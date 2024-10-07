from django.urls import path
from .views import get_currency_icon,get_all_currency_icons,get_fiat_wallet_by_user_id

urlpatterns = [
    path('get-currency-icon/', get_currency_icon, name='get-currency-icon'),
    path('icons/', get_all_currency_icons, name='get_all_currency_icons'),
    path('fiat_wallet/<str:wallet_id>/', get_fiat_wallet_by_user_id, name='get_fiat_wallet_by_user_id'),
]