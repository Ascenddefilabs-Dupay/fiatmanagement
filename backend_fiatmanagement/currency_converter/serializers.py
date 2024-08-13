from rest_framework import serializers
from .models import Project
from .models import Bank
from .models import FiatWallet,User
from .models import Currency

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







class FiatWalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = FiatWallet
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
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