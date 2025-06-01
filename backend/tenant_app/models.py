from django.db import models, transaction
from django.db.models import Max
from django.contrib.auth.models import AbstractUser,AbstractBaseUser, PermissionsMixin
from django.core.exceptions import ValidationError
import datetime
from admin_app.models import AmenityPublic


class User(AbstractBaseUser):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    contact_number = models.CharField(max_length=150, unique=True)
    first_name = models.CharField(max_length=250, null=True, blank=True)
    last_name = models.CharField(max_length=250, null=True, blank=True)
    password = models.CharField(max_length=250, null=True, blank=True)
    confirm_password = models.CharField(max_length=250, null=True, blank=True)
    is_active = models.BooleanField(default=True, null=True, blank=True)
    is_superuser = models.BooleanField(default=False)
    otp = models.CharField(max_length=6, blank=True, null=True)
    otp_creation_time = models.DateTimeField(default=datetime.datetime.now)
    
    EMAIL_FIELD = "email"
    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email"]

    def __str__(self):
        return self.email

    class Meta:
        verbose_name_plural = 'Users'


class Social(models.Model):
    name = models.CharField(default='', null=True, blank=True, max_length=30)
    social_link = models.TextField()
    icon = models.ImageField(
        upload_to='social/icons/')

    def __str__(self):
        return f"Social Link {self.pk}"

    class Meta:

        verbose_name = "Social Media"
        verbose_name_plural = "Social Media"



class Amenity(models.Model):
    name = models.CharField(max_length=250,)
    # Comment by Om Shrivastava on 29-05-2024
    # Reason : Currently its not use
    # icon = models.ImageField(upload_to='Images/Amenity/',null=True,blank=True)
    # End of commented by Om Shrivastava on 29-05-2024
    # Reason : Currently its not use
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    # Addition by Om Shrivastava on 28-05-2024
    # Reason : After saving the table giving the name.
    def __str__(self):
        return str(self.name)
    # End of adition by Om Shrivastava on 28-05-2024
    # Reason : After saving the table giving the name.


"""
End of addition by - Om Shrivastava on 27-05-2024
Reason - To store Amenity detail
"""

"""
Added by - Om Shrivastava on 27-05-2024
Reason - To store Room detail


"""


class Setting(models.Model):
    terms_and_conditions = models.TextField(null=True, blank=True)
    hotel_name = models.CharField(max_length=250,)
    city = models.CharField(max_length=250,null=True, blank=True)
    hotel_address = models.CharField(max_length=250, null=True, blank=True)
    logo = models.ImageField(
        upload_to='Images/Setting/', max_length=250, null=True, blank=True)
    standard_checkin_time = models.TimeField(null=True, blank=True)
    standard_checkout_time = models.TimeField(null=True, blank=True)
    # Addition by Om Shrivastava on 31-05-2024
    # Reason : Create the availablity date and time
    # Modified by - Ashish Dewangan on 02-09-2024
    # Reason - To provide default value as 0
    # vacant_info_before_hour = models.IntegerField(
    #     null=True, blank=True, verbose_name='Vacant info hour')
    vacant_info_before_hour = models.IntegerField(
        null=True, blank=True, verbose_name='Vacant info hour', default=0)
    # End of modification by - Ashish Dewangan on 02-09-2024
    # Reason - To provide default value as 0
    # End of addition by Om Shrivastava on 31-05-2024
    # Reason : Create the availablity date and time
    # Addition by Om Shrivastava on 03-06-2024
    # Reason : Add gst field
    gst = models.CharField(
        max_length=10, null=True, blank=True)
    # End of addition by Om Shrivastava on 03-06-2024
    # Reason : Add gst field

    # Added by - Ashish Dewangan on 18-09-2024
    # Reason - Added more columns to setting model
    contact_number = models.CharField(max_length=13, null=True, blank=True)
    email = models.EmailField(max_length=250, null=True, blank=True)
    tin = models.CharField(max_length=11, null=True, blank=True)
    gstin = models.CharField(max_length=15, null=True, blank=True)
    # End of addition by - Ashish Dewangan on 18-09-2024
    # Reason - Added more columns to setting model
    # Addition by Om Shrivastava on 03-01-2025
    # Reason : Add contact no field 
    whatsapp_number = models.CharField(max_length=13, null=True, blank=True)
    # End of addition by Om Shrivastava on 03-01-2025
    # Reason : Add contact no field 
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    def __str__(self):
        return f"{self.hotel_name} - {self.city}"

# Code Modification by Tejasve Gupta on 22-08-2024
# Reason - Changes in Room Type and Addition of Variety

ROOM_TYPE = (
    ("Standard(Non AC)", "Standard(Non AC)"),
    ("Superior(AC)", "Superior(AC)"),
    ("Executive(AC)", "Executive(AC)"),
)

ROOM_VARIETY = (("Single", "Single"),
                ("Double", "Double"),
                ("Triple", "Triple"),)
# Code Modification by Tejasve Gupta on 22-08-2024
# Reason - Changes in Room Type and Addition of Variety
   
class RoomType(models.Model):
    room_type = models.CharField(max_length=250, null=True, blank=True)
    
    def __str__(self):
        return self.room_type or "Unnamed Room Type"
    
