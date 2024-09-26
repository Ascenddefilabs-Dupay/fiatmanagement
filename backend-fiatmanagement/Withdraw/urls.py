from django.urls import path
from .views import get_wallet_amount ,update_wallet_amount,get_bank_names ,get_currency_icon

urlpatterns = [
    path('get-wallet-amount/', get_wallet_amount, name='get_wallet_amount'), 
    path('update-wallet-amount/', update_wallet_amount, name='update_wallet_amount'),
    path('get-bank-names/', get_bank_names, name='get_bank_names'),
    path('get-currency-icon/', get_currency_icon, name='get-currency-icon'),
]

