from django.shortcuts import render
from django.db import connection
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
from .models import AdminCMS,UserCurrency
from decimal import Decimal, InvalidOperation
import json
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST


def get_fiat_wallet_by_user_id(request, wallet_id):
    try:
        # Fetch all fiat wallet details for the given user_id
        fiat_wallets = UserCurrency.objects.filter(wallet_id=wallet_id)
        print('wallet_id',wallet_id)
        
        # If no records found, return a message
        if not fiat_wallets.exists():
            return JsonResponse({"message": "No fiat wallets found for this user"}, status=404)
        
        # Serialize the results into a dictionary format
        fiat_wallets_data = []
        for wallet in fiat_wallets:
            fiat_wallets_data.append({
                "id": wallet.id,
                "wallet_id": wallet.wallet_id,
                "currency_type": wallet.currency_type,
                "balance": wallet.balance,
            })

        print(wallet.wallet_id)
        
        # Return the data as a JSON response
        return JsonResponse({"fiat_wallets": fiat_wallets_data}, safe=False, status=200)
    
    except Exception as e:
        return JsonResponse({"error": str(e)})
# Create your views here.
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
    


# def get_all_currency_icons(request):
#     try:
#         # Fetch all currency icons
#         currency_icons = AdminCMS.objects.all()
        
#         # Prepare the response data
#         currency_icons_data = [
#             {
#                 "account_type": icon.account_type,
#                 "currency_type": icon.currency_type,
#                 "icon": icon.icon.url if icon.icon else None,  # Ensure to get the URL of the icon
#             }
#             for icon in currency_icons
#         ]

#         # Return the icons as a JSON response
#         return JsonResponse({"currency_icons": currency_icons_data}, safe=False, status=200)

#     except Exception as e:
#         # Handle any unexpected errors
#         return JsonResponse({"error": str(e)}, status=500)


# def get_all_currency_icons(request):
#     try:
#         # Fetch all currency icons from AdminCMS
#         currency_icons = AdminCMS.objects.all()
        
#         # Prepare the response data
#         currency_icons_data = [
#             {
#                 "account_type": icon.account_type,
#                 "currency_type": icon.currency_type,
#                 "icon": icon.icon,
#             }
#             for icon in currency_icons
#         ]

#         # Return the icons as a JSON response
#         return JsonResponse({"currency_icons": currency_icons_data}, safe=False, status=200)

#     except Exception as e:
#         # Handle any unexpected errors
#         return JsonResponse({"error": str(e)}, status=500)
    
def get_all_currency_icons(request):
    try:
        # Fetch all currency icons
        currency_icons = AdminCMS.objects.all()
        
        # Prepare the response data
        currency_icons_data = [
            {
                "currency_code": icon.currency_type,
                # "currency_country": icon.currency_country,
                "currency_icon": icon.icon if icon.icon else None  # Get the URL of the image if it exists
            }
            for icon in currency_icons
        ]

        # Return the icons as a JSON response
        return JsonResponse({"currency_icons": currency_icons_data}, safe=False, status=200)

    except Exception as e:
        # Handle any unexpected errors
        print(e)
        return JsonResponse({"error": str(e)}, status=500)
    

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
    

