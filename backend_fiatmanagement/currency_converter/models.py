from django.db import models
import uuid
from django.core.validators import RegexValidator
from django.db.models import Max
import random
from cloudinary.models import CloudinaryField # type: ignore

# Create your models here.
class Project(models.Model):
    name = models.CharField(max_length=100)
    email = models.CharField(max_length=100)


    def __str__(self):
        return self.name
    



class User(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(
        max_length=15,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message="Invalid phone number format."
            )
        ],
        blank=True,
        null=True,
        unique=True
    )
    users_data_limit = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=0,  # Default limit can be 0 or any other appropriate value
    )

    def __str__(self):
        return self.name

class FiatWallet(models.Model):
    fiat_wallet_id = models.CharField(
        primary_key=True,
        max_length=12,
        unique=True,
        editable=False
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, editable=False)
    fiat_wallet_type = models.CharField(max_length=50)
    fiat_wallet_currency = models.CharField(max_length=10)
    fiat_wallet_address = models.CharField(
        max_length=66,
        unique=True,
        editable=False
    )
    fiat_wallet_balance = models.DecimalField(
        max_digits=18, 
        decimal_places=8, 
        default=0, 
        
    )
    fiat_wallet_created_time = models.DateTimeField(auto_now_add=True)
    fiat_wallet_updated_time = models.DateTimeField(auto_now=True)
    fiat_wallet_phone_number = models.CharField(
        max_length=15,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message="Invalid phone number format."
            )
        ],
        blank=True,
        null=True,
        unique=True
    )
    fiat_wallet_username = models.CharField(max_length=50, unique=True)
    # fiat_wallet_amount_limit = models.DecimalField(
    #     max_digits=18,
    #     decimal_places=2,
    #     default=0,
    # )
    # fiat_wallet_limit_type = models.CharField(max_length=10, choices=[('Daily', 'Daily'), ('Weekly', 'Weekly'), ('Monthly', 'Monthly')], default='Daily')

    def __str__(self):
        return f"{self.user.name} - {self.fiat_wallet_type}"

    def generate_wallet_address(self):
        currency_prefix = self.fiat_wallet_currency[:3].upper()

        if currency_prefix in ['INR', 'USD', 'EUR']:
            return currency_prefix + ''.join(random.choices('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', k=63))
        else:
            raise ValueError("Unsupported currency type")

    def save(self, *args, **kwargs):
        self.fiat_wallet_currency = self.fiat_wallet_currency.upper()
        if not self.fiat_wallet_id:
            max_id = FiatWallet.objects.aggregate(max_id=Max('fiat_wallet_id'))['max_id']
            if max_id is None:
                next_id = 'wa0000000001'
            else:
                numeric_part = int(max_id[2:]) + 1
                next_id = f"wa{numeric_part:010d}"
            self.fiat_wallet_id = next_id
        
        if not self.fiat_wallet_address:
            self.fiat_wallet_address = self.generate_wallet_address()

        # Set a default user if none is provided
        if not self.user_id:
            default_user = User.objects.first()  # Get the default user from the database
            if default_user is None:
                raise ValueError("No default user available. Please create a user first.")
            self.user = default_user

        super().save(*args, **kwargs)


class Currency(models.Model):
    currency_code = models.CharField(max_length=10, primary_key=True)
    currency_country = models.CharField(max_length=100,unique=True)
    currency_icon = models.ImageField(upload_to='currency_icons/')
    currency_icon=models.FileField(upload_to='photos',unique=True, blank=True,null=True)


    def __str__(self):
        return f"{self.currency_country} - {self.currency_code}"
class Bank(models.Model):
    bank_name = models.CharField(max_length=100, unique=True)
    bank_icon = models.FileField(upload_to='bank_icons', blank=True, null=True)  # Use FileField for consistency

    def __str__(self):
        return self.bank_name
    
class UsersCurrencies(models.Model):
    fiat_wallet = models.ForeignKey(FiatWallet, on_delete=models.CASCADE)
    currency_type = models.ForeignKey(Currency, on_delete=models.CASCADE, to_field='currency_code')
    balance = models.DecimalField(max_digits=18, decimal_places=8, default=0)

    def __str__(self):
        return f"{self.fiat_wallet} - {self.currency_type.currency_code} - Balance: {self.balance}"

    class Meta:
        unique_together = ('fiat_wallet', 'currency_type')