from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet
from currency_converter import views

router = DefaultRouter()


router.register('projects',ProjectViewSet)



router.register(r'fiat_wallets', views.FiatWalletViewSet)
router.register(r'user', views.UserViewSet)

urlpatterns = [
    path('',include(router.urls)),
]
