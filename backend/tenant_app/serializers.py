from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from .models import *
from admin_app.models import AmenityPublic



class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'



class SocialSerializer(ModelSerializer):
    class Meta:
        model = Social
        fields = '__all__'



# End of Code Addition by Tejasve Gupta on 18-07-2024
# Reason - To get Hotel Details

# Code added by Tejasve Gupta on 26-05-2024
# Reason - For Password and Forgot Password


class UpdatePasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    new_password = serializers.CharField(min_length=8)
# End of Code added by Tejasve Gupta on 26-05-2024
# Reason - For Password and Forgot Password


"""
Addition by - Om Shrivastava on 28-05-2024
Reason - Create serializer of Amenity, Roomdetail, amentiyroom, billingdetails tables
"""
# Some modification by Om Shrivastava on 30-05-2024
# beacuse we need to getting the foreign key id's from their respective tables

# Code added by Om Shrivastava on 29-05-2024
# Reason - For serialize the Amenity table

class AmenityPublicSerializer(serializers.ModelSerializer): 
    class Meta:
        model = AmenityPublic
        fields = ['id', 'amenity_name']

class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = ['id', 'name']
# End of code addition by Om Shrivastava on 29-05-2024
# Reason - For serialize the Amenity table

# Code added by Om Shrivastava on 29-05-2024
# Reason - For serialize the RoomDetail table

class RoomVarietySerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomVariety
        fields = ['room_variety']
        
class RoomTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomType
        fields = ['room_type']
        

class RoomImageSerializer(serializers.ModelSerializer):
    models = RoomImage
    fields = '__all__'
    
class RoomDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomDetail
        # Code Addition by Tejasve Gupta on 21-08-2024
        # Reason - Addition of Room Variety filed
        # Modified by - Ashish Dewangan on 04-09-2024
        # Reaspm - To serialize is_active column
        # fields = ['id', 'room_type', 'price', 'number', 'variety']
        fields = ['id',
                  'room_type', 'price', 'number', 
                  'variety',
                  'is_active',
                  'number_of_persons',
                  'image',
                  'room_description',
                  'setting',
                  'amenities', ]
        
        # End of modification by - Ashish Dewangan on 04-09-2024
        # Reaspm - To serialize is_active column
        # end of Code Addition by Tejasve Gupta on 21-08-2024
        # Reason - Addition of Room Variety filed
# End of code addition by Om Shrivastava on 29-05-2024
# Reason - For serialize the RoomDetail table


class HotelAmenitySerializer(serializers.ModelSerializer):
    hotel_name = serializers.CharField(source='hotel.hotel_name', read_only=True)
    rooms = RoomDetailSerializer(source='hotel.rooms', many=True, read_only=True)
    class Meta:
        model = HotelAmenity
        # fields = '__all__'
        fields = ['id', 'amenity_name', 'hotel', 'hotel_name', 'rooms']


class HotelAmenityMultipleSerializer(serializers.Serializer):
    hotel = serializers.PrimaryKeyRelatedField(queryset=Setting.objects.all())
    amenity_ids = serializers.ListField(
        child=serializers.PrimaryKeyRelatedField(queryset=AmenityPublic.objects.all())
    )

    def create(self, validated_data):
        hotel = validated_data['hotel']
        amenity_ids = validated_data['amenity_ids']
        amenities = []
        for amenity in amenity_ids:
            ha = HotelAmenity.objects.create(hotel=hotel, amenity_name=amenity)
            amenities.append(ha)
        return amenities

class HotelAmenityReadSerializer(serializers.ModelSerializer):
    amenity_name = AmenityPublicSerializer(read_only=True)

    class Meta:
        model = HotelAmenity
        fields = ['id', 'hotel', 'amenity_name']
        
