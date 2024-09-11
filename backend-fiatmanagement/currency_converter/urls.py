from django.urls import path, include
from rest_framework.routers import DefaultRouter

from currency_converter import views
from .views import ProjectViewSet, BankViewSet,UserCurrencyViewSet,TransactionViewSet,AccountTypeList

# Initialize the router
router = DefaultRouter()

# Register viewsets with the router
router.register('projects', ProjectViewSet)
router.register(r'user_currencies', UserCurrencyViewSet, basename='usercurrency')
router.register(r'fiat_wallets', views.FiatWalletViewSet)
router.register(r'user', views.UserViewSet)
router.register(r'currencies', views.CurrencyViewSet)
router.register(r'banks', BankViewSet)
router.register(r'transactions', TransactionViewSet)

# Define the URL patterns
urlpatterns = [
    path('', include(router.urls)),  # Include the router URLs
    path('account-types/', AccountTypeList.as_view(), name='account-type-list'),
]
