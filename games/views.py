import json
from django.contrib import messages
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST
from .forms import CommentForm, RegisterForm
from .models import Comment, Game, Score

def home(request):
    return render(request, "games/home.html", {"games": Game.objects.all(), "genres": Game.GENRES, "duel_kinds": Duel.KINDS.items()})

def game_detail(request, slug):
    game = get_object_or_404(Game, slug=slug)
    form = CommentForm()
    if request.method == "POST":
        if not request.user.is_authenticated:
            return redirect("login")
        form = CommentForm(request.POST)
        if form.is_valid():
            c = form.save(commit=False)
            c.user, c.game = request.user, game
            c.save()
            messages.success(request, "Комментарий добавлен")
            return redirect("game", slug=slug)
        messages.error(request, "Комментарий: от 1 до 300 символов")
    return render(request, "games/game.html", {
        "game": game, "form": form,
        "scores": game.scores.select_related("user")[:10],
        "comments": _with_frames(game.comments.select_related("user")),
        "three": game.slug in THREE3D,
    })

@require_POST
def save_score(request, slug):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Войдите в аккаунт"}, status=401)
    game = get_object_or_404(Game, slug=slug)
    try:
        value = int(json.loads(request.body)["score"])
    except (ValueError, KeyError, TypeError):
        return JsonResponse({"error": "Некорректные данные"}, status=400)
    if not 0 <= value <= 1_000_000:
        return JsonResponse({"error": "Недопустимое значение"}, status=400)
    s, created = Score.objects.get_or_create(user=request.user, game=game, defaults={"value": value})
    new = created
    if not created and value > s.value:
        s.value = value; s.save(); new = True
    gain = min(30, value // 10)
    if gain:
        pr = _prof(request.user); pr.coins += gain; pr.save()
    return JsonResponse({"new_record": new, "score": s.value, "coins": gain, "ach": check_ach(request.user, game.slug, value)})

@login_required
@require_POST
def delete_comment(request, pk):
    c = get_object_or_404(Comment, pk=pk)
    if c.user == request.user or request.user.is_staff:
        c.delete()
        messages.success(request, "Комментарий удалён")
    else:
        messages.error(request, "Нельзя удалить чужой комментарий")
    return redirect("game", slug=c.game.slug)

@login_required
def profile(request):
    return render(request, "games/profile.html", {
        "scores": Score.objects.filter(user=request.user).select_related("game"),
        "comments_count": Comment.objects.filter(user=request.user).count(),
        "ach": ach_list(request.user), "coins": _prof(request.user).coins, "frame": _prof(request.user).frame,
    })

def register(request):
    form = RegisterForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        login(request, form.save())
        return redirect("home")
    return render(request, "games/register.html", {"form": form})

# ---------- Игра с другом (онлайн-комнаты) ----------
import random, string
from .models import Room
LINES = [(0,1,2),(3,4,5),(6,7,8),(0,3,6),(1,4,7),(2,5,8),(0,4,8),(2,4,6)]

def _win(b):
    for a, c, d in LINES:
        if b[a] != " " and b[a] == b[c] == b[d]:
            return b[a]
    return "" if " " in b else "D"

def _state(r, u):
    you = "X" if r.host_id == u.id else "O" if r.guest_id == u.id else ""
    return {"board": list(r.board), "turn": r.turn, "winner": r.winner, "guest": bool(r.guest_id), "you": you}

@login_required
@require_POST
def room_new(request):
    code = "".join(random.choices(string.ascii_uppercase + string.digits, k=5))
    Room.objects.create(code=code, host=request.user)
    return redirect("room", code=code)

@login_required
def room(request, code):
    r = get_object_or_404(Room, code=code.upper())
    if r.host_id != request.user.id and r.guest_id is None:
        r.guest = request.user; r.save()
    return render(request, "games/room.html", {"room": r})

@login_required
def room_state(request, code):
    return JsonResponse(_state(get_object_or_404(Room, code=code), request.user))

@login_required
@require_POST
def room_move(request, code):
    r = get_object_or_404(Room, code=code)
    try:
        i = int(json.loads(request.body)["i"])
        if not 0 <= i < 9: raise ValueError
    except (ValueError, KeyError, TypeError):
        return JsonResponse({"error": "Некорректный ход"}, status=400)
    if not r.guest_id:
        return JsonResponse({"error": "Ждём второго игрока"}, status=400)
    if r.winner or _state(r, request.user)["you"] != r.turn or r.board[i] != " ":
        return JsonResponse({"error": "Сейчас так ходить нельзя"}, status=400)
    b = list(r.board); b[i] = r.turn
    r.board = "".join(b); r.winner = _win(r.board); r.turn = "O" if r.turn == "X" else "X"; r.save()
    return JsonResponse(_state(r, request.user))

# ---------- Гонка очков (любое число игроков) ----------
from .models import Race, RaceScore

def _rstate(r):
    return {"players": [{"name": s.user.username, "value": s.value} for s in r.scores.select_related("user").order_by("-value")]}

@login_required
@require_POST
def race_new(request):
    game = get_object_or_404(Game, slug=request.POST.get("game"))
    code = "".join(random.choices(string.ascii_uppercase + string.digits, k=5))
    Race.objects.create(code=code, game=game, host=request.user)
    return redirect("race", code=code)

@login_required
def race(request, code):
    r = get_object_or_404(Race, code=code.upper())
    RaceScore.objects.get_or_create(race=r, user=request.user)
    return render(request, "games/race.html", {"race": r, "game": r.game, "three": r.game.slug in THREE3D})

@login_required
def race_state(request, code):
    return JsonResponse(_rstate(get_object_or_404(Race, code=code)))

@login_required
@require_POST
def race_score(request, code):
    r = get_object_or_404(Race, code=code)
    try:
        v = int(json.loads(request.body)["score"])
        if not 0 <= v <= 1_000_000: raise ValueError
    except (ValueError, KeyError, TypeError):
        return JsonResponse({"error": "Некорректные данные"}, status=400)
    s, _ = RaceScore.objects.get_or_create(race=r, user=request.user)
    if v > s.value:
        s.value = v; s.save()
    return JsonResponse(_rstate(r))

@login_required
def join(request, code):
    code = code.strip().upper()
    if Race.objects.filter(code=code).exists(): return redirect("race", code=code)
    if Room.objects.filter(code=code).exists(): return redirect("room", code=code)
    if Duel.objects.filter(code=code).exists(): return redirect("duel", code=code)
    if Party.objects.filter(code=code).exists(): return redirect("party", code=code)
    if Uno.objects.filter(code=code).exists(): return redirect("uno", code=code)
    if Story.objects.filter(code=code).exists(): return redirect("story", code=code)
    if Durak.objects.filter(code=code).exists(): return redirect("durak", code=code)
    messages.error(request, "Комната с таким кодом не найдена")
    return redirect("home")

@login_required
@require_POST
def room_rematch(request, code):
    r = get_object_or_404(Room, code=code)
    if request.user.id not in (r.host_id, r.guest_id):
        return JsonResponse({"error": "Вы не участник"}, status=403)
    if r.winner:
        r.board, r.winner, r.turn = " " * 9, "", "X"; r.save()
    return JsonResponse(_state(r, request.user))

# ---------- Игры вдвоём: четыре в ряд, гомоку, КНБ ----------
from .models import Duel
GRID = {"c4": (7, 6, 4), "gomoku": (9, 9, 5)}

import time

def _fleet(n=8):
    occ, ships = set(), []
    for L in (4, 3, 3, 2, 2):
        while True:
            h = random.random() < .5
            r = random.randrange(n if h else n - L + 1); c = random.randrange(n - L + 1 if h else n)
            cells = [r * n + c + k if h else (r + k) * n + c for k in range(L)]
            if not occ & set(cells):
                occ |= set(cells); ships.append(cells); break
    return ships

def _navy_view(s, me):
    o = "O" if me == "X" else "X"
    mine = {c for sh in s["ships"][me] for c in sh}; enemy = {c for sh in s["ships"][o] for c in sh}
    e, m = [" "] * 64, [" "] * 64
    for i in s["shots"][me]: e[i] = "h" if i in enemy else "x"
    for c in mine: m[c] = "s"
    for i in s["shots"][o]: m[i] = "h" if i in mine else "x"
    return {"enemy": e, "mine": m}

def _init(kind):
    if kind == "navy": return {"ships": {"X": _fleet(), "O": _fleet()}, "shots": {"X": [], "O": []}}
    if kind == "west": return {"score": {"X": 0, "O": 0}, "go_at": time.time() + random.uniform(4, 7), "last": None, "rt": 0}
    if kind == "tug": return {"pos": 0}
    if kind in GRID:
        w, h, _ = GRID[kind]; return {"b": [" "] * (w * h)}
    return {"picks": {"X": None, "O": None}, "score": {"X": 0, "O": 0}, "last": None}

def _grid_win(b, w, h, n):
    for y in range(h):
        for x in range(w):
            c = b[y * w + x]
            if c == " ": continue
            for dx, dy in ((1, 0), (0, 1), (1, 1), (1, -1)):
                if all(0 <= x + k * dx < w and 0 <= y + k * dy < h and b[(y + k * dy) * w + x + k * dx] == c for k in range(n)):
                    return c
    return "D" if " " not in b else ""

def _dstate(d, u):
    you = "X" if d.host_id == u.id else "O" if d.guest_id == u.id else ""
    s = d.state
    if d.kind == "rps":
        s = {"score": s["score"], "last": s["last"], "picked": {k: s["picks"][k] is not None for k in "XO"}}
    elif d.kind == "navy": s = _navy_view(s, you or "X")
    elif d.kind == "west": s = {"score": s["score"], "go": time.time() >= s["go_at"], "last": s["last"]}
    return {"kind": d.kind, "state": s, "turn": d.turn, "winner": d.winner, "you": you, "guest": bool(d.guest_id)}

@login_required
@require_POST
def duel_new(request):
    kind = request.POST.get("kind")
    if kind not in Duel.KINDS:
        messages.error(request, "Неизвестная игра"); return redirect("home")
    code = "".join(random.choices(string.ascii_uppercase + string.digits, k=5))
    Duel.objects.create(code=code, kind=kind, host=request.user, state=_init(kind))
    return redirect("duel", code=code)

@login_required
def duel(request, code):
    d = get_object_or_404(Duel, code=code.upper())
    if d.host_id != request.user.id and d.guest_id is None:
        d.guest = request.user
        if d.kind == "west": d.state = _init("west")
        d.save()
    return render(request, "games/duel.html", {"duel": d, "title": Duel.KINDS[d.kind]})

@login_required
def duel_state(request, code):
    return JsonResponse(_dstate(get_object_or_404(Duel, code=code), request.user))

@login_required
@require_POST
def duel_move(request, code):
    d = get_object_or_404(Duel, code=code)
    bad = lambda t: JsonResponse({"error": t}, status=400)
    try: i = int(json.loads(request.body)["i"])
    except (ValueError, KeyError, TypeError): return bad("Некорректный ход")
    me = _dstate(d, request.user)["you"]
    if not d.guest_id or d.winner or not me: return bad("Сейчас играть нельзя")
    s = d.state
    if d.kind == "rps":
        if not 0 <= i < 3 or s["picks"][me] is not None: return bad("Выбор уже сделан")
        s["picks"][me] = i; p = s["picks"]
        if p["X"] is not None and p["O"] is not None:
            r = (p["X"] - p["O"]) % 3
            if r:
                w = "X" if r == 1 else "O"; s["score"][w] += 1
                if s["score"][w] >= 3: d.winner = w
            s["last"] = {"X": p["X"], "O": p["O"]}; s["picks"] = {"X": None, "O": None}
    elif d.kind == "tug":
        s["pos"] += 1 if me == "X" else -1
        d.winner = "X" if s["pos"] >= 15 else "O" if s["pos"] <= -15 else ""
    elif d.kind == "west":
        now = time.time(); opp = "O" if me == "X" else "X"
        if now - s.get("rt", 0) < 1.2: return bad("Подождите следующий раунд")
        foul = now < s["go_at"]; w = opp if foul else me
        s["score"][w] += 1; s["last"] = {"w": w, "foul": foul, "by": me}; s["rt"] = now
        if s["score"][w] >= 3: d.winner = w
        s["go_at"] = now + random.uniform(3.5, 6)
    elif d.kind == "navy":
        opp = "O" if me == "X" else "X"
        if me != d.turn or not 0 <= i < 64 or i in s["shots"][me]: return bad("Сюда стрелять нельзя")
        s["shots"][me].append(i)
        cells = {c for sh in s["ships"][opp] for c in sh}
        if i in cells:
            if cells <= set(s["shots"][me]): d.winner = me
        else: d.turn = opp
    else:
        if me != d.turn: return bad("Сейчас ход соперника")
        w, h, n = GRID[d.kind]; b = s["b"]
        if d.kind == "c4":
            if not 0 <= i < w: return bad("Некорректный ход")
            cell = next((y * w + i for y in range(h - 1, -1, -1) if b[y * w + i] == " "), None)
            if cell is None: return bad("Колонка заполнена")
        else:
            if not 0 <= i < w * h or b[i] != " ": return bad("Клетка занята")
            cell = i
        b[cell] = me; d.winner = _grid_win(b, w, h, n); d.turn = "O" if me == "X" else "X"
    d.state = s; d.save()
    return JsonResponse(_dstate(d, request.user))

@login_required
@require_POST
def duel_rematch(request, code):
    d = get_object_or_404(Duel, code=code)
    if request.user.id not in (d.host_id, d.guest_id):
        return JsonResponse({"error": "Вы не участник"}, status=403)
    if d.winner:
        d.state, d.winner, d.turn = _init(d.kind), "", "X"; d.save()
    return JsonResponse(_dstate(d, request.user))

# ---------- Достижения ----------
import re
from .models import Profile, Unlocked
ACH = {
    "first": ("Первый шаг", "Сохраните свой первый рекорд"),
    "five": ("Любознательный", "Сыграйте в 5 разных игр"),
    "ten": ("Коллекционер", "Сыграйте в 10 разных игр"),
    "s100": ("Сотня", "Наберите 100 очков в любой игре"),
    "snake20": ("Змеелов", "20 очков в «Змейке»"),
    "race500": ("Гонщик", "500 очков в «Гонках»"),
    "ttt1": ("Хитрец", "Победите бота в крестики-нолики"),
    "tetris1k": ("Мастер Тетриса", "1000 очков в «Тетрисе»"),
    "rich": ("Богач", "Накопите 500 монет в гараже"),
}

def _award(user, codes):
    new = []
    for c in codes:
        _, created = Unlocked.objects.get_or_create(user=user, code=c)
        if created: new.append(ACH[c][0])
    return new

def check_ach(user, slug, value):
    n = Score.objects.filter(user=user).count()
    codes = ["first"] + (["five"] if n >= 5 else []) + (["ten"] if n >= 10 else []) + (["s100"] if value >= 100 else [])
    if slug == "snake" and value >= 20: codes.append("snake20")
    if slug == "racing" and value >= 500: codes.append("race500")
    if slug == "ttt" and value >= 1: codes.append("ttt1")
    if slug == "tetris" and value >= 1000: codes.append("tetris1k")
    return _award(user, codes)

def ach_list(user):
    done = set(Unlocked.objects.filter(user=user).values_list("code", flat=True))
    return [{"title": t, "desc": d, "done": c in done} for c, (t, d) in ACH.items()]

# ---------- Гараж (гонки) ----------
UPG = {"engine": 60, "nitro": 50, "handling": 40, "accel": 45, "armor": 90, "magnet": 50, "brakes": 35}

def _gj(p):
    u = {**{k: 0 for k in UPG}, **(p.upg or {})}
    return {"coins": p.coins, "car": p.car, "color": p.color, "track": p.track, "upg": u}

def _prof(user):
    return Profile.objects.get_or_create(user=user)[0]

def _body(request):
    try: return json.loads(request.body)
    except ValueError: return {}

@login_required
def garage(request):
    return JsonResponse(_gj(_prof(request.user)))

@login_required
@require_POST
def garage_save(request):
    b, p = _body(request), _prof(request.user)
    if b.get("car") in ("hatch", "sport", "suv", "vaz"): p.car = b["car"]
    if b.get("track") in ("meadow", "desert", "night"): p.track = b["track"]
    if re.fullmatch(r"#[0-9a-fA-F]{6}", str(b.get("color", ""))): p.color = b["color"]
    p.save()
    return JsonResponse(_gj(p))

@login_required
@require_POST
def garage_buy(request):
    p, k = _prof(request.user), _body(request).get("upg")
    if k not in UPG: return JsonResponse({"error": "Неизвестное улучшение"}, status=400)
    upg = {**{k: 0 for k in UPG}, **(p.upg or {})}
    cost = UPG[k] * (upg[k] + 1)
    if upg[k] >= 5: return JsonResponse({"error": "Максимальный уровень"}, status=400)
    if p.coins < cost: return JsonResponse({"error": f"Не хватает монет (нужно {cost})"}, status=400)
    p.coins -= cost; upg[k] += 1; p.upg = upg; p.save()
    return JsonResponse(_gj(p))

@login_required
@require_POST
def garage_coins(request):
    p = _prof(request.user)
    try: n = max(0, min(300, int(_body(request).get("n", 0))))
    except (TypeError, ValueError): n = 0
    p.coins += n; p.save()
    return JsonResponse({**_gj(p), "ach": _award(request.user, ["rich"]) if p.coins >= 500 else []})

# ---------- Друзья, чат, пати ----------
from django.db.models import Q
from .models import Friend, Party, Message, Uno
User = get_user_model() if 'get_user_model' in globals() else None
from django.contrib.auth import get_user_model
User = get_user_model()

def _code(): return "".join(random.choices(string.ascii_uppercase + string.digits, k=5))

@login_required
def friends(request):
    me = request.user
    fl = [f.b if f.a_id == me.id else f.a for f in Friend.objects.filter(Q(a=me) | Q(b=me), ok=True).select_related("a", "b")]
    rels = {(f.a_id, f.b_id): f.pk for f in Friend.objects.filter(Q(a=me) | Q(b=me), ok=True)}
    flist = [{"u": u, "pk": rels.get((me.id, u.id)) or rels.get((u.id, me.id))} for u in fl]
    return render(request, "games/friends.html", {
        "friends": flist, "incoming": Friend.objects.filter(b=me, ok=False).select_related("a"),
        "outgoing": Friend.objects.filter(a=me, ok=False).select_related("b"), "parties": me.parties.all()})

@login_required
@require_POST
def friend_add(request):
    u = User.objects.filter(username__iexact=request.POST.get("username", "").strip()).first()
    if not u or u == request.user:
        messages.error(request, "Игрок не найден")
    else:
        rev = Friend.objects.filter(a=u, b=request.user).first()
        if rev: rev.ok = True; rev.save(); messages.success(request, f"Теперь вы друзья с {u.username}")
        else: Friend.objects.get_or_create(a=request.user, b=u); messages.success(request, "Заявка отправлена")
    return redirect("friends")

@login_required
@require_POST
def friend_act(request, pk, act):
    f = get_object_or_404(Friend, pk=pk)
    if request.user.id not in (f.a_id, f.b_id): return redirect("friends")
    if act == "accept" and f.b_id == request.user.id: f.ok = True; f.save()
    else: f.delete()
    return redirect("friends")

@login_required
@require_POST
def party_new(request):
    p = Party.objects.create(code=_code(), host=request.user); p.members.add(request.user)
    return redirect("party", code=p.code)

@login_required
def party(request, code):
    p = get_object_or_404(Party, code=code.upper()); p.members.add(request.user)
    return render(request, "games/chat.html", {"kind": "party", "key": p.code, "title": "Пати " + p.code, "games": Game.objects.all()})

@login_required
def dm(request, username):
    u = get_object_or_404(User, username=username)
    return render(request, "games/chat.html", {"kind": "dm", "key": u.username, "title": "Чат с " + u.username})

@login_required
def chat_api(request, kind, key):
    me = request.user; p = other = None
    if kind == "party":
        p = get_object_or_404(Party, code=key)
        if not p.members.filter(pk=me.pk).exists(): return JsonResponse({"error": "Нет доступа"}, status=403)
        qs = Message.objects.filter(party=p)
    else:
        other = get_object_or_404(User, username=key)
        qs = Message.objects.filter(party=None).filter(Q(sender=me, to=other) | Q(sender=other, to=me))
    if request.method == "POST":
        t = str(_body(request).get("text", "")).strip()[:300]
        if not t: return JsonResponse({"error": "Пустое сообщение"}, status=400)
        Message.objects.create(sender=me, to=other, party=p, text=t)
        return JsonResponse({"ok": True})
    try: after = int(request.GET.get("after", 0))
    except ValueError: after = 0
    ms = qs.filter(id__gt=after).select_related("sender").order_by("id")[:100]
    out = {"msgs": [{"id": m.id, "name": m.sender.username, "text": m.text, "mine": m.sender_id == me.id, "ts": m.ts.strftime("%H:%M")} for m in ms]}
    if p: out["members"] = [u.username for u in p.members.all()]
    return JsonResponse(out)

@login_required
@require_POST
def party_game(request, code):
    p = get_object_or_404(Party, code=code.upper()); g = request.POST.get("game")
    if g == "durak":
        d = Durak.objects.create(code=_code(), host=request.user, players=[request.user.id]); link, name = f"/durak/{d.code}/", "Дурак"
    elif g in ("uno", "uno2"):
        u = Uno.objects.create(code=_code(), host=request.user, players=[request.user.id], mode="many" if g == "uno2" else "one"); link, name = f"/uno/{u.code}/", "UNO"
    else:
        game = get_object_or_404(Game, slug=g); r = Race.objects.create(code=_code(), game=game, host=request.user); link, name = f"/race/{r.code}/", "Гонка очков: " + game.title
    Message.objects.create(sender=request.user, party=p, text=f"{name} — {link}")
    return redirect(link)

# ---------- UNO (2-4 игрока) ----------
UC = "RYGB"
def _udeck():
    d = []
    for c in UC:
        d.append(c + "0")
        for x in list("123456789") + ["S", "R", "D"]: d += [c + x] * 2
    d += ["KW"] * 4 + ["KF"] * 4
    random.shuffle(d); return d

def _uok(c, top, col): return c[0] == "K" or c[0] == col or c[1] == top[1]

def _udraw(s, n):
    out = []
    for _ in range(n):
        if not s["deck"]:
            t = s["discard"].pop(); s["deck"] = s["discard"]; random.shuffle(s["deck"]); s["discard"] = [t]
            if not s["deck"]: break
        out.append(s["deck"].pop())
    return out

def _ustate(u, me):
    s, ids = u.state, u.players
    us = {x.id: x for x in User.objects.filter(id__in=ids)}
    pl = [{"name": us[i].username, "n": len(s.get("hands", {}).get(str(i), [])), "you": i == me.id,
           "turn": bool(u.started and not u.winner and ids[s["turn"]] == i)} for i in ids]
    out = {"started": u.started, "players": pl, "host": u.host_id == me.id, "winner": u.winner, "log": s.get("log", ""), "deck": len(s.get("deck", []))}
    out["mode"] = u.mode
    if u.started:
        hand = s["hands"].get(str(me.id), []); top, col = s["discard"][-1], s["color"]
        yt = (not u.winner and ids[s["turn"]] == me.id); ok = [_uok(c, top, col) for c in hand]; drew = bool(s.get("drew"))
        out.update(hand=hand, ok=ok, top=top, color=col, yourturn=yt, turnName=us[ids[s["turn"]]].username, drew=drew,
                   canDraw=yt and (u.mode == "many" or (not drew and not any(ok))), canPass=yt and u.mode == "one" and drew)
    return out

@login_required
@require_POST
def uno_new(request):
    mode = "many" if request.POST.get("mode") == "many" else "one"
    u = Uno.objects.create(code=_code(), host=request.user, players=[request.user.id], mode=mode)
    return redirect("uno", code=u.code)

@login_required
def uno(request, code):
    u = get_object_or_404(Uno, code=code.upper())
    if not u.started and request.user.id not in u.players and len(u.players) < 4:
        u.players = u.players + [request.user.id]; u.save()
    return render(request, "games/uno.html", {"uno": u})

@login_required
def uno_state(request, code):
    u = get_object_or_404(Uno, code=code)
    if request.user.id not in u.players: return JsonResponse({"error": "Вы не в игре"}, status=403)
    return JsonResponse(_ustate(u, request.user))

@login_required
@require_POST
def uno_start(request, code):
    u = get_object_or_404(Uno, code=code)
    if u.host_id != request.user.id or len(u.players) < 2: return JsonResponse({"error": "Нужен хозяин и минимум 2 игрока"}, status=400)
    d = _udeck(); hands = {str(i): [d.pop() for _ in range(7)] for i in u.players}
    j = next(k for k in range(len(d)) if d[k][0] != "K"); first = d.pop(j)
    u.state = {"deck": d, "hands": hands, "discard": [first], "color": first[0], "turn": 0, "dir": 1, "log": "Игра началась"}
    u.started, u.winner = True, ""; u.save()
    return JsonResponse(_ustate(u, request.user))

@login_required
@require_POST
def uno_move(request, code):
    u = get_object_or_404(Uno, code=code); me = request.user; bad = lambda t: JsonResponse({"error": t}, status=400)
    s, ids = u.state, u.players
    if not u.started or u.winner or me.id not in ids or ids[s["turn"]] != me.id: return bad("Сейчас не ваш ход")
    b = _body(request); n, t = len(ids), s["turn"]; hand = s["hands"][str(me.id)]
    adv = lambda k: (t + s["dir"] * k) % n
    top, col = s["discard"][-1], s["color"]; ok = lambda c: _uok(c, top, col)
    if b.get("draw"):
        if u.mode == "one":
            if s.get("drew"): return bad("Вы уже брали карту: сыграйте её или пропустите ход")
            if any(ok(c) for c in hand): return bad("У вас есть подходящая карта — сыграйте её")
            new = _udraw(s, 1); hand += new
            if new and ok(new[0]): s["drew"] = True; s["log"] = f"{me.username} взял карту (можно сыграть или пропустить)"
            else: s["log"] = f"{me.username} взял карту и пропускает ход"; s["turn"] = adv(1)
        else:
            hand += _udraw(s, 1); s["log"] = f"{me.username} тянет карту"
    elif b.get("pass"):
        if u.mode != "one" or not s.get("drew"): return bad("Пропустить можно только после взятой карты")
        s["drew"] = False; s["log"] = f"{me.username} пропускает ход"; s["turn"] = adv(1)
    else:
        try: i = int(b["i"]); card = hand[i]
        except (KeyError, ValueError, TypeError, IndexError): return bad("Некорректный ход")
        if s.get("drew") and i != len(hand) - 1: return bad("Можно сыграть только вытянутую карту")
        if not ok(card): return bad("Эту карту нельзя сыграть")
        s["drew"] = False; hand.pop(i); s["discard"].append(card)
        s["color"] = (b.get("color") if b.get("color") in UC else random.choice(UC)) if card[0] == "K" else card[0]
        x = card[1]; s["log"] = f"{me.username} сыграл карту"
        if not hand: u.winner = me.username
        elif x == "S": s["turn"] = adv(2)
        elif x == "R" and card[0] != "K": s["dir"] *= -1; s["turn"] = adv(2 if n == 2 else 1)
        elif x in ("D", "F"):
            tg = adv(1); s["hands"][str(ids[tg])] += _udraw(s, 2 if x == "D" else 4); s["turn"] = adv(2)
        else: s["turn"] = adv(1)
    s["hands"][str(me.id)] = hand; u.state = s; u.save()
    return JsonResponse(_ustate(u, me))

# ---------- Магазин рамок ----------
FRAMES = {"wood": ("Деревянная рамка", 100), "forest": ("Лесная рамка", 150), "ice": ("Ледяная рамка", 200),
          "fire": ("Огненная рамка", 250), "gold": ("Золотая рамка", 400), "royal": ("Королевская рамка", 700)}

def _with_frames(qs):
    cl = list(qs)
    fr = dict(Profile.objects.filter(user_id__in={c.user_id for c in cl}).values_list("user_id", "frame"))
    for c in cl: c.frame = fr.get(c.user_id, "")
    return cl

@login_required
def shop(request):
    p = _prof(request.user)
    items = [{"code": k, "name": n, "price": c, "owned": k in (p.owned or []), "eq": p.frame == k} for k, (n, c) in FRAMES.items()]
    return render(request, "games/shop.html", {"items": items, "coins": p.coins, "frame": p.frame})

@login_required
@require_POST
def shop_act(request, act, code):
    p = _prof(request.user)
    if code in FRAMES:
        owned = list(p.owned or [])
        if act == "buy" and code not in owned:
            n, c = FRAMES[code]
            if p.coins < c: messages.error(request, f"Не хватает монет (нужно {c})")
            else: p.coins -= c; owned.append(code); p.owned = owned; p.frame = code; messages.success(request, f"Куплено: {n}")
        elif act == "equip" and code in owned: p.frame = code
        elif act == "unequip": p.frame = ""
        p.save()
    return redirect("shop")

# ---------- Остров сокровищ: сетевая 3D-новелла ----------
from collections import Counter
from .models import Story

def _resolve(st):
    s = st.state
    if not s["votes"]: return
    c = Counter(s["votes"].values()); top = max(c.values())
    to = random.choice([k for k, n in c.items() if n == top]); s["node"], s["votes"] = to, {}
    if to.startswith("end_"):
        for uid in st.players:
            pr = Profile.objects.get_or_create(user_id=uid)[0]; pr.coins += 40; pr.save()

def _sstate(st, me):
    us = {x.id: x.username for x in User.objects.filter(id__in=st.players)}; v = st.state["votes"]
    return {"node": st.state["node"], "players": [{"name": us.get(i, "?"), "voted": str(i) in v} for i in st.players],
            "counts": dict(Counter(v.values())), "mine": v.get(str(me.id)), "host": st.host_id == me.id}

@login_required
@require_POST
def story_new(request):
    st = Story.objects.create(code=_code(), host=request.user, players=[request.user.id], state={"node": "start", "votes": {}})
    return redirect("story", code=st.code)

@login_required
def story(request, code):
    st = get_object_or_404(Story, code=code.upper())
    if request.user.id not in st.players and len(st.players) < 8:
        st.players = st.players + [request.user.id]; st.save()
    return render(request, "games/story.html", {"story": st})

@login_required
def story_state(request, code):
    st = get_object_or_404(Story, code=code)
    if request.user.id not in st.players: return JsonResponse({"error": "Вы не в игре"}, status=403)
    return JsonResponse(_sstate(st, request.user))

@login_required
@require_POST
def story_vote(request, code):
    st = get_object_or_404(Story, code=code); to = str(_body(request).get("to", ""))
    if request.user.id not in st.players or not re.fullmatch(r"[a-z0-9_]{1,20}", to):
        return JsonResponse({"error": "Некорректный выбор"}, status=400)
    st.state["votes"][str(request.user.id)] = to
    if len(st.state["votes"]) >= len(st.players): _resolve(st)
    st.save()
    return JsonResponse(_sstate(st, request.user))

@login_required
@require_POST
def story_resolve(request, code):
    st = get_object_or_404(Story, code=code)
    if st.host_id != request.user.id: return JsonResponse({"error": "Только хозяин комнаты"}, status=403)
    _resolve(st); st.save()
    return JsonResponse(_sstate(st, request.user))

THREE3D = {"maze3d", "tanks", "penalty", "snake3d", "sky", "racing", "flight", "ball", "stack", "gallery", "ski", "defense", "parking", "rings", "sumo", "hopper"}

# ---------- Дурак (2-4 игрока, подкидной) ----------
from .models import Durak
SUITS, RANKS = "SHDC", ["6", "7", "8", "9", "10", "J", "Q", "K", "A"]
def _rk(c): return RANKS.index(c[1:])
def _dbeats(a, d, tr): return (d[0] == a[0] and _rk(d) > _rk(a)) or (d[0] == tr and a[0] != tr)

def _dnext(s, ids, i):
    j = (i + 1) % len(ids)
    while ids[j] in s["out"]: j = (j + 1) % len(ids)
    return j

def _drefill(s, ids, att, df):
    n = len(ids)
    order = [(att + k) % n for k in range(n) if (att + k) % n != df] + [df]
    for i in order:
        if ids[i] in s["out"]: continue
        h = s["hands"][str(ids[i])]
        while len(h) < 6 and s["deck"]: h.append(s["deck"].pop())

def _dkstate(u, me):
    s, ids = u.state, u.players
    us = {x.id: x.username for x in User.objects.filter(id__in=ids)}
    out = {"started": u.started, "host": u.host_id == me.id, "winner": u.winner, "log": s.get("log", ""), "players": []}
    if not u.started:
        out["players"] = [{"name": us[i], "n": 0, "you": i == me.id, "turn": False} for i in ids]; return out
    att, df = ids[s["att"]], ids[s["df"]]; unc = any(p[1] is None for p in s["table"])
    actor = df if unc else att
    out["players"] = [{"name": us[i], "n": len(s["hands"][str(i)]), "you": i == me.id, "out": i in s["out"], "turn": (not u.winner) and i == actor} for i in ids]
    out.update(hand=s["hands"].get(str(me.id), []), table=s["table"], trump=s["tcard"], deck=len(s["deck"]),
               role="att" if me.id == att else "def" if me.id == df else "", att=us[att], df=us[df])
    return out

@login_required
@require_POST
def durak_new(request):
    u = Durak.objects.create(code=_code(), host=request.user, players=[request.user.id])
    return redirect("durak", code=u.code)

@login_required
def durak(request, code):
    u = get_object_or_404(Durak, code=code.upper())
    if not u.started and request.user.id not in u.players and len(u.players) < 4:
        u.players = u.players + [request.user.id]; u.save()
    return render(request, "games/durak.html", {"durak": u})

@login_required
def durak_state(request, code):
    u = get_object_or_404(Durak, code=code)
    if request.user.id not in u.players: return JsonResponse({"error": "Вы не в игре"}, status=403)
    return JsonResponse(_dkstate(u, request.user))

@login_required
@require_POST
def durak_start(request, code):
    u = get_object_or_404(Durak, code=code)
    if u.host_id != request.user.id or len(u.players) < 2: return JsonResponse({"error": "Нужен хозяин и минимум 2 игрока"}, status=400)
    d = [s + r for s in SUITS for r in RANKS]; random.shuffle(d)
    hands = {str(i): [d.pop() for _ in range(6)] for i in u.players}; tc = d[0]; tr = tc[0]; best, att = 99, 0
    for k, i in enumerate(u.players):
        for c in hands[str(i)]:
            if c[0] == tr and _rk(c) < best: best, att = _rk(c), k
    u.state = {"deck": d, "hands": hands, "tcard": tc, "trump": tr, "table": [], "att": att, "df": (att + 1) % len(u.players), "out": [], "log": "Игра началась"}
    u.started, u.winner = True, ""; u.save()
    return JsonResponse(_dkstate(u, request.user))

@login_required
@require_POST
def durak_move(request, code):
    u = get_object_or_404(Durak, code=code); me = request.user; bad = lambda t: JsonResponse({"error": t}, status=400)
    s, ids = u.state, u.players; b = _body(request); act = b.get("act")
    if not u.started or u.winner or me.id not in ids or me.id in s["out"]: return bad("Сейчас нельзя ходить")
    n, att, df, table, tr = len(ids), s["att"], s["df"], s["table"], s["trump"]; hand = s["hands"][str(me.id)]
    try: card = hand[int(b["i"])] if act in ("attack", "defend") else None
    except (KeyError, ValueError, TypeError, IndexError): return bad("Некорректный ход")
    if act == "attack":
        if me.id != ids[att]: return bad("Сейчас атакует другой игрок")
        dh = s["hands"][str(ids[df])]; unc = sum(1 for p in table if p[1] is None)
        if table and card[1:] not in {c[1:] for p in table for c in p if c}: return bad("Подкиньте карту такого же достоинства")
        if len(table) >= 6 or unc >= len(dh): return bad("Больше подкидывать нельзя")
        hand.remove(card); table.append([card, None])
    elif act == "defend":
        if me.id != ids[df]: return bad("Вы не защищаетесь")
        j = next((k for k, p in enumerate(table) if p[1] is None), None)
        if j is None: return bad("Нечего бить")
        if not _dbeats(table[j][0], card, tr): return bad("Эта карта не бьёт")
        hand.remove(card); table[j][1] = card
    elif act in ("take", "done"):
        if not table: return bad("Стол пуст")
        if act == "take":
            if me.id != ids[df]: return bad("Вы не защищаетесь")
            hand += [c for p in table for c in p if c]
        elif me.id != ids[att] or any(p[1] is None for p in table): return bad("Бито можно сказать, когда все карты побиты")
        s["table"] = []; _drefill(s, ids, att, df)
        for i in ids:
            if i not in s["out"] and not s["hands"][str(i)] and not s["deck"]: s["out"].append(i)
        act_ids = [i for i in ids if i not in s["out"]]
        if len(act_ids) <= 1:
            u.winner = ("Дурак: " + User.objects.get(id=act_ids[0]).username) if act_ids else "Ничья"
        else:
            na = df if (act == "done" and ids[df] not in s["out"]) else _dnext(s, ids, df)
            s["att"], s["df"] = na, _dnext(s, ids, na)
        s["log"] = "Бито" if act == "done" else "Защитник берёт карты"
    else: return bad("Неизвестное действие")
    s["hands"][str(me.id)] = hand; u.state = s; u.save()
    return JsonResponse(_dkstate(u, me))