class SettingSerializer(serializers.ModelSerializer):
    rooms = RoomDetailSerializer( many=True, read_only=True)
    amenities = HotelAmenitySerializer(many=True, read_only=True)
    class Meta:
        model = Setting
        fields = [
            'id',
            'hotel_name',
            'hotel_address',
            'terms_and_conditions',
            'logo',
            'standard_checkin_time',
            'standard_checkout_time',
            'vacant_info_before_hour',
            'gst',
            'city',
            # Added by - Ashish Dewangan on 18-09-2024
            # Reason - To serialize contact number, email , gstin, tin columns
            'contact_number',
            'email',
            'gstin',
            'tin',
            # End of addition by - Ashish Dewangan on 18-09-2024
            # Reason - To serialize contact number, email , gstin, tin columns
            # Added by - Om Shrivastava on 03-01-2025
            # Reason - To serialize whatsapp number
            'whatsapp_number',
            # End of addition by - Om Shrivastava on 03-01-2025
            # Reason - To serialize contact whatsapp 
            'created_at',
            'updated_at',
            'rooms',
            'amenities',
            
        ]
        
        
# Code added by Om Shrivastava on 29-05-2024
# Reason - For serialize the AmenityRoom table


# class AmenityRoomSerializer(serializers.ModelSerializer):
#     # class Meta:
#     #     model = AmenityRoom
#     #     fields = "__all__"
#     room_number = serializers.CharField(source='room_id.number', read_only=True)
#     amenity_name = serializers.CharField(source='amenity_id.name', read_only=True)

#     class Meta:
#         model = AmenityRoom
#         fields = ['id', 'room_number', 'amenity_name', 'created_at', 'updated_at']


class AmenityRoomSerializer(serializers.ModelSerializer):
    room_number = serializers.CharField(source='room_id.number', read_only=True)
    amenity_name = serializers.CharField(source='amenity_id.amenity_name', read_only=True)
    room = serializers.CharField(write_only=True)  # Accept room number as input
    amenity = serializers.CharField(write_only=True)  # Accept amenity name as input

    room_details = RoomDetailSerializer(source='room_id', read_only=True)  # Nested room info

    class Meta:
        model = AmenityRoom
        fields = ['id', 'room', 'amenity', 'room_number', 'amenity_name', 'room_details', 'created_at', 'updated_at']

    def create(self, validated_data):
        room_number = validated_data.pop('room')
        amenity_name = validated_data.pop('amenity')

        try:
            room = RoomDetail.objects.get(number=room_number)
        except RoomDetail.DoesNotExist:
            raise serializers.ValidationError({"room": "Room not found."})

        try:
            amenity = AmenityPublic.objects.get(amenity_name=amenity_name)
        except AmenityPublic.DoesNotExist:
            raise serializers.ValidationError({"amenity": "Amenity not found."})

        return AmenityRoom.objects.create(room_id=room, amenity_id=amenity)

from rest_framework import serializers
class AmenityRoomCreateSerializer(serializers.Serializer):
    room_id = serializers.IntegerField()
    amenities = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False
    )

    def validate_room_id(self, value):
        try:
            room = RoomDetail.objects.get(id=value)
        except RoomDetail.DoesNotExist:
            raise serializers.ValidationError("Room with this ID does not exist.")
        return room

    def validate_amenities(self, value):
        amenities = AmenityPublic.objects.filter(id__in=value)
        if len(amenities) != len(set(value)):
            raise serializers.ValidationError("One or more amenities are invalid.")
        return amenities

    def create(self, validated_data):
        room = validated_data['room_id']  # This is the RoomDetail instance after validation
        amenities = validated_data['amenities']  # This is a queryset of AmenityPublic instances

        amenity_room_objs = [
            AmenityRoom(room_id=room, amenity_id=amenity) for amenity in amenities
        ]
        AmenityRoom.objects.bulk_create(amenity_room_objs)
        return amenity_room_objs



# End of code addition by Om Shrivastava on 29-05-2024
# Reason - For serialize the AmenityRoom table

# Code added by Om Shrivastava on 29-05-2024
# Reason - For serialize the PersonalDetail table


class PersonalDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalDetail
        fields = ['id', 'name', 'phone', 'id_card_no', 'email',
                  #   Addition by Om Shrivastava on 31-05-2024
                  #   Reason : Getting the address, last name and id type
                  'address', 'last_name', 'id_card_type', 'id_card_photo',
                  #   End of addition by Om Shrivastava on 31-05-2024
                  #   Reason : Getting the last name and id type
                  # Code Addition by Tejasve Gupta on 18-07-2024
                  # Reason - To add Country, state, city dropdown, zip code, gender and DOB
                  "country", "state", "city", "zip", "gender", "dob",
                  # Added by - Ashish Dewangan on 12-09-2024
                  # Reason - To serialize country and state ids
                  "country_id", "state_id",
                  # End of addition by - Ashish Dewangan on 12-09-2024
                  # Reason - To serialize country and state ids

                  # Added by - Akanksha 0n 11/10/2024
                  # Reason - To seialize the name title salutation
                  "salutation",
                  # End by - Akanksha 0n 11/10/2024
                  # Reason - To seialize the name title salutation
                  ]
        # End of Code Addition by Tejasve Gupta on 18-07-2024
        # Reason - To add Country, state, city dropdown, zip code, gender and DOB
# End of code addition by Om Shrivastava on 29-05-2024
# Reason - For serialize the PersonalDetail table


'''Code Addition by Tejasve Gupta on 08-08-2024
Reason - For Adding more guests(secondary)'''


class GuestDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = GuestDetails
        fields = [
                  # Added by - Akanksha 0n 12/10/2024
                  # Reason - To seialize the guest name title salutation
                  'guest_salutation', 
                  # Added by - Akanksha 0n 12/10/2024
                  # Reason - To seialize the guest name title salutation
                  'guest_name', 'guest_last_name', 'guest_id_card_type',
                  'guest_id_card_no', 'guest_id_card_photo',
                  # Added by - Ashish Dewangan on 26-09-2024
                  # Reason - To store adult / child details
                  'person_type',
                  # End of addition by - Ashish Dewangan on 26-09-2024
                  # Reason - To store adult / child details
                  
                            
                    # Added by Akanksha on 24-01-2025
                    # Reason : To store room number for guest
                    'selectedRoom', 'room_shifted'
                    # End by Akanksha on 24-01-2025
                    # Reason : To store room number for guest
                  ]


'''End of Code Addition by Tejasve Gupta on 08-08-2024
Reason - For Adding more guests(secondary)'''

# Code added by Om Shrivastava on 29-05-2024
# Reason - For serialize the BillingDetail table


