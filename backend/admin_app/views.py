from rest_framework.views import APIView
from rest_framework.response import Response

from .models import *
from .serializers import *
from django.contrib.auth.hashers import make_password, check_password




class TenantAPIView(APIView):
    def get(self, request, tenantId=None):
        if tenantId:
            tenant = Tenant.objects.get(tenant_name=tenantId)
            tenantSerializer = TenantListSerializer(tenant)
            return Response({"msg": "success", "tenantDetails": tenantSerializer.data})
        else:
            tenantList = Tenant.objects.all()
            tenantListSerializer = TenantListSerializer(tenantList, many=True)
            return Response({"msg": "success", "tenantList": tenantListSerializer.data})
        


