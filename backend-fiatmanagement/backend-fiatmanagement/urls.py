# backend-fiatmanagement/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('fiatmanagementapi/', include('Topup.urls')),
    path('addbank/', include('AddBank.urls')),  # Include AddBank URLs
    path('Fiat_Currency/', include('Fiat_Currency.urls')),
    path('fiat_withdraw/',include('Withdraw.urls')),
]
