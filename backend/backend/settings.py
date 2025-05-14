import logging.config
from pathlib import Path
import os

import django
from django.utils.encoding import force_str
from datetime import timedelta

django.utils.encoding.force_text = force_str

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-7go$f=rxko1@mk3&6^x-7*e+(6xa7c$32lfy!a@q=(gf3jfe(0'

DEBUG = True

ALLOWED_HOSTS = ['*']


SHARED_APPS = [
    'tenant_schemas',
    'admin_app',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.admin',
    'django.contrib.auth',
]

TENANT_APPS = [
    'tenant_app',
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.admin',
]

INSTALLED_APPS = [
    'tenant_schemas',
    'admin_app',
    'tenant_app',
    'django.contrib.contenttypes',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    "corsheaders",
    'admin_volt.apps.AdminVoltConfig',
    'ckeditor',
]

PUBLIC_SCHEMA_NAME = 'public'
PUBLIC_SCHEMA_URLCONF = 'backend.urls'


ROOT_URLCONF = 'backend.urls'


DEFAULT_FILE_STORAGE = 'tenant_schemas.storage.TenantFileSystemStorage'

TENANT_MODEL = "admin_app.Tenant"


MIDDLEWARE = [
    # 'tenant_schemas.middleware.TenantMiddleware',
    'admin_app.middlewares.MutitenantMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',
]


TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',

        'DIRS': ['backend/templates',],

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


TEMPLATE_CONTEXT_PROCESSORS = (
    'django.core.context_processors.request',
)


WSGI_APPLICATION = 'backend.wsgi.application'


DATABASES = {
    'default': {
        'ENGINE': 'tenant_schemas.postgresql_backend',
        'NAME': "XeniaTenant",
        'USER': 'postgres',
        'PASSWORD': 'admin',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

DATABASE_ROUTERS = (
    'tenant_schemas.routers.TenantSyncRouter',
)

ACCESS_SECRET_KEY = "CyHvEOk0BVSWJYNCfHfYaobAXStsNq7cCxVltTVIN1w"
REFRESH_SECRET_KEY = "cea322be5a13ffa85efb6a6578f168bda404a2bcbb58155a45a8e08266deff69"


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


LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True


DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


STATIC_URL = 'static/'
STATIC_URL = '/staticfiles/'
STATIC_ROOT = os.path.join(BASE_DIR, 'admin_app/static')
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
MEDIA_URL = 'media/'


CORS_ORIGIN_ALLOW_ALL = True
CORS_ALLOW_CREDENTIALS = True



CSRF_TRUSTED_ORIGINS = [
    'https://tenant1.xeniaindia.in', 'http://tenant1.xeniaindia.in',"http://192.168.29.185:8000"]
#SERVER CHANGES
# CSRF_TRUSTED_ORIGINS = ["http://31.220.17.212/"]


EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_USE_TLS = True
EMAIL_PORT = 587
EMAIL_HOST_USER = 'adyant.ashishdew@gmail.com'
EMAIL_HOST_PASSWORD = 'iodgtzixghezvmrx'

HTTP_METHOD = "http://"

DOMAIN_NAME = "xeniaindia"
FRONTEND_URL = "192.168.29.185:3000/"
BACKEND_URL = "192.168.29.185:8000/"
API_VERSION = "v1/"



CKEDITOR_CONFIGS = {
    'default': {
        'toolbar': 'full',
    },
}
FILE_UPLOAD_HANDLERS = [
    'django.core.files.uploadhandler.TemporaryFileUploadHandler',
]


DATE_FORMAT = (('d/m/Y'))
DATE_INPUT_FORMATS = (('%d/%m/%Y'),)
DATETIME_FORMAT = (('d/m/Y H:i'))
DATETIME_INPUT_FORMATS = (('%d/%m/%Y %H:%i'),)

LOGGING_CONFIG = logging.config.dictConfig({
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "simple": {
            "format": "{levelname} {asctime} {module} {lineno:d} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "DjangoLogsHandler": {
            "level": "ERROR",
            "class": "logging.handlers.RotatingFileHandler",
            "filename":  "./logs/django_logs.log",
            'maxBytes': 1024 * 1024 * 1,  # 1MB
            'backupCount': 3,
            "formatter": "simple",
        },
        "CustomLogsHandler": {
            "level": "DEBUG",
            "class": "logging.handlers.RotatingFileHandler",
            "filename":  "./logs/custom_logs.log",
            'maxBytes': 1024 * 1024 * 1,  # 1MB
            'backupCount': 3,
            "formatter": "simple",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["DjangoLogsHandler"],
            "level": "ERROR",
            "propagate": False,
        },
        "custom_logger": {
            "handlers": ["CustomLogsHandler"],
            "level": "DEBUG",
            "propagate": False,
        },
    }
})