class BillingDetailSerializer(serializers.ModelSerializer):
    # Addition by Om Shrivastava on 10-07-2024
    # Reason : Set the personal detail value inside the billing detail 
    # personal_details = PersonalDetailSerializer(
    #     source='personal_details_id', read_only=True)
    personal_details = serializers.SerializerMethodField()
    # End of addition by Om Shrivastava on 10-07-2024
    # Reason : Set the personal detail value inside the billing detail 
    # Code Modification By Tejasve Gupta on 27-06-2024
    # Reason - Addition of some more fields

    """
    Added by - Ashish Dewangan on 13-10-2024
    Reason - To serialize the user email who have performed the checkin and checkout process
    """
    user_email_at_checkin = serializers.SerializerMethodField()
    user_email_at_checkout = serializers.SerializerMethodField()
    """
    End of addition by - Ashish Dewangan on 13-10-2024
    Reason - To serialize the user email who have performed the checkin and checkout process
    """

    class Meta:
        model = BillingDetail
        fields = [
            'id', 'payment_method', 'number_of_persons', 'number_of_adults',
            'number_of_children', 'total', 'extra_person_charges', 'gst',
            'gst_value', 'advanced_pay_amount', 'discount_in', 'discount_rupees',
            'discount_percentage', 'taxable_amount', 'grand_total', 'date',
            'user_id', 'bill_number', 'personal_details',
            # Addition by Om Shrivastava on 27-07-2024
            # Reason : Add invoice number
            'invoice_number',
            # End of addition by Om Shrivastava on 27-07-2024
            # Reason : Add invoice number
            # Code Addition by Tejasve Gupta on 28-08-2024
            # Reason - Advance Booking Options
            'booking_type', 'is_Refundable', 'refund_amount',
            # End of Code Addition by Tejasve Gupta on 28-08-2024
            # Reason - Advance Booking Options
            'room_charges',
            # Added by - Ashish Dewangan on 29-08-2024
            # Reason - To serialize missing fields
            'details', 'extraDetails',
            'sub_total', 'miscellaneous_charges', 'extra_discount',
            'arrival_date', 'arrival_time', 'departure_date', 'departure_time', 'due',
            # End of addition by - Ashish Dewangan on 29-08-2024
            # Reason - To serialize missing fields

            # Added by - Ashish Dewangan on 18-09-2024
            # Reason - To serialize missing fields
            'gstin', 'tin',
            # End of addition by - Ashish Dewangan on 18-09-2024
            # Reason - To serialize missing fields
            # Added by - Om Shrivastava on 06-10-2024
            # Reason - To serialize some personal detail field inside the billing Detail
            'customer_name',"customer_last_name","customer_country","customer_state","customer_city","customer_country_id","customer_state_id","customer_zip","customer_gender","customer_dob","customer_email","customer_phone","customer_id_card_type","customer_id_card_no","customer_id_card_photo","customer_address",
            # End of addition by - Om Shrivastava on 06-10-2024
            # Reason - To serialize some personal detail field inside the billing Detail

            # Added by - Ashish Dewangan on 06-10-2024
            # Reason - TO serialize user details who does checkin and checkout
            'user_id_at_checkin','user_id_at_checkout',
            # End of addition by - Ashish Dewangan on 06-10-2024
            # Reason - TO serialize user details who does checkin and checkout


            # Added by - Ashish Dewangan on 13-10-2024
            # Reason - To serialize the user email who have performed the checkin and checkout process
            'user_email_at_checkin', 'user_email_at_checkout',
            # End of addition by - Ashish Dewangan on 13-10-2024
            # Reason - To serialize the user email who have performed the checkin and checkout process
            # Added by - Akanksha 0n 11/10/2024
            # Reason - To serialize name title salutation
            "customer_salutation",
            # Added by - Akanksha 0n 11/10/2024
            # Reason - To serialize name title salutation
            # Addition by Akanksha on 23-01-2025
            # Reason: To store transaction ID and image receipt
            "transaction_id",
            "payment_proof",
            "new_room_charges",
            "additional_charges",
            "additional_reason",
            "is_partial_payment_confirmed",
            # End of addition by Akanksha on 23-01-2025
            # Reason: To store transaction ID and image receipt
            # Addition by Om Shrivastava on 16-10-2024
            # Reason : Add updated field for getting the checkout time 
            'updated_at',
            # End of addition by Om Shrivastava on 16-10-2024
            # Reason : Add updated field for getting the checkout time 

            # Added by - Ashish Dewangan on 21-10-2024
            # Reason - Serialized extra optional fields
            'purpose_of_visit','arrived_from','destination',
            # End of addition by - Ashish Dewangan on 21-10-2024
            # Reason - Serialized extra optional fields

            # Added by - Ashish Dewangan on 26-10-2024
            # Reason - Serialized is_cancelled field
            "is_cancelled",
            # End of addition by - Ashish Dewangan on 26-10-2024
            # Reason - Serialized is_cancelled field
        ]

    # Addition by Om Shrivastava on 07-10-2024
    # Reason : Set the personal detail value inside the billing detail
    def get_personal_details(self, obj):
        return {
            'id': obj.personal_details_id.id if obj.personal_details_id else None,
            'salutation' : obj.customer_salutation,
            'name': obj.customer_name,
            'phone': obj.customer_phone,
            'address': obj.customer_address,
            'id_card_no': obj.customer_id_card_no,
            'last_name': obj.customer_last_name,
            'email': obj.customer_email,
            'id_card_type': obj.customer_id_card_type,
            'id_card_photo': obj.customer_id_card_photo.url if obj.customer_id_card_photo else None,
            'country': obj.customer_country,
            'state': obj.customer_state,
            'city': obj.customer_city,
            'zip': obj.customer_zip,
            'country_id': obj.customer_country_id,
            'state_id': obj.customer_state_id,
            'gender': obj.customer_gender,
            'dob': obj.customer_dob,
        }
    # End of addition by Om Shrivastava on 07-10-2024
    # Reason : Set the personal detail value inside the billing detail

    """
    Addition by - Ashish Dewangan on 13-10-2024
    Reason - To serialize the user email who have performed the checkin and checkout process
    """

    def get_user_email_at_checkin(self, obj):
        return obj.user_id_at_checkin.email if obj.user_id_at_checkin else None

    def get_user_email_at_checkout(self, obj):
        return obj.user_id_at_checkout.email if obj.user_id_at_checkout else None
    """
    End of addition by - Ashish Dewangan on 13-10-2024
    Reason - To serialize the user email who have performed the checkin and checkout process
    """

