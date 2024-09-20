# AddBank/urls.py
from django.urls import path
from .views import get_fiat_wallet_by_user_id

urlpatterns = [
    path('fiat_wallet/<str:wallet_id>/', get_fiat_wallet_by_user_id, name='get_fiat_wallet_by_user_id'),

]