class RoomVariety(models.Model):
    room_variety = models.CharField(max_length=250, null=True, blank=True)
    
    def __str__(self):
        return self.room_variety or "Unnamed Room Variety"

class RoomDetail(models.Model):
    room_description = models.CharField(max_length=250, null=True, blank=True)
    room_type = models.CharField(max_length=250, null=True, blank=True)
    variety = models.CharField(max_length=250, null=True, blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    number = models.CharField(max_length=250, verbose_name="Room number")
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    setting = models.ForeignKey(Setting, on_delete=models.CASCADE, null=True, blank=True, related_name='rooms')
    number_of_persons = models.PositiveIntegerField(
        null=True, blank=True, verbose_name="Number of Persons"
    )
    amenities =  models.CharField(max_length=500, null=True, blank=True)
    image = models.ImageField(
        upload_to="room_images/", null=True, blank=True, verbose_name="Room Image"
    )
    def __str__(self):
        return f"{self.number}"
    
    
class RoomImage(models.Model):
    image = models.ImageField(
        upload_to="room_images/", null=True, blank=True, verbose_name="Room Image"
    )
    room = models.ForeignKey(
        RoomDetail, 
        related_name="images",  
        on_delete=models.CASCADE, 
        null=True,
        blank=True 
    )
    
    def __str__(self):
        return f"Room ID: {self.room.id}, Image: {self.image.name if self.image else 'No Image'}"
    
"""
End of addition by - Om Shrivastava on 27-05-2024
Reason - To store Room detail
"""

"""
Added by - Om Shrivastava on 27-05-2024
Reason - To store Amenity room detail
"""


class AmenityRoom(models.Model):
    amenity_id = models.ForeignKey(AmenityPublic, on_delete=models.CASCADE)
    room_id = models.ForeignKey(RoomDetail, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    def __str__(self):
        return f"{self.room_id.number} - {self.amenity_id.amenity_name}"

"""
End of addition by - Om Shrivastava on 27-05-2024
Reason - To store Amenity room detail
"""

"""
Added by - Om Shrivastava on 27-05-2024
Reason - To store Personal detail
"""


class PersonalDetail(models.Model):
    # Modification and addition by Om Shrivastava on 29-10-2024
    # Reason : Add textfield to store name 
    # name = models.CharField(max_length=250, verbose_name='First name')
    name = models.CharField(max_length=250, verbose_name='First name')
    # End of modification and addition by Om Shrivastava on 29-10-2024
    # Reason : Add textfield to store name 
    # Addition by Om Shrivastava on 31-05-2024
    # Reason : Add the last name field
    # Modification and addition by Om Shrivastava on 29-10-2024
    # Reason : Add textfield to store name 
    # last_name = models.CharField(max_length=250, null=True, blank=True)
    last_name = models.CharField(max_length=250, null=True, blank=True)
    # End of modification and addition by Om Shrivastava on 29-10-2024
    # Reason : Add textfield to store name 

    # Code Addition by Tejasve Gupta on 18-07-2024
    # Reason - To add Country, state, city dropdown, zip code, gender and DOB

    # Modified by - Ashish Dewangan on 12-09-2024
    # Reason - To increase length of these fields and added new field to store state and country id
    # country = models.CharField(max_length=15, null=True, blank=True)
    # state = models.CharField(max_length=15, null=True, blank=True)
    # city = models.CharField(max_length=15, null=True, blank=True)
    country = models.CharField(max_length=250, null=True, blank=True)
    state = models.CharField(max_length=250, null=True, blank=True)
    city = models.CharField(max_length=250, null=True, blank=True)

    country_id = models.CharField(max_length=15, null=True, blank=True)
    state_id = models.CharField(max_length=15, null=True, blank=True)
    # End of modification by - Ashish Dewangan on 12-09-2024
    # Reason - To increase length of these fields and added new field to store state and country id

    # Modified by - Ashish Dewangan on 11-09-2024
    # Reason - To allow characters in zip code
    # zip = models.IntegerField(null=True, blank=True)
    zip = models.CharField(max_length=50, null=True, blank=True)
    # End of modification by - Ashish Dewangan on 11-09-2024
    # Reason - To allow characters in zip code
    gender = models.CharField(max_length=10, default="N/A")
    dob = models.DateField(null=True, blank=True)
    # end of Code Addition by Tejasve Gupta on 18-07-2024
    # Reason - To add Country, state, city dropdown, zip code, gender and DOB
    # Code Addition by Tejasve Gupta on 26-06-2024
    email = models.EmailField(max_length=250, null=True, blank=True)
    # Code Addition by Tejasve Gupta on 26-06-2024
    # End of addition by Om Shrivastava on 31-05-2024
    # Reason : Add the last name field
    phone = models.CharField(max_length=12)
    # Addition by Om Shrivastava on 31-05-2024
    # Reason : Add the id type field
    id_card_type = models.CharField(max_length=250, null=True, blank=True)
    # End of addition by Om Shrivastava on 31-05-2024
    # Reason : Add the id type field
    id_card_no = models.CharField(max_length=250)
    id_card_photo = models.ImageField(
        upload_to='Images/PersonalDetail/', null=True, blank=True)
    address = models.CharField(max_length=250, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    # Added by - Akanksha 0n 11/10/2024
    # Reason - To store name title salutation
    salutation = models.CharField(max_length=10, null=True, blank=True)
    # End by - Akanksha 0n 11/10/2024
    # Reason - To store name title salutation

"""
End of addition by - Om Shrivastava on 27-05-2024
Reason - To store Personal detail
"""
"""
Added by - Om Shrivastava on 27-05-2024
Reason - To store Billing detail
"""
PAYMENT_MODE = (
    ("Online", "Online"),
    ("Cash", "Cash"),
)

# Addition by Om Shrivastava on 03-06-2024
# Reason : Add validation for discount in rupee and discount percentage


def validate_discount_rupees(value):
    if value is not None:
        if (value < 0):
            raise ValidationError("Discount can't be less the zero")
        else:
            return value


def validate_discount_precentage(value):
    if value is not None:
        if (value < 0):
            raise ValidationError("Discount can't be less the zero")
        else:
            return value
# End of addition by Om Shrivastava on 03-06-2024
# Reason : Add validation for discount in rupee and discount percentage


class BillingDetail(models.Model):
    # Addition by Akanksha on 23-01-2025
    # Reason: To store transaction ID and image receipt
    transaction_id = models.CharField(max_length=250, null=True, blank=True)
    payment_proof = models.ImageField(upload_to='payment_receipts/', null=True, blank=True)
    is_partial_payment_confirmed = models.BooleanField(default=False)
    new_room_charges = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    additional_charges = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    additional_reason = models.CharField(max_length=250, null=True, blank=True)
    # End of addition by Akanksha on 23-01-2025
    # Reason: To store transaction ID and image receipt
    payment_method = models.CharField(max_length=500,choices=PAYMENT_MODE, default='Online')
    # Addition by Om Shrivastava on 03-01-2025
    # Reason : Add transaction number and image 
    transaction_number = models.CharField(max_length=250,null=True, blank=True)
    transaction_image =  models.ImageField(
        upload_to='Images/BillingDetail/', null=True, blank=True)
    # End of addition by Om Shrivastava on 03-01-2025
    # Reason : Add transaction number and image 
    number_of_persons = models.CharField(max_length=250,)
    number_of_adults = models.CharField(max_length=250, null=True, blank=True)
    number_of_children = models.CharField(
        max_length=250, null=True, blank=True)

    # Modified by - Ashish Dewangan on 28-08-2024
    # Reason - Renamed the column
    # total_amount = models.DecimalField(max_digits=15, decimal_places=2)
    total = models.DecimalField(max_digits=15, decimal_places=2)
    # End of modification by - Ashish Dewangan on 28-08-2024
    # Reason - Renamed the column

    # Addition by Om Shrivastava on 29-05-2024
    # Reason : Add this field for extra person charges
    # Code Modification By Tejasve Gupta on 27-06-2024
    # Reason - Addition of some more fields
    extra_person_charges = models.DecimalField(
        max_digits=13, decimal_places=2, null=True, blank=True)
    # End of addition by Om Shrivastava on 29-05-2024
    # Reason : Add this field for extra person charges
    gst = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True, verbose_name='Tax rate')
    # Addition by Om Shrivastava on 03-06-2024
    # Reason : Show the GST value
    gst_value = models.DecimalField(
        max_digits=13, decimal_places=2, null=True, blank=True, verbose_name='Tax value')
    # End of addition by Om Shrivastava on 03-06-2024
    # Reason : Show the GST value
    advanced_pay_amount = models.DecimalField(
        max_digits=13, decimal_places=2, null=True, blank=True)
    # Addition by Om Shrivastava on 03-06-2024
    # Reason : Add discount and taxable amoount fields
    DISCOUNT_CHOICES = [('rupee', 'rupee'),
                        ('percentage', 'percentage')]
    discount_in = models.CharField(
        max_length=255, choices=DISCOUNT_CHOICES, default="percentage")
    discount_rupees = models.FloatField(
        default=0.0, blank=True, verbose_name="rupee", validators=[validate_discount_rupees])
    # End of Code Modification By Tejasve Gupta on 27-06-2024
    # Reason - Addition of some more fields
    discount_percentage = models.FloatField(
        default=0.0, blank=True, verbose_name="percentage", validators=[validate_discount_precentage])
    taxable_amount = models.DecimalField(
        max_digits=13, decimal_places=2, null=True, blank=True)
    grand_total = models.DecimalField(
        max_digits=13, decimal_places=2, null=True, blank=True)
    # End of addition by Om Shrivastava on 03-06-2024
    # Reason : Add discount and taxable amoount fields
    date = models.DateTimeField(null=True, blank=True)
    user_id = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True)
    # Modification and addition by Om Shrivastava on 14-09-2024
    # Reason : Add max length
    # bill_number = models.CharField(null=True, blank=True)
    bill_number = models.CharField(max_length=25, null=True, blank=True)
    # End of modification and addition by Om Shrivastava on 14-09-2024
    # Reason : Add max length
    # checkin_details_id = models.ForeignKey(CheckinDetail, on_delete=models.CASCADE)
    personal_details_id = models.ForeignKey(
        PersonalDetail, on_delete=models.CASCADE)
    # Addition by Om shrivastava on 06-10-2024
    # Reason : Add the fields 
    customer_name = models.CharField(max_length=250, verbose_name='First name',null=True,blank=True)
    customer_last_name = models.CharField(max_length=250, null=True, blank=True)
    customer_country = models.CharField(max_length=250, null=True, blank=True)
    customer_state = models.CharField(max_length=250, null=True, blank=True)
    customer_city = models.CharField(max_length=250, null=True, blank=True)
    customer_country_id = models.CharField(max_length=15, null=True, blank=True)
    customer_state_id = models.CharField(max_length=15, null=True, blank=True)
    customer_zip = models.CharField(max_length=50, null=True, blank=True)
    customer_gender = models.CharField(max_length=10,null=True, blank=True, default="N/A")
    customer_dob = models.DateField(null=True, blank=True)
    customer_email = models.EmailField(max_length=250, null=True, blank=True)
    customer_phone = models.CharField(max_length=12,null=True, blank=True)
    customer_id_card_type = models.CharField(max_length=250, null=True, blank=True)
    customer_id_card_no = models.CharField(max_length=250,null=True, blank=True)

    # Added by - Akanksha 0n 11/10/2024
    # Reason - To store name title salutation
    customer_salutation = models.CharField(max_length=10, null=True, blank=True)
    # End by - Akanksha 0n 11/10/2024
    # Reason - To store name title salutation

    # Modification and addition by Om Shrivastava on 07-10-2024
    # Reason : Set the path of image
    # customer_id_card_photo = models.ImageField(
    #     upload_to='Images/PersonalDetail/', null=True, blank=True)
    customer_id_card_photo = models.ImageField(
        upload_to='Images/BillingDetail/', null=True, blank=True)
    customer_address = models.CharField(max_length=250, null=True, blank=True)
    # End of modification and addition by Om Shrivastava on 07-10-2024
    # Reason : Set the path of image
    # End of addition by Om shrivastava on 06-10-2024
    # Reason : Add the fields 
    # Added by - Ashish Dewangan on 18-09-2024
    # Reason - Added more columns to billing details model
    tin = models.CharField(max_length=11, null=True, blank=True)
    gstin = models.CharField(max_length=15, null=True, blank=True)
    # End of addition by - Ashish Dewangan on 18-09-2024
    # Reason - Added more columns to billing details model

    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    due = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True)

    # Addition by Om Shrivastava on 27-07-2024
    # Reason : Add invoice number
    invoice_number = models.CharField(max_length=250,null=True, blank=True)
    # End of addition by Om Shrivastava on 27-07-2024
    # Reason : Add invoice number
    # Code Addition by Tejasve Gupta on 28-08-2024
    # Reason - Advance Booking Options
    booking_type = models.CharField(max_length=10, null=True, blank=True)
    is_Refundable = models.CharField(max_length=5, null=True, blank=True)

    # Modified by - Ashish Dewangan on 28-08-2024
    # Reason - Renamed the column
    # refundable_amount = models.DecimalField(
    #     max_digits=13, decimal_places=2, null=True, blank=True)
    refund_amount = models.DecimalField(
        max_digits=13, decimal_places=2, null=True, blank=True)
    # End of modification by - Ashish Dewangan on 28-08-2024
    # Reason - Renamed the column

    # End of Code Addition by Tejasve Gupta on 28-08-2024
    # Reason - Advance Booking Options

    # Added by - Ashish Dewangan on 28-08-2024
    # Reason - To store all necessary details for checkout
    room_charges = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True)
    sub_total = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True)
    miscellaneous_charges = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True)
    extra_discount = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True)
    is_cancelled = models.BooleanField(default=False)
    arrival_date = models.DateField(null=True, blank=True)
    arrival_time = models.TimeField(null=True, blank=True)
    departure_date = models.DateField(null=True, blank=True)
    departure_time = models.TimeField(null=True, blank=True)
    # End of code addition by - Ashish Dewangan on 28-08-2024
    # Reason - To store all necessary details for checkout

    # Added by - Ashish Dewangan on 06-10-2024
    # Reaason - To store user details to indicate which user has done checkin and which has done checkout
    user_id_at_checkin = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,related_name="user_id_at_checkin")
    user_id_at_checkout = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,related_name="user_id_at_checkout")
    # End of addition by - Ashish Dewangan on 06-10-2024
    # Reaason - To store user details to indicate which user has done checkin and which has done checkout

    # Added by - Ashish Dewangan on 21-10-2024
    # Reason - Added extra optional fields
    purpose_of_visit = models.TextField(null=True,blank=True,default="")
    arrived_from = models.TextField(null=True,blank=True,default="")
    destination = models.TextField(null=True,blank=True,default="")
    # End of addition by - Ashish Dewangan on 21-10-2024
    # Reason - Added extra optional fields
    details = models.CharField(max_length=500,null=True, blank=True, default="")
    extraDetails = models.CharField(max_length=500,null=True, blank=True, default="")
    # Addition by Om Shrivastava on 30-05-2024
    # Reason : After save method generate bill number
    def save(self, *args, **kwargs):
        # Modification and addtion by Om Shrivastava on 14-09-2024
        # Reason : Generate bll no
        # if not self.bill_number:
        #     with transaction.atomic():
        #         last_bill = BillingDetail.objects.filter(
        #             bill_number__startswith='AB'
        #         ).aggregate(max_number=Max('bill_number'))
        #         # Modification and a
        #         # if last_bill['max_number']:
        # if last_bill['max_number'] is not None:
        #     last_number = int(last_bill['max_number'][2:])
        #     new_number = last_number + 1
        # else:
        #     new_number = 1001  # Start from 1001 if no bill exists

        # self.bill_number = f"AB{new_number}"
        if not self.bill_number:
            with transaction.atomic():
                # Fetch the max bill_number, handling cases where no records are found
                last_bill = BillingDetail.objects.filter(
                    bill_number__startswith='HS24BillNo'
                ).aggregate(max_number=Max('bill_number'))

            # Ensure 'max_number' is either None or a valid value
            if last_bill and last_bill['max_number']:
                try:
                    # Extract the numeric part after 'HS24BillNo' and convert it to an integer
                    # Start after 'HS24BillNo'
                    last_number = int(last_bill['max_number'][10:])
                    new_number = last_number + 1
                except (ValueError, TypeError):
                    # Handle the case where the bill number is not in the expected format
                    new_number = 1001  # Start from 1001 in case of error
            else:
                # If no previous bill number is found, start from 1001
                new_number = 1001

            # Format the new bill number with the proper prefix and number
            self.bill_number = f"HS24BillNo{new_number}"
        # End of modification and addtion by Om Shrivastava on 14-09-2024
        # Reason : Generate bll no

        # Addition by Om Shrivastava on 27-07-2027
        # Reason : Generate invoice number
        # if not self.invoice_number:
        #     with transaction.atomic():
        #         last_bill = BillingDetail.objects.filter(
        #             invoice_number__startswith='Inv'
        #         ).aggregate(max_number=Max('invoice_number'))
        #         if last_bill['max_number']:
        #             last_number = int(last_bill['max_number'][2:])
        #             new_number = last_number + 1
        #         else:
        #             new_number = 1  # Start from 1001 if no bill exists

        #         self.invoice_number = f"Inv{new_number}"
        # Modification and addition by Om Shrivastava on 13-09-2024
        # Reason : Generate invoice no
        # if not self.invoice_number:
        #     with transaction.atomic():
        #         last_bill = BillingDetail.objects.filter(
        #             invoice_number__startswith='Inv'
        #         ).aggregate(max_number=Max('invoice_number'))

        #         if last_bill['max_number']:
        #             # Extract the numeric part after 'Inv' and convert to integer
        #             try:
        #                 last_number = int(last_bill['max_number'][3:])
        #                 new_number = last_number + 1
        #             except ValueError:
        #                 # Handle the case where the invoice number is not in the expected format
        #                 new_number = 1001
        #         else:
        #             new_number = 1001  # Start from 1001 if no bill exists

        #         self.invoice_number = f"Inv{new_number}"

        if not self.invoice_number:
            with transaction.atomic():
                last_bill = BillingDetail.objects.filter(
                    invoice_number__startswith='HS24'
                ).aggregate(max_number=Max('invoice_number'))

            if last_bill['max_number']:
                try:
                    # Extract the numeric part after 'HS24' and convert it to an integer
                    last_number = int(last_bill['max_number'][4:])
                    new_number = last_number + 1
                except ValueError:
                    # Handle the case where the invoice number is not in the expected format
                    new_number = 1
            else:
                new_number = 1  # Start from 1 if no invoice exists

            # Format the new invoice number with zero-padding (e.g., 'HS2400001')
            self.invoice_number = f"HS24{new_number:05d}"
        # Modification and addition by Om Shrivastava on 13-09-2024
        # Reason : Generate invoice no
        # End of addition by Om Shrivastava on 27-07-2027
        # Reason : Generate invoice number
        super(BillingDetail, self).save(*args, **kwargs)
    # End of addition by Om Shrivastava on 30-05-2024
    # Reason : After save method generate bill number


