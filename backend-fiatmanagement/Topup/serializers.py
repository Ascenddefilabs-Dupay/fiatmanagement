from rest_framework import serializers
from .models import Project
from .models import Bank
from .models import FiatWallet,CustomUser
from .models import Currency
from .models import UserCurrency
from .models import Transaction
from .models import AdminCMS


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'

class BankSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bank
        fields = '__all__'

    def validate_bank_name(self, value):
        if Bank.objects.filter(bank_name=value).exists():
            raise serializers.ValidationError("Bank name already exists.")
        return value

class AdminCMSSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminCMS
        fields = ['account_type', 'currency_type','icon'] 

class UsersCurrenciesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserCurrency
        fields = '__all__'

    def validate_currency_code(self, value):
        if len(value) > 15:
            raise serializers.ValidationError("Currency code is too long.")
        return value

class FiatWalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = FiatWallet
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = '__all__'


class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = ['currency_code', 'currency_country', 'currency_icon']
    
    currency_country = serializers.CharField(required=False)
    def validate_currency_code(self, value):
        if Currency.objects.filter(currency_code=value).exists():
            raise serializers.ValidationError("Currency code already exists.")
        return value

    def validate_currency_country(self, value):
        if Currency.objects.filter(currency_country=value).exists():
            raise serializers.ValidationError("Currency country already exists.")
        return value
    
class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'  

    # Optionally, you can add custom validation or methods here
    def validate_transaction_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("Transaction amount cannot be negative.")
        return value

class TopupSerializer(serializers.Serializer):
    wallet_id = serializers.CharField()
    currency_code = serializers.CharField()  # Required field
    currency_country = serializers.CharField()  # Required field
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)