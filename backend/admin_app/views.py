from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from rest_framework import status
from .models import *
from .serializers import *
from django.contrib.auth.hashers import make_password, check_password
from itertools import combinations

from tenant_app.serializers import *


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

class AmenityListView(APIView):
    def get(self, request):
        amenities = AmenityPublic.objects.all()
        serializer = AmenityPublicSerializer(amenities, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
from django.http import JsonResponse
from tenant_schemas.utils import get_tenant_model, schema_context
from tenant_app.serializers import RoomDetailSerializer


def city_based_room_filter(request):
    city = request.GET.get("city")
    TenantModel = get_tenant_model()
    
    all_rooms = []

    for tenant in TenantModel.objects.exclude(schema_name='public'):
        with schema_context(tenant.schema_name):
            from tenant_app.models import RoomDetail  # Import inside context
            
            rooms = RoomDetail.objects.filter(setting__city__iexact=city)  # case-insensitive match
            
            print(f"Tenant: {tenant.schema_name}, City filter: {city}")
            print(f"Rooms found: {rooms.count()}")
            
            for room in rooms:
                print(f"Room number: {room.number}, City: {room.setting.city if room.setting else 'No setting'}")
                all_rooms.append({
                    'tenant': tenant.schema_name,
                    'room_number': room.number,
                    'city': room.setting.city if room.setting else None,
                    # add other fields as needed
                })

    return JsonResponse({"rooms": all_rooms})


# class HotelAmenityView(APIView):
#     def get(self, request):
#         TenantModel = get_tenant_model()
#         amenity_name_filter = request.GET.get("amenity_name", "").strip().lower()
#         all_amenities = []

#         for tenant in TenantModel.objects.exclude(schema_name='public'):
#             with schema_context(tenant.schema_name):
#                 try:
#                     from tenant_app.models import HotelAmenity
#                     amenities = HotelAmenity.objects.all()

#                     for amenity in amenities:
#                         if not amenity_name_filter or amenity.amenity_name.strip().lower() == amenity_name_filter:
#                             all_amenities.append({
#                                 'tenant': tenant.schema_name,
#                                 'id': amenity.id,
#                                 'amenity_name': amenity.amenity_name,
#                             })
#                 except Exception as e:
#                     print(f"Error fetching amenities for tenant {tenant.schema_name}: {e}")

#         return Response({"amenities": all_amenities}, status=status.HTTP_200_OK)
# class HotelAmenityView(APIView):
#     def get(self, request):
#         TenantModel = get_tenant_model()
#         amenity_name_filter = request.GET.get("amenity_name", "").strip().lower()
#         all_amenities = []

#         for tenant in TenantModel.objects.exclude(schema_name='public'):
#             with schema_context(tenant.schema_name):
#                 try:
#                     from tenant_app.models import HotelAmenity, AmenityRoom, RoomDetail, AmenityPublic
                    
#                     amenities = HotelAmenity.objects.all()
#                     for amenity in amenities:
#                         if amenity_name_filter and amenity.amenity_name.strip().lower() != amenity_name_filter:
#                             continue

#                         # Match with AmenityPublic
#                         public_amenity = AmenityPublic.objects.filter(amenity_name__iexact=amenity.amenity_name).first()
#                         if not public_amenity:
#                             continue

#                         # Fetch related rooms from AmenityRoom
#                         related_rooms = AmenityRoom.objects.filter(amenity_id=public_amenity)
#                         room_data = []
#                         for relation in related_rooms:
#                             room = relation.room_id
#                             room_data.append({
#                                 "room_number": room.number,
#                                 "room_type": room.room_type,
#                                 "variety": room.variety,
#                                 "price": str(room.price),
#                                 "room_description": room.room_description,
#                                 "number_of_persons": room.number_of_persons,
#                                 "image": request.build_absolute_uri(room.image.url) if room.image else None
#                             })

#                         all_amenities.append({
#                             'tenant': tenant.schema_name,
#                             'id': amenity.id,
#                             'amenity_name': amenity.amenity_name,
#                             'rooms': room_data,
#                         })
#                 except Exception as e:
#                     print(f"Error fetching amenities for tenant {tenant.schema_name}: {e}")

#         return Response({"amenities": all_amenities}, status=status.HTTP_200_OK)


# class HotelAmenityView(APIView):
#     def get(self, request):
#         TenantModel = get_tenant_model()
#         amenity_name = request.GET.get("amenity_name", "").strip()
#         if not amenity_name:
#             return Response({"error": "amenity_name parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

#         all_amenities = []

#         for tenant in TenantModel.objects.exclude(schema_name='public'):
#             with schema_context(tenant.schema_name):
#                 try:
#                     from tenant_app.models import HotelAmenity

#                     amenities = HotelAmenity.objects.filter(amenity_name__iexact=amenity_name)
#                     serializer = HotelAmenitySerializer(amenities, many=True, context={'request': request})
#                     # Add tenant info per amenity (optional)
#                     for amenity_data in serializer.data:
#                         amenity_data['tenant'] = tenant.schema_name
#                         all_amenities.append(amenity_data)

#                 except Exception as e:
#                     print(f"Error fetching amenities for tenant {tenant.schema_name}: {e}")

#         return Response({"amenities": all_amenities}, status=status.HTTP_200_OK)
class HotelAmenityView(APIView):
    def get(self, request):
        TenantModel = get_tenant_model()
        amenity_name = request.GET.get("amenity_name", "").strip()

        if not amenity_name:
            return Response({"error": "amenity_name parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Step 1: Get AmenityPublic object from the public schema
        from admin_app.models import AmenityPublic
        amenity_public = AmenityPublic.objects.filter(amenity_name__iexact=amenity_name).first()

        if not amenity_public:
            return Response({"error": f"Amenity '{amenity_name}' not found in public schema"}, status=404)

        amenity_public_id = amenity_public.id
        all_amenities = []

        # Step 2: Loop through all tenants and get HotelAmenity objects pointing to this AmenityPublic
        for tenant in TenantModel.objects.exclude(schema_name='public'):
            with schema_context(tenant.schema_name):
                try:
                    from tenant_app.models import HotelAmenity

                    amenities = HotelAmenity.objects.filter(amenity_name_id=amenity_public_id)
                    serializer = HotelAmenitySerializer(amenities, many=True, context={'request': request})

                    for amenity_data in serializer.data:
                        amenity_data['tenant'] = tenant.schema_name
                        all_amenities.append(amenity_data)

                except Exception as e:
                    print(f"Error in tenant {tenant.schema_name}: {e}")

        return Response({"amenities": all_amenities}, status=status.HTTP_200_OK)


# class RoomFilterAPIView(APIView):
#     def get(self, request, *args, **kwargs):
#         TenantModel = get_tenant_model()

#         adults_param = request.query_params.get('adults')
#         children_param = request.query_params.get('children')
#         rooms_param = request.query_params.get('rooms')

#         try:
#             adults = int(adults_param or 0)
#             children = int(children_param or 0)
#             rooms_requested = int(rooms_param or 1)
#         except ValueError:
#             return Response({'error': 'Invalid query parameters.'}, status=status.HTTP_400_BAD_REQUEST)

#         total_persons = adults + children

#         all_room_types = []
#         all_varieties = []
#         all_selected_rooms = []

#         for tenant in TenantModel.objects.exclude(schema_name='public'):
#             with schema_context(tenant.schema_name):
#                 try:
#                     from tenant_app.models import RoomType, RoomVariety, RoomDetail

#                     room_types = [
#                         {"value": rt.id, "label": rt.room_type, "tenant": tenant.schema_name}
#                         for rt in RoomType.objects.all()
#                     ]
#                     varieties = [
#                         {"value": rv.id, "label": rv.room_variety, "tenant": tenant.schema_name}
#                         for rv in RoomVariety.objects.all()
#                     ]

#                     all_room_types.extend(room_types)
#                     all_varieties.extend(varieties)

#                     # room_queryset = RoomDetail.objects.filter(is_active=True).order_by('-number_of_persons')
#                     room_queryset = RoomDetail.objects.filter(is_active=True, number_of_persons__isnull=False).order_by('-number_of_persons')
#                     available_rooms = list(room_queryset)

#                     suitable_combinations = []
#                     for combo in combinations(available_rooms, rooms_requested):
#                         total_capacity = sum([room.number_of_persons or 0 for room in combo])
#                         if total_capacity >= total_persons:
#                             suitable_combinations.append(combo)

#                     selected_rooms = suitable_combinations[0] if suitable_combinations else []
#                     serialized = RoomDetailSerializer(selected_rooms, many=True, context={'request': request})

#                     for room in serialized.data:
#                         room["tenant"] = tenant.schema_name
#                         all_selected_rooms.append(room)

#                 except Exception as e:
#                     print(f"Error in tenant {tenant.schema_name}: {e}")

#         return Response({
#             "room_types": all_room_types,
#             "variety": all_varieties,
#             "room_list": all_selected_rooms,
#             "message": "No rooms available for the selected configuration." if not all_selected_rooms else ""
#         })


# class RoomFilterAPIView(APIView):
#     def get(self, request, *args, **kwargs):
#         TenantModel = get_tenant_model()

#         adults_param = request.query_params.get('adults')
#         children_param = request.query_params.get('children')
#         rooms_param = request.query_params.get('rooms')

#         try:
#             adults = int(adults_param or 0)
#             children = int(children_param or 0)
#             rooms_requested = int(rooms_param or 1)
#         except ValueError:
#             return Response({'error': 'Invalid query parameters.'}, status=status.HTTP_400_BAD_REQUEST)

#         total_persons = adults + children

#         all_room_types = []
#         all_varieties = []
#         all_hotels = []

#         for tenant in TenantModel.objects.exclude(schema_name='public'):
#             with schema_context(tenant.schema_name):
#                 try:
#                     from tenant_app.models import RoomType, RoomVariety, RoomDetail

#                     # Aggregate room types and varieties
#                     room_types = [
#                         {"value": rt.id, "label": rt.room_type, "tenant": tenant.schema_name}
#                         for rt in RoomType.objects.all()
#                     ]
#                     varieties = [
#                         {"value": rv.id, "label": rv.room_variety, "tenant": tenant.schema_name}
#                         for rv in RoomVariety.objects.all()
#                     ]

#                     all_room_types.extend(room_types)
#                     all_varieties.extend(varieties)

#                     room_queryset = RoomDetail.objects.filter(is_active=True, number_of_persons__isnull=False).order_by('-number_of_persons')
#                     available_rooms = list(room_queryset)

#                     suitable_combinations = []
#                     for combo in combinations(available_rooms, rooms_requested):
#                         total_capacity = sum([room.number_of_persons or 0 for room in combo])
#                         if total_capacity >= total_persons:
#                             suitable_combinations.append(combo)

#                     selected_rooms = suitable_combinations[0] if suitable_combinations else []

#                     serialized_rooms = RoomDetailSerializer(selected_rooms, many=True, context={'request': request})

#                     # Get hotel name for grouping from any room's setting.hotel_name
#                     hotel_name = None
#                     if selected_rooms:
#                         first_room = selected_rooms[0]
#                         if first_room.setting:
#                             hotel_name = first_room.setting.hotel_name
#                     if not hotel_name:
#                         hotel_name = tenant.schema_name

#                     # Add tenant and hotel_name at hotel level, rooms as list
#                     hotel_dict = {
#                         "tenant": tenant.schema_name,
#                         "hotel_name": hotel_name,
#                         "rooms": serialized_rooms.data,
#                     }
#                     all_hotels.append(hotel_dict)

#                 except Exception as e:
#                     print(f"Error in tenant {tenant.schema_name}: {e}")

#         return Response({
#             "room_types": all_room_types,
#             "variety": all_varieties,
#             "hotels": all_hotels,
#             "message": "No rooms available for the selected configuration." if not all_hotels else ""
#         })


from tenant_app.serializers import RoomDetailSerializer  # Make sure this import is correct

class RoomFilterAPIView(APIView):
    def get(self, request, *args, **kwargs):
        TenantModel = get_tenant_model()

        city_param = request.query_params.get('city')
        adults_param = request.query_params.get('adults')
        children_param = request.query_params.get('children')
        rooms_param = request.query_params.get('rooms')

        try:
            adults = int(adults_param or 0)
            children = int(children_param or 0)
            rooms_requested = int(rooms_param or 1)
        except ValueError:
            return Response({'error': 'Invalid query parameters.'}, status=status.HTTP_400_BAD_REQUEST)

        total_persons = adults + children

        all_room_types = []
        all_varieties = []
        all_hotels = []

        for tenant in TenantModel.objects.exclude(schema_name='public'):
            with schema_context(tenant.schema_name):
                try:
                    from tenant_app.models import RoomType, RoomVariety, RoomDetail

                    # Aggregate room types and varieties
                    room_types = [
                        {"value": rt.id, "label": rt.room_type, "tenant": tenant.schema_name}
                        for rt in RoomType.objects.all()
                    ]
                    varieties = [
                        {"value": rv.id, "label": rv.room_variety, "tenant": tenant.schema_name}
                        for rv in RoomVariety.objects.all()
                    ]

                    all_room_types.extend(room_types)
                    all_varieties.extend(varieties)

                    room_queryset = RoomDetail.objects.filter(
                        is_active=True,
                        number_of_persons__isnull=False
                    ).order_by('-number_of_persons')
                    
                    if city_param:
                        room_queryset = room_queryset.filter(
                            setting__city__iexact=city_param
                        )

                    available_rooms = list(room_queryset)

                    suitable_combinations = []
                    for combo in combinations(available_rooms, rooms_requested):
                        # Only consider combinations with exactly requested number of rooms
                        if len(combo) != rooms_requested:
                            continue

                        total_capacity = sum([room.number_of_persons or 0 for room in combo])
                        if total_capacity >= total_persons:
                            suitable_combinations.append(combo)

                    selected_rooms = list(suitable_combinations[0]) if suitable_combinations else []

                    serialized_rooms = RoomDetailSerializer(
                        selected_rooms, many=True, context={'request': request}
                    )

                    # Get hotel name from room setting
                    hotel_name = None
                    if selected_rooms:
                        first_room = selected_rooms[0]
                        if first_room.setting:
                            hotel_name = first_room.setting.hotel_name
                    if not hotel_name:
                        hotel_name = tenant.schema_name

                    hotel_dict = {
                        "tenant": tenant.schema_name,
                        "hotel_name": hotel_name,
                        "rooms": serialized_rooms.data,
                    }
                    if selected_rooms:
                        all_hotels.append(hotel_dict)

                except Exception as e:
                    print(f"Error in tenant {tenant.schema_name}: {e}")

        return Response({
            "room_types": all_room_types,
            "variety": all_varieties,
            "hotels": all_hotels,
            "message": "No rooms available for the selected configuration." if not all_hotels else ""
        })


class RoomDetailAPIView(APIView):
    def get(self, request, room_id):
        TenantModel = get_tenant_model()
        tenants = TenantModel.objects.exclude(schema_name='public')

        for tenant in tenants:
            with schema_context(tenant.schema_name):
                try:
                    from tenant_app.models import RoomDetail, RoomImage
                    from tenant_app.serializers import RoomDetailSerializer

                    room = RoomDetail.objects.get(id=room_id, is_active=True)

                    data = RoomDetailSerializer(room, context={'request': request}).data

                    images = [
                        {'id': img.id, 'image': img.image.url}
                        for img in RoomImage.objects.filter(room=room, image__isnull=False)
                    ]

                    hotel_name = room.setting.hotel_name if room.setting else tenant.schema_name

                    return Response({
                        "tenant": tenant.schema_name,
                        "hotel_name": hotel_name,
                        "room_id": room.id,
                        "room_type": room.room_type,
                        "room_detail": data,
                        "images": images,
                    })

                except RoomDetail.DoesNotExist:
                    continue  # Try next tenant
                except Exception as e:
                    return Response({'error': f'Unexpected error in tenant {tenant.schema_name}: {str(e)}'},
                                    status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'error': 'Room not found in any tenant'}, status=status.HTTP_404_NOT_FOUND)


class RoomPriceFilterAPIView(APIView):
    def get(self, request, *args, **kwargs):
        TenantModel = get_tenant_model()

        min_price_param = request.query_params.get('min_price')
        max_price_param = request.query_params.get('max_price')

        try:
            min_price = int(min_price_param or 0)
            max_price = int(max_price_param or 1000000)
        except ValueError:
            return Response({'error': 'Invalid price range parameters.'}, status=status.HTTP_400_BAD_REQUEST)

        all_filtered_rooms = []

        for tenant in TenantModel.objects.exclude(schema_name='public'):
            with schema_context(tenant.schema_name):
                try:
                    from tenant_app.models import RoomDetail  # adjust if in different app

                    room_queryset = RoomDetail.objects.filter(
                        is_active=True,
                        price__gte=min_price,
                        price__lte=max_price
                    )

                    if not room_queryset.exists():
                        continue

                    serialized_rooms = RoomDetailSerializer(
                        room_queryset, many=True, context={'request': request}
                    )

                    # Get hotel name
                    hotel_name = tenant.schema_name
                    first_room = room_queryset.first()
                    if first_room and first_room.setting:
                        hotel_name = first_room.setting.hotel_name

                    all_filtered_rooms.append({
                        "tenant": tenant.schema_name,
                        "hotel_name": hotel_name,
                        "rooms": serialized_rooms.data
                    })

                except Exception as e:
                    print(f"Error in tenant {tenant.schema_name}: {e}")

        return Response({
            "filtered_hotels": all_filtered_rooms,
            "message": "No rooms found within the selected price range." if not all_filtered_rooms else ""
        })
