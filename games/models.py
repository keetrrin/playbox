from django.conf import settings
from django.db import models

class Game(models.Model):
    GENRES = [("arcade", "Аркада"), ("puzzle", "Головоломки"), ("skill", "Реакция"), ("classic", "Классика"), ("story", "Сюжетные")]
    genre = models.CharField("Жанр", max_length=10, choices=GENRES, default="arcade")
    slug = models.SlugField(unique=True, help_text="Должен совпадать с ключом в games.js")
    title = models.CharField("Название", max_length=50)
    emoji = models.CharField(max_length=4, default="🎮")
    description = models.TextField("Описание")
    def __str__(self): return self.title

class Score(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name="scores")
    value = models.PositiveIntegerField("Очки")
    updated = models.DateTimeField(auto_now=True)
    class Meta:
        unique_together = ("user", "game")
        ordering = ["-value"]
    def __str__(self): return f"{self.user} — {self.game}: {self.value}"

class Comment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name="comments")
    text = models.CharField("Текст", max_length=300)
    created = models.DateTimeField(auto_now_add=True)
    class Meta: ordering = ["-created"]
    def __str__(self): return self.text[:30]

class Room(models.Model):
    """Онлайн-комната для игры вдвоём (крестики-нолики)."""
    code = models.CharField(max_length=6, unique=True)
    host = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="hosted_rooms")
    guest = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="joined_rooms")
    board = models.CharField(max_length=9, default=" " * 9)
    turn = models.CharField(max_length=1, default="X")
    winner = models.CharField(max_length=1, blank=True)
    created = models.DateTimeField(auto_now_add=True)

class Race(models.Model):
    """Гонка очков: друзья играют в одну игру и сравнивают результат."""
    code = models.CharField(max_length=6, unique=True)
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    host = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)

class RaceScore(models.Model):
    race = models.ForeignKey(Race, on_delete=models.CASCADE, related_name="scores")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    value = models.PositiveIntegerField(default=0)
    class Meta: unique_together = ("race", "user")

class Duel(models.Model):
    """Игра вдвоём: четыре в ряд, гомоку, камень-ножницы-бумага."""
    KINDS = {"c4": "Четыре в ряд", "gomoku": "Гомоку (5 в ряд)", "rps": "Камень-ножницы-бумага", "navy": "Морской бой", "west": "Дуэль на Диком Западе", "tug": "Перетягивание каната"}
    code = models.CharField(max_length=6, unique=True)
    kind = models.CharField(max_length=10)
    host = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="duels_hosted")
    guest = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="duels_joined")
    state = models.JSONField(default=dict)
    turn = models.CharField(max_length=1, default="X")
    winner = models.CharField(max_length=1, blank=True)

class Profile(models.Model):
    """Гараж и монеты игрока."""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    coins = models.PositiveIntegerField(default=0)
    car = models.CharField(max_length=10, default="hatch")
    color = models.CharField(max_length=7, default="#1e88e5")
    track = models.CharField(max_length=10, default="meadow")
    upg = models.JSONField(default=dict)
    owned = models.JSONField(default=list)
    frame = models.CharField(max_length=10, blank=True)

class Unlocked(models.Model):
    """Полученные достижения."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    code = models.CharField(max_length=30)
    ts = models.DateTimeField(auto_now_add=True)
    class Meta: unique_together = ("user", "code")

class Friend(models.Model):
    a = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="fr_out")
    b = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="fr_in")
    ok = models.BooleanField(default=False)
    class Meta: unique_together = ("a", "b")

class Party(models.Model):
    code = models.CharField(max_length=6, unique=True)
    host = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="parties_hosted")
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="parties")

class Message(models.Model):
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="msgs")
    to = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.CASCADE, related_name="msgs_in")
    party = models.ForeignKey(Party, null=True, blank=True, on_delete=models.CASCADE)
    text = models.CharField(max_length=300)
    ts = models.DateTimeField(auto_now_add=True)

class Uno(models.Model):
    code = models.CharField(max_length=6, unique=True)
    host = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="unos")
    players = models.JSONField(default=list)
    state = models.JSONField(default=dict)
    started = models.BooleanField(default=False)
    winner = models.CharField(max_length=40, blank=True)
    mode = models.CharField(max_length=4, default="one")

class Story(models.Model):
    """Сетевая 3D-новелла: игроки голосуют за выбор."""
    code = models.CharField(max_length=6, unique=True)
    host = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="stories")
    players = models.JSONField(default=list)
    state = models.JSONField(default=dict)

class Durak(models.Model):
    code = models.CharField(max_length=6, unique=True)
    host = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="duraks")
    players = models.JSONField(default=list)
    state = models.JSONField(default=dict)
    started = models.BooleanField(default=False)
    winner = models.CharField(max_length=60, blank=True)
