from django.db import models
import uuid
from django.core.validators import RegexValidator
from django.db.models import Max
import random

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
        editable=False
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
