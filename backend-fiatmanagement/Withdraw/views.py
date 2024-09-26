from django.db import connection
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

@api_view(['POST'])
def get_wallet_amount(request):
    wallet_id = request.data.get('wallet_id')
    currency = request.data.get('currency')

    try:
        # Check if wallet_id exists in the user_currencies table
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1 FROM user_currencies WHERE wallet_id = %s", [wallet_id])
            wallet_exists = cursor.fetchone()  # Check if the wallet exists

        if not wallet_exists:
            return Response({'error': 'Wallet ID not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Check if currency exists for the given wallet_id
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT balance FROM user_currencies
                WHERE wallet_id = %s AND currency_type = %s
            """, [wallet_id, currency])
            result = cursor.fetchone()

        if result:
            amount = result[0]
            return Response({'amount': amount}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Currency not found.'}, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)




@api_view(['POST'])
def update_wallet_amount(request):
    wallet_id = request.data.get('wallet_id')
    currency = request.data.get('currency')
    amount_to_deduct = request.data.get('new_amount')

    try:
        # Check if wallet_id and currency exist
        with connection.cursor() as cursor:
            # Get current amount
            cursor.execute("""
                SELECT balance FROM user_currencies
                WHERE wallet_id = %s AND currency_type = %s
            """, [wallet_id, currency])
            result = cursor.fetchone()

            if not result:
                return Response({'error': 'Wallet ID or currency not found.'}, status=status.HTTP_404_NOT_FOUND)

            current_amount = result[0]

            # Validate if sufficient balance is available
            if current_amount < amount_to_deduct:
                return Response({'error': 'Insufficient balance for the withdrawal.'}, status=status.HTTP_400_BAD_REQUEST)

            # Update the amount
            new_amount = current_amount - amount_to_deduct
            cursor.execute("""
                UPDATE user_currencies
                SET balance = %s
                WHERE wallet_id = %s AND currency_type = %s
            """, [new_amount, wallet_id, currency])

        return Response({'message': 'Withdrawal successful', 'new_amount': new_amount}, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Error occurred: {e}")  # Log the error to console
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




@api_view(['POST'])
def get_bank_names(request):
    user_id = request.data.get('user_id')  # Get user_id from the request

    if not user_id:
        return Response({'error': 'User ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Fetch bank names where user_id matches in the add_bank table
        with connection.cursor() as cursor:
            cursor.execute("SELECT bank_name FROM add_bank WHERE user_id = %s", [user_id])
            bank_names = cursor.fetchall()

        # Convert the list of tuples to a list of strings
        bank_names = [bank_name[0] for bank_name in bank_names]

        if not bank_names:
            return Response({'error': 'No banks found for this user.'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'bank_names': bank_names}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['POST'])
def get_currency_icon(request):
    currency = request.data.get('currency')
    
    if not currency:
        return Response({'error': 'Currency not provided.'}, status=status.HTTP_400_BAD_REQUEST)
    
    with connection.cursor() as cursor:
        cursor.execute("SELECT icon FROM admincms WHERE currency_type = %s", [currency])
        result = cursor.fetchone()
    
    if result:
        icon_url = result[0]  # Assuming the column 'icon_url' holds the URL of the icon
        return Response({'icon_url': icon_url}, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Currency icon not found.'}, status=status.HTTP_404_NOT_FOUND)