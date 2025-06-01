

from django.contrib import admin
from .models import *
from django.apps import apps
from tenant_schemas.utils import get_public_schema_name


@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ("id", "client_id", "tenant_name", "created_at")
    list_display_links = ("id", "client_id", "tenant_name", "created_at")
    search_fields = ["client_id__name", "id", "tenant_name",]
    list_per_page = 10

    def has_change_permission(self, request, obj=None):
        return True

    def has_delete_permission(self, request, obj=None):
        return False

    def has_module_permission(self, request, view=None):
        if request.tenant.schema_name == get_public_schema_name():
            return True
        else:
            return False

@admin.register(AmenityPublic)
class AmenityAdmin(admin.ModelAdmin):
    list_display = ('id','amenity_name', )

@admin.register(ClientDetails)
class ClientDetailsAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "owner_name", "mobile_number",
                    "address", "created_at", "is_active")
    list_display_links = ("id", "name", "owner_name",
                          "mobile_number", "address", "created_at", "is_active")
    search_fields = ["name", "id", "owner_name", "created_at"]
    list_per_page = 10

    def has_change_permission(self, request, obj=None):
        return True

    def has_delete_permission(self, request, obj=None):
        return False

    def has_module_permission(self, request, view=None):
        if request.tenant.schema_name == get_public_schema_name():
            return True
        else:
            return False


@admin.register(VisitCount)
class VisitCountAdmin(admin.ModelAdmin):
    list_display = ("id", "tenant_name", "count")
    list_display_links = ("id", "tenant_name", "count")
    search_fields = ["tenant_name", "id"]
    list_per_page = 10

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def has_module_permission(self, request, view=None):
        if request.tenant.schema_name == get_public_schema_name():
            return True
        else:
            return False


@admin.register(Plans)
class PlanAdmin(admin.ModelAdmin):
    list_display = ("plan_name",)
    list_display_links = ("plan_name",)

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def has_module_permission(self, request, view=None):
        if request.tenant.schema_name == get_public_schema_name():
            return True
        else:
            return False


@admin.register(Features)
class Feature(admin.ModelAdmin):
    list_display = ("feature_name",)
    list_display_links = ("feature_name",)

    def has_change_permission(self, request, obj=None):
        return True

    def has_delete_permission(self, request, obj=None):
        return True

    def has_module_permission(self, request, view=None):
        if request.tenant.schema_name == get_public_schema_name():
            return True
        else:
            return False


@admin.register(PlannedFeatures)
class PlannedFeatureAdmin(admin.ModelAdmin):
    list_display = ("Plan_selected", "Feature_selected",)
    list_display_links = ("Plan_selected", "Feature_selected",)

    def Plan_selected(self, obj):

        if obj.plan_selected:
            return obj.plan_selected.plan_name
        return None

    def Feature_selected(self, obj):

        if obj.feature_selected:
            return obj.feature_selected.feature_name
        return None

    def has_change_permission(self, request, obj=None):
        return True

    def has_delete_permission(self, request, obj=None):
        return True

    def has_module_permission(self, request, view=None):
        if request.tenant.schema_name == get_public_schema_name():
            return True
        else:
            return False

    def get_form(self, request, obj=None, **kwargs):
        form = super(PlannedFeatureAdmin, self).get_form(
            request, obj, **kwargs)
        form.base_fields['plan_selected'].label_from_instance = lambda inst: "{}".format(
            inst.plan_name)
        form.base_fields['feature_selected'].label_from_instance = lambda inst: "{}".format(
            inst.feature_name)
        return form
