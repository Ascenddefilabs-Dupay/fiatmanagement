from rest_framework import serializers
from .models import Project
from .models import Bank
from .models import FiatWallet,CustomUser
from .models import Currency
from .models import UserCurrency
from .models import Transaction


from datetime import date
import re
from .models import CustomUser
from django.core.files.base import ContentFile
import base64
from django.contrib.auth.hashers import check_password, make_password


class GoogleSignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['user_email', 'user_first_name', 'user_last_name']  # Only these fields for Google signup

    def create(self, validated_data):
        user = CustomUser.objects.create(
            user_email=validated_data['user_email'],
            user_first_name=validated_data['user_first_name'],
            user_last_name=validated_data['user_last_name']
        )
        return user


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['user_email', 'user_password']  # Regular signup with password
        extra_kwargs = {
            'user_password': {'write_only': True},
            'user_profile_photo': {'required': False},
            # 'user_type': {'default': 'customer'}
            
        }
       
    def validate_user_first_name(self, value):
        if not re.match("^[A-Za-z]*$", value):
            raise serializers.ValidationError("First name should only contain characters.")
        return value

    def validate_user_last_name(self, value):
        if not re.match("^[A-Za-z]*$", value):
            raise serializers.ValidationError("Last name should only contain characters.")
        return value

    def validate_user_dob(self, value):
        today = date.today()
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        if age < 18:
            raise serializers.ValidationError("You must be at least 18 years old to register.")
        return value

    def create(self, validated_data):
        user = CustomUser(**validated_data)
        # Ensure you hash the password
        # user.set_password(validated_data['user_password'])
        user.save()
        return user

    def to_internal_value(self, data):
        if 'user_profile_photo' in data and data['user_profile_photo'].startswith('data:image'):
            try:
                format, imgstr = data['user_profile_photo'].split(';base64,')
                ext = format.split('/')[-1]
                imgstr += '=' * (-len(imgstr) % 4)  # Correct padding
                image_data = base64.b64decode(imgstr)
                file_path = f'profile_photos/temp.{ext}'
                with open(file_path, 'wb') as f:
                    f.write(image_data)
                data['user_profile_photo'] = file_path
            except (TypeError, base64.binascii.Error):
                raise serializers.ValidationError({'user_profile_photo': 'Invalid image data.'})
        return super().to_internal_value(data)

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
        fields = '__all__'  # This includes all fields of the Transaction model

    # Optionally, you can add custom validation or methods here
    def validate_transaction_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("Transaction amount cannot be negative.")
        return value