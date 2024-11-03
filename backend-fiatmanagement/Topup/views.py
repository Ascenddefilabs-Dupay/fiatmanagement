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

from .serializers import AdminCMSSerializer,TopupSerializer
import uuid

# from .serializers import AdminCMSSerializer
from django.db.models import Count # type: ignore
from django.utils.timezone import now, timedelta # type: ignore
from django.http import JsonResponse # type: ignore
from django.core.exceptions import ValidationError
from rest_framework.exceptions import ValidationError as DRFValidationError





from .serializers import AdminCMSSerializer
from django.db.models import Count # type: ignore
from django.utils.timezone import now, timedelta # type: ignore
from django.http import JsonResponse # type: ignore





from .serializers import AdminCMSSerializer
from django.db.models import Count # type: ignore
from django.utils.timezone import now, timedelta # type: ignore
from django.http import JsonResponse # type: ignore
from .models import UserCurrency
import json
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from .serializers import UsersCurrenciesSerializer
from .models import AdminCMS
import logging

import uuid
import base64
import qrcode
from io import BytesIO


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    
# class UserCurrencyBalanceView(APIView):
#     def get(self, request):
#         wallet_id = request.query_params.get('wallet_id')
#         currency_type = request.query_params.get('currency_type')

#         if not wallet_id or not currency_type:
#             return Response({"error": "wallet_id and currency_type are required."}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             # Fetch the user currency for the specific wallet and currency type
#             user_currency = UserCurrency.objects.get(wallet__fiat_wallet_id=wallet_id, currency_type=currency_type)
#             serializer = UsersCurrenciesSerializer(user_currency)
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         except UserCurrency.DoesNotExist:
#             return Response({"error": f"User currency for wallet_id {wallet_id} and currency_type {currency_type} not found."}, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def generate_wallet_id():
    latest_wallet = FiatWallet.objects.order_by('-fiat_wallet_id').first()
    if latest_wallet:
        last_id = latest_wallet.fiat_wallet_id
        if last_id.startswith('Wa'):
            number = int(last_id[2:])  # Extract the number part
        else:
            number = 0
        new_number = number + 1
        return f'Wa{new_number:010d}'  # Ensure ID is 12 characters long
    return 'Wa0000000001'  # Starting ID

def generate_wallet_address():
    while True:
        new_address = str(uuid.uuid4())
        if not FiatWallet.objects.filter(fiat_wallet_address=new_address).exists():
            return new_address

def generate_qr_code(email, phone_number):
    qr_data = f"{email}-{phone_number}"
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    img.save(buffer, "PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")

