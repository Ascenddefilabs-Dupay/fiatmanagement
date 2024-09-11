from django.shortcuts import render
from requests import Response
from .models import Project
from .models import Bank
from .serializers import ProjectSerializer
from .serializers import BankSerializer
from .serializers import FiatWalletSerializer,UserSerializer
from .models import FiatWallet
from .models import CustomUser
from .models import Currency
from .serializers import CurrencySerializer
from .models import UserCurrency
from .serializers import UsersCurrenciesSerializer
from rest_framework.views import APIView # type: ignore
from rest_framework.response import Response # type: ignore
from rest_framework import status # type: ignore
from decimal import Decimal, InvalidOperation
from rest_framework.decorators import action # type: ignore
from django.shortcuts import get_object_or_404 # type: ignore
from django.db import transaction # type: ignore
from .models import Transaction
from .serializers import TransactionSerializer
from django.db import connection # type: ignore
# import json

from rest_framework import viewsets # type: ignore
from .models import AdminCMS
from .serializers import AdminCMSSerializer
from django.db.models import Count # type: ignore
from django.utils.timezone import now, timedelta # type: ignore
from django.http import JsonResponse # type: ignore







class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

class FiatWalletViewSet(viewsets.ModelViewSet):
    queryset = FiatWallet.objects.all()
    serializer_class = FiatWalletSerializer
    lookup_field="fiat_wallet_id"

class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    # lookup_field="id"

    

class CurrencyViewSet(viewsets.ModelViewSet):
    queryset = Currency.objects.all()
    serializer_class = CurrencySerializer
class BankViewSet(viewsets.ModelViewSet):
    queryset = Bank.objects.all()
    serializer_class = BankSerializer

class UsersCurrenciesViewSet(viewsets.ModelViewSet):
    queryset = UserCurrency.objects.all()
    serializer_class = UsersCurrenciesSerializer
class UserCurrencyViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['post'], url_path='create_or_update')
    def create_or_update(self, request, *args, **kwargs):
        wallet_id = request.data.get('wallet_id')
        currency_type = request.data.get('currency_type')
        amount = request.data.get('amount')

        if not wallet_id or not currency_type or amount is None:
            return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            amount = Decimal(amount)
            if amount <= 0:
                return Response({"error": "Amount must be greater than zero"}, status=status.HTTP_400_BAD_REQUEST)
        except (InvalidOperation, TypeError):
            return Response({"error": "Invalid amount format"}, status=status.HTTP_400_BAD_REQUEST)

        # Get the FiatWallet
        fiat_wallet = get_object_or_404(FiatWallet, fiat_wallet_id=wallet_id)

        with transaction.atomic():
            if fiat_wallet.fiat_wallet_currency == currency_type:
                # Update fiat_wallet_balance
                fiat_wallet.fiat_wallet_balance += amount
                fiat_wallet.save()

                # Update UserCurrency balance
                user_currency, created = UserCurrency.objects.get_or_create(
                    wallet_id=wallet_id, 
                    currency_type=currency_type
                )
                user_currency.balance += amount
                user_currency.save()

                return Response({
                    "message": "Amount deposited successfully",
                    "fiat_wallet_balance": fiat_wallet.fiat_wallet_balance,
                    "user_currency_balance": user_currency.balance
                }, status=status.HTTP_200_OK)
            else:
                # Update UserCurrency balance
                user_currency, created = UserCurrency.objects.get_or_create(
                    wallet_id=wallet_id, 
                    currency_type=currency_type
                )
                user_currency.balance += amount
                user_currency.save()

                message = "New currency added and amount deposited successfully" if created else "Amount deposited successfully"
                return Response({
                    "message": message,
                    "user_currency_balance": user_currency.balance
                }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='withdraw')
    def withdraw(self, request, *args, **kwargs):
        wallet_id = request.data.get('wallet_id')
        currency_type = request.data.get('currency_type')
        amount = request.data.get('amount')

        if not wallet_id or not currency_type or amount is None:
            return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            amount = Decimal(amount)
            if amount <= 0:
                return Response({"error": "Amount must be greater than zero"}, status=status.HTTP_400_BAD_REQUEST)
        except (InvalidOperation, TypeError):
            return Response({"error": "Invalid amount format"}, status=status.HTTP_400_BAD_REQUEST)

        # Get the FiatWallet
        fiat_wallet = get_object_or_404(FiatWallet, fiat_wallet_id=wallet_id)

        with transaction.atomic():
            if fiat_wallet.fiat_wallet_currency == currency_type:
                # Check if sufficient balance exists in fiat_wallet
                if fiat_wallet.fiat_wallet_balance < amount:
                    return Response({"error": "Insufficient balance in fiat wallet"}, status=status.HTTP_400_BAD_REQUEST)

                # Deduct amount from fiat_wallet_balance
                fiat_wallet.fiat_wallet_balance -= amount
                fiat_wallet.save()

                # Deduct amount from UserCurrency balance
                user_currency, created = UserCurrency.objects.get_or_create(
                    wallet_id=wallet_id, 
                    currency_type=currency_type
                )
                user_currency.balance -= amount
                user_currency.save()

                return Response({
                    "message": "Amount withdrawn successfully",
                    "fiat_wallet_balance": fiat_wallet.fiat_wallet_balance,
                    "user_currency_balance": user_currency.balance
                }, status=status.HTTP_200_OK)
            else:
                # Fetch UserCurrency
                user_currency = UserCurrency.objects.filter(wallet_id=wallet_id, currency_type=currency_type).first()
                if not user_currency:
                    return Response({"error": "Currency not found in user's wallet"}, status=status.HTTP_400_BAD_REQUEST)

                # Check if sufficient balance exists in UserCurrency
                if user_currency.balance < amount:
                    return Response({"error": "Insufficient balance in user currency"}, status=status.HTTP_400_BAD_REQUEST)

                # Deduct amount from UserCurrency balance
                user_currency.balance -= amount
                user_currency.save()

                return Response({
                    "message": "Amount withdrawn successfully",
                    "user_currency_balance": user_currency.balance
                }, status=status.HTTP_200_OK)

    def list(self, request, *args, **kwargs):
        wallet_id = request.query_params.get('wallet_id')
        if not wallet_id:
            return Response({"error": "Missing wallet_id"}, status=status.HTTP_400_BAD_REQUEST)

        user_currencies = UserCurrency.objects.filter(wallet_id=wallet_id)
        serializer = UsersCurrenciesSerializer(user_currencies, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

    def create(self, request, *args, **kwargs):
        print(request.data)
        fiat_address = request.data.get('fiat_address')
        transaction_amount = float(request.data.get('transaction_amount'))
        print(transaction_amount)
        transaction_currency = request.data.get('transaction_currency')

        
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM currency_converter_fiatwallet WHERE fiat_wallet_address = %s", [fiat_address])
            fiat_wallet = cursor.fetchone()

        if not fiat_wallet:
            return JsonResponse({'status': 'address_failure', 'message': 'Fiat Address does not exist.'})

        try:
            
            with connection.cursor() as cursor:
                cursor.execute("SELECT fiat_wallet_id FROM currency_converter_fiatwallet ORDER BY fiat_wallet_id DESC LIMIT 1")
                last_wallet = cursor.fetchone()
                print("1")

            if not last_wallet:
                print("2")
                return JsonResponse({'status': 'failure', 'message': 'No wallet records found.'})
                

            last_wallet_id = last_wallet[0]  

            
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT balance FROM user_currencies WHERE wallet_id = %s AND currency_type = %s",
                    [last_wallet_id, transaction_currency]
                )
                currency_balance = cursor.fetchone()
                print("3")

            
            # Proceed with creating the transaction record
            return super().create(request, *args, **kwargs)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

class AccountTypeList(APIView):
    def get(self, request, format=None):
        account_types = AdminCMS.objects.all()  # Fetch all account types
        serializer = AdminCMSSerializer(account_types, many=True)  # Serialize the queryset
        return Response(serializer.data, status=status.HTTP_200_OK)



def get_user_registration_stats(request):
    # Daily registered users (last 6 days)
        daily_counts = CustomUser.objects.filter(
            user_joined_date__gte=now() - timedelta(days=6)
        ).extra(select={'day': 'date(user_joined_date)'}).values('day').annotate(count=Count('user_id'))

        # Monthly registered users (last 6 months)
        monthly_counts = CustomUser.objects.filter(
            user_joined_date__gte=now() - timedelta(days=180)
        ).extra(select={'month': "to_char(user_joined_date, 'YYYY-MM')"}).values('month').annotate(count=Count('user_id'))

        return JsonResponse({
            'daily': list(daily_counts),
            'monthly': list(monthly_counts),
        })