# End of code addition by Om Shrivastava on 29-05-2024
# Reason - For serialize the BillingDetail table

# Code added by Om Shrivastava on 29-05-2024
# Reason - For serialize the CheckinDetail table


class CheckinDetailSerializer(serializers.ModelSerializer):
    room_number = RoomDetailSerializer(source='room_id', read_only=True)
    billing_id = BillingDetailSerializer(
        source='billing_detail_id', read_only=True)

    class Meta:
        model = CheckinDetail
        # Code Addition by Tejasve Gupta on 16-08-2024
        # Reason - Advance Booking Options
        fields = ['id', 'arrival_date', 'arrival_time', 'departure_date',
                  'departure_time', 'room_number', 'billing_id', 'room_price','room_shifted', 'created_at', 'updated_at',
                  
                  # 'booking_type', 'is_Refundable', 'refundable_amount'
                  ]
        # End of Code Addition by Tejasve Gupta on 16-08-2024
        # Reason - Advance Booking Options
# End of code addition by Om Shrivastava on 29-05-2024
# Reason - For serialize the CheckinDetail table

# Code added by Om Shrivastava on 29-05-2024
# Reason - For serialize the BookedRoom table


class BookedRoomSerializer(serializers.ModelSerializer):
    
    room_detail = RoomDetailSerializer(source='room_detail_id', read_only=True)
    billing_detail = BillingDetailSerializer(
        source='billing_detail_id', read_only=True)
    checkin_detail = CheckinDetailSerializer(
        source='checking_detail_id', read_only=True)

    class Meta:
        model = BookedRoom
        fields = ['id', 'room_detail', 'billing_detail', 'checkin_detail']
# End of code addition by Om Shrivastava on 29-05-2024
# Reason - For serialize the BookedRoom table

# End of modification by Om Shrivastava on 30-05-2024
# beacuse we need to getting the foreign key id's from their respective tables


'''
Code Addition by Tejasve Gupta on 09-06-2024
Reason - Creation of API for paginate(Check-in List)'''


# class CheckinDetailSerializer(serializers.ModelSerializer):
#     class Meta:
#         # room_details = serializers.RelatedField(source='RoomDetail', read_only=True)
#         room_details = RoomDetailSerializer(source='room_id', read_only=True)
#         model = CheckinDetail
#         fields = ["arrival_date","arrival_time","departure_date","departure_time","room_details","billing_id"]


'''End of Code Addition by Tejasve Gupta on 09-06-2024
Reason - Creation of API for paginate(Check-in List)'''

'''Code Addition by Tejasve Gupta on 10-08-2024
Reason - Creation of Payment Receipt Table'''


class PaymentReceiptSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentReceipt
        fields = ['payment_method', 'amount_paid', 'billing_id',
                  'created_at', 'updated_at', 'receipt_number', 'total_amount', 'person_name',
                  # Added by - Ashish Dewangan on 30-09-2024
                  # Reason - To serialize room numbers and room charges
                  'room_charges', 'room_numbers',
                  # End of addition by - Ashish Dewangan on 30-09-2024
                  # Reason - To serialize room numbers and room charges

                  # Added by - Ashish Dewangan on 04-10-2024
                  # Reason - To serialize user details
                  "user",
                  # End of addition by - Ashish Dewangan on 04-10-2024
                  # Reason - To serialize user details
                  
                  # Added by - Om Shrivastava on 12-10-2024
                  # Reason - To serialize refundable data
                #   "is_Refundable","refund_amount",
                  # End of addition by - Om Shrivastava on 12-10-2024
                  # Reason - To serialize refundable data

                  
                  # Added by - Akanksha 0n 11/10/2024
                  # Reason - To seialize the name title salutation
                  "person_salutation",
                  # Added by - Akanksha 0n 11/10/2024
                  # Reason - To seialize the name title salutation
                    # Addition by Akanksha on 23-01-2025
                    # Reason: To store transaction ID and image receipt
                    'transaction_id',
                    'payment_proof',
                    'is_partial',
                    'partial_reason',
                    # End of addition by Akanksha on 23-01-2025
                    # Reason: To store transaction ID and image receipt
                
                  ]