"""
End of addition by - Om Shrivastava on 27-05-2024
Reason - To store Billing detail
"""

"""
Added by - Om Shrivastava on 27-05-2024
Reason - To store Checkin detail
"""


class CheckinDetail(models.Model):
    arrival_date = models.DateField()
    arrival_time = models.TimeField()
    '''Code modification by Tejasve Gupta on 02-08-2024
    Reason - Removal of departure date and time at the checkin time'''
    departure_date = models.DateField(null=True, blank=True)
    departure_time = models.TimeField(null=True, blank=True)
    '''End of Code modification by Tejasve Gupta on 02-08-2024
    Reason - Removal of departure date and time at the checkin time'''
    # Addition by Om Shrivastava on 30-05-2024
    # Reason : Add roomDetail here, for get the arrival and departure time
    room_id = models.ForeignKey(
        RoomDetail, on_delete=models.CASCADE, null=True, blank=True)
    billing_id = models.ForeignKey(
        BillingDetail, on_delete=models.CASCADE, null=True, blank=True)
    room_price = models.DecimalField(
        max_digits=15, decimal_places=2, null=True, blank=True)
    # End of addition by Om Shrivastava on 30-05-2024
    # Reason : Add roomDetail here, for get the arrival and departure time
    room_shifted = models.BooleanField(null=True, blank=True, default=None)
    # Code Addition by Tejasve Gupta on 16-08-2024
    # Reason - Advance Booking Options
    # booking_type = models.CharField(max_length=10, null=True, blank=True)
    # is_Refundable = models.CharField(max_length=5, null=True, blank=True)
    # refund_amount = models.DecimalField(
    #     max_digits=13, decimal_places=2, null=True, blank=True)
    # End of Code Addition by Tejasve Gupta on 16-08-2024
    # Reason - Advance Booking Options

    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)


