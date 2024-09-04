from rest_framework import serializers
from .models import Project
from .models import Bank
from .models import FiatWallet,CustomUser
from .models import Currency
from .models import UserCurrency
from .models import Transaction


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



class UsersCurrenciesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserCurrency
        fields = '__all__'



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
        fields = '__all__'

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