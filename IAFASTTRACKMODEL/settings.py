# encoding: iso-8859-1 
"""
Django settings for IAFASTTRACKMODEL project.

Based on by 'django-admin startproject' using Django 2.1.2.

For more information on this file, see
https://docs.djangoproject.com/en/2.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.1/ref/settings/
"""

from math import log
import os
import logging  # Import logging
from pathlib import Path
from re import L
import pymysql
pymysql.install_as_MySQLdb()

BASE_DIR = Path(__file__).resolve().parent.parent

# ---- OpenAI configuration ----
OPENAI_ENDPOINT = os.getenv("OPENAI_ENDPOINT", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_API_VERSION = os.getenv("OPENAI_API_VERSION", "")
OPENAI_API_TYPE = os.getenv("OPENAI_API_TYPE", "")

# Configura logging básico si no hay configuración previa
logging.basicConfig(level=logging.INFO)

# Configuración de archivos estáticos
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')  # destino para collectstatic

# Directorios adicionales de archivos estáticos (además de los de cada app)
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/2.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '4cfeccdb-b04b-4b34-9255-d6f2e681c463'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

#ALLOWED_HOSTS = ['https://ia-fast-track-hggfakg6fch5h2bd.francecentral-01.azurewebsites.net', 'ia-fast-track-hggfakg6fch5h2bd.francecentral-01.azurewebsites.net', '127.0.0.1', 'localhost']
ALLOWED_HOSTS = ['217.154.184.34', 'ai.synergiatechexperts.com', '127.0.0.1', 'localhost']

CSRF_TRUSTED_ORIGINS = [
    "https://ia-fast-track-hggfakg6fch5h2bd.francecentral-01.azurewebsites.net",
    "https://ai.synergiatechexperts.com",
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
    logging.info("Running in production mode")  
    DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.getenv('DB_NAME', 'iafasttrack'),
        'USER': os.getenv('DB_USER', 'iauser'),
        'PASSWORD': os.getenv('DB_PASSWORD', 'iapassword'),
        'HOST': os.getenv('DB_HOST', 'db'),  # 👈 importante: 'db', no 'localhost'
        'PORT': os.getenv('DB_PORT', '3306'),
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    } 
}
    db_info = DATABASES['default']
    conn_str = f"ENGINE={db_info['ENGINE']}; NAME={db_info['NAME']}; USER={db_info['USER']}; HOST={db_info['HOST']}"

    # DATABASES = {
    #     'default': {
    #         'ENGINE': 'django.db.backends.mysql',
    #         'HOST': f"35.195.92.90",
    #         'PORT': '3306',
    #         'NAME': 'aifasttrackmodel',
    #         'USER': 'aifasttrackmodel',
    #         'PASSWORD': 'Choflas_3',
    #     }
    # }
    # db_info = DATABASES['default']
    # conn_str = f"ENGINE={db_info['ENGINE']}; NAME={db_info['NAME']}; USER={db_info['USER']}; HOST={db_info['HOST']}; PORT={db_info['PORT']}"
else:
    logging.info("Running in development mode") 
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