class FiatWalletViewSet(viewsets.ModelViewSet):
    queryset = FiatWallet.objects.all()
    serializer_class = FiatWalletSerializer
    lookup_field = 'fiat_wallet_id'

    def create(self, request, *args, **kwargs):
        data = request.data
        print("Request data:", data)  # Debug statement

        # Check for required fields
        required_fields = ['user_id', 'fiat_wallet_email']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return Response({"error": f"Missing fields: {', '.join(missing_fields)}"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Retrieve the user by user_id
            user_id = data['user_id']
            try:
                user = CustomUser.objects.get(user_id=user_id)  # Fetch the user record
                phone_number = user.user_phone_number  # Get phone number from user record
            except CustomUser.DoesNotExist:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

            # Use phone number from request data if provided, otherwise use the one from the user record
            fiat_wallet_phone_number = data.get('fiat_wallet_phone_number') or phone_number
            if not fiat_wallet_phone_number:
                return Response({"error": "Phone number is required and was not found."}, status=status.HTTP_400_BAD_REQUEST)

            # Check for an existing wallet with the same user_id
            existing_wallet = FiatWallet.objects.filter(user_id=user_id).first()
            if existing_wallet:
                # If a wallet already exists, reuse fiat_wallet_id and fiat_wallet_address
                return Response({
                    "message": "Wallet already exists for this user.",
                    "fiat_wallet_id": existing_wallet.fiat_wallet_id,
                    "fiat_wallet_address": existing_wallet.fiat_wallet_address
                }, status=status.HTTP_200_OK)

            # Generate wallet ID, address, and QR code if this is a new wallet
            fiat_wallet_id = generate_wallet_id()
            fiat_wallet_address = generate_wallet_address()
            qr_code = generate_qr_code(data['fiat_wallet_email'], fiat_wallet_phone_number)

            # Prepare the payload for saving the wallet
            wallet_data = {
                "fiat_wallet_id": fiat_wallet_id,
                "fiat_wallet_address": fiat_wallet_address,
                # "fiat_wallet_type": data['fiat_wallet_type'],
                "fiat_wallet_balance": data.get('fiat_wallet_balance', 0),
                "fiat_wallet_email": data['fiat_wallet_email'],
                "fiat_wallet_phone_number": fiat_wallet_phone_number,
                "user_id": user_id,
                "qr_code": qr_code,
            }

            print("Wallet data to be serialized:", wallet_data)  # Debug statement

            # Serialize and save the wallet
            serializer = self.get_serializer(data=wallet_data)
            serializer.is_valid(raise_exception=True)
            print("Serialized data:", serializer.validated_data)  # Debug statement
            self.perform_create(serializer)

            # Fetch all currency types from AdminCMS
            currency_types = AdminCMS.objects.exclude(currency_type__isnull=True).values_list('currency_type', flat=True)
            user_currency_data = []
            
            # Create a UserCurrency entry for each currency type
            for currency_type in currency_types:
                user_currency_data.append({
                    "wallet_id": fiat_wallet_id,
                    "currency_type": currency_type,
                    "balance": 0.0  # Set initial balance to 0
                })

            # Bulk create UserCurrency entries
            UserCurrency.objects.bulk_create([
                UserCurrency(**data) for data in user_currency_data
            ])

            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

        except (ValidationError, DRFValidationError) as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": "An unexpected error occurred: " + str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    lookup_field="user_id"

    

class CurrencyViewSet(viewsets.ModelViewSet):
    queryset = Currency.objects.all()  # Assuming you have a Currency model
    serializer_class = CurrencySerializer 

class BankViewSet(viewsets.ModelViewSet):
    queryset = Bank.objects.all()
    serializer_class = BankSerializer

# class UserCurrencyViewSet(viewsets.ReadOnlyModelViewSet):
   
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
    @action(detail=False, methods=['post'])
    def topup(self, request):
        
        wallet_id = request.data.get('wallet_id')
        currency_code = request.data.get('currency_code')
        amount = request.data.get('amount')
        transaction_hash = request.data.get('transaction_hash')

        # Validate required fields
        if not wallet_id or not currency_code or amount is None or not transaction_hash:
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
            # Update UserCurrency balance
            user_currency, created = UserCurrency.objects.get_or_create(
                wallet_id=wallet_id, 
                currency_type=currency_code
            )
            user_currency.balance += amount
            user_currency.save()
            
            # Prepare transaction data
            transaction_data = {
                "wallet_id": wallet_id,
                "transaction_amount": amount,
                "transaction_currency": currency_code,
                "transaction_type": "topup",
                "fiat_address": fiat_wallet.fiat_wallet_address,
                "transaction_status": "Success",
                "transaction_fee": 0.0,
                "transaction_hash": transaction_hash,
                "transaction_method": "wallet-topup",
            }

            # Save the transaction
            print(request.data)
            transaction_serializer = TransactionSerializer(data=transaction_data)
            if transaction_serializer.is_valid():
                

                transaction_serializer.save()
                return Response({
                    "message": "Top-up successful",
                    "user_currency_balance": user_currency.balance
                }, status=status.HTTP_200_OK)
            else:
                return Response(transaction_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
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
            cursor.execute("SELECT * FROM fiat_wallet WHERE fiat_wallet_address = %s", [fiat_address])
            fiat_wallet = cursor.fetchone()

        if not fiat_wallet:
            return JsonResponse({'status': 'address_failure', 'message': 'Fiat Address does not exist.'})

        try:
            
            with connection.cursor() as cursor:
                cursor.execute("SELECT fiat_wallet_id FROM fiat_wallet ORDER BY fiat_wallet_id DESC LIMIT 1")
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



@csrf_exempt
@require_POST
def convert_currency(request):
    try:
        data = json.loads(request.body)
        wallet_id = data['wallet_id']
        source_currency = data['source_currency']
        destination_currency = data['destination_currency']
        amount = data['amount']
        conversion_rate = data['conversion_rate']
        
        # Convert amount and conversion_rate to Decimal for precise arithmetic
        amt = Decimal(str(amount))
        con_rate = Decimal(str(conversion_rate))

        # Fetch the relevant user currencies
        source_currency_obj = UserCurrency.objects.filter(wallet_id=wallet_id, currency_type=source_currency).first()
        destination_currency_obj = UserCurrency.objects.filter(wallet_id=wallet_id, currency_type=destination_currency).first()

        if not source_currency_obj or not destination_currency_obj:
            return JsonResponse({'status': 'error', 'message': 'Invalid currencies or wallet ID'}, status=400)

        if source_currency_obj.balance < amt:
            return JsonResponse({'status': 'error', 'message': 'Insufficient balance'}, status=400)

        # Deduct the source amount and add the converted amount
        source_currency_obj.balance -= amt
        source_currency_obj.save()

        # Calculate the converted amount
        converted_amount = amt * con_rate
        destination_currency_obj.balance += converted_amount
        destination_currency_obj.save()

        return JsonResponse({'status': 'success', 'message': 'Currency conversion successful'})

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    

class DefaultCurrencyView(APIView):
    
    def get(self, request):
        # Get the currency_type from the query parameters
        currency_type = request.query_params.get('currency_type')


        if not currency_type:
            return Response({
                'error': 'Currency type is required.'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Fetch the AdminCMS entry for the requested currency
            admin_cms_entry = AdminCMS.objects.get(currency_type=currency_type)
            full_icon_url = f"https://res.cloudinary.com/dgfv6j82t/{admin_cms_entry.icon}"
            return Response({
                # 'currency_type': admin_cms_entry.currency_type,
                'icon':  full_icon_url   # This should be the full URL
            }, status=status.HTTP_200_OK)
        except AdminCMS.DoesNotExist:
            return Response({
                'error': f'Currency type {currency_type} not found.'
            }, status=status.HTTP_404_NOT_FOUND)

# @csrf_exempt
# @require_POST
# def validate_currencies(request):
#     try:
#         data = json.loads(request.body)
#         wallet_id = data['wallet_id']
#         source_currency = data['source_currency']
#         destination_currency = data['destination_currency']
        
#         # Check if the source and destination currencies exist
#         source_currency_obj = UserCurrency.objects.filter(wallet_id=wallet_id, currency_type=source_currency).first()
#         destination_currency_obj = UserCurrency.objects.filter(wallet_id=wallet_id, currency_type=destination_currency).first()


