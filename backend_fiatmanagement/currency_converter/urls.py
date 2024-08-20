from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet
from currency_converter import views
from .views import BankViewSet
from .views import UsersCurrenciesViewSet


router = DefaultRouter()


router.register('projects',ProjectViewSet)
router.register(r'users-currencies', UsersCurrenciesViewSet)



router.register(r'fiat_wallets', views.FiatWalletViewSet)
router.register(r'user', views.UserViewSet)
router.register(r'currencies', views.CurrencyViewSet)
router.register(r'banks', BankViewSet)



urlpatterns = [
    path('',include(router.urls)),
    
]





