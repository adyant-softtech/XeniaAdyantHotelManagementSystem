from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, re_path
from .views import *

urlpatterns = [

    path('<str:tenant>/social-links/', SocialAPIView.as_view()),
    path('<str:tenant>/signup/', SignupAPIView.as_view()),
    path('<str:tenant>/login/', LoginAPIView.as_view()),
    path('<str:tenant>/refresh/', TokenAPIVIew.as_view()),
    path('<str:tenant>/user/', UserAPIView.as_view()),
    path('<str:tenant>/settings/', SettingDetailView.as_view(), name='setting-detail'),
    path('<str:tenant>/send-otp/', PasswordResetAPIView.as_view(), name='send_otp'),
    path('<str:tenant>/update-password/',
         PasswordResetAPIView.as_view(), name='update_password'),
    path('<str:tenant>/verify-otp/',
         PasswordResetAPIView.as_view(), name='verify_otp'),

    path('<str:tenant>/get_checkin_details/', CheckinDetailView.as_view(),),
    # End of addition by - Om Shrivastava on 28-05-2024
    # Reason - To get the all Checkin details
    # Added by - Om Shrivastava on 29-05-2024
    # Reason - To post the all Checkin details
    path('<str:tenant>/post_checkin_form/', CheckinDetailView.as_view(), name='book-room'),
    # End of addition by - Om Shrivastava on 29-05-2024
    # Reason - To post the all Checkin details
    # Added by - Om Shrivastava on 04-06-2024
    # Reason - To post the checkout form details
    path('<str:tenant>/checkout_details/', CheckoutView.as_view(), name='checkout'),
    # End of addition by - Om Shrivastava on 04-06-2024
    # Reason - To post the checkout form details
    path('<str:tenant>/checkout_list/', CheckoutListAPIView.as_view(), name='checkout-list'),

    # Added by - Ashish Dewangan on 29-08-2024
    # Reason - Added route for particular checkout page API
    path("<str:tenant>/particular-checkout-details/",
         ParticularCheckOutDetailsAPIview.as_view(), name='Particular-checkout'),
    # End of addition by - Ashish Dewangan on 29-08-2024
    # Reason - Added route for particular checkout page API

    # Code Added by Tejasve Gupta on 07-06-2024
    # reason- created api for Paginate and filteration
    path('<str:tenant>/checkin-list/', CheckinListAPIView.as_view(), name='checkin-list'),
    # End of Code Added by Tejasve Gupta on 07-06-2024
    # reason- created api for Paginate and filteration
    # Code Addition by Tejasve Gupta on 20-06-2024
    # Reason - additiion of module Expense
    path('<str:tenant>/expense/', ExpenseDetailsListAPIView.as_view(), name='expense'),
    path('<str:tenant>/expense-list/', ExpenseDetailsListAPIView.as_view(), name='expense-list'),
    # End of Code Addition by Tejasve Gupta on 20-06-2024
    # Reason - additiion of module Expense
    # Addition by Om Shrivastava on 22-08-2024
    # Reason : Edit and delete the expense details
    path('<str:tenant>/expenses/<int:id>/', ExpenseDetailsListAPIView.as_view(),
         name='expense-detail-edit-delete'),  # For PUT and DELETE requests
    # End of addition by Om Shrivastava on 22-08-2024
    # Reason : Edit and delete the expense details
    # Code Addition by Tejasve Gupta on 17-07-2024
    # Reason - Addition of path for new APIs
    path('<str:tenant>/extend-checkout/', ExtendCheckoutAPIview.as_view(), name='extend'),
    path("<str:tenant>/particular-checkin-details/",
         ParticularCheckinDetailsAPIview.as_view(), name='Particular-checkin'),
    path("<str:tenant>/re-Check-in-details/", ReCheckinFormAPIView.as_view(), name='re-checkin'),
    # Code Addition by Tejasve Gupta on 17-07-2024
    # Reason - Addition of path for new APIs
    # Code Addition by Tejasve Gupta on 24-07-2024
    # Reason - To post room details from frontend as well
    path("<str:tenant>/roomdetails/", RoomDetailCreateAPIView.as_view(), name='Room-Details'),
    path('<str:tenant>/rooms-put-delete/<int:pk>/',
         RoomDetailCreateAPIView.as_view(), name='rooms-put-delete'),
    # End of Code Addition by Tejasve Gupta on 24-07-2024
    # Reason - To post room details from frontend as well
    # Code Addition by Tejasve Gupta on 02-08-2024
    # Reason - for name search dropdown
    path('<str:tenant>/personal-details/', PersonalDetailView.as_view(), name='personal-details'),
    # End of Code Addition by Tejasve Gupta on 02-08-2024
    # Reason - for name search dropdown

    # Code Addition by Tejasve Gupta on 04-08-2024
    # Reason - for advance booking details list
    path('<str:tenant>/advance-checkin-list/', AdvanceBookingAPIView.as_view(),
         name='advance-checkin-list'),
    # End of Code Addition by Tejasve Gupta on 04-08-2024
    # Reason - for advance booking details list

    # Code Addition by Tejasve Gupta on 10-08-2024
    # Reason - for PaymentReceipt
    path('<str:tenant>/payment-receipts/', PaymentReceiptAPIView.as_view(),
         name='payment-receipts'),
    # End of Code Addition by Tejasve Gupta on 10-08-2024
    # Reason - for PaymentReceipt
    # Code Addition by Om Shrivastava on 21-08-2024
    # Reason - For getting the users list
    path('<str:tenant>/all-user/', AllUserAPIView.as_view(), name='user-list'),
    # End of Code Addition by Om Shrivastava on 21-08-2024
    # Reason - For getting the users list
    # Code Addition by Tejasve Gupta on 30-08-2024
    # Reason - Reason - For Check-in Cancelation
    path('<str:tenant>/cancel-checkin/', CancelCheckinAPIview.as_view(), name='cancel-checkin'),
    # End of Code Addition by Tejasve Gupta on 30-08-2024
    # Reason - Reason - For Check-in Cancelation

    # Added by - Ashish Dewangan on 03-10-2024
    # Reason - Added API endpoints for Handover crud operations
    path('<str:tenant>/handovers/', HandoverAPIView.as_view(), name='handover'),
    path('<str:tenant>/handovers/<int:id>/', HandoverAPIView.as_view(),
         name='handover-detail-edit-delete'),
    # End of addition by - Ashish Dewangan on 03-10-2024
    # Reason - Added API endpoints for Handover crud operations
    
# Added by akanksha on 07-02-2025
# Reason to store refund amount in the backend
     path('<str:tenant>/refund-checkin/', UpdateRefundAPIview.as_view(), name='cancel-checkin'),
     path('<str:tenant>/room-shift/', RoomShiftView.as_view(), name='room-shift'),
     path('<str:tenant>/balance-sheet/', BalanceSheetAPIView.as_view(), name="balance-sheet"),
     path('<str:tenant>/room_type/', RoomTypeAPIView.as_view(), name='room_type'),
     path('<str:tenant>/room_variety/', RoomVarietyAPIView.as_view(), name='room_type'),
     path('<str:tenant>/amenity/', AmenityAPIView.as_view(), name='amenity'),
     path('<str:tenant>/amenity/<int:id>/', AmenityAPIView.as_view(), name='amenity'),
     path('<str:tenant>/amenityRoom/', AmenityRoomAPIView.as_view(), name='amenity'),
     path('<str:tenant>/amenityRoom/<int:id>/', AmenityRoomAPIView.as_view(), name='amenity'),
     # path('<str:tenant>/rooms/<int:room_id>/', RoomDetailAPIView.as_view(), name='room-detail'),
     path('<str:tenant>/amenity-rooms/', FilterAmenityRoomAPIView.as_view(), name='filtered-amenity-rooms'),
     path('<str:tenant>/hotelAmenity/', HottelAmenityView.as_view(), name='hotel-amenity'),
     path('<str:tenant>/postHotelAmenity/', HotelAmenityMultipleView.as_view(), name='hotel-amenity'),
     path('<str:tenant>/getHotelAmenity/', HotelAmenityMultipleView.as_view(), name='hotel-amenity'),
     path("<str:tenant>/roomdetails/", RoomFilterAPIView.as_view(), name='Room-Details'),

# End by akanksha on 07-02-2025
# Reason to store refund amount in the backend




]