"""
End of addition by - Om Shrivastava on 27-05-2024
Reason - To store Checkin detail
"""
# Added by akanksha on 10-03-2025
# Reason To store room shift and previous room history
class RoomShiftHistory(models.Model):
    previous_billing = models.ForeignKey(BillingDetail, related_name="previous_billing", on_delete=models.CASCADE, null=True, blank=True)
    billing_id = models.ForeignKey(BillingDetail, on_delete=models.CASCADE)
    previous_room = models.ForeignKey(RoomDetail, related_name='previous_room', on_delete=models.CASCADE)
    new_room = models.ForeignKey(RoomDetail, related_name='new_room', on_delete=models.CASCADE)
    shifted_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    shifted_date = models.DateField(null=True, blank=True)
    shifted_time = models.TimeField(null=True, blank=True)

    def __str__(self):
        return f"Shift from Room {self.previous_room.number} to {self.new_room.number} on {self.shifted_at}"
# End by akanksha on 10-03-2025
# Reason To store room shift and previous room history
"""
Added by - Om Shrivastava on 27-05-2024
Reason - To store Booked room detail
"""


class BookedRoom(models.Model):
    room_detail_id = models.ForeignKey(
        RoomDetail, on_delete=models.CASCADE, null=True, blank=True)
    billing_detail_id = models.ForeignKey(
        BillingDetail, on_delete=models.CASCADE, null=True, blank=True)
    # Addition by Om Shrivastava on 30-05-2024
    # Reason : And Checkin detail field
    checking_detail_id = models.ForeignKey(
        CheckinDetail, on_delete=models.CASCADE, null=True, blank=True)
    # End of addition by Om Shrivastava on 30-05-2024
    # Reason : And Checkin detail field
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)


