# encoding: iso-8859-1 
"""
Django settings for IAFASTTRACKMODEL project.

Based on by 'django-admin startproject' using Django 2.1.2.

For more information on this file, see
https://docs.djangoproject.com/en/2.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.1/ref/settings/
"""

import os
import logging  # Import logging
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Configura logging básico si no hay configuración previa
logging.basicConfig(level=logging.INFO)

# Configuración de archivos estáticos
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')  # destino para collectstatic

# Si tienes archivos estáticos personalizados, descomenta y ajusta la siguiente línea:
# STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/2.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '4cfeccdb-b04b-4b34-9255-d6f2e681c463'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

#ALLOWED_HOSTS = ['https://ia-fast-track-hggfakg6fch5h2bd.francecentral-01.azurewebsites.net', 'ia-fast-track-hggfakg6fch5h2bd.francecentral-01.azurewebsites.net', '127.0.0.1', 'localhost']
ALLOWED_HOSTS = ['.appspot.com', 'ai.synergiatechexperts.com', '127.0.0.1', 'localhost']

CSRF_TRUSTED_ORIGINS = [
    "https://ia-fast-track-hggfakg6fch5h2bd.francecentral-01.azurewebsites.net",
]

# Application references
# https://docs.djangoproject.com/en/2.1/ref/settings/#std:setting-INSTALLED_APPS
INSTALLED_APPS = [
    # Add your apps here to enable them
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'model',
]

# Middleware framework
# https://docs.djangoproject.com/en/2.1/topics/http/middleware/
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'IAFASTTRACKMODEL.urls'

# Template configuration
# https://docs.djangoproject.com/en/2.1/topics/templates/
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

WSGI_APPLICATION = 'IAFASTTRACKMODEL.wsgi.application'

# Database
# https://docs.djangoproject.com/en/2.1/ref/settings/#databases

# Detect environment: use 'PRODUCTION' env var or DEBUG flag
if os.environ.get('PRODUCTION', '').lower() == 'true' or not DEBUG:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': 'nombre_base_datos',
            'USER': 'usuario@servidor',
            'PASSWORD': 'contraseña',
            'HOST': 'servidor.postgres.database.azure.com',
            'PORT': '5432',
        }
    }
    db_info = DATABASES['default']
    conn_str = f"ENGINE={db_info['ENGINE']}; NAME={db_info['NAME']}; USER={db_info['USER']}; HOST={db_info['HOST']}; PORT={db_info['PORT']}"
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
        }
    }
    db_info = DATABASES['default']
    conn_str = f"ENGINE={db_info['ENGINE']}; NAME={db_info['NAME']}"

print(f"Conectando a la base de datos: {conn_str}")

# Password validation
# https://docs.djangoproject.com/en/2.1/ref/settings/#auth-password-validators
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
# https://docs.djangoproject.com/en/2.1/topics/i18n/
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True
