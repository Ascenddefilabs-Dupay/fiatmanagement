from django.urls import path, include
from rest_framework.routers import DefaultRouter

from Topup import views
from .views import ProjectViewSet, BankViewSet,UserCurrencyViewSet,TransactionViewSet,AccountTypeList,get_user_registration_stats

from .views import FiatWalletViewSet
from .views import DefaultCurrencyView
# Initialize the router
router = DefaultRouter()

# Register viewsets with the router
router.register('projects', ProjectViewSet)
router.register(r'user_currencies', UserCurrencyViewSet, basename='usercurrency')
router.register(r'fiat_wallets', views.FiatWalletViewSet)
router.register(r'user', views.UserViewSet)

router.register(r'topup', views.CurrencyViewSet, basename='topup')
router.register(r'currencies', views.CurrencyViewSet, basename='currencies')

# router.register(r'currencies', views.CurrencyViewSet)

router.register(r'banks', BankViewSet)
router.register(r'transactions', TransactionViewSet)

# Define the URL patterns
urlpatterns = [
    path('', include(router.urls)),  # Include the router URLs
    path('account-types/', AccountTypeList.as_view(), name='account-type-list'),
    path('user-registration-stats/', get_user_registration_stats, name='user-registration-stats'),
    path('convert_currency/', views.convert_currency, name='convert_currency'),
    # path('validate_currencies/', views.validate_currencies, name='validateCurrencies'),
    path('fiat_wallets/<str:wallet_id>/<str:currency_type>/', FiatWalletViewSet.as_view({'get': 'retrieve'}), name='fiat_wallet-detail'),
    path('admincms/default_currency/', DefaultCurrencyView.as_view(), name='default-currency'),
]
