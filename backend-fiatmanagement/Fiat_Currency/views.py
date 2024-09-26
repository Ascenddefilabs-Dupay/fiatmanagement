from django.http import HttpResponse, JsonResponse
from .models import UserCurrency,AdminCMS

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
    
# def get_icon_by_currency(request, currency_type):
#     print('final currency',currency_type)
#     try:
#         # Fetch the icon based on the currency_type
        
#         admin_cms_entry = AdminCMS.objects.objects.filter(currency_type=currency_type)
#         icon = admin_cms_entry.icon
#         print(icon)  # Print the icon to the console
#         return HttpResponse(f"Icon: {icon}")  # Return a simple response
#     except AdminCMS.DoesNotExist:
#         print("Icon not found for the provided currency type.")
#         return HttpResponse("Icon not found.", status=404)
    
def get_currency_icon_by_currency_type(request, currency_type):
    try:
        # Fetch the icon details based on currency_type from AdminCMS
        currency_icons = AdminCMS.objects.filter(currency_type=currency_type)
        print('Currency Type:', currency_type)
        
        # Check if the record exists
        if not currency_icons.exists():
            return JsonResponse({"message": f"No currency icons found for currency type: {currency_type}"}, status=404)
        
        # Prepare the response data
        currency_icons_data = [
            {
                "account_type": icon.account_type,
                "currency_type": icon.currency_type,
                "icon": icon.icon,
            }
            for icon in currency_icons
        ]

        # Return the icons as a JSON response
        return JsonResponse({"currency_icons": currency_icons_data}, safe=False, status=200)

    except Exception as e:
        # Handle any unexpected errors
        return JsonResponse({"error": str(e)}, status=500)