from django.shortcuts import render
from rest_framework import viewsets
from .models import Project
from .models import Bank
from .serializers import ProjectSerializer
from .serializers import BankSerializer
from .serializers import FiatWalletSerializer,UserSerializer
from .models import FiatWallet
from .models import User
from .models import Currency
from .serializers import CurrencySerializer
from .models import UsersCurrencies
from .serializers import UsersCurrenciesSerializer



class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

class FiatWalletViewSet(viewsets.ModelViewSet):
    queryset = FiatWallet.objects.all()
    serializer_class = FiatWalletSerializer
    lookup_field="fiat_wallet_id"

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    # lookup_field="id"

class CurrencyViewSet(viewsets.ModelViewSet):
    queryset = Currency.objects.all()
    serializer_class = CurrencySerializer
class BankViewSet(viewsets.ModelViewSet):
    queryset = Bank.objects.all()
    serializer_class = BankSerializer



class UsersCurrenciesViewSet(viewsets.ModelViewSet):
    queryset = UsersCurrencies.objects.all()
    serializer_class = UsersCurrenciesSerializer

