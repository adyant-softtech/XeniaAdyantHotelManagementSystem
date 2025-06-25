
from django.contrib import admin
from .models import *
from django.contrib import messages
from django.utils.html import format_html
from tenant_schemas.utils import get_public_schema_name
from django.utils.timezone import localtime
from django.conf import settings


@admin.register(User)
class UserModelAdmin(admin.ModelAdmin):
    list_display = ( 'id','email', 'username',
                    'last_name',
                    'contact_number', 
                    )

    list_filter = ('is_active',)
    search_fields = ('email', 'username')
    ordering = ('email',)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if not request.user.is_superuser:
            return qs.filter(is_active=True)
        return qs

    def get_list_display(self, request):
        return self.list_display + ('is_active',)

    def get_list_filter(self, request):
        if request.user.is_superuser:
            return self.list_filter
        return tuple()

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('email', 'contact_number')}),
        ('Permissions', {'fields': ('is_active', 'is_superuser')}),
        ('Important dates', {'fields': ('last_login',)}),
    )

    def has_module_permission(self, request, view=None):
        if request.tenant.schema_name != get_public_schema_name():
            return True
        else:
            return False
        
    def has_add_permission(self, request, obj=None):
        return False
    
    
@admin.register(Social)
class SocialAdmin(admin.ModelAdmin):
    list_display = ( 'name', 'social_link', 'icon')

    def save_model(self, request, obj, form, change):
        social_links_count = Social.objects.count()
        if social_links_count >= 5 and not change:
            messages.warning(
                request, 'You cannot add more than 5 social links or icons.')
            return

        super().save_model(request, obj, form, change)

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context['title'] = "Select social media to change"
        return super(SocialAdmin, self).changelist_view(request, extra_context=extra_context)
    
    def has_module_permission(self, request, view=None):
        if request.tenant.schema_name != get_public_schema_name():
            return True
        else:
            return False
        

@admin.register(Amenity)
class AmenityAdmin(admin.ModelAdmin):
    # Addition by Om Shrivastava on 28-05-2024
    # Reason : Show these fields in admin site
    list_display = ("id", "name")

    # End of addition by Om Shrivastava on 28-05-2024
    # Reason : Show these fields in admin site
"""
End of addition by Om Shrivastava on 27-05-2024
Reason : Register the Amentiy table
"""

"""
Addition by Om Shrivastava on 27-05-2024
Reason : Register the Room detail table
"""
@admin.register(RoomImage)
class RoomImageAdmin(admin.ModelAdmin):
    # Addition by Om Shrivastava on 28-05-2024
    # Reason : Show these fields in admin site
    list_display = ( "image", "room")

@admin.register(RoomDetail)
class RoomDetailAdmin(admin.ModelAdmin):
    # Addition by Om Shrivastava on 28-05-2024
    # Reason : Show these fields in admin site
    list_display = ("id", 
                    "room_type", 
                    "price", "number", 
                    "variety",
                    "image",
                    "number_of_persons",
                    "room_description",
                    )

    # End of addition by Om Shrivastava on 28-05-2024
    # Reason : Show these fields in admin site
"""
End of addition by Om Shrivastava on 27-05-2024
Reason : Register the Room detail table
"""

# Added by akanksha on 10-03-2025
# Reason To store room shift and previous room history
@admin.register(RoomShiftHistory)
class RoomShiftHistoryAdmin(admin.ModelAdmin):
    list_display = ("billing_id","previous_room","new_room", "shifted_date", "shifted_time")
# Added by akanksha on 10-03-2025
# Reason To store room shift and previous room history

"""
Addition by Om Shrivastava on 27-05-2024
Reason : Register the Amentiy Room table
"""


@admin.register(AmenityRoom)
class AmenityRoomAdmin(admin.ModelAdmin):
    # Addition by Om Shrivastava on 28-05-2024
    # Reason : Show these fields in admin site
    list_display = ("amenity_id", "room_id",)

    # End of addition by Om Shrivastava on 28-05-2024
    # Reason : Show these fields in admin site
"""
End of addition by Om Shrivastava on 27-05-2024
Reason : Register the Amentiy Room table
"""

'''Code Addition by Tejasve Gupta on 08-08-2024
Reason - For Adding more guests(secondary)'''


@admin.register(GuestDetails)
class GuestDetailsAdmin(admin.ModelAdmin):
    # Addition by Om Shrivastava on 28-05-2024
    # Reason : Show these fields in admin site
    list_display = ('guest_name', 'guest_last_name', 'guest_id_card_type',
                    'guest_id_card_no', 'guest_id_card_photo', 
                    # Added by Akanksha on 24-01-2025
                    # Reason : To store room number for guest
                    'selectedRoom', 'room_shifted')
                    # End by Akanksha on 24-01-2025
                    # Reason : To store room number for guest


