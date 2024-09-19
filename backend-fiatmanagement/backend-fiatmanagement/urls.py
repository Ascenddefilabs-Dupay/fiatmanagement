# backend-fiatmanagement/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('fiatmanagementapi/', include('Topup.urls')),
    path('addbank/', include('AddBank.urls')),  # Include AddBank URLs
]
