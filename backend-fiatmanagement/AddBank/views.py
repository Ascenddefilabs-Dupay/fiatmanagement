
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from .models import Bank
from django.shortcuts import get_object_or_404
from .serializers import BankSerializer
from django.db import connection
import json

@api_view(['GET'])
def get_banks_by_user(request, user_id):
    try:
        banks = Bank.objects.filter(user_id=user_id)
        serializer = BankSerializer(banks, many=True)
        return Response(serializer.data, status=200)
    except Exception as e:
        return Response({'error': str(e)}, status=400)
@api_view(['POST'])
def add_bank(request):
    # Print request data for debugging
    print("Received request data:", request.data)
    print("Received request files:", request.FILES)

    user_id = request.data.get('user_id')
    if not user_id:
        return Response({'error': 'user_id is missing'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Debug print for user_id
    print("user_id received:", user_id)

    # Fetch user_phone_number from users table using raw SQL
    with connection.cursor() as cursor:
        cursor.execute("SELECT user_phone_number FROM users WHERE user_id = %s", [user_id])
        result = cursor.fetchone()
    
    if not result:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    phone_number = result[0]

    # Prepare data to be serialized
    bank_data = {
        'user_id': user_id,
        'phone_number': phone_number,
        'bank_name': request.data.get('bank_name'),
        'account_holder_name': request.data.get('account_holder_name'),
        'account_number': request.data.get('account_number'),
        'ifsc_code': request.data.get('ifsc_code'),
        'branch_name': request.data.get('branch_name'),
        
        'bic_code': request.data.get('bic_code'),
        'currency': request.data.get('currency'),
        'kyc_document': request.FILES.get('kyc_document'),
    }

    # Debug print for bank_data
    print("Bank data to be  serialized:", bank_data)

    serializer = BankSerializer(data=bank_data)
    if serializer.is_valid():
        print("Serializer is valid. Saving data...")
        serializer.save()
        return Response({'message': 'Bank added successfully!'}, status=status.HTTP_201_CREATED)
    print("Serializer errors:", serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
def get_bank_details(request, user_id, bank_name):
    try:
        bank = get_object_or_404(Bank, user_id=user_id, bank_name=bank_name)
        bank_data = {
            'user_id': bank.user_id,
            'account_holder_name': bank.account_holder_name,
            'account_number': bank.account_number,
            'ifsc_code': bank.ifsc_code,
            'branch_name': bank.branch_name,
            'bic_code': bank.bic_code,
            'currency': bank.currency
        }
        return JsonResponse(bank_data)
    except Bank.DoesNotExist:
        return JsonResponse({'error': 'Bank not found'}, status=404)
@api_view(['DELETE'])
def delete_bank_account(request, bank_id):
    try:
        # Use raw SQL to delete the bank by ID
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM add_bank WHERE id = %s", [bank_id])
        return Response({'message': 'Bank account deleted successfully!'}, status=200)
    except Exception as e:
        return Response({'error': str(e)}, status=400)