'''End of Code Addition by Tejasve Gupta on 08-08-2024
Reason - For Adding more guests(secondary)'''

'''Code Addition by Tejasve Gupta on 10-08-2024
Reason - Creation of Payment Receipt Table'''


@admin.register(PaymentReceipt)
class PaymentReceiptAdmin(admin.ModelAdmin):
    list_display = ('id', 'payment_method', 'amount_paid',
                    'billing_id', 'created_at', 'updated_at', 'receipt_number', 
                    # Addition by Akanksha on 23-01-2025
                    # Reason: To store transaction ID and image receipt
                    'transaction_id',
                    'payment_proof',
                    'is_partial',
                    'partial_reason',
                    # End of addition by Akanksha on 23-01-2025
                    # Reason: To store transaction ID and image receipt
                )
    list_filter = ('payment_method', 'created_at', 'updated_at')
    search_fields = ('billing_id__id', 'payment_method')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'receipt_number')


'''End of Code Addition by Tejasve Gupta on 10-08-2024
Reason - Creation of Payment Receipt Table'''


"""
Addition by Om Shrivastava on 27-05-2024
Reason : Register the Personal detail table
"""


@admin.register(PersonalDetail)
class PersonalDetailAdmin(admin.ModelAdmin):
    # Addition by Om Shrivastava on 28-05-2024
    # Reason : Show these fields in admin site
    list_display = ('id', "name",
                    # Addition by Om Shrivastava on 31-05-2024
                    # Reason : Show the last name in list
                    "last_name",
                    # Code Addition by Tejasve Gupta on 26-06-2024
                    # Reason : To add email field
                    "email",
                    # Code Addition by Tejasve Gupta on 26-06-2024
                    # Reason : To add email field

                    # End of addition by Om Shrivastava on 31-05-2024
                    # Reason : Show the last name in list
                    # Code Modification by Tejasve Gupta on 14-06-2024
                    # Reason - Id Card type column Added in admin panel
                    "phone", "id_card_no", "id_card_type", "id_card_photo", "address")
    # End of Code Modification by Tejasve Gupta on 14-06-2024
    # Reason - Id Card type column Added in admin panel


    # End of addition by Om Shrivastava on 28-05-2024
    # Reason : Show these fields in admin site
"""
End of addition by Om Shrivastava on 27-05-2024
Reason : Register the Personal detail table
"""

"""
Addition by Om Shrivastava on 27-05-2024
Reason : Register the Checkin table
"""


@admin.register(CheckinDetail)
class CheckinDetaildmin(admin.ModelAdmin):
    # Addition by Om Shrivastava on 28-05-2024
    # Reason : Show these fields in admin site
    list_display = ('id', "arrival_date", "arrival_time", "departure_date", "departure_time",
                    # Addition by Om Shrivastava on 30-05-2024
                    # Reason : Show the room id in list
                    "room_id", 'room_price', 'room_shifted', 'created_at', 'updated_at'
                    )

    # End of addition by Om Shrivastava on 30-05-2024
    # Reason : Show the room id in list
    # End of addition by Om Shrivastava on 28-05-2024
    # Reason : Show these fields in admin site
"""
End of addition by Om Shrivastava on 27-05-2024
Reason : Register the Checkin table
"""

"""
Addition by Om Shrivastava on 27-05-2024
Reason : Register the Billing detail table
"""


@admin.register(BillingDetail)
class BillingDetailAdmin(admin.ModelAdmin):
    # Addition by Om Shrivastava on 28-05-2024
    # Reason : Show these fields in admin site

    # Code Modification By Tejasve Gupta on 27-06-2024
    # Reason - Addition of some more fields
    list_display = (
        'id', 'payment_method', 'number_of_persons', 'number_of_adults',
        'number_of_children', 'total', 'extra_person_charges', 'gst',
        'gst_value', 'advanced_pay_amount', 'discount_in', 'discount_rupees',
        'discount_percentage', 'taxable_amount', 'grand_total', 'due', 'date',
        'user_id', 'bill_number', 'personal_details_id', 'refund_amount',

        "invoice_number",
        # Addition by Akanksha on 23-01-2025
        # Reason: To store transaction ID and image receipt
        'transaction_id',
        'payment_proof',
        'new_room_charges',
        'additional_charges',
        'additional_reason',
        "is_partial_payment_confirmed",
        # End of addition by Akanksha on 23-01-2025
        # Reason: To store transaction ID and image receipt
    )
    # End of Code Modification By Tejasve Gupta on 27-06-2024
    # Reason - Addition of some more fields

    # End of addition by Om Shrivastava on 28-05-2024
    # Reason : Show these fields in admin site

    # Addition by Om Shrivastava on 29-05-2024
    # Reason : Add some field for readonly
    readonly_fields = (
        "bill_number",

        "invoice_number",

        # Addition by Om Shrivastava on 29-05-2024
        # Reason : Add some field for readonly
        'total', 'taxable_amount', 'gst', 'gst_value', 'grand_total'
        # End of addition by Om Shrivastava on 29-05-2024
        # Reason : Add some field for readonly

    )
    # End of addition by Om Shrivastava on 29-05-2024
    # Reason : Add some field for readonly


