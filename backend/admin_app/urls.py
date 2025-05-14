

from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from .views import *

urlpatterns = [

    path('tenants/', TenantAPIView.as_view()),

    path('tenants/<str:tenantId>', TenantAPIView.as_view()),



]