"""
End of addition by - Om Shrivastava on 27-05-2024
Reason - To store Booked room detail
"""

"""
Added by - Om Shrivastava on 03-06-2024
Reason - To store Booked room detail
"""


class CheckoutDetail(models.Model):
    # room_detail_id = models.ForeignKey(RoomDetail, on_delete=models.CASCADE,null=True,blank=True)
    # checking_detail_id = models.ForeignKey(CheckinDetail, on_delete=models.CASCADE,null=True,blank=True)
    # Code Modification by Tejasve Gupta on 06-07-2024
    # Reason - Add new necessary fields in check-in details form
    billing_detail_id = models.ForeignKey(
        BillingDetail, on_delete=models.CASCADE, null=True, blank=True)
    room_charges = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True)
    discount_in = models.CharField(max_length=20, null=True, blank=True)
    discount_amount = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True)
    extra_charge = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True)
    taxable_amount = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True)
    gst_value = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True)
    sub_total = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True)
    miscellaneous_charges = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True)
    extra_discount = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True)
    grand_total = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    #   Code Modification by Tejasve Gupta on 15-08-2024
    #   Reason - update checkout date in checkin details on checkout post
    departure_date = models.DateField(null=True, blank=True)
    departure_time = models.TimeField(null=True, blank=True)
    #   End of Code Modification by Tejasve Gupta on 15-08-2024
    #   Reason - update checkout date in checkin details on checkout post

    def __str__(self):
        return f"Checkout for billing detail {self.billing_detail_id}"
        # Code Modification by Tejasve Gupta on 06-07-2024
    # Reason - Add new necessary fields in check-in details form


