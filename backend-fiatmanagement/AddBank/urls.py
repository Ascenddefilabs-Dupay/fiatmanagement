# AddBank/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('add/', views.add_bank, name='add_bank'),  # Route for adding a bank
]
