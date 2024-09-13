
from django.db import connection

from django.db import models
import uuid
from django.core.validators import RegexValidator
from django.db.models import Max
import random
# from cloudinary.models import CloudinaryField # type: ignore
# import qrcode
from io import BytesIO
import base64
from django.utils import timezone
import re
import qrcode





# Create your models here.
class Project(models.Model):
    name = models.CharField(max_length=100)
    email = models.CharField(max_length=100)


    def __str__(self):
        return self.name


class AdminCMS(models.Model):
    account_type = models.CharField(max_length=100, primary_key=True)
    currency_type = models.CharField(max_length=100)

    def __str__(self):
        return self.account_type

    class Meta:
        db_table = 'admincms'  # Explicitly set the table name

class CustomUser(models.Model):
    user_id = models.CharField(max_length=8, primary_key=True)
    user_email = models.EmailField(unique=True)
    user_first_name = models.CharField(max_length=30)
    user_middle_name = models.CharField(max_length=30, blank=True)
    user_last_name = models.CharField(max_length=30)
    user_dob = models.DateField()
    user_phone_number = models.BigIntegerField()
    user_country = models.CharField(max_length=50)
    user_city = models.CharField(max_length=50)
    user_address_line_1 = models.CharField(max_length=255)  
    user_address_line_2 = models.CharField(max_length=255) 
    user_pin_code = models.BigIntegerField()
    user_state = models.CharField(max_length=50)  
    user_profile_photo = models.CharField(max_length=255, blank=True, null=True)
    user_password = models.CharField(max_length=255)
    user_type = models.CharField(max_length=50,default='customer')
    user_old_password = models.CharField(max_length=128, blank=True, null=True)
    user_joined_date = models.DateTimeField(default=timezone.now, blank=True, null=True)
    last_login = models.DateTimeField(default=timezone.now,blank=True,null=True)


    
    

    users_daily_limit = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=0,
    )
    users_monthly_limit = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=0,
    )

    class Meta:
        db_table = 'users'
    # def _str_(self):
    # return f"{self.user_first_name} {self.user_last_name}"


class FiatWallet(models.Model):
    fiat_wallet_id = models.CharField(
        primary_key=True,
        max_length=12,
        unique=True,
        editable=False
    )
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
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
        default=0
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
    fiat_wallet_email = models.EmailField(unique=True)  # Change to EmailField
    qr_code = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        self.fiat_wallet_currency = self.fiat_wallet_currency.upper()

        # Generate fiat_wallet_id with first letter capital and remaining characters camelCase
        if not self.fiat_wallet_id:
            max_id = FiatWallet.objects.aggregate(max_id=Max('fiat_wallet_id'))['max_id']
            if max_id is None:
                next_id_number = 1
            else:
                numeric_part = int(max_id[2:]) + 1
                next_id_number = numeric_part
            
            next_id = f"wa{next_id_number:010d}"
            camel_case_id = next_id.capitalize()  # Capitalize the first letter, the rest remain camelCase
            self.fiat_wallet_id = camel_case_id

        # Check for fiat_wallet_address
        if not self.fiat_wallet_address:
            self.fiat_wallet_address = self.generate_wallet_address()

        # Automatically assign a user if none is provided
        if not self.user_id:
            default_user = CustomUser.objects.first()  # Get the first user from the database
            if default_user is None:
                raise ValueError("No user available. Please create a user first.")
            self.user = default_user

        # Generate QR code if necessary
        self.generate_qr_code()

        super().save(*args, **kwargs)
    def generate_wallet_address(self):
        currency_prefix = self.fiat_wallet_currency[:3].upper()

        if currency_prefix in ['INR', 'USD', 'EUR']:
            return currency_prefix + ''.join(random.choices('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', k=63))
        else:
            raise ValueError("Unsupported currency type")
    def __str__(self):
        return f"{self.user.name} - {self.fiat_wallet_type}"


    def generate_qr_code(self):
        print("hello world......")
        qr_data = f"{self.fiat_wallet_email}-{self.fiat_wallet_phone_number}"
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )

        qr.add_data(qr_data)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, "PNG")
        img_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
        self.qr_code = img_str
        print(qr)

    class Meta:
        db_table = 'fiat_wallet'


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
    
class UserCurrency(models.Model):
    id = models.AutoField(primary_key=True)
    wallet_id = models.CharField(max_length=255, unique=False)
    currency_type = models.CharField(max_length=100)
    balance = models.DecimalField(max_digits=18, decimal_places=8, default=0)

    def __str__(self):
        return f"{self.wallet_id} - {self.currency_type} - Balance: {self.balance}"
    class Meta:
        db_table = 'user_currencies'
    
class Transaction(models.Model):
    transaction_id = models.CharField(max_length=100, unique=True, blank=True, editable=False, primary_key=True)
    transaction_type = models.CharField(max_length=50 ,null=True, blank=True)
    transaction_amount = models.DecimalField(max_digits=18, decimal_places=8 ,null=True, blank=True)
    transaction_currency = models.CharField(max_length=10 ,null=True, blank=True)
    transaction_timestamp = models.DateTimeField(auto_now_add=True)
    transaction_status = models.CharField(max_length=50 ,null=True, blank=True)
    transaction_hash = models.UUIDField()
    transaction_fee = models.DecimalField(max_digits=18, decimal_places=8, null=True, blank=True)
    user_phone_number = models.CharField(max_length=15 , null=True, blank=True)
    wallet_id = models.CharField(max_length=100 ,null=True, blank=True)
    sender_mobile_number= models.CharField(max_length=15 ,null=True, blank=True)
    fiat_address = models.CharField(max_length=255, null=True, blank=True)
    transaction_method = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        db_table = 'transaction_table'

    def __str__(self):
        return f"{self.transaction_id} - {self.transaction_amount} {self.transaction_currency}"

    def save(self, *args, **kwargs):
        if not self.transaction_id:
            self.transaction_id = self.generate_transaction_id()

        # if not self.wallet_id:
        #     self.wallet_id = self.wallet_id_fetch()

        if not self.sender_mobile_number:
            self.sender_mobile_number = self.sender_mobile_number_fetch()
        

        super().save(*args, **kwargs)

    def generate_transaction_id(self):
        latest_transaction = Transaction.objects.order_by('-transaction_id').first()
        if latest_transaction and re.search(r'\d+', latest_transaction.transaction_id):
            last_id = latest_transaction.transaction_id
            number = int(re.search(r'\d+', last_id).group())
            new_number = number + 1
            return f'TRANS{new_number:06d}'
        return 'TRANS000001'
    
    
    def sender_mobile_number_fetch(self):
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM fiat_wallet")
            rows = cursor.fetchall()
        print(rows[-1][7])
        return rows[-1][7]
    



#     from django.core.exceptions import ValidationError

# def clean(self):
#     # Check if a wallet already exists for the user with the same currency
#     if FiatWallet.objects.filter(user=self.user, fiat_wallet_currency=self.fiat_wallet_currency).exists():
#         raise ValidationError(f"User already has a wallet with currency: {self.fiat_wallet_currency}")
#     return super().clean()