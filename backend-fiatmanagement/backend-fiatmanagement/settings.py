"""
Django settings for backend-fiatmanagement project.

Generated by 'django-admin startproject' using Django 5.0.1.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.0/ref/settings/
"""

import os
import cloudinary
import cloudinary.uploader
import cloudinary.api 
import cloudinary.uploader
import cloudinary.api
from pathlib import Path
    
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-gqj&ta5j_u0hy6ck^2&r!yy&-f84cd8)ix@$8nfl7ycwe%3ift'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = [
    'fiatmanagement-rcfpsxcera-uc.a.run.app',
    'fiatmanagement-ind-255574993735.asia-south1.run.app'
    
]
# ALLOWED_HOSTS = ['localhost','127.0.0.1']


# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'Topup',
    'AddBank',
    'Fiat_Currency',
    'cloudinary_storage',
    'cloudinary',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware'
]



CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
CORS_ALLOW_METHODS = [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS'
]
CORS_ALLOW_ALL_ORIGINS = True

ROOT_URLCONF = 'backend-fiatmanagement.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend-fiatmanagement.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#data
DATABASES = {
    'default': {
        'ENGINE': 'django_cockroachdb',
        'NAME': 'dupay',
        'USER': 'dupay',
        'PASSWORD': 'lPVRIuSyVCJqfmghd7ckBw',
        'HOST': 'chill-dibbler-5989.7s5.aws-ap-south-1.cockroachlabs.cloud',
        'PORT': '26257',
        'sslmode': 'disable'
    }
    }

CLOUDINARY_STORAGE = {
<<<<<<< HEAD
    'CLOUD_NAME':'dgfv6j82t',
    'API_KEY': '235116669118225',
    'API_SECRET': 'zRMrcJ0xAtw8sI_xV3v3GGx_0es'
=======
    'CLOUD_NAME': 'dgfv6j82t',
    'API_KEY': '235116669118225',
    'API_SECRET': 'zRMrcJ0xAtw8sI_xV3v3GGx_0es',
>>>>>>> bac414a331015c8e9388cabf5ad60f2403465e2a
}
cloudinary.config(
    cloud_name='dgfv6j82t',
    api_key='235116669118225',
    api_secret='zRMrcJ0xAtw8sI_xV3v3GGx_0es'
)

DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
