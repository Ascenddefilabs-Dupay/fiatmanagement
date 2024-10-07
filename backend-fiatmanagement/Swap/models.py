from django.db import models

# Create your models here.
from django.db import models

# Create your models here.
from django.db import models
from django.core.validators import RegexValidator
# Create your models here.
class FiatWallet(models.Model):
    fiat_wallet_id = models.CharField(max_length=12, blank=True)  # ID should be unique if necessary
    fiat_wallet_address = models.CharField(max_length=255, blank=True)
    fiat_wallet_type = models.CharField(max_length=50)
    fiat_wallet_currency = models.CharField(max_length=10)
    fiat_wallet_balance = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    fiat_wallet_created_time = models.DateTimeField(auto_now_add=True)
    fiat_wallet_updated_time = models.DateTimeField(auto_now=True)
    fiat_wallet_phone_number = models.CharField(
        max_length=15,
        validators=[RegexValidator(
            regex=r'^\+?1?\d{9,15}$',
            message="Invalid phone number format."
        )],
        blank=True,
        primary_key=True
    )
    fiat_wallet_email = models.EmailField()
    user_id = models.CharField(max_length=255)
    qr_code = models.TextField(blank=True, null=True)


    class Meta:
        db_table = 'fiat_wallet'
        managed = False


class UserCurrency(models.Model):
    id = models.AutoField(primary_key=True)
    wallet_id = models.CharField(max_length=255, unique=False)
    currency_type = models.CharField(max_length=100)
    balance = models.DecimalField(max_digits=18, decimal_places=8, default=0)

    def __str__(self):
        return f"{self.wallet_id} - {self.currency_type} - Balance: {self.balance}"
    class Meta:
        db_table = 'user_currencies'
        managed = False


class AdminCMS(models.Model):
    id = models.PositiveIntegerField(primary_key=True, editable=False)
    account_type = models.CharField(max_length=100, null=True, blank=True)
    currency_type = models.CharField(max_length=100, null=True, blank=True)
    icon = models.CharField(max_length=255, null=True, blank=True)
    # icon = models.FileField(upload_to='fiatmanagement', blank=True,null=True)
    
    class Meta:
        db_table = 'admincms'
        managed = False