

from django.db import models
from tenant_schemas.models import TenantMixin
from django.core.exceptions import ValidationError


def validate_image(fieldfile_obj):
    try:
        filesize = fieldfile_obj.file.size
        megabyte_limit = 200
    except:
        try:
            import os
            from pathlib import Path
            filesize = os.path.getsize(fieldfile_obj.file.name)
            print(filesize)
            megabyte_limit = 200
            if filesize > megabyte_limit*1024:
                raise ValidationError(
                    "Please upload image below %skb" % str(megabyte_limit))
        except:
            return
    if filesize > megabyte_limit*1024:
        raise ValidationError(
            "Please upload image below %skb" % str(megabyte_limit))


class Plans(models.Model):
    plan_name = models.CharField(max_length=50, default="")

    class Meta:
        verbose_name_plural = "Plans"

    def __str__(self):
        return self.plan_name


class Features(models.Model):
    feature_name = models.CharField(max_length=50, default="")

    class Meta:
        verbose_name_plural = "Features"

    def __str__(self):
        return self.feature_name


class PlannedFeatures(models.Model):
    plan_selected = models.ForeignKey(
        Plans, on_delete=models.CASCADE, blank=True, null=True)
    feature_selected = models.ForeignKey(
        Features, on_delete=models.CASCADE, blank=True, null=True)

    class Meta:
        verbose_name_plural = "Planned Features"

    def __str__(self):
        return "Edit feature of this plan"

class ClientDetails(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, default='')
    tag_line = models.CharField(max_length=255, null=True, blank=True)
    owner_name = models.CharField(max_length=255, default='')
    email = models.EmailField(unique=True)
    mobile_number = models.CharField(max_length=15, default='', unique=True)
    telephone_number = models.CharField(max_length=15, null=True, blank=True)
    password = models.CharField(max_length=500, null=True)
    confirm_password = models.CharField(max_length=500, null=True)
    address = models.TextField()
    is_active = models.BooleanField(default=False)
    created_at = models.DateField(auto_now=True)
    updated_at = models.DateField(auto_now=True)
    is_partner = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        try:
            oldClientDetails = ClientDetails.objects.get(
                password=self.password)
            if (self.password != oldClientDetails.password):
                from django.contrib.auth.hashers import make_password, check_password
                self.password = make_password(self.password)
                self.confirm_password = make_password(self.confirm_password)
                super().save(*args, **kwargs)
            else:
                super().save(*args, **kwargs)
        except Exception as e:
            from django.contrib.auth.hashers import make_password, check_password
            self.password = make_password(self.password)
            self.confirm_password = make_password(self.confirm_password)
            super().save(*args, **kwargs)


class Tenant(TenantMixin):
    tenant_name = models.CharField(max_length=255, default='', unique=True)
    client_id = models.ForeignKey(
        ClientDetails, related_name='client_id', null=True, on_delete=models.DO_NOTHING)
    created_at = models.DateField(auto_now=True)
    updated_at = models.DateField(auto_now=True)
    client_phone_number = models.CharField(
        max_length=15, null=True, blank=True)
    Subscribed_plan = models.ForeignKey(
        Plans, on_delete=models.SET_NULL, blank=True, null=True)

    def __str__(self):
        return self.tenant_name

    def save(self, *args, **kwargs):

        try:
            visitCount = VisitCount.objects.get(tenant_name=self.tenant_name)
        except Exception as e:
            visitCount = VisitCount(count=0, tenant_name=self.tenant_name)
            visitCount.save()

        if self.client_id:
            self.client_phone_number = self.client_id.mobile_number
        else:
            self.client_phone_number = ""

        if self.client_id:
            clientDetails = ClientDetails.objects.get(id=self.client_id.id)
            clientDetails.is_active = True
            clientDetails.save()

        super().save(*args, **kwargs)


class VisitCount(models.Model):
    id = models.AutoField(primary_key=True)
    tenant_name = models.CharField(max_length=255, default='')
    count = models.BigIntegerField(default=0)


class Otp(models.Model):
    email = models.EmailField()
    otp = models.CharField(max_length=6, default='')
    otptime = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    created_at = models.DateField(auto_now_add=True, blank=True)

    def __str__(self):
        return self.email

    class Meta:
        verbose_name_plural = 'OTP'