"""
End of addition by - Om Shrivastava on 03-06-2024
Reason - To store Booked room detail
"""


"""
Added by - Om Shrivastava on 27-05-2024
Reason - To store app details fields like logo, t&c etc.
"""


"""
End of addition by - Om Shrivastava on 27-05-2024
Reason - To store app details fields like logo, t&c etc.
"""

'''Code Addition by Tejasve Gupta on 20-06-2024
Reason - Creation of Expense module 
'''


class ExpenseDetails(models.Model):
    # Modification and addition by Om Shrivastava on 21-08-2024
    # Reason : Add null and blank attributes
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    # date = models.DateField(null=True,blank=True)
    # time = models.TimeField(null=True,blank=True)
    date = models.CharField(null=True, blank=True, max_length=120)
    time = models.CharField(null=True, blank=True, max_length=120)
    paid_to = models.CharField(max_length=100, null=True, blank=True)
    paid_by = models.CharField(max_length=100, null=True, blank=True)
    expense_type = models.CharField(max_length=100)
    # Modification and addition by Om Shrivastava on 21-08-2024
    # Reason : Add qunatity field and comment the user field
    name = models.CharField(max_length=250)
    quantity = models.CharField(max_length=100, null=True, blank=True)
    description = models.CharField(max_length=100, null=True, blank=True)
    payment_type = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    # Added by - Ashish Dewangan on 02-09-2024
    # Reason - Added a column to store the user details
    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True)
    # End of addition by - Ashish Dewangan on 02-09-2024
    # Reason - Added a column to store the user details

    # End of modification and addition by Om Shrivastava on 21-08-2024
    # Reason : Add qunatity field and comment the user field
    # End of modification and addition by Om Shrivastava on 21-08-2024
    # Reason : Add null and blank attributes

    # Added by - Ashish Deweangan on 03-10-2024
    # Reason - Added column to store admin remark
    admin_remark = models.TextField(null=True, blank=True)
    # End of addition by - Ashish Deweangan on 03-10-2024
    # Reason - Added column to store admin remark

    def __str__(self):
        return f"Expense of {self.amount} on {self.date} by {self.paid_by}"


