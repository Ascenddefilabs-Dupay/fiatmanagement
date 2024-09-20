from django.http import JsonResponse
from .models import UserCurrency

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