"""
End of addition by Om Shrivastava on 27-05-2024
Reason : Register the Billing detail table
"""

"""
Addition by Om Shrivastava on 27-05-2024
Reason : Register the Booked room table
"""


@admin.register(BookedRoom)
class BookedRoomModelAdmin(admin.ModelAdmin):
    # Addition by Om Shrivastava on 28-05-2024
    # Reason : Show these fields in admin site
    list_display = ("room_detail_id", "billing_detail_id",)

    # End of addition by Om Shrivastava on 28-05-2024
    # Reason : Show these fields in admin site
"""
End of addition by Om Shrivastava on 27-05-2024
Reason : Register the Booked room table
"""

"""
Addition by Om Shrivastava on 27-05-2024
Reason : Register the Setting table
"""


@admin.register(Setting)
class SettingModelAdmin(admin.ModelAdmin):
    exclude = ('standard_checkin_time', 'standard_checkout_time', 'vacant_info_before_hour')
    # Addition by Om Shrivastava on 28-05-2024
    # Reason : Show these fields in admin site
    list_display = ("id","hotel_name", "hotel_address",
                    # Modification and addition by Om Shrivastava on 01-06-2024
                    # Reason : Get the vacant_info_hour
                    # "standard_checkin_time","standard_checkout_time",
                    'vacant_info_before_hour',
                    # End of modification and addition by Om Shrivastava on 01-06-2024
                    # Reason : Get the vacant_info_hour
                    )

    # End of addition by Om Shrivastava on 28-05-2024
    # Reason : Show these fields in admin site
"""
End of addition by Om Shrivastava on 27-05-2024
Reason : Register the Setting table
"""

"""
Addition by Om Shrivastava on 03-06-2024
Reason : Register the Checkout table data
"""


@admin.register(CheckoutDetail)
class CheckoutModelAdmin(admin.ModelAdmin):
    list_display = (
        # "room_detail_id","checking_detail_id",

        "billing_detail_id", "sub_total", "miscellaneous_charges", "extra_discount", "grand_total", 'departure_date', 'departure_time')


"""
End of addition by Om Shrivastava on 03-06-2024
Reason : Register the Booked room table
"""

'''
Code Addition by Tejasve Gupta on 20-06-2024
Reason - additiion of module Expense'''


@admin.register(ExpenseDetails)
class CheckoutModelAdmin(admin.ModelAdmin):
    list_display = ("name", "amount", "date", "time", "paid_to",
                    "paid_by", "expense_type",
                    # Modification and addition by Om shrivastava on 21-08-2024
                    # Reason : Change the field
                    "quantity", "payment_type",
                    # End of modification and addition by Om shrivastava on 21-08-2024
                    # Reason : Change the field
                    )


'''
End of Code Addition by Tejasve Gupta on 20-06-2024
Reason - additiion of module Expense'''


# Added by - Ashish Dewangan on 03-10-2024
# Reason - TO resgister the handover model in admin panel
@admin.register(Handover)
class HandoverModelAdmin(admin.ModelAdmin):
    list_display = ("handover_amount", "manager_remark", "admin_remark", "created_at"
                    )
# End of addition by - Ashish Dewangan on 03-10-2024
# Reason - TO resgister the handover model in admin panel

@admin.register(BalanceSheet)
class BalanceSheetAdmin(admin.ModelAdmin):
    list_display = (
        "user",
                    "expense_type","expense_name","expense_quantity","total_amount", "amount_received", "mode", "given_by", "date", "time", "purpose", "admin_remark", "sender")

@admin.register(RoomType)
class RoomTypeAdmin(admin.ModelAdmin):
    list_display = ("id", "room_type")
    
@admin.register(RoomVariety)
class RoomVarietyAdmin(admin.ModelAdmin):
    list_display = ("id", "room_variety")
    
@admin.register(HotelAmenity)
class HotelAmenityAdmin(admin.ModelAdmin):
    list_display = ("id","amenity_name",)