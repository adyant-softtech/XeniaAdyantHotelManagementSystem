from rest_framework import status
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.hashers import check_password
from rest_framework.permissions import IsAuthenticated
from .authentication import *
from django.contrib.auth.hashers import make_password
from .models import *

from django.shortcuts import get_object_or_404
from itertools import combinations
import re
from rest_framework.pagination import PageNumberPagination
import json
from django.utils.dateparse import parse_date
from django.utils import timezone
import pytz
import base64
from decimal import Decimal
from django.db.models.functions import Coalesce
from django.db.models import Value
from django.core.files.base import ContentFile
import imghdr
from django.db.models import Sum, F, DecimalField
from admin_app.models import *
from django.core.exceptions import ObjectDoesNotExist
from .serializers import *
from .utils.emailUtils import *
import datetime
from django.utils.timezone import timedelta
from backend.config import *
from django.db.models import Q
import logging
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.utils.timezone import now

from tenant_schemas.utils import schema_context
from admin_app.models import Tenant, ClientDetails

from rest_framework.decorators import api_view

logger = logging.getLogger("custom_logger")


class SignupAPIView(APIView):
    def post(self, request, tenant):

        data = {
            "username": request.data["first_name"],
            "email": request.data["email"],
            "password": make_password(request.data["password"]),
            "confirm_password": request.data["confirm_password"],
            "contact_number": request.data["contact_number"],
            "first_name": request.data["first_name"],
            "last_name": request.data["last_name"],
        }
        userSerializer = UserSerializer(data=data)

        try:
            if userSerializer.is_valid(raise_exception=True):
                userSerializer.save()

                return Response({"success": "Successfully registered"}, 200)
        except Exception as e:
            logger.error(str(e))

            if "email" in userSerializer.errors.keys():
                return Response({"error": "Email already registered"}, 500)
            elif "contact_number" in userSerializer.errors.keys():
                return Response({"error": "Contact number already registered"}, 500)

            return Response(userSerializer.errors, 500)


class LoginAPIView(APIView):
    def post(self, request, tenant):
        email = request.data["email"]
        password = request.data["password"]
        try:
            user = User.objects.get(email=email)
            if not user.is_active:
                return Response({"error": "User is Inactive"}, 403)

            if check_password(password, user.password):

                access_token = create_access_token(user.id)
                refresh_token = create_refresh_token(user.id)
                return Response({

                    "success": "Login Successfully ",
                    'refresh': refresh_token,
                    'access': access_token,
                    'user': {"first_name": user.first_name,
                             "last_name": user.last_name,
                             "email": user.email,
                             "contact_number": user.contact_number,

                             "is_active": user.is_active}

                }, 200)

            else:

                return Response({"error": "Invalid username or password"}, 401)
        except User.DoesNotExist:
            return Response("User not found", 404)
        except Exception as e:
            logger.error(str(e))
            return Response("Something went wrong", 400)


class TokenAPIVIew(APIView):
    def post(self, request, tenant):
        try:
            refresh_token = request.data["refresh_token"]
            user_id = decode_refresh_token(refresh_token)
            new_access_token = create_access_token(user_id)
            return Response({

                'refresh': refresh_token,
                'access': new_access_token
            })
        except Exception as e:
            logger.error(str(e))
            return Response({
                "message": "Token expired"
            }, 500)


class PasswordResetAPIView(APIView):
    def post(self, request, tenant):
        if request.data["postFor"] == "email":
            email = request.data["email"]
            try:
                user = User.objects.get(email=email)
                otp = generate_otp()
                user.otp = otp
                user.save()
                send_otp(email, otp)
                return JsonResponse({'msg': 'OTP sent successfully'})
            except ObjectDoesNotExist:
                return JsonResponse({'error': 'User not found'}, status=404)

        else:

            otp = request.data['otp']
            email = request.data['email']
            user = User.objects.filter(email=email, otp=otp).first()
            if not user:
                return Response({"error": "Invalid OTP or User not found"}, 400)

            expiration_time = user.otp_creation_time + timedelta(minutes=10)
            if now() > expiration_time:
                return Response({"error": "OTP has expired"}, 200)

            user.otp = None
            user.save()
            return Response({"msg": "OTP verified successfully"}, status=200)

    def put(self, request, tenant):

        email = request.data['email']
        password = request.data['password']

        try:
            user = User.objects.get(email=email)
            user.set_password(password)
            user.save()
            return JsonResponse({'msg': 'Password updated successfully'})
        except Exception as e:
            logger.info(str(e))
            return JsonResponse({'error': 'Invalid OTP'}, status=400)


# class UserAPIView(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]

#     def get(self, request, tenant):
#         try:
#             userSerializer = UserSerializer(request.user)
#             return Response({
#                 "user": {
#                             "first_name": userSerializer.data['first_name'],
#                             "username": userSerializer.data['username'],
#                             "last_name": userSerializer.data['last_name'],
#                             "email": userSerializer.data['email'],
#                             "contact_number": userSerializer.data['contact_number'],
#                             "is_superuser": userSerializer.data['is_superuser'],
#                             "id": userSerializer.data['id'],
#                             }
#             }, 200)
#         except Exception as e:
#             logger.error(str(e))
#             return Response("Something went wrong", 400)

class UserAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, tenant):
        try:
            logger.debug(f"Tenant: {tenant}")
            logger.debug(f"User: {request.user}")

            userSerializer = UserSerializer(request.user)
            user_data = userSerializer.data
            logger.debug(f"Serialized user data: {user_data}")
            
            return Response({
                "user": {
                    "first_name": user_data['first_name'],
                    "username": user_data['username'],
                    "last_name": user_data['last_name'],
                    "email": user_data['email'],
                    "contact_number": user_data['contact_number'],
                    "is_superuser": user_data['is_superuser'],
                    "id": user_data['id'],
                }
            }, 200)
        except Exception as e:
            import traceback
            logger.error(f"Error: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            return Response("Something went wrong", 400)


class SocialAPIView(APIView):
    def get(self, request, tenant):
        try:
            social = Social.objects.all().order_by('id')
            social_infoSerializer = SocialSerializer(social, many=True)
            socialData = social_infoSerializer.data
            return Response({"msg": "success", "socialLinks": socialData}, 200)
        except Exception as e:
            logger.error(str(e))
            return Response("Something went wrong", 400)



class SettingDetailView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get( self, request, *args, **kwargs):
        try:
            setting = Setting.objects.latest('created_at')
            serializer = SettingSerializer(setting)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Setting.DoesNotExist:
            return Response({"detail": "Setting not found."}, status=status.HTTP_404_NOT_FOUND)
        # Code Addition by Tejasve Gupta on 24-07-2024
        # Reason - Creating of setting details in frontend

    def post(self, request, *args, **kwargs):
        setting_id = request.data.get('id', None)

        if setting_id:
            try:
                setting = Setting.objects.get(id=setting_id)
                serializer = SettingSerializer(
                    setting, data=request.data, partial=True)
            except Setting.DoesNotExist:
                return Response({"detail": "Setting not found."}, status=status.HTTP_404_NOT_FOUND)
        else:
            serializer = SettingSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            all_setting_details = Setting.objects.all()
            all_setting_details_serializer = SettingSerializer(
                all_setting_details, many=True)

            return Response({'success': "Setting Details Updated Succesfully",
                             'setting_details': all_setting_details_serializer.data
                             }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        # End Code Addition by Tejasve Gupta on 24-07-2024
        # Reason - Creating of setting details in frontend


# End of Code Addition by Tejasve Gupta on 18-07-2024
# Reason - To get Hotel Details

# Code added by Tejasve Gupta on 26-05-2024
# Reason - Functionality of Forget Password


class PasswordResetAPIView(APIView):
    def post(self, request):
        if request.data["postFor"] == "email":
            email = request.data["data"]["email"]
            try:
                user = User.objects.get(email=email)
                otp = generate_otp()
                user.otp = otp
                user.save()
                send_otp(email, otp)
                return JsonResponse({'msg': 'OTP sent successfully'})
            except ObjectDoesNotExist:
                return JsonResponse({'error': 'User not found'}, status=404)

        else:

            otp = request.data["data"]['otp']
            email = request.data["data"]['email']
            user = User.objects.filter(email=email, otp=otp).first()
            if not user:
                return Response({"error": "Invalid OTP or User not found"}, status=400)
            user.otp = None
            user.save()
            return Response({"msg": "OTP verified successfully"}, status=200)

    def put(self, request):

        email = request.data['email']
        password = request.data['password']

        try:
            user = User.objects.get(email=email)
            user.set_password(password)
            user.save()
            return JsonResponse({'msg': 'Password updated successfully'})
        except Exception as e:
            return JsonResponse({'error': 'Invalid OTP'}, status=400)
# End of Code added by Tejasve Gupta on 26-05-2024
# Reason - Functionality of Forget Password


"""
Added by - Om Shrivastava on 27-05-2024
Reason - To get the all Checkin details for differents table
"""

# Modification and addition by Om shrivastava on 16-08-2024
# Reason : Modify the code according to available, booked and advance room
# class CheckinDetailView(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         amenityList = Amenity.objects.all()
#         amenitySerailizer = AmenitySerializer(amenityList, many=True)

#         amenityRoomList = AmenityRoom.objects.all()
#         amenityRoomSerailizer = AmenityRoomSerializer(
#             amenityRoomList, many=True)

#         personalDetailList = PersonalDetail.objects.all()
#         personalDetailSerailizer = PersonalDetailSerializer(
#             personalDetailList, many=True)

#         checkinDetailList = CheckinDetail.objects.all()
#         checkinDetailSerializer = CheckinDetailSerializer(
#             checkinDetailList, many=True)

#         billingDetailList = BillingDetail.objects.all()
#         bilingDetailsSerializer = BillingDetailSerializer(
#             billingDetailList, many=True)

#         bookedRoomList = BookedRoom.objects.all()
#         bookedRoomSerializer = BookedRoomSerializer(bookedRoomList, many=True)

#         roomData = RoomDetail.objects.all()
#         '''
#         Code Addition by - Tejasve Gupta onn
#         '''

#         # from datetime import datetime, timedelta

#         current_datetime = datetime.now()
#         current_date = current_datetime.date()
#         current_time = current_datetime.time()

#         # Get the setting for vacant_info_before_hour
#         setting = Setting.objects.first()
#         vacant_info_before_hour = setting.vacant_info_before_hour if setting else 0
#         vacant_info_threshold = current_datetime + \
#             timedelta(hours=vacant_info_before_hour)

#         room_list = list()
#         for room_data in roomData:
#             get_room_data = {}
#             get_room_data["id"] = room_data.id
#             get_room_data["room_number"] = room_data.number
#             get_room_data["room_type"] = room_data.room_type
#             get_room_data["room_price"] = room_data.price
#             '''
#             Code Addition By Tejasve Gupta on 03-04-2024
#             Reason - Calculating Availability Status
#             '''
#             vacant_rooms = CheckinDetail.objects.filter(Q(room_id=room_data.id) &
#                                                         Q(departure_date=current_date, departure_time__lte=vacant_info_threshold.time()) &
#                                                         ~Q(departure_date=current_date, departure_time__lte=current_time)).values_list('room_id', flat=True)

#             if vacant_rooms.count() > 0:
#                 get_room_data["status"] = "vacant"
#             else:
#                 # reserved_rooms = CheckinDetail.objects.filter(
#                 #     Q(arrival_date__lte=current_date) & Q(arrival_time__lte=current_time) &
#                 #     Q(departure_date__gte=current_date) &
#                 #     Q(departure_time__gt=(datetime.combine(current_date, current_time) + timedelta(hours=vacant_info_before_hour)))
#                 # )
#                 reserved_rooms = CheckinDetail.objects.filter(
#                     Q(room_id=room_data.id) &
#                     Q(arrival_date__lte=current_date) & Q(
#                         departure_date__gte=current_date)
#                 ).exclude(
#                     Q(arrival_date=current_date, arrival_time__gte=current_time) |
#                     Q(departure_date=current_date,
#                       departure_time__lte=current_time)
#                 )
#                 if reserved_rooms.count() > 0:
#                     get_room_data["status"] = "reserved"
#                 else:
#                     get_room_data["status"] = "available"

#             '''
#             End of Code Addition By Tejasve Gupta on 03-04-2024
#             Reason - Calculating Availability Status
#             '''
#             findAmenity = AmenityRoom.objects.filter(room_id=room_data.id)
#             get_room_data["amenity_list"] = findAmenity.values(
#                 "id", "amenity_id__name")
#             room_list.append(get_room_data)

#         # Addition by Om Shrivastava on 30-05-2024
#         # Reason : Get the available and booked rooms
#         # Retrieve current date and time from user's system
#         # from datetime import datetime,timedelta

#         # current_date = datetime.now().date()
#         # current_time = datetime.now().time()

#         # # Query reserved rooms for the specific date and time range
#         # reserved_rooms = CheckinDetail.objects.filter(
#         #     Q(arrival_date__lte=current_date) & Q(departure_date__gte=current_date)
#         # ).exclude(
#         #     Q(arrival_date=current_date, arrival_time__gte=current_time) |
#         #     Q(departure_date=current_date, departure_time__lte=current_time)
#         # )

#         # # Extract room IDs of reserved rooms
#         # reserved_room_ids = reserved_rooms.values_list('room_id', flat=True)

#         # # Query available rooms excluding reserved rooms
#         # available_rooms = RoomDetail.objects.exclude(id__in=reserved_room_ids)

#         # # Serialize available rooms with their check-in details if available
#         # available_rooms_data = []
#         # for room in available_rooms:
#         #     room_data = {
#         #         'id': room.id,
#         #         'room_type': room.room_type,
#         #         'price': room.price,
#         #         'number': room.number,
#         #         'arrival_date': None,
#         #         'arrival_time': None,
#         #         'departure_date': None,
#         #         'departure_time': None
#         #     }
#         #     last_checkin = CheckinDetail.objects.filter(room_id=room.id).order_by('-arrival_date').first()
#         #     if last_checkin:
#         #         room_data.update({
#         #             'arrival_date': last_checkin.arrival_date,
#         #             'arrival_time': last_checkin.arrival_time,
#         #             'departure_date': last_checkin.departure_date,
#         #             'departure_time': last_checkin.departure_time,
#         #         })
#         #     available_rooms_data.append(room_data)

#         # # Serialize reserved rooms with their check-in details
#         # reserved_rooms_data = []
#         # for reserved in reserved_rooms:
#         #     room_data = {
#         #         'id': reserved.room_id.id,
#         #         'room_type': reserved.room_id.room_type,
#         #         'price': reserved.room_id.price,
#         #         'number': reserved.room_id.number,
#         #         'arrival_date': reserved.arrival_date,
#         #         'arrival_time': reserved.arrival_time,
#         #         'departure_date': reserved.departure_date,
#         #         'departure_time': reserved.departure_time
#         #     }
#         #     reserved_rooms_data.append(room_data)

#     # Working for same vacant room + reserved room -----------------------------------------------
#         # from datetime import datetime,timedelta

#         # current_date = datetime.now().date()
#         # current_time = datetime.now().time()

#         # # Get the setting for vacant_info_before_hour
#         # setting = Setting.objects.first()
#         # vacant_info_before_hour = setting.vacant_info_before_hour if setting else 0
#         # vacant_info_threshold = datetime.now() + timedelta(hours=vacant_info_before_hour)

#         # # Query reserved rooms for the specific date and time range
#         # reserved_rooms = CheckinDetail.objects.filter(
#         #     Q(arrival_date__lte=current_date) & Q(departure_date__gte=current_date)
#         # ).exclude(
#         #     Q(arrival_date=current_date, arrival_time__gte=current_time) |
#         #     Q(departure_date=current_date, departure_time__lte=current_time)
#         # )

#         # # Extract room IDs of reserved rooms
#         # reserved_room_ids = reserved_rooms.values_list('room_id', flat=True)

#         # # Query available rooms excluding reserved rooms
#         # available_rooms = RoomDetail.objects.exclude(id__in=reserved_room_ids)

#         # # Query vacant rooms based on the vacant_info_before_hour setting
#         # vacant_rooms = CheckinDetail.objects.filter(
#         #     Q(departure_date=current_date, departure_time__lte=vacant_info_threshold.time()) &
#         #     ~Q(departure_date=current_date, departure_time__lte=current_time)
#         # ).values_list('room_id', flat=True)

#         # # Serialize available rooms with their check-in details if available
#         # available_rooms_data = []
#         # for room in available_rooms:
#         #     room_data = {
#         #         'id': room.id,
#         #         'room_type': room.room_type,
#         #         'price': room.price,
#         #         'number': room.number,
#         #         'arrival_date': None,
#         #         'arrival_time': None,
#         #         'departure_date': None,
#         #         'departure_time': None
#         #     }
#         #     last_checkin = CheckinDetail.objects.filter(room_id=room.id).order_by('-arrival_date').first()
#         #     if last_checkin:
#         #         room_data.update({
#         #             'arrival_date': last_checkin.arrival_date,
#         #             'arrival_time': last_checkin.arrival_time,
#         #             'departure_date': last_checkin.departure_date,
#         #             'departure_time': last_checkin.departure_time,
#         #         })
#         #     available_rooms_data.append(room_data)

#         # # Serialize reserved rooms with their check-in details
#         # reserved_rooms_data = []
#         # for reserved in reserved_rooms:
#         #     room_data = {
#         #         'id': reserved.room_id.id,
#         #         'room_type': reserved.room_id.room_type,
#         #         'price': reserved.room_id.price,
#         #         'number': reserved.room_id.number,
#         #         'arrival_date': reserved.arrival_date,
#         #         'arrival_time': reserved.arrival_time,
#         #         'departure_date': reserved.departure_date,
#         #         'departure_time': reserved.departure_time
#         #     }
#         #     reserved_rooms_data.append(room_data)

#         # # Serialize vacant rooms
#         # vacant_rooms_data = []
#         # for room_id in vacant_rooms:
#         #     room = RoomDetail.objects.get(id=room_id)
#         #     last_checkin = CheckinDetail.objects.filter(room_id=room.id).order_by('-arrival_date').first()
#         #     if last_checkin:
#         #         room_data = {
#         #             'id': room.id,
#         #             'room_type': room.room_type,
#         #             'price': room.price,
#         #             'number': room.number,
#         #             'arrival_date': last_checkin.arrival_date,
#         #             'arrival_time': last_checkin.arrival_time,
#         #             'departure_date': last_checkin.departure_date,
#         #             'departure_time': last_checkin.departure_time,
#         #         }
#         #         vacant_rooms_data.append(room_data)
#         # Addition by Om Shrivastava on 01-06-2024
#         # Reason : Get the available, reserved and vacant room details
#         # Code Commented By - Tejasve Gupta on 03-06-2024
#         # Reason - Code Shifted above
#         # from datetime import datetime,timedelta
#         # current_datetime = datetime.now()
#         # current_date = current_datetime.date()
#         # current_time = current_datetime.time()

#         # # Get the setting for vacant_info_before_hour
#         # setting = Setting.objects.first()
#         # vacant_info_before_hour = setting.vacant_info_before_hour if setting else 0
#         # vacant_info_threshold = current_datetime + timedelta(hours=vacant_info_before_hour)
#             # End of Code Commented By - Tejasve Gupta on 03-06-2024
#         # Reason - Code Shifted above
#         # Query reserved rooms for the specific date and time range
#         reserved_rooms = CheckinDetail.objects.filter(
#             Q(arrival_date__lte=current_date) & Q(
#                 departure_date__gte=current_date)
#         ).exclude(
#             Q(arrival_date=current_date, arrival_time__gte=current_time) |
#             Q(departure_date=current_date, departure_time__lte=current_time)
#         )
#         # print("*************",reserved_rooms.values())

#         # Extract room IDs of reserved rooms
#         reserved_room_ids = reserved_rooms.values_list('room_id', flat=True)

#         '''
#         Code Addition by Tejasve Gupta on 03-06-2024
#         Reason - Querry created for Booked Rooms
#         '''
#         # Query booked rooms
#         # booked_rooms = CheckinDetail.objects.filter(
#         #     Q(arrival_date__lte=current_date) & Q(departure_date__gte=current_date)
#         # )

#         # Extract Room ID's from Booked Rooms
#         # booked_room_ids = booked_rooms.values_list('room_id', flat=True)

#         '''
#         End of Code Addition by Tejasve Gupta on 03-06-2024
#         Reason - Querry created for Booked Rooms
#         '''

#         # Query available rooms excluding reserved rooms
#         # Query available rooms excluding reserved and booked rooms
#         available_rooms = RoomDetail.objects.exclude(id__in=reserved_room_ids)

#         # Query vacant rooms based on the vacant_info_before_hour setting
#         vacant_rooms = CheckinDetail.objects.filter(
#             Q(departure_date=current_date, departure_time__lte=vacant_info_threshold.time()) &
#             ~Q(departure_date=current_date, departure_time__lte=current_time)
#         ).values_list('room_id', flat=True)

#         # Exclude vacant rooms from reserved rooms
#         reserved_rooms = reserved_rooms.exclude(room_id__in=vacant_rooms)

#         # Serialize available rooms with their check-in details if available
#         available_rooms_data = []
#         for room in available_rooms:
#             room_data = {
#                 'id': room.id,
#                 'room_type': room.room_type,
#                 'price': room.price,
#                 'number': room.number,
#                 'arrival_date': None,
#                 'arrival_time': None,
#                 'departure_date': None,
#                 'departure_time': None
#             }
#             last_checkin = CheckinDetail.objects.filter(
#                 room_id=room.id).order_by('-arrival_date').first()
#             if last_checkin:
#                 room_data.update({
#                     'arrival_date': last_checkin.arrival_date,
#                     'arrival_time': last_checkin.arrival_time,
#                     'departure_date': last_checkin.departure_date,
#                     'departure_time': last_checkin.departure_time,
#                 })
#             available_rooms_data.append(room_data)

#         # Serialize reserved rooms with their check-in details
#         reserved_rooms_data = []
#         for reserved in reserved_rooms:
#             room_data = {
#                 'id': reserved.room_id.id,
#                 'room_type': reserved.room_id.room_type,
#                 'price': reserved.room_id.price,
#                 'number': reserved.room_id.number,
#                 'arrival_date': reserved.arrival_date,
#                 'arrival_time': reserved.arrival_time,
#                 'departure_date': reserved.departure_date,
#                 'departure_time': reserved.departure_time
#             }
#             reserved_rooms_data.append(room_data)

#         # Serialize vacant rooms
#         vacant_rooms_data = []
#         for room_id in vacant_rooms:
#             room = RoomDetail.objects.get(id=room_id)
#             last_checkin = CheckinDetail.objects.filter(
#                 room_id=room.id).order_by('-arrival_date').first()
#             if last_checkin:
#                 room_data = {
#                     'id': room.id,
#                     'room_type': room.room_type,
#                     'price': room.price,
#                     'number': room.number,
#                     'arrival_date': last_checkin.arrival_date,
#                     'arrival_time': last_checkin.arrival_time,
#                     'departure_date': last_checkin.departure_date,
#                     'departure_time': last_checkin.departure_time,
#                 }
#                 vacant_rooms_data.append(room_data)
#         # End of addition by Om Shrivastava on 01-06-2024
#         # Reason : Get the available, reserved and vacant room details

#         # print("++++++room_list++++++++++++>>>>>>", room_list)

#         # print("__________vacant_rooms_data_____________>>>>>>>>", vacant_rooms_data)
#         # print("------------reserved_rooms_data--------->>>>", vacant_rooms_data)
#         # print("=========available_rooms_data=========>>>>", vacant_rooms_data)

#         '''
#         Code Addition by Tejasve Gupta on 03-06-2024
#         Reason - Querry created for Booked Rooms
#         '''
#         # booked_rooms_data = []
#         # for booked in booked_rooms:
#         #     room = booked.room_id
#         #     room_data = {
#         #         'id': room.id,
#         #         'room_type': room.room_type,
#         #         'price': room.price,
#         #         'number': room.number,
#         #         'booking_date': booked.arrival_date,
#         #         'checkout_date': booked.departure_date,
#         #         # 'customer_name': booked.customer_name
#         #     }
#         #     booked_rooms_data.append(room_data)

#         # Combine all room data
#         # room_status_data = {
#         #     'available_rooms': available_rooms_data,
#         #     'reserved_rooms': reserved_rooms_data,
#         #     'vacant_rooms': vacant_rooms_data,
#         #     'booked_rooms': booked_rooms_data
#         # }
#         '''
#         End of Code Addition by Tejasve Gupta on 03-06-2024
#         Reason - Querry created for Booked Rooms
#         '''
#         # Code Addition by Tejasve Gupta on 02-06-2024
#         # Reason - To Get Room Availability
#         # Code Commented by Tejasve Gupta on 03-06-2024
#         # availability_list = []
#         # for room in roomData:
#         #     room_number = room.number
#         #     if room.id in available_rooms.values_list('id', flat=True):
#         #         status = 'available'
#         #     elif room.id in reserved_rooms.values_list('room_id', flat=True):
#         #         status = 'reserved'
#         #     elif room.id in vacant_rooms:
#         #         status = 'vacant'
#         #     else:
#         #         status = 'unknown'

#         #     availability_list.append({
#         #         'room_number': room_number,
#         #         'status': status
#         #     })
#         # End of Code Commented by Tejasve Gupta on 03-06-2024
#         # End of Code Addition by Tejasve Gupta on 02-06-2024
#         # Reason - To Get Room Availability

#         return Response({
#             # Code Addition by Tejasve Gupta on 13-06-2024
#             # Reason - to show pop up notifications


#             "success": "Room Booked Successfully",
#             "room_list": room_list,
#             "amenityList": amenitySerailizer.data,
#             "AmenityRoomList": amenityRoomSerailizer.data,
#             "PersonalDetailList": personalDetailSerailizer.data,
#             "CheckinDetailList": checkinDetailSerializer.data,
#             "BillingDetailList": bilingDetailsSerializer.data,
#             "BookedRoomList": bookedRoomSerializer.data,
#             'available_rooms': available_rooms_data,
#             'reserved_rooms': reserved_rooms_data,
#             'vacant_rooms': vacant_rooms_data,
#             # Code Commented by Tejasve Gupta on 03-06-2024
#             # 'availability_list': availability_list,
#             # End of Code Commented by Tejasve Gupta on 03-06-2024

#         }, 200)
#         # End of Code Addition by Tejasve Gupta on 13-06-2024
#         # Reason - to show pop up notifications

#         # End of addition by Om Shrivastava on 30-05-2024
#         # Reason : Get the available and booked rooms


# class ShiftRoomView(APIView):

#     def post(self, request):
#         guest_id = request.data.get("guest_id")  
#         old_room_id = request.data.get("old_room_id")
#         new_room_id = request.data.get("new_room_id")

#         if not guest_id or not old_room_id or not new_room_id:
#             return Response({"error": "Guest ID, old room ID, and new room ID are required"}, status=400)

#         try:
#             # Get the active check-in record
#             checkin_record = CheckinDetail.objects.filter(
#                 guest_id=guest_id, room_id=old_room_id, departure_date__isnull=True
#             ).first()

#             if not checkin_record:
#                 return Response({"error": "No active check-in found for this room"}, status=400)

#             # Get billing record for old room
#             old_billing_record = BillingDetail.objects.filter(personal_details_id=guest_id).first()

#             if not old_billing_record:
#                 return Response({"error": "No billing record found for this guest"}, status=400)

#             # Get new room details
#             new_room = RoomDetail.objects.get(id=new_room_id)

#             # Store previous room info (optional tracking)
#             checkin_record.previous_room_id = old_room_id  # Add this field in model if needed
#             checkin_record.room_id = new_room  # Update room
#             checkin_record.save()


#             new_billing_record = BillingDetail.objects.create(
#                 personal_details_id=guest_id,
#                 bill_number=old_billing_record.bill_number,  # Keep the same bill number
#                 invoice_number=old_billing_record.invoice_number,  # Keep the same invoice number
#                 room_charges=new_room.price,
#                 taxable_amount=new_room.price,
#                 tax_rate=old_billing_record.tax_rate,
#                 tax_value=(new_room.price * old_billing_record.tax_rate) / 100,
#                 grand_total=(new_room.price + (new_room.price * old_billing_record.tax_rate) / 100),
#                 date=datetime.now(),
#                 status="Shifted Room"
#             )

#             return Response({
#                 "success": "Room shifted successfully with new billing entry",
#                 "previous_billing": {
#                     "bill_number": old_billing_record.bill_number,
#                     "invoice_number": old_billing_record.invoice_number,
#                     "room_id": old_room_id,
#                     "room_charges": old_billing_record.room_charges,
#                     "grand_total": old_billing_record.grand_total,
#                 },
#                 "new_billing": {
#                     "bill_number": new_billing_record.bill_number,
#                     "invoice_number": new_billing_record.invoice_number,
#                     "room_id": new_room_id,
#                     "room_charges": new_billing_record.room_charges,
#                     "grand_total": new_billing_record.grand_total,
#                 }
#             }, status=200)

#         except Exception as e:
#             return Response({"error": str(e)}, status=500)


# class RoomShiftView(APIView):
#     def post(self, request, *args, **kwargs):
#         try:
#             # Extract request data
#             billing_id = request.data.get('billing_id')  
#             current_room_id = request.data.get('current_room_id')
#             new_room_id = request.data.get('new_room_id')

#             # Validate input data
#             if not billing_id or not current_room_id or not new_room_id:
#                 return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

#             # Debugging: Log the input values
#             print(f"Billing ID: {billing_id}, Current Room ID: {current_room_id}, New Room ID: {new_room_id}")

#             # Fetch the CheckinDetail object
#             checkin_record = CheckinDetail.objects.filter(
#                 billing_id_id=billing_id,  
#                 room_id_id=current_room_id  
#             ).first()

#             if not checkin_record:
#                 print("No check-in record found for the provided billing ID and Room ID.")
#                 return Response({"error": "Check-in details not found."}, status=status.HTTP_404_NOT_FOUND)
            
#             # Store previous room number
#             previous_room_id = checkin_record.room_id_id 

#             # Update the room_id in CheckinDetail
#             checkin_record.room_id_id = new_room_id  # ForeignKey update
#             checkin_record.save()

#             return Response({
#                 "success": "Room shifted successfully",
#                 "updated_room_id": new_room_id,
#                 "previous_room_id": previous_room_id
#             }, status=status.HTTP_200_OK)

#         except Exception as e:
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class RoomShiftView(APIView):
#     def post(self, request, *args, **kwargs):
#         try:
#             # Extract request data
#             billing_id = request.data.get('billing_id')  
#             current_room_id = request.data.get('current_room_id')
#             new_room_id = request.data.get('new_room_id')

#             # Validate input data
#             if not billing_id or not current_room_id or not new_room_id:
#                 return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

#             # Debugging: Log the input values
#             print(f"Billing ID: {billing_id}, Current Room ID: {current_room_id}, New Room ID: {new_room_id}")

#             # Fetch the CheckinDetail object
#             checkin_record = CheckinDetail.objects.filter(
#                 billing_id_id=billing_id,  
#                 room_id_id=current_room_id  
#             ).first()

#             if not checkin_record:
#                 print("No check-in record found for the provided billing ID and Room ID.")
#                 return Response({"error": "Check-in details not found."}, status=status.HTTP_404_NOT_FOUND)

#             # Fetch previous room details
#             previous_room_id = checkin_record.room_id_id  # Get previous room ID
#             previous_room = RoomDetail.objects.filter(id=previous_room_id).first()

#             if not previous_room:
#                 return Response({"error": "Previous room not found."}, status=status.HTTP_404_NOT_FOUND)

#             previous_room_number = previous_room.number  # Get previous room number

#             # Fetch the new room details
#             new_room = RoomDetail.objects.filter(id=new_room_id).first()
#             if not new_room:
#                 return Response({"error": "New room not found."}, status=status.HTTP_404_NOT_FOUND)

#             new_room_number = new_room.number  # Get new room number

#             # Update the room_id in CheckinDetail
#             checkin_record.room_id_id = new_room_id  # Update to new room ID
#             checkin_record.save()

#             return Response({
#                 "success": "Room shifted successfully",
#                 "previous_room_id": previous_room_id,
#                 "previous_room_number": previous_room_number,  # Added previous room number
#                 "new_room_id": new_room_id,
#                 "new_room_number": new_room_number  # Added new room number
#             }, status=status.HTTP_200_OK)

#         except Exception as e:
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from datetime import date, datetime
class RoomShiftView(APIView):
    def get(self, request, *args, **kwargs):
        billing_id = request.query_params.get("billing_id")

        if not billing_id:
            return Response({"error": "Billing ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        room_shift_history = RoomShiftHistory.objects.filter(billing_id=billing_id).order_by("-shifted_at")
        room_shifted = room_shift_history.exists()

        if not room_shifted:
            return Response(
                {"room_shifted": False, "message": "No room shift history found"},
                status=status.HTTP_200_OK
            )

        shift_history_data = [
            {
                "previous_room": shift.previous_room.id,
                "new_room": shift.new_room.id,
                "shifted_at": shift.shifted_at,
                "shifted_date" : shift.shifted_date,
                "shifted_time" : shift.shifted_time
            }
            for shift in room_shift_history
        ]

        # Fetch the latest shift for new room details
        latest_shift = room_shift_history.first()
        new_room_details = None
        checkin_details = None

        if latest_shift:
            new_room_details = RoomDetail.objects.filter(id=latest_shift.new_room.id).values().first()

            # Fetch check-in details matching both room_id and billing_id
            checkin = CheckinDetail.objects.filter(
                room_id=latest_shift.new_room.id,
                billing_id=billing_id
            ).order_by("-arrival_date").first()
            
            if checkin:
                checkin_details = {
                    "arrival_date": checkin.arrival_date,
                    "arrival_time": checkin.arrival_time,
                    "departure_date": checkin.departure_date,
                    "departure_time": checkin.departure_time,
                    "room_id": checkin.room_id.id,
                    "billing_id": checkin.billing_id.id,
                    "room_price": checkin.room_price
                }

        return Response(
            {
                "room_shifted": room_shifted,
                "room_shift_history": shift_history_data,
                "new_room_details": new_room_details,
                "new_checkin_details": checkin_details
            },
            status=status.HTTP_200_OK
        )



    def post(self, request, *args, **kwargs):
        try:
            billing_id = request.data.get('billing_id')
            current_room_id = request.data.get('current_room_id')
            new_room_id = request.data.get('new_room_id')

            if not billing_id or not current_room_id or not new_room_id:
                return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():
                # Fetch previous and new room details
                previous_room = RoomDetail.objects.filter(id=current_room_id).first()
                new_room = RoomDetail.objects.filter(id=new_room_id).first()

                if not previous_room or not new_room:
                    return Response({"error": "Invalid room details."}, status=status.HTTP_404_NOT_FOUND)

                # Fetch existing check-in record
                old_checkin = CheckinDetail.objects.filter(
                    billing_id_id=billing_id, room_id_id=current_room_id
                ).first()

                if not old_checkin:
                    return Response({"error": "Check-in record not found."}, status=status.HTTP_404_NOT_FOUND)

                # Close the old check-in
                old_checkin.departure_date = date.today()
                old_checkin.departure_time = datetime.now().time()
                old_checkin.save()

                # Create a new check-in record for the new room
                new_checkin = CheckinDetail.objects.create(
                    arrival_date=date.today(),
                    arrival_time=datetime.now().time(),
                    departure_date=None,
                    departure_time=None,
                    room_id=new_room,
                    billing_id=old_checkin.billing_id,
                    room_shifted = True,
                    room_price=new_room.price if new_room else old_checkin.room_price
                    
                )

                old_guest_records = GuestDetails.objects.filter(
                    billing_id=billing_id, selectedRoom=previous_room.number
                )

                # Create new guest records for the new check-in
                new_guest_records = []
                for guest in old_guest_records:
                    new_guest = GuestDetails.objects.create(
                        guest_salutation=guest.guest_salutation,
                        guest_name=guest.guest_name,
                        guest_last_name=guest.guest_last_name,
                        guest_id_card_type=guest.guest_id_card_type,
                        guest_id_card_no=guest.guest_id_card_no,
                        guest_id_card_photo=guest.guest_id_card_photo,
                        billing_id=new_checkin.billing_id,
                        person_type=guest.person_type,
                        selectedRoom=new_room.number, 
                        room_shifted=True, 
                    )
                    new_guest_records.append(new_guest)

                # Store Room Shift History
                RoomShiftHistory.objects.create(
                    billing_id=old_checkin.billing_id,
                    previous_room=previous_room,
                    new_room=new_room,
                    shifted_at=datetime.now(),
                    shifted_date = date.today(),
                    shifted_time = datetime.now().time()
                )
                
                # Update new room charges in BillingDetails
                billing_record = BillingDetail.objects.filter(id=billing_id).first()
                if billing_record:
                    billing_record.new_room_charges = new_room.price
                    billing_record.save()
                
                # checkin_detail = CheckinDetail.objects.filter(id=billing_id).first()
                # if checkin_detail:
                #     checkin_detail.room_shifted = True
                #     checkin_detail.save()
                
                 # Set the previous room's is_active to True and new room's is_active to False
                previous_room.is_active = True
                previous_room.save()
                new_room.is_active = False
                new_room.save()

                return Response({
                    "success": "Room shifted successfully",
                    "room_shifted": True,
                    "old_room_id": current_room_id,
                    "new_room_id": new_room_id,
                    "new_checkin_id": new_checkin.id,
                    "new_guest_ids": [guest.id for guest in new_guest_records]
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e), "room_shifted": False}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # def post(self, request, *args, **kwargs):
    #     try:
    #         billing_id = request.data.get('billing_id')
    #         current_room_id = request.data.get('current_room_id')
    #         new_room_id = request.data.get('new_room_id')

    #         if not billing_id or not current_room_id or not new_room_id:
    #             return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

    #         with transaction.atomic():
    #             # Fetch previous and new room details
    #             previous_room = RoomDetail.objects.filter(id=current_room_id).first()
    #             new_room = RoomDetail.objects.filter(id=new_room_id).first()

    #             if not previous_room or not new_room:
    #                 return Response({"error": "Invalid room details."}, status=status.HTTP_404_NOT_FOUND)

    #             # Fetch existing check-in record
    #             old_checkin = CheckinDetail.objects.filter(
    #                 billing_id_id=billing_id, room_id_id=current_room_id
    #             ).first()

    #             if not old_checkin:
    #                 return Response({"error": "Check-in record not found."}, status=status.HTTP_404_NOT_FOUND)

    #             # Close the old check-in
    #             old_checkin.departure_date = date.today()
    #             old_checkin.departure_time = datetime.now().time()
    #             old_checkin.save()

    #             # Create a new check-in record
    #             new_checkin = CheckinDetail.objects.create(
    #                 arrival_date=date.today(),
    #                 arrival_time=datetime.now().time(),
    #                 departure_date=None,
    #                 departure_time=None,
    #                 room_id=new_room,
    #                 billing_id=old_checkin.billing_id,
    #                 room_shifted=True,
    #                 room_price=new_room.price if new_room else old_checkin.room_price
    #             )

    #             # Copy guests to new room
    #             old_guest_records = GuestDetails.objects.filter(
    #                 billing_id=billing_id, selectedRoom=previous_room.number
    #             )

    #             new_guest_records = []
    #             for guest in old_guest_records:
    #                 new_guest = GuestDetails.objects.create(
    #                     guest_salutation=guest.guest_salutation,
    #                     guest_name=guest.guest_name,
    #                     guest_last_name=guest.guest_last_name,
    #                     guest_id_card_type=guest.guest_id_card_type,
    #                     guest_id_card_no=guest.guest_id_card_no,
    #                     guest_id_card_photo=guest.guest_id_card_photo,
    #                     billing_id=new_checkin.billing_id,
    #                     person_type=guest.person_type,
    #                     selectedRoom=new_room.number, 
    #                     room_shifted=True, 
    #                 )
    #                 new_guest_records.append(new_guest)

    #             # Store Room Shift History
    #             room_shift = RoomShiftHistory.objects.create(
    #                 billing_id=old_checkin.billing_id,
    #                 previous_room=previous_room,
    #                 new_room=new_room,
    #                 shifted_at=datetime.now(),
    #                 shifted_date=date.today(),
    #                 shifted_time=datetime.now().time()
    #             )

    #             # Update Billing
    #             billing_record = BillingDetail.objects.filter(id=billing_id).first()
    #             if billing_record:
    #                 billing_record.new_room_charges = new_room.price
    #                 billing_record.save()

    #             # Prepare shift history
    #             room_shift_history = RoomShiftHistory.objects.filter(billing_id=billing_id).order_by("-shifted_at")
    #             shift_history_data = [
    #                 {
    #                     "previous_room": shift.previous_room.id,
    #                     "new_room": shift.new_room.id,
    #                     "shifted_at": shift.shifted_at,
    #                     "shifted_date": shift.shifted_date,
    #                     "shifted_time": shift.shifted_time
    #                 }
    #                 for shift in room_shift_history
    #             ]

    #             # New room details
    #             new_room_details = RoomDetail.objects.filter(id=new_room.id).values().first()

    #             # Check-in details
    #             checkin_details = {
    #                 "arrival_date": new_checkin.arrival_date,
    #                 "arrival_time": new_checkin.arrival_time,
    #                 "departure_date": new_checkin.departure_date,
    #                 "departure_time": new_checkin.departure_time,
    #                 "room_id": new_checkin.room_id.id,
    #                 "billing_id": new_checkin.billing_id.id,
    #                 "room_price": new_checkin.room_price
    #             }

    #             return Response({
    #                 "success": "Room shifted successfully",
    #                 "room_shifted": True,
    #                 "room_shift_history": shift_history_data,
    #                 "new_room_details": new_room_details,
    #                 "new_checkin_details": checkin_details
    #             }, status=status.HTTP_201_CREATED)

    #     except Exception as e:
    #         return Response({"error": str(e), "room_shifted": False}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# import pdb


class CheckinDetailView(APIView):
    
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, tenant):
        # amenityList = Amenity.objects.all()
        # amenitySerailizer = AmenitySerializer(amenityList, many=True)
        
        amenityList = AmenityPublic.objects.all()
        amenitySerailizer = AmenityPublicSerializer(amenityList, many=True)

        amenityRoomList = AmenityRoom.objects.all()
        amenityRoomSerailizer = AmenityRoomSerializer(
            amenityRoomList, many=True)

        personalDetailList = PersonalDetail.objects.all()
        personalDetailSerailizer = PersonalDetailSerializer(
            personalDetailList, many=True)

        checkinDetailList = CheckinDetail.objects.all()
        checkinDetailSerializer = CheckinDetailSerializer(
            checkinDetailList, many=True)

        billingDetailList = BillingDetail.objects.all()
        bilingDetailsSerializer = BillingDetailSerializer(
            billingDetailList, many=True)
        # Modified by - Ashish Dewangan on 04-09-2024
        # Reaspm - To filter out inactive rooms and sort the list by room number
        # roomData = RoomDetail.objects.all()
        roomData = RoomDetail.objects.filter(is_active=True).order_by("number")
        # End of modification by - Ashish Dewangan on 04-09-2024
        # Reaspm - To filter out inactive rooms and sort the list by room number
        '''
        Code Addition by - Tejasve Gupta onn
        '''

        from datetime import datetime, timedelta

        current_datetime = datetime.now()
        current_date = current_datetime.date()
        current_time = current_datetime.time()

        # Get the setting for vacant_info_before_hour
        setting = Setting.objects.first()
        vacant_info_before_hour = setting.vacant_info_before_hour if setting else 0
        vacant_info_threshold = current_datetime + \
            timedelta(hours=vacant_info_before_hour)

        # Modified by - Ashish Dewangan on 01-09-2024
        # Reason - To return correct room status
        # booked_rooms = CheckinDetail.objects.filter(
        #     departure_date__isnull=True, arrival_date__lte=current_date
        # ).union(
        #     CheckinDetail.objects.filter(
        #         arrival_date__lte=current_date,
        #         arrival_time__lte=current_time
        #     )
        # )
        # Modified by - Ashish Dewangan on 04-09-2024
        # Reason - To filter out inactive rooms
        # booked_rooms = CheckinDetail.objects.filter(
        #     departure_date__isnull=True, arrival_date__lte=current_date
        # )
        booked_rooms = CheckinDetail.objects.filter(
            departure_date__isnull=True, arrival_date__lte=current_date, room_id__is_active=True
        )
        # En of modification by - Ashish Dewangan on 04-09-2024
        # Reason - To filter out inactive rooms
        # End of modification by - Ashish Dewangan on 01-09-2024
        # Reason - To return correct room status

        booked_room_ids = booked_rooms.values_list('room_id', flat=True)
        # Create the AdvanceRoomList
        # Modified by - Ashish Dewangan on 04-09-2024
        # Reason - To filter out inactive rooms
        # advance_rooms = CheckinDetail.objects.filter(
        #     departure_date__isnull=True
        # ).exclude(room_id__in=booked_room_ids)
        advance_rooms = CheckinDetail.objects.filter(
            departure_date__isnull=True, room_id__is_active=True
        ).exclude(room_id__in=booked_room_ids)
        advance_room_ids = advance_rooms.values_list('room_id', flat=True)

        # End of modification by - Ashish Dewangan on 04-09-2024
        # Reason - To filter out inactive rooms
        # Update BookedRoomList: Rooms without a departure date and not in AdvanceRoomList

        # Update available_rooms: Rooms not in BookedRoomList
        # Modified by - Ashish Dewangan on 04-09-2024
        # Reason - To filter out inactive rooms
        # available_rooms = RoomDetail.objects.exclude(id__in=booked_room_ids)
        available_rooms = RoomDetail.objects.filter(
            is_active=True).exclude(id__in=booked_room_ids)
        # End of modification by - Ashish Dewangan on 04-09-2024
        # Reason - To filter out inactive rooms

        # Preparing the room_list with statuses
        
        room_list = []
        for room_data in roomData:
            get_room_data = {
                "id": room_data.id,
                "room_number": room_data.number,
                "room_type": room_data.room_type,
                "room_price": room_data.price,
                'variety': room_data.variety,
                "status": "available"  # default status
            }

            # Update the room status
            if room_data.id in booked_room_ids:
                get_room_data["status"] = "booked"
            elif room_data.id in advance_room_ids:
                get_room_data["status"] = "advance booking"
            elif CheckinDetail.objects.filter(
                room_id=room_data.id,
                departure_date=current_date,
                departure_time__lte=vacant_info_threshold.time()
            ).exclude(departure_date=current_date, departure_time__lte=current_time).exists():
                get_room_data["status"] = "vacant"

            # findAmenity = AmenityRoom.objects.filter(room_id=room_data.id)
            # get_room_data["amenity_list"] = findAmenity.values(
            #     "id", "amenity_id__name")
            # room_list.append(get_room_data)
            
            # findAmenity = AmenityRoom.objects.filter(room_id=room_data.id)
            # get_room_data["amenity_list"] = findAmenity.values(
            #     "id", "amenity_id__amenity_name")
            # room_list.append(get_room_data)

            findAmenity = AmenityRoom.objects.filter(room_id=room_data.id).select_related("amenity_id")
            get_room_data["amenity_list"] = list(
                findAmenity.values("id", "amenity_id__amenity_name")
            )
            room_list.append(get_room_data)

        def format_timing(arrival_date, arrival_time):
            if arrival_date and arrival_time:
                # Format the date as "dd-mm-yyyy"
                formatted_date = arrival_date.strftime('%d-%m-%Y')
                # Format the time as "hh.mmpm/am"
                # Modified by - Ashish Dewangan on 07-09-2024
                # Reason - To format date and time differently
                # formatted_time = arrival_time.strftime('%I.%M%p').lower()
                # return f"{formatted_date}, {formatted_time}"
                formatted_time = arrival_time.strftime('%H:%M:%S').lower()
                return f"{formatted_date} {formatted_time}"
                # End of modification by - Ashish Dewangan on 07-09-2024
                # Reason - To format date and time differently
            return None

        # Serialize available rooms with their check-in details
        available_rooms_data = []
        for room in available_rooms:
            last_checkin = CheckinDetail.objects.filter(
                room_id=room.id).order_by('-arrival_date').first()
            room_data = {
                'id': room.id,
                'room_type': room.room_type,
                'price': room.price,
                'variety': room.variety,
                'number': room.number,
                'arrival_date': last_checkin.arrival_date if last_checkin else None,
                'arrival_time': last_checkin.arrival_time if last_checkin else None,
                'departure_date': last_checkin.departure_date if last_checkin else None,
                'departure_time': last_checkin.departure_time if last_checkin else None,
                'status': 'Free',
                'timing': format_timing(last_checkin.arrival_date, last_checkin.arrival_time) if last_checkin else None
            }

            if room.id in advance_room_ids:
                room_data['status'] = 'Advance'
            available_rooms_data.append(room_data)
            # last_checkin = CheckinDetail.objects.filter(
            #     room_id=room.id).order_by('-arrival_date').first()
            # if last_checkin:
            #     room_data.update({
            #         'arrival_date': last_checkin.arrival_date,
            #         'arrival_time': last_checkin.arrival_time,
            #         'departure_date': last_checkin.departure_date,
            #         'departure_time': last_checkin.departure_time,
            #     })
            # available_rooms_data.append(room_data)

        # Serialize advance rooms with their check-in details
        advance_rooms_data = []
        for advance in advance_rooms:
            room_data = {
                'id': advance.room_id.id,
                'room_type': advance.room_id.room_type,
                'price': advance.room_id.price,
                'variety': advance.room_id.variety,
                'number': advance.room_id.number,
                'arrival_date': advance.arrival_date,
                'arrival_time': advance.arrival_time,
                'departure_date': advance.departure_date,
                'departure_time': advance.departure_time,
                'status': 'Advance',
                'timing': format_timing(advance.arrival_date, advance.arrival_time)

            }
            advance_rooms_data.append(room_data)

        # Serialize booked rooms with their check-in details
        booked_rooms_data = []
        for booked in booked_rooms:
            room_data = {
                'id': booked.room_id.id,
                'room_type': booked.room_id.room_type,
                'price': booked.room_id.price,
                'variety': booked.room_id.variety,
                'number': booked.room_id.number,
                'arrival_date': booked.arrival_date,
                'arrival_time': booked.arrival_time,
                'departure_date': booked.departure_date,
                'departure_time': booked.departure_time,
                'status': 'Booked',
                'timing': format_timing(booked.arrival_date, booked.arrival_time)
            }
            booked_rooms_data.append(room_data)

        def sort_room_number(room):
            # Extract numeric and alphabetic parts
            match = re.match(r"(\d+)([a-zA-Z]*)", room['room_number'])
            if match:
                number = int(match.group(1))
                alpha = match.group(2)
                return (number, alpha)
            return (0, '')

        # Combine room data into a dictionary to avoid duplicates by room number
        combined_room_data = {}
        for room in available_rooms_data + advance_rooms_data + booked_rooms_data:
            room_data = room.copy()
            room_data['room_number'] = room_data.pop(
                'number')  # Rename 'number' to 'room_number'
            if room_data['room_number'] not in combined_room_data:
                combined_room_data[room_data['room_number']] = room_data

        # Convert the dictionary back to a list and sort by room number
        all_room_booking_details = sorted(
            combined_room_data.values(), key=sort_room_number)

        return Response({
            # Code Addition by Tejasve Gupta on 13-06-2024
            # Reason - to show pop up notifications


            "success": "Room Booked Successfully",
            "room_list": room_list,
            "amenityList": amenitySerailizer.data,
            "AmenityRoomList": amenityRoomSerailizer.data,
            "PersonalDetailList": personalDetailSerailizer.data,
            "CheckinDetailList": checkinDetailSerializer.data,
            "BillingDetailList": bilingDetailsSerializer.data,
            'available_rooms': available_rooms_data,
            'AdvanceRoomList': advance_rooms_data,
            'BookedRoomList': booked_rooms_data,
            "all_room_booking_details": all_room_booking_details
        }, 200)
       

    def post(self, request, *args, **kwargs):
        room_details_data = json.loads(request.data.get('selectedRooms', '-'))
        payment_method = request.data.get('payment_method')
        number_of_persons = request.data.get('number_of_persons')
        number_of_children = request.data.get('number_of_children')
        number_of_adults = request.data.get('number_of_adults')
        arrival_date = request.data.get('arrival_date')
        arrival_time = request.data.get('arrival_time')

        transaction_id = request.data.get('transaction_id')
        payment_proof = request.FILES.get('payment_proof', None)
        person_name = request.data.get('name')
        person_phone = request.data.get('phone')
        person_address = request.data.get('address')
        person_id_card = request.data.get('id_card_no')
        person_last_name = request.data.get('last_name')
        person_id_type = request.data.get('id_card_type')
        person_email = request.data.get('email')
        person_id_photo = request.data.get('id_card_photo')
        booking_type = request.data.get('bookingType')
        person_country = request.data.get('country')
        person_state = request.data.get('state')
        person_city = request.data.get('city')
        person_zip = request.data.get('zip')
        country_id = request.data.get('country_id')
        state_id = request.data.get('state_id')
        person_gender = request.data.get('gender')
        person_dob = request.data.get('dob')
        extra_person_charges = request.data.get('extraPersonCharges')
        discount_rupees = request.data.get('discount_rupees')
        discount_percentage = request.data.get('discount_percentage')
        discount_in = request.data.get('discount_in')
        room_charges = request.data.get('room_charges')
        sub_total = request.data.get('sub_total')
        taxable_amount = request.data.get('taxable_amount')
        total = request.data.get('total')
        gst = request.data.get('gst', 0)
        gst_value = request.data.get('gst_value')
        advanced_pay_amount = request.data.get('advancePayment')
        grand_total = request.data.get('grand_total')
        due = request.data.get('due')
        personal_detail_object = request.data.get('personal_detail_object')

        person_salutations = request.data.get('salutation')
        purpose_of_visit = request.data.get('purpose_of_visit')
        arrived_from = request.data.get('arrived_from')
        destination = request.data.get('destination')
        if personal_detail_object:
            try:
                personal_detail = PersonalDetail.objects.get(
                    id=personal_detail_object)
                personal_detail.name = person_name
                personal_detail.phone = person_phone
                personal_detail.address = person_address
                personal_detail.id_card_no = person_id_card
                personal_detail.last_name = person_last_name
                personal_detail.email = person_email
                personal_detail.id_card_type = person_id_type
                if person_id_photo:
                    personal_detail.id_card_photo = person_id_photo
                personal_detail.country = person_country
                personal_detail.state = person_state
                personal_detail.city = person_city
                personal_detail.zip = person_zip

                # Added by - Akanksha 0n 11/10/2024
                # Reason - To store name title salutation
                personal_detail.salutation = person_salutations
                # Added by - Akanksha 0n 11/10/2024
                # Reason - To store name title salutation

                # Added by - Ashish Dewangan on 12-09-2024
                # Reason - To store country and state ids
                personal_detail.country_id = country_id
                personal_detail.state_id = state_id
                # End of addition by - Ashish Dewangan on 12-09-2024
                # Reason - To store country and state ids

                personal_detail.gender = person_gender
                personal_detail.dob = person_dob
                personal_detail.save()
            except PersonalDetail.DoesNotExist:
                # Create a new PersonalDetail if no record is found with the given PK
                personal_detail = PersonalDetail.objects.create(
                    name=person_name,
                    phone=person_phone,
                    address=person_address,
                    id_card_no=person_id_card,
                    last_name=person_last_name,
                    email=person_email,
                    id_card_type=person_id_type,
                    id_card_photo=person_id_photo,
                    country=person_country,
                    state=person_state,
                    city=person_city,

                    # Added by - Akanksha 0n 11/10/2024
                    # Reason - To store name title salutation
                    salutation = person_salutations,
                    # End by - Akanksha 0n 11/10/2024
                    # Reason - To store name title salutation

                    # Added by - Ashish Dewangan on 12-09-2024
                    # Reason - To store country and state ids
                    country_id=country_id,
                    state_id=state_id,
                    # End of addition by - Ashish Dewangan on 12-09-2024
                    # Reason - To store country and state ids

                    zip=person_zip,
                    gender=person_gender,
                    dob=person_dob
                )
        else:
            # Create a new PersonalDetail if no PK is provided
            personal_detail = PersonalDetail.objects.create(
                name=person_name,
                phone=person_phone,
                address=person_address,
                id_card_no=person_id_card,
                last_name=person_last_name,
                email=person_email,
                id_card_type=person_id_type,
                id_card_photo=person_id_photo,
                country=person_country,
                state=person_state,
                city=person_city,
                zip=person_zip,

                # Added by - Akanksha 0n 11/10/2024
                # Reason - To store name title salutation
                salutation = person_salutations,
                # Added by - Akanksha 0n 11/10/2024
                # Reason - To store name title salutation

                # Added by - Ashish Dewangan on 12-09-2024
                # Reason - To store country and state ids
                country_id=country_id,
                state_id=state_id,
                # End of addition by - Ashish Dewangan on 12-09-2024
                # Reason - To store country and state ids

                gender=person_gender,
                dob=person_dob
            )
        current_utc_time = timezone.now()
        kolkata_timezone = pytz.timezone("Asia/Kolkata")
        current_time_in_kolkata = current_utc_time.astimezone(kolkata_timezone)
        # End of addition by - Ashish Dewangan on 14-11-2024
        # Reason - To store created_at according to Indian timezone  

        billing_detail = BillingDetail.objects.create(
            
            # Addition by Akanksha on 23-01-2025
            # Reason: To store transaction ID and image receipt
            transaction_id=transaction_id,
            payment_proof=payment_proof,
            # End of addition by Akanksha on 23-01-2025
            # Reason: To store transaction ID and image receipt
            
            # Added by - Ashish Dewangan on 14-11-2024
            # Reason - To store created_at according to Indian timezone  
            created_at=current_time_in_kolkata,
            # End of addition by - Ashish Dewangan on 14-11-2024
            # Reason - To store created_at according to Indian timezone  

            payment_method=payment_method,
            number_of_persons=number_of_persons,
            # Addition by Om Shrivastava on 01-06-2024
            # Reason : Add the no of childrens and adults field
            number_of_children=number_of_children,
            number_of_adults=number_of_adults,
            # End of sddition by Om Shrivastava on 01-06-2024
            # Reason : Add the no of childrens and adults field
            room_charges=room_charges,
            extra_person_charges=extra_person_charges,
            sub_total=sub_total,
            discount_rupees=discount_rupees,
            # Added by - Ashish Dewangan on 01-09-2024
            # Reason - To save discount applied in rupees or percentage
            discount_in=discount_in,
            # End of addition by - Ashish Dewangan on 01-09-2024
            # Reason - To save discount applied in rupees or percentage
            discount_percentage=discount_percentage,
            taxable_amount=taxable_amount,
            gst=gst,
            gst_value=gst_value,
            total=total,
            grand_total=grand_total,
            personal_details_id=personal_detail,
            advanced_pay_amount=advanced_pay_amount,
            due=due,
            booking_type=booking_type,
            # Commented by Om Shrivastava on 13-10-2024
            # Reason : No need to save this field in checkin post method
            # is_Refundable=is_Refundable,
            # refund_amount=refund_amount,
            # End of commented by Om Shrivastava on 13-10-2024
            # Reason : No need to save this field in checkin post method
            arrival_date=arrival_date,
            arrival_time=arrival_time,
            # Addition by Om Shrivastava on 06-10-2024
            # Reason : Set the personal detail value 
            customer_name = personal_detail.name,
            customer_last_name = personal_detail.last_name,
            customer_country = personal_detail.country,
            customer_state = personal_detail.state,
            customer_city = personal_detail.city,
            customer_country_id = personal_detail.country_id,
            customer_state_id = personal_detail.state_id,
            customer_zip = personal_detail.zip,
            customer_gender = personal_detail.gender,
            customer_dob = personal_detail.dob,
            customer_email = personal_detail.email,
            customer_phone = personal_detail.phone,
            customer_id_card_type = personal_detail.id_card_type,
            customer_id_card_no = personal_detail.id_card_no,
            customer_address = personal_detail.address,
            customer_id_card_photo = personal_detail.id_card_photo,
            # End of addition by Om Shrivastava on 06-10-2024
            # Reason : Set the personal detail value
            
            # Added by - Akanksha 0n 11/10/2024
            # Reason - To set name title salutation
            customer_salutation = personal_detail.salutation,
            # End by - Akanksha 0n 11/10/2024
            # Reason - To set name title salutation


            # Added by - Ashish Dewangan on 06-10-2024
            # Reason - To store details of user who performed checkin
            user_id_at_checkin=request.user,
            # End of addition by - Ashish Dewangan on 06-10-2024
            # Reason - To store details of user who performed checkin


            # Added by - Ashish Dewangan on 21-10-2024
            # Reason - To store purpose_of_visit,arrived_from,destination in billing details
            purpose_of_visit = purpose_of_visit,
            arrived_from = arrived_from,
            destination = destination,
            # End of addition by - Ashish Dewangan on 21-10-2024
            # Reason - To store purpose_of_visit,arrived_from,destination in billing details
        )
        booked_rooms = []

        # Added by - Ashish Dewangan on 30-09-2024
        # Reason - To store room numbers in payment receipt
        room_numbers_list = ""
        # End of addition by - Ashish Dewangan on 30-09-2024
        # Reason - To store room numbers in payment receipt

        for room_data in room_details_data:
            room_number = room_data.get('room_number')

            # Added by - Ashish Dewangan on 30-09-2024
            # Reason - To store room numbers in payment receipt
            if len(room_numbers_list) > 0:
                room_numbers_list = room_numbers_list+", "+room_number
            else:
                room_numbers_list = room_numbers_list+room_number
            # End of addition by - Ashish Dewangan on 30-09-2024
            # Reason - To store room numbers in payment receipt

            #  Addition by Om Shrivastava on 31-05-2024
            #  Reason : Get the room type and price also
            room_type = room_data.get('room_type')
            # price = room_data.get('room_price')
            price = room_data.get('room_price') or room_data.get('price')

            #  End of addition by Om Shrivastava on 31-05-2024
            #  Reason : Get the room type and price also
            print(f"Fetching room detail for number: {room_number}, type: {room_type}, price: {price}")
            try:
                # Check if RoomDetail exists
                # Code Modification by Tejasve Gupta on 08-06-2024
                # Reason - Correction of code for Form Data and Booked Rooms

                room_detail = RoomDetail.objects.get(
                    number=room_number,
                    #  Addition by Om Shrivastava on 31-05-2024
                    #  Reason : Get the room type and price also
                    room_type=room_type,
                    price=price
                    #  End of addition by Om Shrivastava on 31-05-2024
                    #  Reason : Get the room type and price also
                    
                )
                # print("ROOM DETAILS:", room_detail)
                # Code Modification by Tejasve Gupta on 08-06-2024
                # Reason - Correction of code for Form Data and Booked Rooms
                
            except RoomDetail.DoesNotExist:
                return Response({"error": f"Room detail not found for room number {room_number}."},
                                status=status.HTTP_404_NOT_FOUND)
              
           

            checkin_detail = CheckinDetail.objects.create(
                arrival_date=arrival_date,
                arrival_time=arrival_time,
                # departure_date=departure_date,
                # departure_time=departure_time,
                room_id=room_detail,
                billing_id=billing_detail,
                room_price=price,
                
            )
            room_detail.is_active = False
            room_detail.save()

        guest_details_data = json.loads(request.data.get('guest_details'))

        
        guest_details = []
        for guest in guest_details_data:
            guest_id_card_photo = ""
            if 'id_card_photo' in guest:
                imgdata = base64.b64decode(str(guest['id_card_photo']))
                extension = imghdr.what(None, h=imgdata)
                guest_id_card_photo = ContentFile(
                    imgdata, name="id"+"." + extension)

            guest_details.append(
                GuestDetails(
                    guest_salutation=guest['salutation'] if 'salutation' in guest else None,
                    guest_name=guest['guest_name'],
                    guest_last_name=guest['guest_last_name'],
                    guest_id_card_type=guest['guest_id_card_type'],
                    guest_id_card_no=guest['guest_id_card_no'],
                    guest_id_card_photo=guest_id_card_photo,
                    billing_id=billing_detail,
                    person_type=guest['person_type'],
                    selectedRoom=guest.get('selectedRoom', None),
                    
                )
            )
        GuestDetails.objects.bulk_create(guest_details)

        payment_receipt = None
        if advanced_pay_amount and float(advanced_pay_amount) > 0:
            # Added by - Ashish Dewangan on 04-10-2024
            # Reason - to save user details in payment receipt
            user = request.user
            # End of addition by - Ashish Dewangan on 04-10-2024
            # Reason - to save user details in payment receipt
            payment_receipt = PaymentReceipt.objects.create(
                payment_method=payment_method,
                amount_paid=advanced_pay_amount,
                billing_id=billing_detail,
                person_name=person_name,
                total_amount=total,
                room_charges=room_charges,
                room_numbers=room_numbers_list,
                user=user,
                transaction_id=transaction_id,
                payment_proof=payment_proof,
                
            )

        # If a payment receipt was created, serialize it
        payment_receipt_data = None
        if payment_receipt:
            payment_receipt_data = PaymentReceiptSerializer(
                payment_receipt).data
            '''End of Code Addition by Tejasve Gupta on 10-08-2024
        Reason - Creation of Payment Receipt Table'''

        serializer = BookedRoomSerializer(booked_rooms, many=True)
        roomData = RoomDetail.objects.filter(is_active=True)
        from datetime import datetime, timedelta

        current_datetime = datetime.now()
        current_date = current_datetime.date()
        current_time = current_datetime.time()

        # Get the setting for vacant_info_before_hour
        setting = Setting.objects.first()
        vacant_info_before_hour = setting.vacant_info_before_hour if setting else 0
        vacant_info_threshold = current_datetime + \
            timedelta(hours=vacant_info_before_hour)

       
        booked_rooms = CheckinDetail.objects.filter(
            departure_date__isnull=True, arrival_date__lte=current_date,
            room_id__is_active=True
        )
        booked_room_ids = booked_rooms.values_list('room_id', flat=True)
        advance_rooms = CheckinDetail.objects.filter(
            departure_date__isnull=True, room_id__is_active=True
        ).exclude(room_id__in=booked_room_ids)
        # End of modification by - Ashish Dewangan on 04-09-2024
        # Reason - To filter out inactive rooms
        advance_room_ids = advance_rooms.values_list('room_id', flat=True)

        # Update BookedRoomList: Rooms without a departure date and not in AdvanceRoomList

        # Update available_rooms: Rooms not in BookedRoomList
        # Modified by - Ashish Dewangan on 04-09-2024
        # Reason - To filter out inactive rooms
        # available_rooms = RoomDetail.objects.exclude(id__in=booked_room_ids)
        available_rooms = RoomDetail.objects.filter(
            is_active=True).exclude(id__in=booked_room_ids)
        # End of modification by - Ashish Dewangan on 04-09-2024
        # Reason - To filter out inactive rooms

        # Preparing the room_list with statuses
        room_list = []
        for room_data in roomData:
            get_room_data = {
                "id": room_data.id,
                "room_number": room_data.number,
                "room_type": room_data.room_type,
                "room_price": room_data.price,
                'variety': room_data.variety,
                "status": "available"  # default status
            }

            # Update the room status
            if room_data.id in booked_room_ids:
                get_room_data["status"] = "booked"
            elif room_data.id in advance_room_ids:
                get_room_data["status"] = "advance booking"
            elif CheckinDetail.objects.filter(
                room_id=room_data.id,
                departure_date=current_date,
                departure_time__lte=vacant_info_threshold.time()
            ).exclude(departure_date=current_date, departure_time__lte=current_time).exists():
                get_room_data["status"] = "vacant"

            # findAmenity = AmenityRoom.objects.filter(room_id=room_data.id)
            # get_room_data["amenity_list"] = findAmenity.values(
            #     "id", "amenity_id__name")
            # room_list.append(get_room_data)

        def format_timing(arrival_date, arrival_time):
            if arrival_date and arrival_time:
                # Format the date as "dd-mm-yyyy"
                formatted_date = arrival_date.strftime('%d-%m-%Y')
                # Format the time as "hh.mmpm/am"
                formatted_time = arrival_time.strftime('%I.%M%p').lower()
                return f"{formatted_date}, {formatted_time}"
            return None

        # Serialize available rooms with their check-in details
        available_rooms_data = []
        for room in available_rooms:
            last_checkin = CheckinDetail.objects.filter(
                room_id=room.id).order_by('-arrival_date').first()
            room_data = {
                'id': room.id,
                'room_type': room.room_type,
                'price': room.price,
                'variety': room.variety,
                'number': room.number,
                'arrival_date': last_checkin.arrival_date if last_checkin else None,
                'arrival_time': last_checkin.arrival_time if last_checkin else None,
                'departure_date': last_checkin.departure_date if last_checkin else None,
                'departure_time': last_checkin.departure_time if last_checkin else None,
                'status': 'Free',
                'timing': format_timing(last_checkin.arrival_date, last_checkin.arrival_time) if last_checkin else None
            }

            if room.id in advance_room_ids:
                room_data['status'] = 'Advance'
            available_rooms_data.append(room_data)
           
        advance_rooms_data = []
        for advance in advance_rooms:
            room_data = {
                'id': advance.room_id.id,
                'room_type': advance.room_id.room_type,
                'price': advance.room_id.price,
                'variety': advance.room_id.variety,
                'number': advance.room_id.number,
                'arrival_date': advance.arrival_date,
                'arrival_time': advance.arrival_time,
                'departure_date': advance.departure_date,
                'departure_time': advance.departure_time,
                'status': 'Advance',
                'timing': format_timing(advance.arrival_date, advance.arrival_time)

            }
            advance_rooms_data.append(room_data)

        booked_rooms_data = []
        for booked in booked_rooms:
            room_data = {
                'id': booked.room_id.id,
                'room_type': booked.room_id.room_type,
                'price': booked.room_id.price,
                'variety': booked.room_id.variety,
                'number': booked.room_id.number,
                'arrival_date': booked.arrival_date,
                'arrival_time': booked.arrival_time,
                'departure_date': booked.departure_date,
                'departure_time': booked.departure_time,
                'status': 'Booked',
                'timing': format_timing(booked.arrival_date, booked.arrival_time)
            }
            booked_rooms_data.append(room_data)

        def sort_room_number(room):
            # Extract numeric and alphabetic parts
            match = re.match(r"(\d+)([a-zA-Z]*)", room['room_number'])
            if match:
                number = int(match.group(1))
                alpha = match.group(2)
                return (number, alpha)
            return (0, '')

        # Combine room data into a dictionary to avoid duplicates by room number
        combined_room_data = {}
        for room in available_rooms_data + advance_rooms_data + booked_rooms_data:
            room_data = room.copy()
            room_data['room_number'] = room_data.pop(
                'number')  # Rename 'number' to 'room_number'
            if room_data['room_number'] not in combined_room_data:
                combined_room_data[room_data['room_number']] = room_data

        all_room_booking_details = sorted(
            combined_room_data.values(), key=sort_room_number)
        # End of addition by - Ashish Dewangan on 01-09-2024
        # Reason - To return room status after checkin

        return Response({"data": serializer.data,
                         "success": "Check-in details saved successfully",
                         "billing_id": billing_detail.id,
                         'payment_receipt_data': payment_receipt_data,
                         # Added by - Ashish Dewangan on 01-09-2024
                         # Reason - To return room status after checkin
                         "all_room_booking_details": all_room_booking_details,
                         # End of addition by - Ashish Dewangan on 01-09-2024
                         # Reason - To return room status after checkin

                        #  'person_name': person_name,
                         #  'room_id':room_detail,
                         #  "amount_paid":PaymentReceipt.amount_paid,
                         #  "payment_method":PaymentReceipt.payment_method
                         },
                        status=status.HTTP_201_CREATED)

    # End of modification and addition by Om Shrivastava on 03-06-2024
    # Reason : Apply calculation for total amount

    # End of addition by - Om Shrivastava on 27-05-2024
    # Reason - To POST the Checkin details for differents table

# Addition by Om Shrivastava on 03-06-2024
# Reason : Post the checkout form


class CheckoutView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    # Code Modification by Tejasve Gupta on 17-07-2024
    # Reason - Changes in Checkin Details View
    # Code Modification by Tejasve Gupta on 15-08-2024
    # Reason - update checkout date in checkin details on checkout post
    def post(self, request, tenant , format=None):
        data = request.data
        billing_id = data.get('billing_detail_id')

        # Added by - Ashish Dewangan on 18-09-2024
        # Reason - To store gstin and tin number to billing details at the time of checkout
        setting_object = Setting.objects.first()
        gstin = ""
        tin = ""
        if setting_object:
            gstin = setting_object.gstin
            tin = setting_object.tin
        # End of addition by - Ashish Dewangan on 18-09-2024
        # Reason - To store gstin and tin number to billing details at the time of checkout
        
        

        checkout_data = {
            'billing_detail_id': billing_id,
            'room_charges': data.get('room_charges'),
            'new_room_charges': data.get('new_room_charges'),
            # 'discount_in': data.get('discount_in'),
            'discount_rupees': data.get('discount_rupees'),
            'extra_person_charges': data.get('extra_person_charges'),
            'taxable_amount': data.get('taxable_amount'),
            'gst_value': data.get('gst_value'),
            'sub_total': data.get('sub_total'),
            'miscellaneous_charges': data.get('miscellaneous_charges'),
            'details': data.get('details'),
            'extraDetails' : data.get('extraDetails'),
            'extra_discount': data.get('extra_discount'),
            'grand_total': data.get('grand_total'),
            'departure_date': data.get('departure_date'),
            'departure_time': data.get('departure_time'),
            # Added by - Ashish Dewangan on 18-09-2024
            # Reason - To store gstin and tin number to billing details at the time of checkout
            'gstin': gstin,
            'tin': tin,
            # Enf of addition by - Ashish Dewangan on 18-09-2024
            # Reason - To store gstin and tin number to billing details at the time of checkout

        }

        # Serialize and save the checkout details
        # serializer = CheckoutDetailsSerializer(data=checkout_data)
        # if serializer.is_valid():
        #     serializer.save()
        try:
            billing_object = BillingDetail.objects.get(id=billing_id)
            
            # Fetch all payments made for this billing ID
            total_paid = PaymentReceipt.objects.filter(billing_id=billing_object).aggregate(Sum('amount_paid'))['amount_paid__sum'] or 0

            grand_total = float(data.get('grand_total', 0))
            
            # Determine if partial payment is confirmed
            is_partial_payment_confirmed = total_paid < grand_total
            # sum=0
            # prs = PaymentReceipt.objects.filter(billing_id=billing_object)
            # for pr in prs:
            #     sum=sum+pr.amount_paid
            # if data.get('grand_total')>sum:
            #     pro = PaymentReceipt.objects.create()
            # Update fields with data from the request
            billing_object.departure_date = data.get('departure_date')
            billing_object.departure_time = data.get('departure_time')
            billing_object.room_charges = data.get('room_charges')
            billing_object.new_room_charges = data.get('new_room_charges')
            billing_object.additional_charges = data.get('additional_charges')
            billing_object.additional_reason = data.get('additional_reason')
            # billing_object.discount_in = data.get('discount_in')
            billing_object.discount_rupees = data.get('discount_rupees')
            billing_object.extra_person_charges = data.get(
                'extra_person_charges')
            billing_object.taxable_amount = data.get('taxable_amount')
            billing_object.gst_value = data.get('gst_value')
            billing_object.total = data.get('total')
            billing_object.sub_total = data.get('sub_total')
            billing_object.miscellaneous_charges = data.get(
                'miscellaneous_charges')
            billing_object.details = data.get('details')
            billing_object.extraDetails = data.get('extraDetails')
            billing_object.extra_discount = data.get('extra_discount')
            billing_object.grand_total = data.get('grand_total')
            # Added by - Ashish Dewangan on 18-09-2024
            # Reason - To store gstin and tin number to billing details at the time of checkout
            billing_object.gstin = gstin
            billing_object.tin = tin
            billing_object.is_partial_payment_confirmed = is_partial_payment_confirmed
            # Added by - Ashish Dewangan on 06-10-2024
            # Reason - To store details of user who performed checkin
            billing_object.user_id_at_checkout = request.user
            # End of addition by - Ashish Dewangan on 06-10-2024
            # Reason - To store details of user who performed checkin

            # End of addition by - Ashish Dewangan on 18-09-2024
            # Reason - To store gstin and tin number to billing details at the time of checkout
        except BillingDetail.DoesNotExist:
            return Response({"error": "Billing detail not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = BillingDetailSerializer(
            billing_object, data=checkout_data, partial=True)
        if serializer.is_valid():
            serializer.save()

            # Update the departure_date and departure_time in the CheckinDetail
            try:
                checkin_details = CheckinDetail.objects.filter(
                    billing_id=billing_id)

                for checkin_detail in checkin_details:
                    checkin_detail.departure_date = data.get('departure_date')
                    checkin_detail.departure_time = data.get('departure_time')
                    checkin_detail.save()
                    
                    # Set the room to active after checkout
                    room = checkin_detail.room_id  # Assuming room_id is a ForeignKey to RoomDetail
                    room.is_active = True
                    room.save()

                return Response({"success": "Checkout details saved and departure date updated successfully",
                                 "is_partial_payment_confirmed": is_partial_payment_confirmed
                                }, status=status.HTTP_200_OK)
            except CheckinDetail.DoesNotExist:
                return Response({"error": "Checkin detail not found for the given billing ID"}, status=status.HTTP_404_NOT_FOUND)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    # End of Code Modification by Tejasve Gupta on 15-08-2024
    # Reason - update checkout date in checkin details on checkout post

    def get(self, request, tenant):
        try:
            billing_id = request.query_params.get("billing_id")
            if not billing_id:
                return Response({"error": "Billing ID is required"}, status=status.HTTP_400_BAD_REQUEST)

            billing_exists = BillingDetail.objects.filter(
                id=billing_id).exists()
            if billing_exists:
                return Response({"status": "PAID"}, status=status.HTTP_200_OK)
            else:
                return Response({"status": "UNPAID"}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        # End of Code Modification by Tejasve Gupta on 17-07-2024
    # Reason - Changes in Checkin Details View
# End of addition by Om Shrivastava on 03-06-2024
# Reason : Post the checkout form


# Code Addition by Tejasve Gupta on 09-06-2024
# Reason - Creation of API for Pagination and Filteration
# from datetime import datetime


class CheckinListPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'pageSize'
    max_page_size = 100


class CheckinListAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    '''def get(self, request):
        # Get query parameters
        page_number = int(request.query_params.get("pageNumber", 1))
        start_date = request.query_params.get(
            "startDate", datetime.now().date().strftime("%Y-%m-%d"))
        end_date = request.query_params.get("endDate")
        sort_field = request.query_params.get("sortField", "arrival_date")
        sort_order = request.query_params.get("sortOrder", "asc")

        # Set default start date to the current date if not provided
        if not start_date:
            start_date = datetime.now().date().strftime("%Y-%m-%d")

        checkin_objects = CheckinDetail.objects.all()
        # noofrec=checkin_objects.count()
        # Date filtering
        # try:
        #     if start_date:
        #         start_date_obj = datetime.strptime(
        #             start_date, "%Y-%m-%d").date()
        #         checkin_objects = checkin_objects.filter(
        #             arrival_date__gte=start_date_obj)

        #     if end_date:
        #         end_date_obj = datetime.strptime(end_date, "%Y-%m-%d").date()
        #         checkin_objects = checkin_objects.filter(
        #             departure_date__lte=end_date_obj)

        #         if start_date_obj and end_date_obj and start_date_obj > end_date_obj:
        #             raise ValidationError(
        #                 "End date should be after start date.")
        # except ValidationError as e:
        #     return Response({"message": str(e)}, status=400)

        # Date filtering
        try:
            start_date_obj = parse_date(start_date)
            if start_date_obj:
                checkin_objects = checkin_objects.filter(
                    arrival_date__gte=start_date_obj)

            if end_date:
                end_date_obj = parse_date(end_date)
                if end_date_obj:
                    checkin_objects = checkin_objects.filter(
                        arrival_date__lte=end_date_obj)

                if start_date_obj and end_date_obj and start_date_obj > end_date_obj:
                    raise ValidationError(
                        "End date should be after start date.")
        except ValidationError as e:
            return Response({"message": str(e)}, status=400)

        # Sorting
        if sort_order == "desc":
            sort_field = f"-{sort_field}"
        else:
            sort_field = f"{sort_field}"
        checkin_objects = checkin_objects.order_by(sort_field)

        # Pagination
        paginator = Paginator(checkin_objects, 10)
        paginated_checkin_objects = paginator.page(page_number).object_list
        # print("Page Number------->>",page_number)
        # print("Sort Order--------->>>>", sort_field)
        # for i in paginated_checkin_objects:
        #     print("paginated_checkin_objects", i.arrival_date)
        # print("sorf field------>>>>", sort_field)

        bookings = set()
        for i in paginated_checkin_objects:
            bookings.add(i.billing_id.id)

        filtered_checkins = []
        billing_objects = []
        for i in bookings:
            billing_objects.append(BillingDetail.objects.get(id=i))

        for billing_object in billing_objects:
            temp_checkin_objects = CheckinDetail.objects.filter(
                billing_id=billing_object.id)
            checkin_details = {}
            rooms = []
            period = []
            for temp_checkin_object in temp_checkin_objects:
                room_detail = {
                    "number": temp_checkin_object.room_id.number,
                    "type": temp_checkin_object.room_id.room_type,
                    "variety": temp_checkin_object.room_id.variety,
                }
                rooms.append(room_detail)
                checkin_date_time = {
                    "arrival_time": temp_checkin_object.arrival_time,
                    "arrival_date": temp_checkin_object.arrival_date,
                }
                period.append(checkin_date_time)

            personal_details_object = billing_object.personal_details_id
            personal_details = {
                "name": personal_details_object.name,
                "last_name": personal_details_object.last_name,
                "email": personal_details_object.email,
                "phone": personal_details_object.phone,
                "id_card_type": personal_details_object.id_card_type,
                "id_card_no": personal_details_object.id_card_no,
                "address": personal_details_object.address,
                # Code Addition by Tejasve Gupta on 18-07-2024
                # Reason - To add Country, state, city dropdown, zip code, gender and DOB
                "country": personal_details_object.country,
                "state": personal_details_object.state,
                "city": personal_details_object.city,
                "zip": personal_details_object.zip,
                "dob": personal_details_object.dob,
                "gender": personal_details_object.gender,
                # End of Code Addition by Tejasve Gupta on 18-07-2024
                # Reason - To add Country, state, city dropdown, zip code, gender and DOB
                "created_at": personal_details_object.created_at.strftime('%d-%m-%y'),
                "updated_at": personal_details_object.updated_at,
                # Add more fields as required
            }

            checkin_details["rooms"] = rooms
            checkin_details["checkin_period"] = period
            checkin_details["billing_id"] = billing_object.id
            checkin_details["total"] = billing_object.total
            checkin_details["personal_details"] = personal_details

            filtered_checkins.append(checkin_details)

        total_checkins = len(bookings)
        starting_index = (page_number-1) * 10
        ending_index = starting_index + 10
        # ==============================
        filtered_checkins = filtered_checkins[starting_index:ending_index]
        # print("++++++FILTERED+++++++", filtered_checkins)
        return Response({
            "message": "successful",
            "filtered_checkins": filtered_checkins,
            "total_checkins": total_checkins,
        }, status=200)'''

    def get(self, request, tenant):
        # Get query parameters
        from datetime import datetime
        page_number = int(request.query_params.get("pageNumber", 1))
        start_date = request.query_params.get(
            "startDate", datetime.now().date().strftime("%Y-%m-%d"))
        end_date = request.query_params.get("endDate")
        sort_field = request.query_params.get("sortField", "arrival_date")
        sort_order = request.query_params.get("sortOrder", "asc")

        # Set default start date to the current date if not provided
        if not start_date:
            start_date = datetime.now().date().strftime("%Y-%m-%d")

        # Modified by - Ashish Dewangan on 18-09-2024
        # Reasson - To filter out advance bookings
        # billings = BillingDetail.objects.filter(departure_date=None)
        billings = BillingDetail.objects.filter(
            departure_date=None, booking_type="Current")
        # End of modification by - Ashish Dewangan on 18-09-2024
        # Reasson - To filter out advance bookings

        # noofrec=checkin_objects.count()
        # Date filtering
        # try:
        #     if start_date:
        #         start_date_obj = datetime.strptime(
        #             start_date, "%Y-%m-%d").date()
        #         checkin_objects = checkin_objects.filter(
        #             arrival_date__gte=start_date_obj)

        #     if end_date:
        #         end_date_obj = datetime.strptime(end_date, "%Y-%m-%d").date()
        #         checkin_objects = checkin_objects.filter(
        #             departure_date__lte=end_date_obj)

        #         if start_date_obj and end_date_obj and start_date_obj > end_date_obj:
        #             raise ValidationError(
        #                 "End date should be after start date.")
        # except ValidationError as e:
        #     return Response({"message": str(e)}, status=400)

        # Date filtering
        try:
            start_date_obj = parse_date(start_date)
            if start_date_obj:
                billings = billings.filter(
                    arrival_date__gte=start_date_obj)

            if end_date:
                end_date_obj = parse_date(end_date)
                if end_date_obj:
                    billings = billings.filter(
                        arrival_date__lte=end_date_obj)

                if start_date_obj and end_date_obj and start_date_obj > end_date_obj:
                    raise ValidationError(
                        "End date should be after start date.")
        except ValidationError as e:
            return Response({"message": str(e)}, status=400)
        
         # Debugging: Print the initial queryset count
        print(f"Initial queryset count: {billings.count()}")

        # Mapping sortField to actual fields in the BillingDetail model
        # Sorting by name
        if sort_field == "name":
            sort_field = "customer_name"
        if sort_field == "idcardType":
            sort_field = "customer_id_card_type"
        if sort_field == "idcardNo":
            sort_field = "customer_id_card_no"
        if sort_order == "desc":
            sort_field = f"-{sort_field}"
        
        billings = billings.order_by(sort_field)

        # Debugging: Print the sort field before applying sorting
        print(f"Sort field: {sort_field}, Sort order: {sort_order}")

        # Sorting
        # if sort_order == "desc":
        #     sort_field = f"-{sort_field}"
        # else:
        #     sort_field = f"{sort_field}"
        # billings = billings.order_by(sort_field)

         # Debugging: Print the sorted results
        sorted_billings = list(billings)  # Convert to list to view sorted results
        print(f"Sorted billings: {[getattr(b, 'customer_name') for b in sorted_billings]}")


        # Handle special case for sorting by name
        # if sort_field == "name":
        #     billings = billings.order_by("customer_name")  # Adjust according to your field
        # elif sort_field == "-name":
        #     billings = billings.order_by("-customer_name")  # Adjust according to your field
        # else:
        #     billings = billings.order_by(sort_field)

        # Addition by Om Shrivastava on 07-10-2024
        # Reason : Set the all checkin data
        total_checkins = billings.count()
        # Addition by Om Shrivastava on 07-10-2024
        # Reason : Set the all checkin data

        # Pagination
        paginator = Paginator(billings, 10)
        paginated_billing_objects = paginator.page(page_number).object_list
        # print("Page Number------->>",page_number)
        # print("Sort Order--------->>>>", sort_field)
        # for i in paginated_checkin_objects:
        #     print("paginated_checkin_objects", i.arrival_date)
        # print("sorf field------>>>>", sort_field)

        # bookings = set()
        # for i in paginated_checkin_objects:
        #     bookings.add(i.billing_id.id)

        filtered_checkins = []
        # billing_objects = []
        # for i in bookings:
        # billing_objects.append(BillingDetail.objects.get(id=i))

        for billing_object in paginated_billing_objects:
            temp_checkin_objects = CheckinDetail.objects.filter(
                billing_id=billing_object.id)
            checkin_details = {}
            rooms = []
            period = []
            for temp_checkin_object in temp_checkin_objects:
                room_detail = {
                    "number": temp_checkin_object.room_id.number,
                    "type": temp_checkin_object.room_id.room_type,
                    "variety": temp_checkin_object.room_id.variety,
                }
                rooms.append(room_detail)
                checkin_date_time = {
                    "arrival_time": temp_checkin_object.arrival_time,
                    "arrival_date": temp_checkin_object.arrival_date,
                }
                period.append(checkin_date_time)

            personal_details_object = billing_object.personal_details_id
            personal_details = {
                "name": personal_details_object.name,
                # Added by - Akanksha 0n 11/10/2024
                # Reason - To add name title salutation
                "salutation": personal_details_object.salutation,
                # End by - Akanksha 0n 11/10/2024
                # Reason - To add name title salutation
                "last_name": personal_details_object.last_name,
                "email": personal_details_object.email,
                "phone": personal_details_object.phone,
                "id_card_type": personal_details_object.id_card_type,
                "id_card_no": personal_details_object.id_card_no,
                "address": personal_details_object.address,
                # Code Addition by Tejasve Gupta on 18-07-2024
                # Reason - To add Country, state, city dropdown, zip code, gender and DOB
                "country": personal_details_object.country,
                "state": personal_details_object.state,
                "city": personal_details_object.city,
                "zip": personal_details_object.zip,
                "dob": personal_details_object.dob,
                "gender": personal_details_object.gender,
                # End of Code Addition by Tejasve Gupta on 18-07-2024
                # Reason - To add Country, state, city dropdown, zip code, gender and DOB
                "created_at": personal_details_object.created_at.strftime('%d-%m-%y'),
                "updated_at": personal_details_object.updated_at,
                # Add more fields as required
            }

            # Addition by Om Shrivastava on 07-10-2024
            # Reason : Update the all keys
            personal_details.update({
                "name": billing_object.customer_name,
                "last_name": billing_object.customer_last_name,
                "email": billing_object.customer_email,
                "phone": billing_object.customer_phone,
                "id_card_type": billing_object.customer_id_card_type,
                "id_card_no": billing_object.customer_id_card_no,
                "address": billing_object.customer_address,
                "country": billing_object.customer_country,
                "state": billing_object.customer_state,
                "city": billing_object.customer_city,
                "zip": billing_object.customer_zip,
                "dob": billing_object.customer_dob,
                "gender": billing_object.customer_gender,
            })
            # End of addition by Om Shrivastava on 07-10-2024
            # Reason : Update the all keys
            
            # Addition of transaction_id and payment_proof with safety check
            # Within the loop for each billing object
            # if temp_checkin_objects.exists():
            #     latest_checkin = temp_checkin_objects.latest('created_at')
            #     transaction_id = latest_checkin.transaction_id or "Not Available"
            #     payment_proof = latest_checkin.payment_proof.url if latest_checkin.payment_proof else "No Proof Uploaded"
            # else:
            #     # Handle missing data gracefully
            #     transaction_id = "No Transaction Found"
            #     payment_proof = "No Proof Uploaded"
                
            checkin_details["rooms"] = rooms
            checkin_details["checkin_period"] = period
            checkin_details["billing_id"] = billing_object.id
            checkin_details["booking_type"] = billing_object.booking_type
            checkin_details["new_room_charges"] = billing_object.new_room_charges
            checkin_details["room_charges"] = billing_object.room_charges
            checkin_details["personal_details"] = personal_details
            checkin_details["user_id_at_checkin"] = billing_object.user_id_at_checkin.email
            
            # Include transaction_id and payment_proof in the response
            # checkin_details["transaction_id"] = transaction_id
            # checkin_details["payment_proof"] = payment_proof
    
            # Added by - Ashish Dewangan on 14-11-2024
            # Reason - To formate date time before returning it in the response
            local_dt = timezone.localtime(billing_object.created_at, pytz.timezone('Asia/Kolkata'))
            checkin_details["created_at"]=  local_dt.strftime('%d-%m-%Y %I:%M %p')
            # End of addition by - Ashish Dewangan on 14-11-2024
            # Reason - To formate date time before returning it in the response

            filtered_checkins.append(checkin_details)
        # Commented by Om Shrivastava on 07-10-2024
        # Reason : No need to use this code 
        # total_checkins = len(paginated_billing_objects)
        # starting_index = (page_number-1) * 10
        # ending_index = starting_index + 10
        # # ==============================
        # filtered_checkins = filtered_checkins[starting_index:ending_index]
        # print("++++++FILTERED+++++++", filtered_checkins)
        # End of commented by Om Shrivastava on 07-10-2024
        # Reason : No need to use this code 
        return Response({
            "message": "successful",
            "filtered_checkins": filtered_checkins,
            "total_checkins": total_checkins,
        }, status=200)

        # Code Modification by Tejasve Gupta on 10-06-2024
        # Reason - Recreated Class for checkin list


# End of Code Addition by Tejasve Gupta on 09-06-2024
# Reason - Creation of Api for Pagination and Filteration

# Code Addition by Tejasve Gupta on 20-06-2024
# Reason - Addition of Expense Module
class ExpenseDetailsListAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, tenant):
        # Modification and addition by Om Shrivastava on 22-08-2024
        # Reason : Enhance theget  api
        # # print(f"User: {request.user}")
        # # u=User.objects.first()
        # # u.is_superuser:
        # if request.user.is_superuser:
        #     expenses = ExpenseDetails.objects.all()
        #     # print("-----------SUPER-USER---------------")
        # else:
        #     # Non-superuser can only access their own expenses
        #     # print("-----------NON SUPER-USER---------------")
        #     expenses = ExpenseDetails.objects.filter(user=request.user)
        # # expenses = ExpenseDetails.objects.filter(user=request.user)
        # # print(f"+++++++++Expenses Queryset+++++++++++++++++: {expenses}")
        # serializer = ExpenseDetailsSerializer(expenses, many=True)
        # # print(f"=============Serialized Data==================: {
        # #       serializer.data}")
        # return Response(serializer.data)
        # Modified by - Ashish Dewangan on 02-09-2024
        # Reason - To return list based on superuser condition
        # expenseListData = ExpenseDetails.objects.all().order_by("-id")
        # try:
        #     serializer = ExpenseDetailsSerializer(
        #         expenseListData, many=True
        #     )
        #     return Response(
        #         {
        #             "expenseList": (
        #                 serializer.data
        #             ),
        #         },
        #         status=200,
        #     )
        # except Exception as e:
        #     return Response({'error': "Unexpected error occurred"}, status=500)

        # Added by - Ashish Dewangan on 11-10-2024
        # Reason - To get value of date filter
        filter_date = request.GET.get('date')  # Returns 'value1'
        # End of addition by - Ashish Dewangan on 11-10-2024
        # Reason - To get value of date filter
        
        if request.user.is_superuser:
            # Modification and addition by Om Shrivastava on 11-10-2024
            # Reason : Getting the details in reverse order 
            # expenses = ExpenseDetails.objects.all()
            
            # Modified by - Ashish Dewangan on 11-10-2024
            # Reason - To filter the expenses according to date
            # expenses = ExpenseDetails.objects.all().order_by("-id")
            if filter_date:
                expenses = ExpenseDetails.objects.filter(
                        date=filter_date).order_by("-id")
            else:        
                expenses = ExpenseDetails.objects.all().order_by("-id")
            # End of modification by - Ashish Dewangan on 11-10-2024
            # Reason - To filter the expenses according to date
            
            # Ebd of modification and addition by Om Shrivastava on 11-10-2024
            # Reason : Getting the details in reverse order 

        else:
            # Modification and addition by Om Shrivastava on 11-10-2024
            # Reason : Getting the details in reverse order
            # expenses = ExpenseDetails.objects.filter(user=request.user)
            # expenses = ExpenseDetails.objects.filter(user=request.user).order_by("-id")

            # Modified by - Ashish Dewangan on 11-10-2024
            # Reason - To filter the expenses according to date
            if filter_date:
                expenses = ExpenseDetails.objects.filter(
                    user=request.user , date=filter_date).order_by("-id")        
            else:
                expenses = ExpenseDetails.objects.filter(user=request.user).order_by("-id")        
            # End of modification by - Ashish Dewangan on 11-10-2024
            # Reason - To filter the expenses according to date    
                    
            # End of modification and addition by Om Shrivastava on 11-10-2024
            # Reason : Getting the details in reverse order

        serializer = ExpenseDetailsSerializer(expenses, many=True)
        return Response(serializer.data)
        # End of modification by - Ashish Dewangan on 02-09-2024
        # Reason - To return list based on superuser condition

        # End of modification and addition by Om Shrivastava on 22-08-2024
        # Reason : Enhance theget  api

    # def post(self, request):
    #     # Commented by Om Shrivastava on 21-08-2024
    #     # Reason : Remove this field
    #     user = User.objects.get(email=request.data["user"])
    #     expense_data = {
    #         "amount": request.data["amount"],
    #         "date": request.data["date"],
    #         "time": request.data["time"],
    #         "paid_to": request.data["paid_to"],
    #         "paid_by": request.data["paid_by"],
    #         "expense_type": request.data["expense_type"],
    #         # Modification by Om Shrivastava on 21-08-2024
    #         # Reason : Add the quantity field and also remove the user field
    #         "name": request.data["name"],
    #         "quantity": request.data["quantity"],
    #         "payment_type": request.data["payment_type"],
    #         "description": request.data["description"],
    #         "user": user.id,
    #         # End of modification by Om Shrivastava on 21-08-2024
    #         # Reason : Add the quantity field and also remove the user field
    #     }
    #     serializer = ExpenseDetailsSerializer(data=expense_data)
    #     if serializer.is_valid():
    #         serializer.save()
    #         return Response(serializer.data, status=status.HTTP_201_CREATED)
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, tenant):
        try:
            # Start an atomic transaction so both saves succeed or fail together
            with transaction.atomic():
                # Get user from email
                user = User.objects.get(email=request.data["user"])

                # ---------------------- ExpenseDetails Part --------------------------
                # Commented by Om Shrivastava on 21-08-2024
                # Reason : Remove this field
                expense_data = {
                    "amount": request.data["amount"],
                    "date": request.data["date"],
                    "time": request.data["time"],
                    "paid_to": request.data["paid_to"],
                    "paid_by": request.data["paid_by"],
                    "expense_type": request.data["expense_type"],
                    # Modification by Om Shrivastava on 21-08-2024
                    # Reason : Add the quantity field and also remove the user field
                    "name": request.data["name"],
                    "quantity": request.data["quantity"],
                    "payment_type": request.data["payment_type"],
                    "description": request.data["description"],
                    "user": user.id,
                    # End of modification by Om Shrivastava on 21-08-2024
                }

                expense_serializer = ExpenseDetailsSerializer(data=expense_data)

                if not expense_serializer.is_valid():
                    return Response(expense_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

                expense_serializer.save()

                # ---------------------- BalanceSheet Part ---------------------------
                balance_data = {
                    "total_amount": request.data.get("total_amount"),
                    "amount_received": request.data.get("amount"),
                    "mode": request.data.get("payment_type"),
                    "given_by": request.data.get("paid_to"),
                    "date": request.data.get("date"),
                    "time": request.data.get("time"),
                    "purpose": request.data.get("description"),
                    "admin_remark": request.data.get("admin_remark"),
                    "sender": "giver",
                    "expense_type": request.data.get("expense_type"),
                    "expense_name": request.data.get("name"),  # mapped from request.data["name"]
                    "expense_quantity": request.data.get("quantity"),
                }

                balance_serializer = BalanceSheetSerializer(data=balance_data)

                if not balance_serializer.is_valid():
                    return Response(balance_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

                balance_serializer.save(user=user)

                return Response({
                    "expense": expense_serializer.data,
                    "balance": balance_serializer.data
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # Addition by Om Shrivastava on 22-08-2022
    # Reason : Create put and delete method
    def put(self, request, id, tenant):
        try:
            expense = ExpenseDetails.objects.get(id=id)
        except ExpenseDetails.DoesNotExist:
            return Response({'error': 'Expense not found'}, status=status.HTTP_404_NOT_FOUND)

            # Modified by - Ashish Dewangan on 02-09-2024
            # Reason - To update expense details
            # serializer = ExpenseDetailsSerializer(
        #    expense, data=request.data, partial=True)
        # user = User.objects.get(email=request.data["user"])
        expense_data = {
            "amount": request.data["amount"],
            "date": request.data["date"],
            "time": request.data["time"],
            "paid_to": request.data["paid_to"],
            "paid_by": request.data["paid_by"],
            "expense_type": request.data["expense_type"],
            "name": request.data["name"],
            "quantity": request.data["quantity"],
            "payment_type": request.data["payment_type"],
            "description": request.data["description"],
            # Commented by - Ashish Dewangan on 03-10-2024
            # Reason - it was updating the created by column's value to "admin" if admin made the changes
            # "user": user.id,
            # End of comment by - Ashish Dewangan on 03-10-2024
            # Reason - it was updating the created by column's value to "admin" if admin made the changes

            # Added by - Ashish Dewangan on 03-10-2024
            # Reason - To store admin remark in expense table
            "admin_remark": request.data["admin_remark"],
            # End of addition by - Ashish Dewangan on 03-10-2024
            # Reason - To store admin remark in expense table
        }

        serializer = ExpenseDetailsSerializer(
            expense, data=expense_data, partial=True)
        # End of modification by - Ashish Dewangan on 02-09-2024
        # Reason - To update expense details
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id, tenant):
        try:
            expense = ExpenseDetails.objects.get(id=id)
        except ExpenseDetails.DoesNotExist:
            return Response({'error': 'Expense not found'}, status=status.HTTP_404_NOT_FOUND)

        expense.delete()
        return Response({'message': 'Expense deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    # End of addition by Om Shrivastava on 22-08-2022
    # Reason : Create put and delete method

# End of Code Addition by Tejasve Gupta on 20-06-2024.
# Reason - Addition of Expense Module.


# Code Addition by Tejasve Gupta on 05-07-2024
# Reason - New Api creation for Extending checkout time

class ExtendCheckoutAPIview(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            departure_date = request.data.get('departure_date')
            departure_time = request.data.get('departure_time')
            room_details_data = json.loads(request.data.get('selectedRooms', '-'))
            billing_id = request.data.get('billing_id')
            arrival_date = request.data.get('arrival_date')
            arrival_time = request.data.get('arrival_time')

            if not all([departure_date, departure_time, room_details_data, billing_id]):
                return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

            new_entries = []
            for room_id in room_details_data:
                try:
                    room = RoomDetail.objects.get(number=room_id)
                except RoomDetail.DoesNotExist:
                    return Response({"error": f"Room with ID {room_id} not found"}, status=status.HTTP_404_NOT_FOUND)

                try:
                    billing = BillingDetail.objects.get(id=billing_id)
                except BillingDetail.DoesNotExist:
                    return Response({"error": f"Billing with ID {billing_id} not found"}, status=status.HTTP_404_NOT_FOUND)

                new_checkin = CheckinDetail(
                    room_id=room,
                    billing_id=billing,
                    arrival_date=arrival_date,
                    arrival_time=arrival_time,
                    departure_date=departure_date,
                    departure_time=departure_time,
                )
                new_entries.append(new_checkin)

            CheckinDetail.objects.bulk_create(new_entries)

            serializer = CheckinDetailSerializer(new_entries, many=True)

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except json.JSONDecodeError:
            return Response({"error": "Invalid JSON in selectedRooms"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# End of Code Addition by Tejasve Gupta on 05-07-2024
# Reason - New Api creation for Extending checkout time


class ParticularCheckinDetailsAPIview(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, tenant):
        billing_id = request.query_params.get("billing_id")
        try:
            billing_details = BillingDetail.objects.get(id=billing_id)
        except BillingDetail.DoesNotExist:
            return Response({"error": "BillingDetail not found."}, status=status.HTTP_404_NOT_FOUND)

        billing_details_serializer = BillingDetailSerializer(billing_details)

        checkin_details = CheckinDetail.objects.filter(
            billing_id=billing_details.id)
        checkin_details_serializer = CheckinDetailSerializer(
            checkin_details, many=True)
        # Commented by Akanksha on 25-01-2025
        # Reason : to show room number with guest details
        # guest_details = GuestDetails.objects.filter(
        #     billing_id=billing_details)
        # guest_detail_serializer = GuestDetailSerializer(
        #     guest_details, many=True)
         # Fetch and serialize GuestDetails with room details
        # end by Akanksha on 25-01-2025
        # Reason : to show room number with guest details
        
        
        # Added by Akanksha on 25-01-2025
        # Reason : to show room number with guest details
        guest_details = GuestDetails.objects.filter(billing_id=billing_details)
        guest_details_with_room = []
        for guest in guest_details:
            room_details = self.get_room_details(guest.selectedRoom)
            guest_data = GuestDetailSerializer(guest).data
            guest_data["room_details"] = room_details
            guest_details_with_room.append(guest_data)
            
        payment_receipts = PaymentReceipt.objects.filter(billing_id=billing_id)
        payment_receipt_serializer = PaymentReceiptSerializer(
            payment_receipts, many=True)
        # End by Akanksha on 25-01-2025
        # Reason : to show room number with guest details
        
        # Fetch room shift history
        room_shift = RoomShiftHistory.objects.filter(billing_id=billing_id).order_by('-shifted_date', '-shifted_time').first()

        room_shift_data = None
        room_shifted = False

        if room_shift:
            room_shifted = True
            room_shift_data = {
                "previous_room": room_shift.previous_room.number if room_shift.previous_room else None, 
                "new_room": room_shift.new_room.number if room_shift.new_room else None,  
            }

            
        billing_checkin_serializer = {
        # Commented by Akanksha on 25-01-2025
        # Reason : to show room number with guest details
            # "guest_details": guest_detail_serializer.data,
        # Commented by Akanksha on 25-01-2025
        # Reason : to show room number with guest details
        
        
        # Added by Akanksha on 25-01-2025
        # Reason : to show room number with guest details
            "guest_details": guest_details_with_room,
        # End by Akanksha on 25-01-2025
        # Reason : to show room number with guest details
            "billing_details": billing_details_serializer.data,
            "checkin_details": checkin_details_serializer.data,
            "payment_receipts": payment_receipt_serializer.data,
            "room_shifted": room_shifted,
            "room_shift_details": room_shift_data
            
        }
        # print("billing_checkin_serializer------->>>>",
        #       billing_checkin_serializer)

        return Response(billing_checkin_serializer, status=status.HTTP_200_OK)

    
    def get_room_details(self, room_number, tenant):
        """
        Fetch room details based on room number.
        """
        try:
            room = RoomDetail.objects.get(number=room_number)
            return {
                "room_type": room.room_type,
                "price": float(room.price),  # Convert Decimal to float
                "variety": room.variety,
                "is_active": room.is_active,
            }
        except ObjectDoesNotExist:
            return {"error": f"Room with number {room_number} does not exist."}



class ReCheckinFormAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # Extract the billing_id from the query parameters
        billing_id = request.data.get('billing_id')
        # print("billing_id------------------------------->>>>", billing_id)

        if not billing_id:
            return Response({"error": "billing_id is required in query parameters."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            billing_detail = BillingDetail.objects.get(id=billing_id)
        except BillingDetail.DoesNotExist:
            return Response({"error": f"BillingDetail not found for billing_id {billing_id}."}, status=status.HTTP_404_NOT_FOUND)

        # Extracting data from the request
        room_details_data = json.loads(request.data.get('selectedRooms', '-'))
        payment_method = request.data.get('payment_method')
        number_of_persons = request.data.get('number_of_persons')
        number_of_children = request.data.get('number_of_children')
        total_amount = Decimal(request.data.get('total_amount', '0'))
        arrival_date = request.data.get('arrival_date')
        arrival_time = request.data.get('arrival_time')
        departure_date = request.data.get('departure_date')
        departure_time = request.data.get('departure_time')
        person_name = request.data.get('name')
        person_phone = request.data.get('phone')
        person_address = request.data.get('address')
        person_id_card = request.data.get('id_card_no')
        person_last_name = request.data.get('last_name')
        person_id_type = request.data.get('id_card_type')
        person_email = request.data.get('email')
        person_id_photo = request.data.get('id_card_photo')

        extra_person_charges = Decimal(
            request.data.get('extraPersonCharges', '0'))
        discount_rupees = Decimal(request.data.get('discount_rupees', '0'))
        discount_percentage = Decimal(
            request.data.get('discount_percentage', '0'))
        taxable_amount = Decimal(request.data.get('subtotal', '0'))
        gst = request.data.get('gst')
        gst_value = Decimal(request.data.get('gstValue', '0'))
        advanced_pay_amount = Decimal(request.data.get('advancePayment', '0'))
        grand_total = Decimal(request.data.get('grandTotal', '0'))
        due = Decimal(request.data.get('due', '0'))

        # Create PersonalDetail
        personal_detail = PersonalDetail.objects.create(
            name=person_name,
            phone=person_phone,
            address=person_address,
            id_card_no=person_id_card,
            last_name=person_last_name,
            email=person_email,
            id_card_type=person_id_type,
            id_card_photo=person_id_photo
        )

        total_amount = Decimal('0')
        booked_rooms = []

        for room_data in room_details_data:
            room_number = room_data.get('room_number')
            room_type = room_data.get('room_type')
            price = Decimal(room_data.get('price', '0'))

            try:
                room_detail = RoomDetail.objects.get(
                    number=room_number,
                    room_type=room_type,
                    price=price
                )
            except RoomDetail.DoesNotExist:
                return Response({"error": f"Room detail not found for room number {room_number}."},
                                status=status.HTTP_404_NOT_FOUND)
                
            

            total_amount += price

            try:
                setting = Setting.objects.first()
                gst = Decimal(
                    setting.gst) if setting and setting.gst is not None else Decimal('0')
            except Setting.DoesNotExist:
                gst = Decimal('0')

            # Update the existing billing detail for total_amount
            billing_detail.total_amount += price
            billing_detail.save()

            checkin_detail = CheckinDetail.objects.create(
                arrival_date=arrival_date,
                arrival_time=arrival_time,
                departure_date=departure_date,
                departure_time=departure_time,
                room_id=room_detail,
                billing_id=billing_detail,
                room_price=price,
            )

            booked_room = BookedRoom.objects.create(
                room_detail_id=room_detail,
                billing_detail_id=billing_detail,
                checking_detail_id=checkin_detail
            )
            booked_rooms.append(booked_room)

        billing_detail.total_amount = total_amount
        billing_detail.save()

        serializer = BookedRoomSerializer(booked_rooms, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # Code Addition by Tejasve Gupta on 24-07-2024
    # Reason - To post room details from frontend as well


class RoomDetailCreateAPIView(APIView):
    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated]
    room_list = {}

    def get(self, request, *args, **kwargs):
        # room_types = [{"value": rt[0], "label": rt[1]} for rt in ROOM_TYPE]
        # variety = [{"value": rt[0], "label": rt[1]} for rt in ROOM_VARIETY]

        # Modified by - Ashish Dewangan on 04-09-2024
        # Reason - Returned room list in response
        # response = {
        #    'room_types': room_types,
        #    'variety': variety
        # }
        
        # Fetch room types from the RoomType model
        room_types = [
            {"value": rt.id, "label": rt.room_type} 
            for rt in RoomType.objects.all()
        ]
        
        # Fetch room varieties from the RoomVariety model
        variety = [
            {"value": rv.id, "label": rv.room_variety} 
            for rv in RoomVariety.objects.all()
        ]
        
        

        all_room_details = RoomDetail.objects.all().order_by("number")
        all_room_details_serializer = RoomDetailSerializer(
            all_room_details, many=True)

        room_list = [
            {
                'id': room['id'],
                'room_type': room['room_type'],
                'room_number': room['number'],
                'room_price': room['price'],
                'variety': room['variety'],
                'is_active': room['is_active'],
                'image': room['image'],
                'number_of_persons': room['number_of_persons'],
                'amenities': room['amenities'],
            } for room in all_room_details_serializer.data
        ]

        # End of addition by - Ashish Dewangan on 04-09-2024
        # Reason - Returned room list in response
        response = {
            'room_types': room_types,
            'variety': variety,
            'room_list': room_list
        }

        return Response(response)
    # End of Code Addition by Tejasve Gupta on 21-08-2024
    # Reason- to show room type dropdown


    def post(self, request, tenant, *args, **kwargs):

        # Added by - Ashish Dewangan on 07-09-2024
        # Reason - To check if room number already exists
        room_number = request.data["number"]
        doesRoomExist = RoomDetail.objects.filter(
            number=room_number).count() > 0
        if doesRoomExist == True:
            return Response("Room number already exists.", status=status.HTTP_400_BAD_REQUEST)
        # End of addition by - Ashish Dewangan on 07-09-2024
        # Reason - To check if room number already exists

        data = request.data
        amenities = data.get("amenities")

        # If it's a list, convert to comma-separated string
        if isinstance(amenities, list):
            request._mutable = True  # Optional: needed if request.data is immutable (in some cases)
            request.data["amenities"] = ", ".join(amenities)
            request._mutable = False
            
        serializer = RoomDetailSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()

            # Modified by - Ashish Dewangan on 04-09-2024
            # Reason - Sorted list according to room number
            # all_room_details = RoomDetail.objects.all()
            all_room_details = RoomDetail.objects.all().order_by("number")
            # Modified by - Ashish Dewangan on 04-09-2024
            # Reason - Sorted list according to room number

            all_room_details_serializer = RoomDetailSerializer(
                all_room_details, many=True)

            # Constructing the response list dictionary
            room_list = [
                {
                    'id': room['id'],
                    'room_type': room['room_type'],
                    'room_number': room['number'],
                    'room_price': room['price'],
                    # Code Addition by Tejasve Gupta on 21-08-2024
                    # Reason - Addition of Room Variety filed
                    'variety': room['variety'],
                    # End of Code Addition by Tejasve Gupta on 21-08-2024
                    # Reason - Addition of Room Variety filed

                    # Added by - Ashish Dewangan on 04-09-2024
                    # Reason - to return is_active value in response
                    'is_active': room['is_active'],
                    # End of addition by - Ashish Dewangan on 04-09-2024
                    # Reason - to return is_active value in response
                    'setting': room['setting'],
                    'amenities': room['amenities'],
                } for room in all_room_details_serializer.data
            ]

            # print("Room List---->>>>>", room_list)
            return Response(room_list, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # End of Code Addition by Tejasve Gupta on 24-07-2024
    # Reason - To post room details from frontend as well

    # def put(self, request,tenant, *args, **kwargs):
    #     room_id = kwargs.get('pk')
    #     try:
    #         room = RoomDetail.objects.get(id=room_id)
    #     except RoomDetail.DoesNotExist:
    #         return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)

    #     serializer = RoomDetailSerializer(
    #         room, data=request.data, partial=True)
    #     if serializer.is_valid():
    #         serializer.save()

    #         # Fetch updated room list

    #         # Modified by - Ashish Dewangan on 04-09-2024
    #         # Reason - Sorted list according to room number
    #         # all_room_details = RoomDetail.objects.all()
    #         all_room_details = RoomDetail.objects.all().order_by("number")
    #         # End of modification by - Ashish Dewangan on 04-09-2024
    #         # Reason - Sorted list according to room number

    #         all_room_details_serializer = RoomDetailSerializer(
    #             all_room_details, many=True)

    #         room_list = [
    #             {
    #                 'id': room['id'],
    #                 'room_type': room['room_type'],
    #                 'room_number': room['number'],
    #                 'room_price': room['price'],

    #                 'variety': room['variety'],
    #                 # Added by - Ashish Dewangan on 04-09-2024
    #                 # Reason - to return is_active value in response
    #                 'is_active': room['is_active'],
    #                 # End of addition by - Ashish Dewangan on 04-09-2024
    #                 # Reason - to return is_active value in response
    #                 'amenities': room['amenities'],
    #             } for room in all_room_details_serializer.data

    #         ]

    #         return Response(room_list, status=status.HTTP_200_OK)

    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, tenant, *args, **kwargs):
        room_id = kwargs.get('pk')
        try:
            room = RoomDetail.objects.get(id=room_id)
        except RoomDetail.DoesNotExist:
            return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        amenities = data.get("amenities")

        # If amenities is a list, convert to comma-separated string (same as in POST)
        if isinstance(amenities, list):
            # If request.data is immutable, make it mutable before updating
            if hasattr(request.data, '_mutable'):
                request._mutable = True
            request.data["amenities"] = ", ".join(amenities)
            if hasattr(request.data, '_mutable'):
                request._mutable = False

        serializer = RoomDetailSerializer(room, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()

            # Fetch updated room list sorted by number
            all_room_details = RoomDetail.objects.all().order_by("number")
            all_room_details_serializer = RoomDetailSerializer(all_room_details, many=True)

            room_list = [
                {
                    'id': room['id'],
                    'room_type': room['room_type'],
                    'room_number': room['number'],
                    'room_price': room['price'],
                    'variety': room['variety'],
                    'is_active': room['is_active'],
                    'amenities': room['amenities'],
                } for room in all_room_details_serializer.data
            ]

            return Response(room_list, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def delete(self, request, tenant, *args, **kwargs):
        room_id = kwargs.get('pk')
        try:
            room = RoomDetail.objects.get(id=room_id)
        except RoomDetail.DoesNotExist:
            return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)

        room.delete()

        # Fetch updated room list

        # Modified by - Ashish Dewangan on 04-09-2024
        # Reason - Sorted list according to room number
        # all_room_details = RoomDetail.objects.all()
        all_room_details = RoomDetail.objects.all().order_by("number")
        # End of modification by - Ashish Dewangan on 04-09-2024
        # Reason - Sorted list according to room number

        all_room_details_serializer = RoomDetailSerializer(
            all_room_details, many=True)

        room_list = [
            {
                'id': room['id'],
                'room_type': room['room_type'],
                'room_number': room['number'],
                'room_price': room['price'],
                'variety': room['variety'],

                # Added by - Ashish Dewangan on 04-09-2024
                # Reason - to return is_active value in response
                'is_active': room['is_active'],
                # End of addition by - Ashish Dewangan on 04-09-2024
                # Reason - to return is_active value in response
            } for room in all_room_details_serializer.data
        ]

        return Response({'message': 'Room Detail deleted successfully', 'rooms': room_list}, status=status.HTTP_200_OK)

# Code Addition by Tejasve Gupta on 02-08-2024
# Reason - for name search dropdown


class RoomDetailsAPIView(APIView):
    room_list = {}

    def get(self, request, *args, **kwargs):
        room_types = [
            {"value": rt.id, "label": rt.room_type} 
            for rt in RoomType.objects.all()
        ]
        
        variety = [
            {"value": rv.id, "label": rv.room_variety} 
            for rv in RoomVariety.objects.all()
        ]
        
        

        all_room_details = RoomDetail.objects.all().order_by("number")
        all_room_details_serializer = RoomDetailSerializer(
            all_room_details, many=True)

        room_list = [
            {
                'id': room['id'],
                'room_type': room['room_type'],
                'room_number': room['number'],
                'room_price': room['price'],
                'variety': room['variety'],
                'is_active': room['is_active'],
                'image': room['image'],
                'number_of_persons': room['number_of_persons'],
                'amenities': room['amenities'],
            } for room in all_room_details_serializer.data
        ]

        response = {
            'room_types': room_types,
            'variety': variety,
            'room_list': room_list
        }

        return Response(response)

   

class PersonalDetailView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        search_term = request.query_params.get('search', '').strip().lower()
        # print("search_term----->>>>", search_term)
        # print(type(search_term))

        # Modified by - Ashish Dewangan on 11-09-2024
        # Reason - To search after 3rd character is typed
        # if search_term and len(search_term) > 3:
        # personal_details = PersonalDetail.objects.filter(
        #     Q(name__icontains=search_term) | Q(
        #         phone__icontains=search_term)
        # )
        # else:
        #     personal_details = PersonalDetail.objects.none()
        personal_details = PersonalDetail.objects.filter(
            Q(name__icontains=search_term) | Q(
                phone__icontains=search_term)
            # Addition by Om Shrivastava on 23-09-2024
            # Reason : Add searching by Id card type
            # Modification and addition by Om Shrivastava on 27-09-2024
            # Reason : Search by id card no
            # | Q(id_card_type__icontains=search_term
            | Q(id_card_no__icontains=search_term
                # End of modification and addition by Om Shrivastava on 27-09-2024
                # Reason : Search by id card no
                # End of addition by Om Shrivastava on 23-09-2024
                # Reason : Add searching by Id card type
                )
        )
        # End of modification by - Ashish Dewangan on 11-09-2024
        # Reason - To search after 3rd character is typed

        serializer = PersonalDetailSerializer(personal_details, many=True)
        # print("Personal details---->>>>", serializer.data)
        return Response(serializer.data, status=status.HTTP_200_OK)

# End of Code Addition by Tejasve Gupta on 02-08-2024
# Reason - for name search dropdown

# Code Addition by Tejasve Gupta on 05-08-2024
# Reason - Addition of Advance Booking List Module


class AdvanceBookingAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    # Modified by - Ashish Dewangan on 05-09-2024
    # Reason - To show advance bookings which are checkedout
    # def get(self, request):
    #     # Get query parameters
    #     from datetime import datetime
    #     page_number = int(request.query_params.get("pageNumber", 1))
    #     start_date = request.query_params.get("startDate")

    #     # Set start_date to tomorrow's date if not provided or invalid
    #     if start_date:
    #         start_date = parse_date(start_date)
    #         if not start_date or start_date < datetime.now().date() + timedelta(days=1):
    #             start_date = datetime.now().date() + timedelta(days=1)
    #     else:
    #         start_date = datetime.now().date() + timedelta(days=1)

    #     end_date = request.query_params.get("endDate")

    #     # Filter bookings from start_date (tomorrow onwards)
    #     checkin_objects = CheckinDetail.objects.filter(
    #         arrival_date__gte=start_date
    #     )

    #     if end_date:
    #         end_date_obj = parse_date(end_date)
    #         if end_date_obj:
    #             checkin_objects = checkin_objects.filter(
    #                 arrival_date__lte=end_date_obj
    #             )

    #             if datetime.strptime(start_date.strftime("%Y-%m-%d"), "%Y-%m-%d").date() > end_date_obj:
    #                 raise ValidationError(
    #                     "End date should be after start date.")

    #     # Pagination
    #     paginator = Paginator(checkin_objects, 10)
    #     paginated_checkin_objects = paginator.page(page_number).object_list

    #     bookings = set()
    #     for i in paginated_checkin_objects:
    #         bookings.add(i.billing_id.id)

    #     filtered_checkins = []
    #     billing_objects = []
    #     for i in bookings:
    #         billing_objects.append(BillingDetail.objects.get(id=i))

    #     for billing_object in billing_objects:
    #         temp_checkin_objects = CheckinDetail.objects.filter(
    #             billing_id=billing_object.id
    #         )
    #         checkin_details = {}
    #         rooms = []
    #         period = []
    #         for temp_checkin_object in temp_checkin_objects:
    #             room_detail = {
    #                 "number": temp_checkin_object.room_id.number,
    #                 "type": temp_checkin_object.room_id.room_type,
    #             }
    #             rooms.append(room_detail)
    #             checkin_date_time = {
    #                 "arrival_time": temp_checkin_object.arrival_time,
    #                 "arrival_date": temp_checkin_object.arrival_date,
    #             }
    #             period.append(checkin_date_time)

    #         personal_details_object = billing_object.personal_details_id
    #         personal_details = {
    #             "name": personal_details_object.name,
    #             "last_name": personal_details_object.last_name,
    #             "email": personal_details_object.email,
    #             "phone": personal_details_object.phone,
    #             "id_card_type": personal_details_object.id_card_type,
    #             "id_card_no": personal_details_object.id_card_no,
    #             "address": personal_details_object.address,
    #             "country": personal_details_object.country,
    #             "state": personal_details_object.state,
    #             "city": personal_details_object.city,
    #             "zip": personal_details_object.zip,
    #             "dob": personal_details_object.dob,
    #             "gender": personal_details_object.gender,
    #             "created_at": personal_details_object.created_at.strftime('%d-%m-%y'),
    #             "updated_at": personal_details_object.updated_at,
    #         }

    #         checkin_details["rooms"] = rooms
    #         checkin_details["checkin_period"] = period
    #         checkin_details["billing_id"] = billing_object.id
    #         checkin_details["total"] = billing_object.total
    #         checkin_details["personal_details"] = personal_details

    #         filtered_checkins.append(checkin_details)

    #     total_checkins = len(bookings)
    #     starting_index = (page_number - 1) * 10
    #     ending_index = starting_index + 10
    #     filtered_checkins = filtered_checkins[starting_index:ending_index]

    #     return Response({
    #         "message": "successful",
    #         "filtered_checkins": filtered_checkins,
    #         "total_checkins": total_checkins,
    #     }, status=200)

    def get(self, request, tenant):
        # Get query parameters
        from datetime import datetime
        page_number = int(request.query_params.get("pageNumber", 1))
        start_date = request.query_params.get("startDate")

        # Set start_date to tomorrow's date if not provided or invalid
        if start_date:
            start_date = parse_date(start_date)
            # Commented by - Ashish Dewangan on 13-09-2024
            # Reason - Date was being calculated wrongly
            # if not start_date or start_date < datetime.now().date() + timedelta(days=1):
            #     start_date = datetime.now().date() + timedelta(days=1)
            # End of comment by - Ashish Dewangan on 13-09-2024
            # Reason - Date was being calculated wrongly
        else:
            # Modified by - Ashish Dewangan on 13-09-2024
            # Reason - Date was being calculated wrongly
            # start_date = datetime.now().date() + timedelta(days=1)
            start_date = datetime.now().date()
            # End of modification by - Ashish Dewangan on 13-09-2024
            # Reason - Date was being calculated wrongly

        end_date = request.query_params.get("endDate")
        if end_date:
            end_date = parse_date(end_date)
            # Commented by - Ashish Dewangan on 13-09-2024
            # Reason - Date was being calculated wrongly
            # if not end_date or end_date <= start_date:
            #     end_date = start_date + timedelta(days=1)
            # End of modification by - Ashish Dewangan on 13-09-2024
            # Reason - Date was being calculated wrongly

        # Filter bookings from start_date (tomorrow onwards)

        # Modified by - Ashish Dewangan on 13-09-2024
        # Reason - To filter out data of current date
        # billing_objects = BillingDetail.objects.filter(
        #     arrival_date__gte=start_date, departure_date__isnull=True
        # )

        # Modified by - Ashish Dewangan on 18-09-2024
        # Reasson - To filter out advance bookings
        # billing_objects = BillingDetail.objects.filter(
        #     arrival_date__gt=start_date, departure_date__isnull=True
        # )
        billing_objects = BillingDetail.objects.filter(
            arrival_date__gte=start_date, departure_date__isnull=True, booking_type="Advance"
        )
        # End of modification by - Ashish Dewangan on 18-09-2024
        # Reasson - To filter out advance bookings

        # End of modification by - Ashish Dewangan on 13-09-2024
        # Reason - To filter out data of current date

        if end_date:
            billing_objects = billing_objects.filter(
                arrival_date__lte=end_date
            )

        sort_field = request.query_params.get("sortField", "arrival_date")
        sort_order = request.query_params.get("sortOrder", "asc")

        if sort_field == "name":
            sort_field = "customer_name"
        if sort_field == "idcardNo":
            sort_field = "customer_id_card_no"
        if sort_field == "idcardType":
            sort_field = "customer_id_card_type"
        if sort_order == "desc":
            sort_field = f"-{sort_field}"
                
        billing_objects = billing_objects.order_by(sort_field)

        
        total_checkins = billing_objects.count()
        # Pagination
        paginator = Paginator(billing_objects, 10)
        paginated_billing_objects = paginator.page(page_number).object_list

        filtered_checkins = []

        for billing_object in paginated_billing_objects:
            temp_checkin_objects = CheckinDetail.objects.filter(
                billing_id=billing_object.id
            )
            checkin_details = {}
            rooms = []
            period = []
            for temp_checkin_object in temp_checkin_objects:
                room_detail = {
                    "number": temp_checkin_object.room_id.number,
                    "type": temp_checkin_object.room_id.room_type,
                    # Addition byOm Shrivastava on 10-09-2024
                    # Reason : Show the variety
                    "variety": temp_checkin_object.room_id.variety,
                    # End of addition byOm Shrivastava on 10-09-2024
                    # Reason : Show the variety
                }
                rooms.append(room_detail)
                checkin_date_time = {
                    "arrival_time": temp_checkin_object.arrival_time,
                    "arrival_date": temp_checkin_object.arrival_date,
                }
                period.append(checkin_date_time)

            personal_details_object = billing_object.personal_details_id
            personal_details = {
                # Added by akanksha on 23rd oct,
                # Reason to show saluutation 
                "salutation":personal_details_object.salutation,    
                # End by akanksha on 23rd oct,
                # Reason to show saluutation 
                "name": personal_details_object.name,
                "last_name": personal_details_object.last_name,
                "email": personal_details_object.email,
                "phone": personal_details_object.phone,
                "id_card_type": personal_details_object.id_card_type,
                "id_card_no": personal_details_object.id_card_no,
                "address": personal_details_object.address,
                "country": personal_details_object.country,
                "state": personal_details_object.state,
                "city": personal_details_object.city,
                "zip": personal_details_object.zip,
                "dob": personal_details_object.dob,
                "gender": personal_details_object.gender,
                "created_at": personal_details_object.created_at.strftime('%d-%m-%y'),
                "updated_at": personal_details_object.updated_at,
            }

            checkin_details["rooms"] = rooms
            checkin_details["checkin_period"] = period
            checkin_details["billing_id"] = billing_object.id
            checkin_details["total"] = billing_object.total
            checkin_details["booking_type"] = billing_object.booking_type
            checkin_details["personal_details"] = personal_details
            # Addition by Om Shrivastava on 19-10-2024
            # Reason : Add the checkin staff field and room charges
            checkin_details["room_charges"] = billing_object.room_charges
            checkin_details["user_id_at_checkin"] = billing_object.user_id_at_checkin.email
            # End of addition by Om Shrivastava on 19-10-2024
            # Reason : Add the checkin staff field

            # Added by - Ashish Dewangan on 14-11-2024
            # Reason - To formate date time before returning it in the response
            local_dt = timezone.localtime(billing_object.created_at, pytz.timezone('Asia/Kolkata'))
            checkin_details["created_at"]=  local_dt.strftime('%d-%m-%Y %I:%M %p')
            # End of addition by - Ashish Dewangan on 14-11-2024
            # Reason - To formate date time before returning it in the response

            filtered_checkins.append(checkin_details)

        # total_checkins = len(filtered_checkins)
        # starting_index = (page_number - 1) * 10
        # ending_index = starting_index + 10
        # filtered_checkins = filtered_checkins[starting_index:ending_index]

        return Response({
            "message": "successful",
            "filtered_checkins": filtered_checkins,
            "total_checkins": total_checkins,
        }, status=200)
    # End of modification by - Ashish Dewangan on 05-09-2024
    # Reason - To show advance bookings which are checkedout

# End of Code Addition by Tejasve Gupta on 05-08-2024
# Reason - Addition of Advance Booking List Module


'''Code Addition by Tejasve Gupta on 10-08-2024
Reason - Creation of Payment Receipt Table'''


class PaymentReceiptAPIView(APIView):
    # Added by - Ashish Dewangan on 04-10-2024
    # Reason - Only authenticated person can use these APIs
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    # End of addition by - Ashish Dewangan on 04-10-2024
    # Reason - Only authenticated person can use these APIs

    def get(self, request, tenant, format=None):
        payment_receipts = PaymentReceipt.objects.all()
        serializer = PaymentReceiptSerializer(payment_receipts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, tenant, format=None):
        billing_id = request.data.get("billing_id")

        # Modified by - Ashish Dewangan on 04-10-2024
        # Reason - To store user details
        # serializer = PaymentReceiptSerializer(data=request.data)

       
        # Added by - Ashish Dewangan on 16-11-2024
        # Reason - To store extra_discount and miscellaneout charges when payment receipt is submitted
        try:
            billingDetail = BillingDetail.objects.get(id=billing_id)
            billingDetail.extra_discount = request.data.get("extra_discount")
            billingDetail.miscellaneous_charges = request.data.get("miscellaneous_charges")
            billingDetail.details = request.data.get("details")
            billingDetail.extraDetails = request.data.get("extraDetails")
            billingDetail.save()
        except Exception as e:    
            print("Exception occured while saving extra discount and miscellaneout",e)
        # End of addition by - Ashish Dewangan on 16-11-2024
        # Reason - To store extra_discount and miscellaneout charges when payment receipt is submitted    

        user = request.user
        data = {
            "amount_paid": request.data.get("amount_paid"),
            "billing_id": request.data.get("billing_id"),
            "payment_method": request.data.get("payment_method"),
            "person_name": request.data.get("person_name"),
            # Added by - Akanksha 0n 12/10/2024
            # Reason - To store name title salutation
            "person_salutation": request.data.get("person_salutation"),
            # End by - Akanksha 0n 12/10/2024
            # Reason - To store name title salutation
            "room_charges": request.data.get("room_charges"),
            "room_numbers": request.data.get("room_numbers"),
            "total_amount": request.data.get("total_amount"),
            # Addition by Om Shrivastava on 12-10-2024
            # Reason : Set the refundable data
            # "is_Refundable": request.data.get("is_Refundable"),
            # "refund_amount": request.data.get("refund_amount"),
            # End of addition by Om Shrivastava on 12-10-2024
            # Reason : Set the refundable data

            "user": user.id,
            
            # Addition by Akanksha on 23-01-2025
            # Reason: To store transaction ID and image receipt
            "transaction_id": request.data.get("transaction_id"),
            "is_partial": request.data.get("is_partial"),
            # "payment_proof": request.data.get("payment_proof"),
            "payment_proof": request.FILES.get("payment_proof"),
            "partial_reason": request.data.get("partial_reason"),
            # "payment_proof": request.FILES.get('payment_proof'),
            # End of addition by Akanksha on 23-01-2025
            # Reason: To store transaction ID and image receipt
        }
        # print(data)
        # Handle the file upload
        # payment_proof = request.FILES.get("payment_proof")
        # if payment_proof:
        #     data["payment_proof"] = payment_proof  # Attach the file to the data
        # else:
        #     return Response({
        #         'success': False,
        #         'message': 'No payment proof file uploaded.',
        #     }, status=status.HTTP_400_BAD_REQUEST)


        serializer = PaymentReceiptSerializer(data=data)
        # End of modification by - Ashish Dewangan on 04-10-2024
        # Reason - To store user details

        if serializer.is_valid():
            serializer.save()

            payment_receipts = PaymentReceipt.objects.filter(
                billing_id=billing_id)
            listSerializer = PaymentReceiptSerializer(
                payment_receipts, many=True)

            response_data = {
                'success': True,
                'message': 'Payment receipt created successfully.',
                'data': listSerializer.data,
                'latest_payment_receipt': serializer.data,
                # "payment_receipts":serializer.data,
            }
            return Response(response_data, status=status.HTTP_201_CREATED)

        return Response({
            'success': False,
            'message': 'Failed to create payment receipt.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


'''End of Code Addition by Tejasve Gupta on 10-08-2024
Reason - Creation of Payment Receipt Table'''

'''Code Addition by Om Shrivastava on 21-08-2024
Reason - Creation of all getting user data'''


class AllUserAPIView(APIView):
    def get(self, request, *args, **kwargs):
        userData = User.objects.all().order_by("id")
        try:
            serializer = UserSerializer(
                userData, many=True
            )
            return Response(
                {
                    "user": (
                        serializer.data
                    ),
                },
                status=200,
            )
        except Exception as e:
            return Response({'error': "Unexpected error occurred"}, status=500)


'''End of Code Addition by Om Shrivastava on 21-08-2024
Reason - Creation of all getting user data'''


"""
Commented and modified by - Ashish Dewangan on 27-08-2024
Reason - Created a new CheckoutListAPIView API to get proper data in response
"""
"""
# Code Addition by Tejsve Gupta on 23-08-2024
# Reason - To show checkout list
class CheckoutListAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Get query parameters
        page_number = int(request.query_params.get("pageNumber", 1))
        start_date = request.query_params.get(
            "startDate", datetime.now().date().strftime("%Y-%m-%d"))
        end_date = request.query_params.get("endDate")
        sort_field = request.query_params.get("sortField", "created_at")
        sort_order = request.query_params.get("sortOrder", "asc")

        # Filter by date range
        if end_date:
            checkout_details = CheckoutDetail.objects.filter(
                created_at__date__range=[parse_date(
                    start_date), parse_date(end_date)]
            )
        else:
            checkout_details = CheckoutDetail.objects.filter(
                created_at__date__gte=parse_date(start_date)
            )

        # Apply sorting
        if sort_order == "desc":
            sort_field = "-" + sort_field
        checkout_details = checkout_details.order_by(sort_field)

        # Apply pagination
        paginator = Paginator(checkout_details, 10)  # Show 10 records per page
        try:
            checkout_details_page = paginator.page(page_number)
        except PageNotAnInteger:
            # If page is not an integer, deliver first page.
            checkout_details_page = paginator.page(1)
        except EmptyPage:
            # If page is out of range, deliver last page of results.
            checkout_details_page = paginator.page(paginator.num_pages)

        # Serialize the paginated data
        serializer = CheckoutDetailsSerializer(
            checkout_details_page, many=True)

        # Include pagination details in the response
        response_data = {
            "count": paginator.count,
            "total_pages": paginator.num_pages,
            "current_page": page_number,
            "checkout_details": serializer.data
        }

        return Response(response_data, status=status.HTTP_200_OK)
    # End of Code Addition by Tejsve Gupta on 23-08-2024
    # Reason - To show checkout list
"""


class CheckoutListAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, tenant):
        from datetime import datetime
        # Get query parameters
        page_number = int(request.query_params.get("pageNumber", 1))
        start_date = request.query_params.get(
            "startDate", datetime.now().date().strftime("%Y-%m-%d"))
        end_date = request.query_params.get("endDate")
        sort_field = request.query_params.get("sortField", "created_at")
        sort_order = request.query_params.get("sortOrder", "asc")
        selected_tab = request.query_params.get("selectedTab")

        # Added by - Ashish Dewangan on 15-11-2024
        # Reason - To apply pagination if request is not coming from customerDetails page
        filter_page = request.query_params.get("filterPage")
        # End of addition by - Ashish Dewangan on 15-11-2024
        # Reason - To apply pagination if request is not coming from customerDetails page

        if end_date:
            billings = BillingDetail.objects.filter(
                departure_date__range=[parse_date(
                    start_date), parse_date(end_date)]
            )
        else:
            billings = BillingDetail.objects.filter(
                departure_date__gte=parse_date(start_date)
            )

        sort_order_prefix = "-" if sort_order == "desc" else ""
        billings = billings.annotate(
            total_paid=Coalesce(Sum('paymentreceipt__amount_paid', output_field=DecimalField()), Value(0, output_field=DecimalField()))
        )

        if sort_field == "name":
            billings = billings.order_by(f"{sort_order_prefix}customer_name")
        elif sort_field == "grand_total":
            billings = billings.order_by(f"{sort_order_prefix}grand_total")
        elif sort_field == "arrival_date":
            billings = billings.order_by(f"{sort_order_prefix}arrival_date")
        elif sort_field == "departure_date":
            billings = billings.order_by(f"{sort_order_prefix}departure_date")
        elif sort_field == "total_paid":
            billings = billings.order_by(f"{sort_order_prefix}total_paid")
        elif sort_field == "phone":
            billings = billings.order_by(f"{sort_order_prefix}customer_phone")
        elif sort_field == "idcardNo":
            billings = billings.order_by(f"{sort_order_prefix}customer_id_card_no")
        elif sort_field == "email":
            billings = billings.order_by(f"{sort_order_prefix}customer_email")
        
        else:
            billings = billings.order_by(f"{sort_order_prefix}{sort_field}")
            
        # Filter based on selectedTab value
        if selected_tab == "Partial Checkouts":
            billings = billings.filter(
                is_partial_payment_confirmed=True,
                is_cancelled=False
            )

        elif selected_tab == "Complete Checkouts":
            billings = billings.filter(
                Q(is_partial_payment_confirmed=False) | Q(is_cancelled=True) | Q(is_Refundable__iexact="Yes")

            )
        # print(f"Filtered {selected_tab} entries count: {billings.count()}")

        print("Refundable count:", BillingDetail.objects.filter(is_Refundable__iexact="Yes").count())

        total_checkouts = billings.count()
    
        if filter_page =="customerDetails":
            paginated_billings = billings
        else:    
            paginator = Paginator(billings, 10)
            paginated_billings = paginator.page(page_number).object_list
        
        overall_grand_total = 0
        overall_amount_collected = 0
        overall_amount_collected_by_cash = 0
        overall_amount_collected_by_online = 0
        overall_amount_refunded = 0
        overall_amount_collected_after_cancellation = 0
        overall_partial_amount = 0

        filtered_chckouts = []

        for billing_object in paginated_billings:
            temp_checkin_objects = CheckinDetail.objects.filter(
                billing_id=billing_object.id)
            checkout_details = {}
            rooms = []
            period = []

            room_data = ""
            for temp_checkin_object in temp_checkin_objects:
                room_detail = {
                    "number": temp_checkin_object.room_id.number,
                    "type": temp_checkin_object.room_id.room_type,
                    "variety": temp_checkin_object.room_id.variety,
                }

                room_data = room_data + \
                    " ("+room_detail["number"] + " " + \
                    room_detail["type"] + " "+room_detail["variety"] + ") "
                rooms.append(room_detail)

                checkin_date_time = {
                    "arrival_time": temp_checkin_object.arrival_time,
                    "arrival_date": temp_checkin_object.arrival_date,
                }
                period.append(checkin_date_time)

            personal_details_object = billing_object.personal_details_id
            personal_details = {
                "name": personal_details_object.name,
                "salutation": personal_details_object.salutation,
                "last_name": personal_details_object.last_name,
                "email": personal_details_object.email,
                "phone": personal_details_object.phone,
                "id_card_type": personal_details_object.id_card_type,
                "id_card_no": personal_details_object.id_card_no,
                "address": personal_details_object.address,
                "country": personal_details_object.country,
                "state": personal_details_object.state,
                "city": personal_details_object.city,
                "zip": personal_details_object.zip,
                "dob": personal_details_object.dob,
                "gender": personal_details_object.gender,
                "created_at": personal_details_object.created_at.strftime('%d-%m-%y'),
                "updated_at": personal_details_object.updated_at,
            }
            personal_details.update({
                "name": billing_object.customer_name,
                "last_name": billing_object.customer_last_name,
                "email": billing_object.customer_email,
                "phone": billing_object.customer_phone,
                "id_card_type": billing_object.customer_id_card_type,
                "id_card_no": billing_object.customer_id_card_no,
                "address": billing_object.customer_address,
                "country": billing_object.customer_country,
                "state": billing_object.customer_state,
                "city": billing_object.customer_city,
                "zip": billing_object.customer_zip,
                "dob": billing_object.customer_dob,
                "gender": billing_object.customer_gender,
            })
            checkout_details["personal_details"] = personal_details

            checkout_data = {
                "room_charges": billing_object.room_charges,
                "extra_person_charges": billing_object.extra_person_charges,
                "sub_total": billing_object.sub_total,
                "discount_in": billing_object.discount_in,
                "discount_rupees": billing_object.discount_rupees,
                "discount_percentage": billing_object.discount_percentage,
                "taxable_amount": billing_object.taxable_amount,
                "gst": billing_object.gst,
                "gst_value": billing_object.gst_value,
                "total": billing_object.total,
                "miscellaneous_charges": billing_object.miscellaneous_charges,
                "details": billing_object.details,
                "extra_discount": billing_object.extra_discount,
                "grand_total": billing_object.grand_total,
                "advanced_pay_amount": billing_object.advanced_pay_amount,
                "due": billing_object.due,
                "is_cancelled": billing_object.is_cancelled,
                "refund_amount": billing_object.refund_amount,
                "is_partial_payment_confirmed": billing_object.is_partial_payment_confirmed,
                "user_id": billing_object.user_id,
                "bill_number": billing_object.bill_number,
                "invoice_number": billing_object.invoice_number,
                "personal_detail_id": billing_object.personal_details_id.id,
                "booking_type": billing_object.booking_type,
                "arrival_date": billing_object.arrival_date,
                "arrival_time": billing_object.arrival_time,
                "departure_date": billing_object.departure_date,
                "departure_time": billing_object.departure_time,
                "number_of_persons": billing_object.number_of_persons,
                "number_of_adults": billing_object.number_of_adults,
                "number_of_childrens": billing_object.number_of_children,
                "created_at": billing_object.created_at,
                "updated_at": billing_object.updated_at

            }
            checkout_details["billing_details"] = checkout_data
            checkout_details["user_id_at_checkout"]= billing_object.user_id_at_checkout.email,
            overall_grand_total += billing_object.grand_total
            total_paid = 0

            payment_receipts = PaymentReceipt.objects.filter(
                billing_id=billing_object.id)
            for payment_receipt in payment_receipts:
                if payment_receipt.payment_method == "Online":
                    overall_amount_collected_by_online += payment_receipt.amount_paid
                else:
                    overall_amount_collected_by_cash += payment_receipt.amount_paid
                overall_amount_collected += payment_receipt.amount_paid
                total_paid += payment_receipt.amount_paid
            refunded_amount = 0
            if billing_object.is_cancelled or billing_object.is_Refundable == "Yes":
                overall_amount_refunded += billing_object.refund_amount
                refunded_amount += billing_object.refund_amount
           
            payment_receipts = PaymentReceipt.objects.filter(billing_id=billing_object.id)
            
            for payment_receipt in payment_receipts:
                if payment_receipt.is_partial:  # Check if it's a partial payment
                    overall_partial_amount += payment_receipt.amount_paid  # Add to total
             
            checkout_details["guest_name"] = personal_details_object.name + \
                " " + personal_details_object.last_name,
            checkout_details["guest_phone_number"] = personal_details_object.phone

            checkout_details["room_details"] = room_data
            checkout_details["grand_total"] = billing_object.grand_total
            checkout_details["checkin_date"] = billing_object.arrival_date
            checkout_details["checkout_date"] = billing_object.departure_date
            checkout_details["billing_id"] = billing_object.id
            checkout_details["room_charges"] = billing_object.room_charges
            checkout_details["new_room_charges"] = billing_object.new_room_charges
            checkout_details["additional_charges"] = billing_object.additional_charges
            checkout_details["additional_reason"] = billing_object.additional_reason
            checkout_details["grand_total"] = billing_object.grand_total
            checkout_details["rooms"] = rooms
            checkout_details["checkin_period"] = period
            checkout_details["total_paid"] = total_paid
            checkout_details["refunded_amount"] = refunded_amount
            filtered_chckouts.append(checkout_details)
        overall_amount_collected_after_cancellation = overall_amount_collected - \
            overall_amount_refunded

        overall_grand_total = 0
        overall_amount_collected = 0
        overall_amount_collected_by_cash = 0
        overall_amount_collected_by_online = 0
        overall_amount_refunded = 0
        overall_amount_collected_after_cancellation = 0
        overall_partial_amount = 0

        for billing_object in billings:
        
            overall_grand_total += billing_object.grand_total

            payment_receipts = PaymentReceipt.objects.filter(
                billing_id=billing_object.id)
            for payment_receipt in payment_receipts:
                if payment_receipt.payment_method == "Online":
                    overall_amount_collected_by_online += payment_receipt.amount_paid
                else:
                    overall_amount_collected_by_cash += payment_receipt.amount_paid
                overall_amount_collected += payment_receipt.amount_paid
         
                total_paid += payment_receipt.amount_paid
           
            if billing_object.is_cancelled or billing_object.is_Refundable == "Yes":
                overall_amount_refunded += billing_object.refund_amount
                refunded_amount += billing_object.refund_amount
            
        
            payment_receipts = PaymentReceipt.objects.filter(billing_id=billing_object.id)
            
            for payment_receipt in payment_receipts:
                if payment_receipt.is_partial:  # Check if it's a partial payment
                    overall_partial_amount += payment_receipt.amount_paid  # Add to total

      
        overall_amount_collected_after_cancellation = overall_amount_collected - \
            overall_amount_refunded
        
       
        if filter_page=="customerDetails":
            total_pages = total_checkouts/10
        else:
            total_pages = paginator.num_pages
        return Response({
            "total_checkouts": total_checkouts,
            "total_pages": total_pages ,
            "current_page": page_number,
            "filtered_checkouts": filtered_chckouts,
            "overall_grand_total": overall_grand_total,
            "overall_amount_collected": overall_amount_collected,
            "overall_amount_collected_by_online": overall_amount_collected_by_online,
            "overall_amount_collected_by_cash": overall_amount_collected_by_cash,
            "overall_amount_refunded": overall_amount_refunded,
            "overall_partial_amount": overall_partial_amount,
            "overall_amount_collected_after_cancellation": overall_amount_collected_after_cancellation,
            
        }, status=200)


"""
End of comment and modification by - Ashish Dewangan on 27-08-2024
Reason - Created a new CheckoutListAPIView API to get proper data in response
"""


"""
Added by - Ashish Dewangan on 28-08-2024
Reason - Added API to show details of particular checkout
"""


class ParticularCheckOutDetailsAPIview(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, tenant):
        billing_id = request.query_params.get("billing_id")
        try:
            billing_details = BillingDetail.objects.get(id=billing_id)
        except BillingDetail.DoesNotExist:
            return Response({"error": "BillingDetail not found."}, status=status.HTTP_404_NOT_FOUND)

        billing_details_serializer = BillingDetailSerializer(billing_details)

        checkin_details = CheckinDetail.objects.filter(
            billing_id=billing_details.id)
        checkin_details_serializer = CheckinDetailSerializer(
            checkin_details, many=True)
        guest_details = GuestDetails.objects.filter(
            billing_id=billing_details)
        guest_detail_serializer = GuestDetailSerializer(
            guest_details, many=True)

        # Added by - Ashish Dewangan on 31-08-2024
        # Reason - To return payment receipt list in response
        payment_receipts = PaymentReceipt.objects.filter(
            billing_id=billing_details)
        payment_receipt_serializer = PaymentReceiptSerializer(
            payment_receipts, many=True)
        # End of addition by - Ashish Dewangan on 31-08-2024
        # Reason - To return payment receipt list in response

        billing_checkout_serializer = {
            "guest_details": guest_detail_serializer.data,
            "billing_details": billing_details_serializer.data,
            "checkin_details": checkin_details_serializer.data,
            # Added by - Ashish Dewangan on 31-08-2024
            # Reason - To return payment receipt list in response
            "payment_receipts": payment_receipt_serializer.data,
            # End of addition by - Ashish Dewangan on 31-08-2024
            # Reason - To return payment receipt list in response
        }

        return Response(billing_checkout_serializer, status=status.HTTP_200_OK)


"""
End of code addition by - Ashish Dewangan on 28-08-2024
Reason - Added API to show details of particular checkout
"""
'''
Code Addition by Tejasve Gupta on 30-08-2024
Reason - For Check-in Cancelation
'''


class CancelCheckinAPIview(APIView):
    # Uncommented by - Ashish Dewangan on 06-10-2024
    # Reason - To allow only logged in user to be able to use these APIs
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    # End of uncomment by - Ashish Dewangan on 06-10-2024
    # Reason - To allow only logged in user to be able to use these APIs

    def patch(self, request, format=None):
        billing_id = request.data.get("billing_id")

        billing_detail_object = BillingDetail.objects.get(id=billing_id)
        is_cancelled = request.data.get('is_cancelled')

        if is_cancelled is not None:
            billing_detail_object.is_cancelled = is_cancelled
            # Modification and addition by Om Shrivastava on 27-10-2024
            # Reason : Set the current date and time 
            # billing_detail_object.departure_date = timezone.now()
            # # Added by - Ashish Dewangan on 04-09-2024
            # # Reason - To store departure time when booking is cancelled
            # billing_detail_object.departure_time = timezone.now()
            # # End of addition by - Ashish Dewangan on 04-09-2024
            # # Reason - To store departure time when booking is cancelled
            current_utc_time = timezone.now()
            # Convert UTC time to Asia/Kolkata time
            kolkata_timezone = pytz.timezone("Asia/Kolkata")
            current_time_in_kolkata = current_utc_time.astimezone(kolkata_timezone)
            billing_detail_object.departure_date = current_time_in_kolkata
            billing_detail_object.departure_time = current_time_in_kolkata
            # Modification and addition by Om Shrivastava on 27-10-2024
            # Reason : Set the current date and time 

            # Modification and addition by Om Shrivastava on 14-10-2024
            # Reason : Save the is refundable field also 
            # billing_detail_object.refund_amount = request.data.get(
            #     'refund_amount')
            refund_amount = request.data.get('refund_amount')
            billing_detail_object.refund_amount = refund_amount

            # Determine if the booking is refundable
            if refund_amount and float(refund_amount) > 0:
                billing_detail_object.is_Refundable = "Yes"
            else:
                billing_detail_object.is_Refundable = "No"
            # End of modification and addition by Om Shrivastava on 14-10-2024
            # Reason : Save the is refundable field also 

            # Added by - Ashish Dewangan on 06-10-2024
            # Reason - To store user details who have cancelled this booking
            billing_detail_object.user_id_at_checkout = request.user
            # End of addition by - Ashish Dewangan on 06-10-2024
            # Reason - To store user details who have cancelled this booking

            billing_detail_object.save()
            # Added by - Ashish Dewangan on 04-09-2024
            # Reason - To store departure time when booking is cancelled
            CheckinDetail.objects.filter(billing_id=billing_detail_object).update(
                # Modification and addition by Om Shrivastava on 27-10-2024
                # Reason : Set the current date and time 
                # departure_date=timezone.now(), departure_time=timezone.now())
                departure_date=current_time_in_kolkata,
                departure_time=current_time_in_kolkata
            )
                # End of modification and addition by Om Shrivastava on 27-10-2024
                # Reason : Set the current date and time 
            # End of addition by - Ashish Dewangan on 04-09-2024
            # Reason - To store departure time when booking is cancelled
            return Response({"success": "Check-in Cancelled Successfully"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid input for is_cancelled."}, status=status.HTTP_400_BAD_REQUEST)
        
# Added by akanksha on 07-02-2025
# Reason to store refund amount in the backend
class UpdateRefundAPIview(APIView):
    """API to update refund amount and refund status."""
    
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self,request, format=None, *args, **kwargs):
        billing_id = request.data.get("billing_id")
        refund_amount = request.data.get("refund_amount")

        if billing_id is None or refund_amount is None:
            return Response({"error": "Missing required fields."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            billing_detail_object = BillingDetail.objects.get(id=billing_id)
        except BillingDetail.DoesNotExist:
            return Response({"error": "Billing record not found."}, status=status.HTTP_404_NOT_FOUND)

        # Convert refund_amount to Decimal for calculation
       
        refund_amount = Decimal(refund_amount)

        # Initialize refund_amount if it is None
        if billing_detail_object.refund_amount is None:
            billing_detail_object.refund_amount = Decimal('0.00')

        # Update refund details by summing the existing refund amount with the new one
        billing_detail_object.refund_amount += refund_amount

        # Determine if the booking is refundable
        if billing_detail_object.refund_amount > 0:
            billing_detail_object.is_Refundable = "Yes"
        else:
            billing_detail_object.is_Refundable = "No"

        billing_detail_object.save()
        

        return Response({"success": "Refund details updated successfully"}, status=status.HTTP_200_OK)
# End by akanksha on 07-02-2025
# Reason to store refund amount in the backend


'''
End of Code Addition by Tejasve Gupta on 30-08-2024
Reason - For Check-in Cancelation
'''

"""
Added by - Ashish Dewangan on 03-10-2024
Reason - Created CRUD APIs for handover model 
"""


class HandoverAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, tenant):
        try:
            filter_date = request.GET.get('date')  # Returns 'value1'

            if request.user.is_superuser:
                if filter_date:
                    # Modified by - Ashish Dewangan on 10-10-2024
                    # Reason - to return latest handovers first
                    # handovers = Handover.objects.filter(
                    #     created_at__date=filter_date)
                    handovers = Handover.objects.filter(
                        created_at__date=filter_date).order_by("-id")
                    # End of modification by - Ashish Dewangan on 10-10-2024
                    # Reason - to return latest handovers first
                else:
                    # Modified by - Ashish Dewangan on 10-10-2024
                    # Reason - to return latest handovers first
                    # handovers = Handover.objects.all()
                    handovers = Handover.objects.all().order_by("-id")
                    # End of modification by - Ashish Dewangan on 10-10-2024
                    # Reason - to return latest handovers first
            else:
                if filter_date:
                    # Modified by - Ashish Dewangan on 09-10-2024
                    # Reason - Added more filters
                    # handovers = Handover.objects.filter(
                    #  user=request.user, created_at__date=filter_date).order_by("id")
                    # Modified by - Ashish Dewangan on 10-10-2024
                    # Reason - to return latest handovers first
                    # handovers = Handover.objects.filter(
                    #     Q(Q(user=request.user) | Q(handover_to=request.user)), created_at__date=filter_date)
                    handovers = Handover.objects.filter(
                        Q(Q(user=request.user) | Q(handover_to=request.user)), created_at__date=filter_date).order_by("-id")
                    # End of modification by - Ashish Dewangan on 10-10-2024
                    # Reason - to return latest handovers first
                    # End of modification by - Ashish Dewangan on 09-10-2024
                    # Reason - Added more filters
                else:
                    # Modified by - Ashish Dewangan on 10-10-2024
                    # Reason - to return latest handovers first
                    # handovers = Handover.objects.filter(
                    #     user=request.user)
                    handovers = Handover.objects.filter(
                        user=request.user).order_by("-id")
                    # End of modification by - Ashish Dewangan on 10-10-2024
                    # Reason - to return latest handovers first

            # Modified by - Ashish Dewangan on 05-10-2024
            # Reason - To return amount summary(total payments received and to amount expensed) in response
            # serializer = HandoverSerializer(handovers, many=True)
            # return Response(serializer.data)
            handover_list = []
            for handover in handovers:
                
                total_amount_received = 0
                advanced_pay_amount = 0

                payment_receipts = PaymentReceipt.objects.filter(
                    user=handover.user, created_at__date=filter_date)
                
                for payment_receipt in payment_receipts:
                    if payment_receipt.payment_method == "Cash":
                        total_amount_received += payment_receipt.amount_paid
                        

                # Assuming you already have billing details or a way to filter them
                # billing_details = BillingDetail.objects.all()  # Or any filter if needed

                # for billing_detail in billing_details:
                #     if billing_detail.payment_method == "Cash":  # Check payment method
                #         if billing_detail.advanced_pay_amount:  # Check if there's an advanced payment
                #             print(f"Before adding: {advanced_pay_amount}")
                #             advanced_pay_amount += billing_detail.advanced_pay_amount
                #             print(f"After adding: {advanced_pay_amount}")
                #         else:
                #             print(f"No advanced_pay_amount for billing_id: {billing_detail.id}")
                #     else:
                #         print(f"Skipping billing_id {billing_detail.id} as payment method is not Cash.")

                billing_details = BillingDetail.objects.filter(
                    payment_method="Cash"  # Filter by Cash payments
                )

                
                # Loop through billing details to calculate advanced pay amount
                for billing in billing_details:
                    # Check if there's a matching PaymentReceipt by comparing billing.id and payment_receipt's related data
                    payment_receipt = PaymentReceipt.objects.filter(
                        billing_id=billing.id,  # Assuming we have a ForeignKey relationship or matching ID
                        user=handover.user,
                        created_at__date=filter_date,  # Matching the date from PaymentReceipt
                        payment_method="Cash"
                    ).first()  # Get the first matching payment receipt (if any)

                    # If we found a matching payment receipt and it's cash, add advanced pay amount
                    if payment_receipt:
                        advanced_pay_amount += billing.advanced_pay_amount or 0  # Ensure we don't add None





                expenses = ExpenseDetails.objects.filter(
                    user=handover.user, date=filter_date)
                total_amount_expensed = 0
                for expense in expenses:
                    if expense.payment_type == "Cash":
                        total_amount_expensed += expense.amount

                # Added by - Ashish Dewangan on 06-10-2024
                # Reason - Added refund amount in handover details
                billings = BillingDetail.objects.filter(
                    user_id_at_checkout=handover.user,
                    departure_date=filter_date,
                    is_Refundable="Yes",
                    payment_method="Cash",
                ).filter(Q(is_cancelled=True) | Q(is_cancelled=False))
                total_amount_refunded = 0
                for billing in billings:
                    total_amount_refunded += billing.refund_amount

                # End of addition by - Ashish Dewangan on 06-10-2024
                # Reason - Added refund amount in handover details

                handover_list.append(
                    {
                        "id": handover.id,
                        "handover_amount": handover.handover_amount,
                        "manager_remark": handover.manager_remark,
                        "admin_remark": handover.admin_remark,
                        "user": handover.user.id,
                        "user_email": handover.user.email,
                        "created_at": handover.created_at,
                        "updated_at": handover.updated_at,
                        "expensed_amount": total_amount_expensed,
                        "received_amount": total_amount_received,
                        "advance_payment": advanced_pay_amount,
                        # Added by - Ashish Dewangan on 06-10-2024
                        # Reason - Added refund amount in response
                        "refunded_amount": total_amount_refunded,
                        # End of addition by - Ashish Dewangan on 06-10-2024
                        # Reason - Added refund amount in response

                        # Added by - Ashish Dewangan on 07-10-2024
                        # Reason - Added handover_amount_received and handover_to in response
                        "handover_amount_received":handover.handover_amount_received,
                        "handover_to":handover.handover_to.id,
                        "handover_to_email": handover.handover_to.email,
                        # End of addition by - Ashish Dewangan on 07-10-2024
                        # Reason - Added handover_amount_received and handover_to in response

                        # Added by - Ashish Dewangan on 09-10-2024
                        # Reason - To return receiver_manager_remark field in the response
                        "receiver_manager_remark":handover.receiver_manager_remark,
                        # End of addition by - Ashish Dewangan on 09-10-2024
                        # Reason - To return receiver_manager_remark field in the response
                    }
                )

            return Response(handover_list)
            # Modified by - Ashish Dewangan on 05-10-2024
            # Reason - To return amount summary(total payments received and to amount expensed) in response
        except Exception as e:
            return Response({"error", "Something went wrong"}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, tenant):
        try:
            handover_data = {
                "handover_amount": request.data["handover_amount"],
                "manager_remark": request.data["manager_remark"],
                "admin_remark": request.data["admin_remark"],
                "user": request.user.id,
                # Added by - Ashish Dewangan on 07-10-2024
                # Reason - To save handover_amount_received and handover_to details
                "handover_amount_received":request.data["handover_amount_received"],
                "handover_to":request.data["handover_to"],
                # End of addition by - Ashish Dewangan on 07-10-2024
                # Reason - To save handover_amount_received and handover_to details

                # Added by - Ashish Dewangan on 09-10-2024
                # Reason - To save receiver_manager_remark field
                "receiver_manager_remark":request.data["receiver_manager_remark"],
                # End of addition by - Ashish Dewangan on 09-10-2024
                # Reason - To save receiver_manager_remark field
            }
            serializer = HandoverSerializer(data=handover_data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error", "Something went wrong"}, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, id, tenant):
        try:
            try:
                handover = Handover.objects.get(id=id)
            except Handover.DoesNotExist:
                return Response({'error': 'Handover not found'}, status=status.HTTP_404_NOT_FOUND)

            handover_data = {
                "handover_amount": request.data["handover_amount"],
                "manager_remark": request.data["manager_remark"],
                "admin_remark": request.data["admin_remark"],
                # Added by - Ashish Dewangan on 07-10-2024
                # Reason - To save handover_amount_received and handover_to details
                "handover_amount_received":request.data["handover_amount_received"],
                "handover_to":request.data["handover_to"],
                # End of addition by - Ashish Dewangan on 07-10-2024
                # Reason - To save handover_amount_received and handover_to details

                # Added by - Ashish Dewangan on 09-10-2024
                # Reason - To save receiver_manager_remark field
                "receiver_manager_remark":request.data["receiver_manager_remark"],
                # End of addition by - Ashish Dewangan on 09-10-2024
                # Reason - To save receiver_manager_remark field
            }

            serializer = HandoverSerializer(
                handover, data=handover_data, partial=True)

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error", "Something went wrong"}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, tenant, request, id):
        try:
            try:
                handover = Handover.objects.get(id=id)
            except Handover.DoesNotExist:
                return Response({'error': 'Handover not found'}, status=status.HTTP_404_NOT_FOUND)

            handover.delete()
            return Response({'message': 'Handover deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error", "Something went wrong"}, status=status.HTTP_400_BAD_REQUEST)


"""
End of addition by - Ashish Dewangan on 03-10-2024
Reason - Created CRUD APIs for handover model 
"""
# class BalanceSheetAPIView(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         try:
#             filter_date = request.GET.get('date')

#             if not filter_date:
#                 return Response({"error": "Date parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

#             # Filter by date
#             balance_sheets = BalanceSheet.objects.filter(date=filter_date).order_by("-id")

#             balance_list = []

#             total_amount_sum = 0
#             amount_received_sum = 0
#             amount_giver_sum = 0
#             closing_balance = 0 
#             opening_balance = 0
#             # previous_day = (datetime.strptime(filter_date, "%Y-%m-%d") - timedelta(days=1)).strftime("%Y-%m-%d")
#             # previous_day_balance = BalanceSheet.objects.filter(date=previous_day).last()

#             # if previous_day_balance:
#             #     # Sum the total_amount and amount_received for the previous day
#             #     prev_total_amount = sum([balance.total_amount or 0 for balance in previous_day_balance])
#             #     prev_amount_received = sum([balance.amount_received or 0 for balance in previous_day_balance])
#             #     closing_balance = prev_total_amount - prev_amount_received



#             for balance in balance_sheets:
#                 balance_list.append({
#                     "id": balance.id,
#                     "user": balance.user.email if balance.user else None,
#                     "total_amount": balance.total_amount,
#                     "amount_received": balance.amount_received,
#                     "mode": balance.mode,
#                     "given_by": balance.given_by,
#                     "date": balance.date,
#                     "time": balance.time,
#                     "purpose": balance.purpose,
#                     "admin_remark": balance.admin_remark,
#                     "sender": balance.sender,
#                 })

#                 # Calculate sums based on sender type
#                 if balance.sender == "receiver":
#                     amount_received_sum += balance.amount_received or 0
#                 # elif balance.sender == "giver":
#                 #     amount_received_sum -= balance.amount_received or 0
                
#                 if balance.sender == "giver":
#                     amount_giver_sum += balance.amount_received or 0

#                 total_amount_sum += balance.total_amount or 0
                
#                 closing_balance = amount_received_sum - amount_giver_sum 

                
            
#             opening_balance = amount_received_sum - closing_balance or 0
                
#             # Add the closing balance from the previous day to the total_amount_sum
#             # total_amount_sum += closing_balance

#             # Calculate the closing balance for today
#             # closing_balance = total_amount_sum - amount_received_sum

#             return Response({
#                 "balances": balance_list,
#                 "opening_balance": opening_balance,
#                 "total_amount_sum": total_amount_sum,
#                 "amount_received_sum": amount_received_sum,
#                 "amount_giver_sum": amount_giver_sum,
#                 "closing_balance": closing_balance
#             }, status=status.HTTP_200_OK)

#         except Exception as e:
#             return Response({"error": "Something went wrong"}, status=status.HTTP_400_BAD_REQUEST)
from datetime import datetime, timedelta
from collections import defaultdict

class BalanceSheetAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, tenant):
        try:
            filter_date_str = request.GET.get('date')
            if not filter_date_str:
                return Response({"error": "Date parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

            filter_date = datetime.strptime(filter_date_str, "%Y-%m-%d").date()

            # Get all balance entries up to the requested date
            all_balances = BalanceSheet.objects.filter(date__lte=filter_date).order_by('date')

            # Dictionary to hold per-day received/given
            daily_data = defaultdict(lambda: {"received": 0, "given": 0})

            for balance in all_balances:
                if balance.sender == "receiver":
                    daily_data[balance.date]["received"] += balance.amount_received or 0
                elif balance.sender == "giver":
                    daily_data[balance.date]["given"] += balance.amount_received or 0

            # # Calculate balances per day and carry forward
            # previous_closing = 0
            # for date in sorted(daily_data.keys()):
            #     if date < filter_date:
            #         day_data = daily_data[date]
            #         previous_closing = previous_closing + day_data["received"] - day_data["given"]
                    
            #     elif date == filter_date:
            #         break

            # opening_balance = previous_closing

            # # Today's data
            # today_data = daily_data.get(filter_date, {"received": 0, "given": 0})
            # amount_received_sum = today_data["received"]
            # amount_giver_sum = today_data["given"]
            # total_amount_received_sum = amount_received_sum + previous_closing or 0
            # closing_balance = total_amount_received_sum - amount_giver_sum

            # Step 1: Calculate previous closing balance (before filter_date)
            previous_closing = 0
            for date in sorted(daily_data.keys()):
                if date < filter_date:
                    day_data = daily_data[date]
                    previous_closing += day_data.get("received", 0) - day_data.get("given", 0)
                elif date == filter_date:
                    break

            # Step 2: Get today's data
            today_data = daily_data.get(filter_date, {"received": 0, "given": 0})
            amount_received_sum = today_data.get("received", 0)
            amount_giver_sum = today_data.get("given", 0)

            # Step 3: Calculate opening and closing balance
            opening_balance = previous_closing
            total_amount_received_sum = opening_balance + amount_received_sum
            closing_balance = total_amount_received_sum - amount_giver_sum

            # Step 4: Set closing_balance as updated previous_closing
            previous_closing = closing_balance

            

            # Get today's balance records
            balance_sheets = BalanceSheet.objects.filter(date=filter_date).order_by("-id")

            balance_list = []
            total_amount_sum = 0

            for balance in balance_sheets:
                balance_list.append({
                    "id": balance.id,
                    "user": balance.user.email if balance.user else None,
                    "total_amount": balance.total_amount,
                    "amount_received": balance.amount_received,
                    "mode": balance.mode,
                    "given_by": balance.given_by,
                    "date": balance.date,
                    "time": balance.time,
                    "purpose": balance.purpose,
                    "admin_remark": balance.admin_remark,
                    "sender": balance.sender,
                })
                total_amount_sum += balance.total_amount or 0

            return Response({
                "balances": balance_list,
                "total_amount_sum": total_amount_sum,
                "amount_received_sum": amount_received_sum,
                "amount_giver_sum": amount_giver_sum,
                "total_amount_received_sum": total_amount_received_sum,
                "opening_balance": opening_balance,
                "closing_balance": closing_balance,
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # def post(self, request):
    #     try:
    #         # print("ddddddddddddddddddddddddddddddddddddddddd", self)
    #         # print("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",  request.data)
    #         balance_data = {
    #             # "user": request.data.get("user"),
    #             "total_amount": request.data.get("total_amount"),
    #             "amount_received": request.data.get("amount_received"),
    #             "mode": request.data.get("mode"),
    #             "given_by": request.data.get("given_by"),
    #             "date": request.data.get("date"),
    #             "time": request.data.get("time"),
    #             "purpose": request.data.get("purpose"),
    #             "admin_remark": request.data.get("admin_remark"),
    #             "sender": request.data.get("sender"),
    #             "expense_type": request.data.get("expense_type"),
    #             "expense_name": request.data.get("expense_name"),
    #             "expense_quantity": request.data.get("expense_quantity"),
    #         }

    #         serializer = BalanceSheetSerializer(data=balance_data)
    #         if serializer.is_valid():
    #             serializer.save(user=request.user)
    #             return Response(serializer.data, status=status.HTTP_201_CREATED)
    #         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    #     except Exception as e:
    #         return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, tenant):
        try:
            # Prepare balance data
            balance_data = {
                "total_amount": request.data.get("total_amount"),
                "amount_received": request.data.get("amount_received"),
                "mode": request.data.get("mode"),
                "given_by": request.data.get("given_by"),
                "date": request.data.get("date"),
                "time": request.data.get("time"),
                "purpose": request.data.get("purpose"),
                "admin_remark": request.data.get("admin_remark"),
                "sender": request.data.get("sender"),
                "expense_type": request.data.get("expense_type"),
                "expense_name": request.data.get("expense_name"),
                "expense_quantity": request.data.get("expense_quantity"),
            }

            # Save BalanceSheet data
            serializer = BalanceSheetSerializer(data=balance_data)
            if serializer.is_valid():
                balance_instance = serializer.save(user=request.user)

                # Prepare and save ExpenseDetails data
                if request.data.get("sender") == "giver":
                    expense_data = {
                        "amount": request.data.get("amount_received"),
                        "date": request.data.get("date"),
                        "time": request.data.get("time"),
                        "paid_to": request.data.get("given_by"),
                        "paid_by": request.user.email,
                        "expense_type": request.data.get("expense_type"),
                        "name": request.data.get("expense_name"),
                        "quantity": request.data.get("expense_quantity"),
                        "payment_type": request.data.get("mode"),
                        "description": request.data.get("purpose"),
                        "user": request.user.id,
                    }

                expense_serializer = ExpenseDetailsSerializer(data=expense_data)
                if expense_serializer.is_valid():
                    expense_serializer.save()
                else:
                    # Log or handle the expense save failure (optional)
                    print("Expense save failed:", expense_serializer.errors)

                return Response(serializer.data, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, id, tenant):
        try:
            try:
                balance = BalanceSheet.objects.get(id=id)
            except BalanceSheet.DoesNotExist:
                return Response({"error": "Balance Sheet not found"}, status=status.HTTP_404_NOT_FOUND)

            balance_data = {
                "user": request.user.id,
                "total_amount": request.data.get("total_amount"),
                "amount_received": request.data.get("amount_received"),
                "mode": request.data.get("mode"),
                "given_by": request.data.get("given_by"),
                "date": request.data.get("date"),
                "time": request.data.get("time"),
                "purpose": request.data.get("purpose"),
                "admin_remark": request.data.get("admin_remark"),
                "sender": request.data.get("sender"),
            }

            serializer = BalanceSheetSerializer(balance, data=balance_data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": "Something went wrong"}, status=status.HTTP_400_BAD_REQUEST)



class RoomTypeAPIView(APIView):
    def get(self, request, tenant):
        room_type = RoomType.objects.all()
        serializer = RoomTypeSerializer(room_type, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, tenant):
        serializer = RoomTypeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class RoomVarietyAPIView(APIView):
    def get(self, request, tenant):
        room_variety = RoomVariety.objects.all()
        serializer = RoomVarietySerializer(room_variety, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, tenant):
        serializer = RoomVarietySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
  
class AmenityAPIView(APIView):
    def get(self, request, tenant):
        name = Amenity.objects.all()
        serializer = AmenitySerializer(name, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, tenant):
        serializer = AmenitySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  
    
    # def put(self, request, tenant, id):
    #     try:
    #         amenity = Amenity.objects.get(id=id)
    #     except Amenity.DoesNotExist:
    #         return Response({"error": "Amenity not found."}, status=status.HTTP_404_NOT_FOUND)

    #     serializer = AmenitySerializer(amenity, data=request.data, partial=True)
    #     if serializer.is_valid():
    #         serializer.save()
    #         return Response(serializer.data, status=status.HTTP_200_OK)
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, tenant, id):
        try:
            amenity_room = AmenityRoom.objects.get(id=id)
        except AmenityRoom.DoesNotExist:
            return Response({"error": "AmenityRoom not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = AmenityRoomSerializer(amenity_room, data=request.data, partial=True)
        if serializer.is_valid():
            # Manually update the related fields if room or amenity name is provided
            validated_data = serializer.validated_data

            if 'room' in request.data:
                try:
                    room = RoomDetail.objects.get(number=request.data['room'])
                    amenity_room.room_id = room
                except RoomDetail.DoesNotExist:
                    return Response({"room": "Room not found."}, status=status.HTTP_400_BAD_REQUEST)

            if 'amenity' in request.data:
                try:
                    amenity = AmenityPublic.objects.get(amenity_name=request.data['amenity'])
                    amenity_room.amenity_id = amenity
                except AmenityPublic.DoesNotExist:
                    return Response({"amenity": "Amenity not found."}, status=status.HTTP_400_BAD_REQUEST)

            amenity_room.save()
            return Response(AmenityRoomSerializer(amenity_room).data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    # DELETE: Remove an existing amenity
    def delete(self, request, tenant, id):
        try:
            amenity_room = AmenityRoom.objects.get(id=id)
            amenity_room.delete()
            return Response({"message": "AmenityRoom deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except AmenityRoom.DoesNotExist:
            return Response({"error": "AmenityRoom not found."}, status=status.HTTP_404_NOT_FOUND)
    
class AmenityRoomAPIView(APIView):
    def get(self, request, tenant):
        name = AmenityRoom.objects.all()
        serializer = AmenityRoomSerializer(name, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    # def post(self, request, tenant):
    #     serializer = AmenityRoomSerializer(data=request.data)
    #     if serializer.is_valid():
    #         serializer.save()
    #         return Response(serializer.data, status=status.HTTP_201_CREATED)
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def post(self, request, *args, **kwargs):
        serializer = AmenityRoomCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Amenities added to room successfully."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, tenant, id):
        try:
            amenity = AmenityRoom.objects.get(id=id)
        except AmenityRoom.DoesNotExist:
            return Response({"error": "Amenity not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = AmenityRoomSerializer(amenity, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # DELETE: Remove an existing amenity
    def delete(self, request, tenant, id):
        try:
            amenity = AmenityRoom.objects.get(id=id)
            amenity.delete()
            return Response({"message": "Amenity deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except Amenity.DoesNotExist:
            return Response({"error": "Amenity not found."}, status=status.HTTP_404_NOT_FOUND)
        
        
class RoomDetailAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, tenant, room_id):
        try:
            room = RoomDetail.objects.get(id=room_id, is_active=True)
            data = RoomDetailSerializer(room).data
            data['images'] = [{'id': img.id, 'image': img.image.url} for img in RoomImage.objects.filter(room=room, image__isnull=False)]
            
            # Add basic room info in the response
            response_data = {
                'room_id': room.id,
                'room_type': room.room_type,
                'room_detail': data,
            }
            return Response(response_data)
        except RoomDetail.DoesNotExist:
            return Response({'error': 'Room not found'}, status=404)


class FilterAmenityRoomAPIView(APIView):
    def get(self, request, tenant):
        amenity_name = request.query_params.get('amenity_name', None)

        if amenity_name:
            amenity_rooms = AmenityRoom.objects.filter(amenity_id__name__iexact=amenity_name)
        else:
            amenity_rooms = AmenityRoom.objects.all()

        serializer = AmenityRoomSerializer(amenity_rooms, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class HottelAmenityView(APIView):
    def get(self, request, tenant):
        name = HotelAmenity.objects.all()
        serializer = HotelAmenitySerializer(name, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    # def post(self, request, tenant):
    #     serializer = HotelAmenitySerializer(data=request.data)
    #     if serializer.is_valid():
    #         serializer.save()
    #         return Response(serializer.data, status=status.HTTP_201_CREATED)
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # def post(self, request, tenant):
    #     serializer = HotelAmenitySerializer(data=request.data)
    #     if serializer.is_valid():
    #         serializer.save()

    #         all_amenities = HotelAmenity.objects.all()
    #         all_serializer = HotelAmenitySerializer(all_amenities, many=True)

    #         return Response({
    #             "message": "Amenity added successfully.",
    #             "data": all_serializer.data
    #         }, status=status.HTTP_201_CREATED)

    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # def post(self, request, tenant):
    #     hotel_id = request.data.get('hotel')  # Expecting hotel ID in request
    #     try:
    #         hotel = Setting.objects.get(id=hotel_id)
    #     except Setting.DoesNotExist:
    #         return Response({"error": "Invalid hotel ID"}, status=status.HTTP_400_BAD_REQUEST)

    #     serializer = HotelAmenitySerializer(data=request.data)
    #     if serializer.is_valid():
    #         serializer.save(hotel=hotel)  # Link to hotel

    #         # Return all amenities of that hotel
    #         all_amenities = HotelAmenity.objects.filter(hotel=hotel)
    #         all_serializer = HotelAmenitySerializer(all_amenities, many=True)

    #         return Response({
    #             "message": "Amenity added successfully.",
    #             "data": all_serializer.data
    #         }, status=status.HTTP_201_CREATED)

    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def post(self, request, tenant):
        hotel_id = (
            request.data[0].get('hotel') if isinstance(request.data, list)
            else request.data.get('hotel')
        )

        try:
            hotel = Setting.objects.get(id=hotel_id)
        except Setting.DoesNotExist:
            return Response({"error": "Invalid hotel ID"}, status=status.HTTP_400_BAD_REQUEST)

        # We expect a list of objects
        serializer = HotelAmenitySerializer(data=request.data, many=True)

        if serializer.is_valid():
            serializer.save()

            all_amenities = HotelAmenity.objects.filter(hotel=hotel)
            all_serializer = HotelAmenitySerializer(all_amenities, many=True)

            return Response({
                "message": "Amenity/amenities added successfully.",
                "data": all_serializer.data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class HotelAmenityMultipleView(APIView):
    def post(self, request, tenant):
        serializer = HotelAmenityMultipleSerializer(data=request.data)
        if serializer.is_valid():
            amenities = serializer.save()
            return Response({"message": f"{len(amenities)} amenities added to hotel."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def get(self, request, tenant):
        amenities = HotelAmenity.objects.all()
        serializer = HotelAmenityReadSerializer(amenities, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class RoomFilterAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    room_list = {}
    
    def get(self, request, *args, **kwargs):
        adults_param = request.query_params.get('adults')
        children_param = request.query_params.get('children')
        rooms_param = request.query_params.get('rooms')

        room_types = [
            {"value": rt.id, "label": rt.room_type}
            for rt in RoomType.objects.all()
        ]
        variety = [
            {"value": rv.id, "label": rv.room_variety}
            for rv in RoomVariety.objects.all()
        ]

        room_queryset = RoomDetail.objects.filter(is_active=True)


        if not adults_param and not children_param and not rooms_param:
            all_rooms = room_queryset.order_by("number")
            serialized_rooms = RoomDetailSerializer(all_rooms, many=True)

            return Response({
                'room_types': room_types,
                'variety': variety,
                'room_list': serialized_rooms.data,
                'message': ''
            })

        try:
            adults = int(adults_param or 0)
            children = int(children_param or 0)
            rooms_requested = int(rooms_param or 1)
        except ValueError:
            return Response({'error': 'Invalid query parameters.'}, status=400)

        total_persons = adults + children

        # Convert queryset to list here for combinations
        available_rooms = list(room_queryset.order_by('-number_of_persons'))

        suitable_combinations = []
        for combo in combinations(available_rooms, rooms_requested):
            total_capacity = sum([room.number_of_persons or 0 for room in combo])
            if total_capacity >= total_persons:
                suitable_combinations.append(combo)

        selected_rooms = suitable_combinations[0] if suitable_combinations else []

        serialized_filtered = RoomDetailSerializer(selected_rooms, many=True)

        return Response({
            'room_types': room_types,
            'variety': variety,
            'room_list': serialized_filtered.data,
            'message': 'No rooms available for the selected configuration.' if not selected_rooms else ''
        })
        
class UserBookingAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, tenant, user_id=None):
        # If no user_id param, default to logged in user
        user = get_object_or_404(User, id=user_id or request.user.id)
        serializer = UserSerializerss(user)
        return Response(serializer.data)