'''End of Code Addition by Tejasve Gupta on 10-08-2024
Reason - Creation of Payment Receipt Table'''


# Added by akanksha on 10-03-2025
# Reason To store room shift and previous room history
class RoomShiftHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomShiftHistory
        fields = [ "billing_id", "previous_room", "new_room", "shifted_at","previous_billing", "shifted_date","shifted_time",]
# Added by akanksha on 10-03-2025
# Reason To store room shift and previous room history


"""
End of addition by - Om Shrivastava on 28-05-2024
Reason - Create serializer of Amenity, Roomdetail, amentiyroom, billingdetails tables
"""
'''
Code Addition by Tejasve Gupta on 20-06-2024
Reason - additiion of module Expense'''


class ExpenseDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseDetails
        fields = ['id', 'amount', 'date', 'time', 'paid_to', 'paid_by',
                  'expense_type', 'quantity', 'name', 'payment_type', 'description', "user",
                  # Added by - Ashish Dewangan on 03-10-2024
                  # Reason - To serialize admin_remark field
                  'admin_remark',
                  # End of addition by - Ashish Dewangan on 03-10-2024
                  # Reason - To serialize admin_remark field
                  ]


'''
End of Code Addition by Tejasve Gupta on 20-06-2024
Reason - additiion of module Expense'''


class CheckoutDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CheckoutDetail
        fields = '__all__'




'''
Added by - Ashish Dewangan on 03-10-2024
Reason - To serialize Handover model
'''


class HandoverSerializer(serializers.ModelSerializer):
    user_email = serializers.SerializerMethodField()
    # Added by - Ashish Dewangan on 07-10-2024
    # Reason - to serialize handover to person's email
    handover_to_email = serializers.SerializerMethodField()
    # End of addition by - Ashish Dewangan on 07-10-2024
    # Reason - to serialize handover to person's email

    class Meta:
        model = Handover
        fields = ["id", "handover_amount", "manager_remark", "admin_remark", "user", "user_email", "created_at", "updated_at",
                  # Added by - Ashish Dewangan on 07-10-2024
                  # Reason - to serialize other fields
                  "handover_amount_received", "handover_to", "handover_to_email",
                  # End of addition by - Ashish Dewangan on 07-10-2024
                  # Reason - to serialize other fields
                  # Added by - Ashish Dewangan on 09-10-2024
                  # Reason - Ro serialize receiver_manager_remark field
                  "receiver_manager_remark",
                  # End of addition by - Ashish Dewangan on 09-10-2024
                  # Reason - Ro serialize receiver_manager_remark field
                  ]

    def get_user_email(self, obj):
        return obj.user.email

    # Added by - Ashish Dewangan on 07-10-2024
    # Reason - to serialize handover to person's email
    def get_handover_to_email(self, obj):
        return obj.handover_to.email
    # End of addition by - Ashish Dewangan on 07-10-2024
    # Reason - to serialize handover to person's email



'''
End of addition by - Ashish Dewangan on 03-10-2024
Reason - To serialize Handover model
'''

class BalanceSheetSerializer(serializers.ModelSerializer):
    user_email = serializers.SerializerMethodField()
    class Meta:
        model = BalanceSheet
        fields = [
                "user_email",
                  "id",
                  "expense_type",
                  "expense_name",
                  "expense_quantity",
                  "total_amount", 
                  "amount_received", 
                  "mode", 
                  "given_by", 
                  "date", 
                  "time", 
                  "purpose", 
                  "admin_remark", 
                  "sender",
                  "receiver_balance",
                  "giver_balance",
                  ]
    def get_user_email(self, obj):
        return obj.user.email if obj.user else None
    
  