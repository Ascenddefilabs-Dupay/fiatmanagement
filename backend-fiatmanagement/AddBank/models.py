# AddBank/models.py
from django.db import models

class Bank(models.Model):
    bank_name = models.CharField(max_length=255)
    account_holder_name = models.CharField(max_length=255)
    account_number = models.CharField(max_length=255)  # Using CharField for consistency
    ifsc_code = models.CharField(max_length=11)
    branch_name = models.CharField(max_length=255)
    bic_code = models.CharField(max_length=11)
    currency = models.CharField(max_length=10)
    kyc_document = models.ImageField(upload_to='bank_icons/')  # Default file storage

    def __str__(self):
        return self.bank_name
    class Meta:
        db_table = 'add_bank' 