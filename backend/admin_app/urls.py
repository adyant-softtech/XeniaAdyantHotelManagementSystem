

from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from .views import *

urlpatterns = [

    path('tenants/', TenantAPIView.as_view()),

    path('tenants/<str:tenantId>', TenantAPIView.as_view()),

    
    path('filter-rooms-by-city/', city_based_room_filter, name='filter_rooms_by_city'),
    
    # to filter amenities in a room through all tenant
    path('hotel_amenity/', HotelAmenityView.as_view(), name='hotel_amenity'),
    
    # to get list of all amenities
    path('amenities/', AmenityListView.as_view(), name='amenity-list'),
    
    path('filterHotel/', RoomFilterAPIView.as_view(), name='amenity-list'),
    path('rooms/<int:room_id>/', RoomDetailAPIView.as_view(), name='room-detail'),
    path('room-price-filter/', RoomPriceFilterAPIView.as_view(), name='room-price-filter'),




]
