

from rest_framework import serializers
from .models import *


class TenantListSerializer(serializers.ModelSerializer):

    client = serializers.CharField(source='client_id.name')
    client_address = serializers.CharField(source='client_id.address')

    class Meta:
        model = Tenant
        fields = '__all__'

class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = AmenityPublic
        fields = '__all__'

class ClientDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientDetails
        fields = '__all__'


class OtpSerializer(serializers.ModelSerializer):
    class Meta:
        model = Otp
        fields = ["email"]
