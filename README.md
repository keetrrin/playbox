# GameVault (Django)

## Запуск в VS Code
1. Откройте папку проекта (File → Open Folder), затем терминал (Ctrl+`).
2. Виртуальное окружение:
   - Windows: `python -m venv venv` и `venv\Scripts\activate`
   - macOS/Linux: `python3 -m venv venv` и `source venv/bin/activate`
3. `pip install -r requirements.txt`
4. `python manage.py makemigrations games`
5. `python manage.py migrate` (заодно создаст 3 игры)
6. `python manage.py createsuperuser` (это админ)
7. `python manage.py runserver` → http://127.0.0.1:8000
Админ-панель: http://127.0.0.1:8000/admin/ (игры, рекорды, комментарии, пользователи).

## БД
SQLite; таблицы `Game`, `Score`, `Comment` связаны с `User` внешними ключами.

## Деплой (Render)
Build: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
Start: `gunicorn config.wsgi`
Env: `DEBUG=0`, `SECRET_KEY=<случайная строка>`.
На бесплатном плане SQLite сбрасывается при перезапуске; для постоянных данных подключите Postgres.
