from django.contrib import admin
from .models import Game, Score, Comment

@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ("title", "slug")
@admin.register(Score)
class ScoreAdmin(admin.ModelAdmin):
    list_display = ("user", "game", "value", "updated"); list_filter = ("game",)
@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("user", "game", "text", "created"); list_filter = ("game",)
