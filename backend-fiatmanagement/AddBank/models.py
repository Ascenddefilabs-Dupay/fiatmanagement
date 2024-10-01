
from django.db import models
import random
from cloudinary.models import CloudinaryField

def generate_id():
    return f'{random.randint(100000, 999999)}'
class Bank(models.Model):
    id = models.CharField(max_length=6, primary_key=True, default=generate_id, editable=False)
    phone_number = models.CharField(max_length=20,null=True)  
    user_id = models.CharField(max_length=255)
    bank_name = models.CharField(max_length=255)
    account_holder_name = models.CharField(max_length=255)
    account_number = models.CharField(max_length=255)  # Using CharField for consistency
    ifsc_code = models.CharField(max_length=11)
    branch_name = models.CharField(max_length=255)
    bic_code = models.CharField(max_length=11)
    currency = models.CharField(max_length=10)
    kyc_document = CloudinaryField('bankIcon', folder='fiatmanagement', blank=True, null=True)  # Default file storage

    def __str__(self):
        return self.bank_name

    class Meta:
        db_table = 'add_bank'

