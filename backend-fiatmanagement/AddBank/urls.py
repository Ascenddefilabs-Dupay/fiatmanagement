# A/urls.py
from django.urls import path
from . import views
from .views import add_bank, get_banks_by_user

urlpatterns = [
    
    path('delete_bank/<str:bank_id>/', views.delete_bank_account, name='delete_bank'),

    path('add/', views.add_bank, name='add_bank'),
    path('get_banks/<str:user_id>/', get_banks_by_user, name='get_banks_by_user'),
    path('get_bank_details/<str:user_id>/<str:bank_name>/', views.get_bank_details, name='get_bank_details'),
      # Route for adding a bank
]
