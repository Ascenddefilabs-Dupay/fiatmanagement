from rest_framework import serializers
from .models import Project
from .models import FiatWallet,User
from .models import Currency

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'








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