# AddBank/urls.py
from django.urls import path
from .views import get_currency_icon_by_currency_type, get_fiat_wallet_by_user_id

urlpatterns = [
    path('fiat_wallet/<str:wallet_id>/', get_fiat_wallet_by_user_id, name='get_fiat_wallet_by_user_id'),
    path('icon/<str:currency_type>/', get_currency_icon_by_currency_type, name='get_icon_by_currency'),
]
