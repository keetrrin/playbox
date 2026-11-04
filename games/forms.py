from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm
from .models import Comment
User = get_user_model()

class RegisterForm(UserCreationForm):
    email = forms.EmailField(label="Email")
    class Meta(UserCreationForm.Meta):
        model = User
        fields = ("username", "email")
    def clean_email(self):
        e = self.cleaned_data["email"].lower()
        if User.objects.filter(email__iexact=e).exists():
            raise forms.ValidationError("Этот email уже используется")
        return e

class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ["text"]
        labels = {"text": ""}
        widgets = {"text": forms.Textarea(attrs={"rows": 2, "maxlength": 300, "placeholder": "Ваш комментарий"})}