'''End of Code Addition by Tejasve Gupta on 20-06-2024
Reason - Creation of Expense module 
'''

'''Code Addition by Tejasve Gupta on 08-08-2024
Reason - For Adding more guests(secondary)'''


class GuestDetails(models.Model):
    # Added by - Akanksha 0n 12/10/2024
    # Reason - To store name title salutation
    guest_salutation = models.CharField(max_length=10, null=True, blank=True)
    # End by - Akanksha 0n 12/10/2024
    # Reason - To store name title salutation
    guest_name = models.CharField(
        max_length=250, verbose_name='Guest Name', null=True, blank=True)
    guest_last_name = models.CharField(max_length=250, null=True, blank=True)
    guest_id_card_type = models.CharField(
        max_length=250, null=True, blank=True)
    guest_id_card_no = models.CharField(max_length=250, null=True, blank=True)
    guest_id_card_photo = models.ImageField(
        upload_to='Images/GuestDetails/', null=True, blank=True)
    billing_id = models.ForeignKey(
        BillingDetail, on_delete=models.CASCADE, null=True, blank=True)

    # Added by - Ashish Dewangan on 26-09-2024
    # Reason - To store adult / child details
    person_type = models.CharField(max_length=10, null=True, blank=True)
    # End of addition by - Ashish Dewangan on 26-09-2024
    # Reason - To store adult / child details
    
    # Added by Akanksha on 24-01-2025
    # Reason : To store room number for guest
    selectedRoom = models.CharField(
        max_length=250, null=True, blank=True)
    room_shifted = models.BooleanField(null=True, blank=True, default=None)
    # End by Akanksha on 24-01-2025
    # Reason : To store room number for guest


'''End of Code Addition by Tejasve Gupta on 08-08-2024
Reason - For Adding more guests(secondary)'''


'''Code Addition by Tejasve Gupta on 10-08-2024
Reason - Creation of Payment Receipt Table'''


class PaymentReceipt(models.Model):
    payment_method = models.CharField(
        choices=PAYMENT_MODE, default='Online', max_length=50)
    # Addition by Om Shrivastava on 03-01-2025
    # Reason : Add transaction number and image 
    transaction_number = models.CharField(max_length=250,null=True, blank=True)
    transaction_image =  models.ImageField(
        upload_to='Images/PaymentReceipt/', null=True, blank=True)
    # End of addition by Om Shrivastava on 03-01-2025
    # Reason : Add transaction number and image 
    amount_paid = models.DecimalField(max_digits=15, decimal_places=2)
    billing_id = models.ForeignKey(
        BillingDetail, on_delete=models.CASCADE, null=True, blank=True)
    # Modification and addition by Om Shrivastava on 14-09-2024
    # Reason : Set the max length
    # receipt_number = models.CharField(
    #     max_length=6, unique=True, editable=False, null=True, blank=True)
    receipt_number = models.CharField(
        max_length=25, unique=True, editable=False, null=True, blank=True)
    # Modification and addition by Om Shrivastava on 14-09-2024
    # Reason : Set the max length
    person_name = models.CharField(
        max_length=250, verbose_name='Person Name', null=True, blank=True)

    # Added by - Ashish Dewangan on 30-09-2024
    # Reason - To store room numbers and room charges in payment receipt

    # Added by - Akanksha 0n 12/10/2024
    # Reason - To store name title salutation
    person_salutation = models.CharField(max_length=10, null=True, blank=True)
    # End by - Akanksha 0n 12/10/2024
    # Reason - To store name title salutation
    
    room_charges = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True, default=0)
    room_numbers = models.TextField(null=True, blank=True, default="")
    # End of addition by - Ashish Dewangan on 30-09-2024
    # Reason - To store room numbers and room charges in payment receipt

    total_amount = models.DecimalField(
        max_digits=15, decimal_places=2, null=True, blank=True)
    # Addition by Om Shrivastava on 13-10-2024
    # Reason : Add the refundable field in payment receipt 
    # Commented by Om Shrivastava on 14-10-2024
    # Reason : No use this field 
    # is_Refundable = models.CharField(max_length=5, null=True, blank=True)
    # refund_amount = models.DecimalField(
    #     max_digits=13, decimal_places=2, null=True, blank=True)
    # Commented by Om Shrivastava on 14-10-2024
    # Reason : No use this field 
    # End of addition by Om Shrivastava on 13-10-2024
    # Reason : Add the refundable field in payment receipt 
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    # Added by - Ashish Dewangan on 04-10-2024
    # Reason - To store user details
    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True)
    # End of addition by - Ashish Dewangan on 04-10-2024
    # Reason - To store user details
    
    # Addition by Akanksha on 23-01-2025
    # Reason: To store transaction ID and image receipt
    transaction_id = models.CharField(max_length=100, null=True, blank=True)
    payment_proof = models.ImageField(upload_to='payment_receipts/', null=True, blank=True)
    is_partial = models.BooleanField(null=True, blank=True, default=None)
    partial_reason = models.CharField(max_length=250, null=True, blank=True)
    # End of addition by Akanksha on 23-01-2025
    # Reason: To store transaction ID and image receipt
    
    

    # Modification and addition by Om Shrivastava on 13-09-2024
    # Reason : Generate receipt no
    # def save(self, *args, **kwargs):
    #     if not self.receipt_number:
    #         self.receipt_number = self.generate_unique_receipt_number()
    #     super(PaymentReceipt, self).save(*args, **kwargs)

    # def generate_unique_receipt_number(self):
    #     while True:
    #         receipt_number = f'{random.randint(100000, 999999)}'
    #         if not PaymentReceipt.objects.filter(receipt_number=receipt_number).exists():
    #             return receipt_number

    def save(self, *args, **kwargs):
        if not self.receipt_number:
            self.receipt_number = self.generate_unique_receipt_number()
        super(PaymentReceipt, self).save(*args, **kwargs)

    def generate_unique_receipt_number(self):
        prefix = 'HSPR24'
        last_receipt = PaymentReceipt.objects.filter(
            receipt_number__startswith=prefix).order_by('receipt_number').last()

        if last_receipt:
            # Extract the numeric part and increment it
            last_number = int(last_receipt.receipt_number[len(prefix):])
            new_number = last_number + 1
        else:
            # Start the sequence from 1 if no previous receipt exists
            new_number = 1

        # Zero-pad the new number to maintain the required length
        new_receipt_number = f'{prefix}{str(new_number).zfill(5)}'

        return new_receipt_number
    # Modification and addition by Om Shrivastava on 13-09-2024
    # Reason : Generate receipt no


'''End of Code Addition by Tejasve Gupta on 10-08-2024
Reason - Creation of Payment Receipt Table'''


# Added by - Ashish Dewangan on 03-10-2024
# Reason - Created a model to store handover details
class Handover(models.Model):
    handover_amount = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,default=0)
    manager_remark = models.TextField(null=True,blank=True)
    admin_remark = models.TextField(null=True,blank=True)
    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    # Added by - Ashish Dewangan on 07-10-2024
    # Reason - To store handover amount received and handover to details
    handover_amount_received =  models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,default=0)
    handover_to = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="handover_to")
    # End of addition by - Ashish Dewangan on 07-10-2024
    # Reason - To store handover amount received and handover to details

    # Added by - Ashish Dewangan on 09-10-2024
    # Reason - To store receiver_manager_remark to details
    receiver_manager_remark = models.TextField(null=True,blank=True)
    # End of addition by - Ashish Dewangan on 09-10-2024
    # Reason - To store receiver_manager_remark to details
# End of addition by - Ashish Dewangan on 03-10-2024
# Reason - Created a model to store handover details

class BalanceSheet(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2,null=True, blank=True)
    amount_received = models.DecimalField(max_digits=10, decimal_places=2,null=True, blank=True)
    mode = models.CharField(max_length=250,null=True, blank=True)
    given_by = models.CharField(max_length=250, null=True, blank=True)
    date = models.DateField(null=True, blank=True)    
    time = models.TimeField(null=True, blank=True)
    purpose = models.CharField(max_length=250, null=True, blank=True)
    admin_remark = models.CharField(max_length=250, null=True, blank=True)
    sender = models.CharField(max_length=250, null=True, blank=True)
    giver_balance = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    receiver_balance = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    expense_type = models.CharField(max_length=100, null=True, blank=True)
    expense_name = models.CharField(max_length=100, null=True, blank=True)
    expense_quantity = models.CharField(max_length=100, null=True, blank=True)
 
class HotelAmenity(models.Model):
    # amenity_name = models.CharField(max_length=100, unique=True, null=True, blank=True) 
    amenity_name = models.ForeignKey(AmenityPublic, on_delete=models.CASCADE, null=True, blank=True)
    hotel = models.ForeignKey(Setting, on_delete=models.CASCADE, related_name='amenities', null=True, blank=True)

    def __str__(self):
        return str(self.amenity_name) if self.amenity_name else "Unnamed Amenity"