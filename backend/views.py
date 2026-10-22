"""
KeyDirect Real Estate - REST API ViewSets & Views
Parent Company: SimeonJrStudios
Leadership: CEO Afolabi Oluwadamilare Simeon
"""

from decimal import Decimal
from django.db.models import Q
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate

from backend.models import CustomUser, Property, ChatMessage, CurrencyRate
from backend.serializers import (
    UserSerializer, UserRegistrationSerializer, PropertyListSerializer,
    PropertyDetailSerializer, ChatMessageSerializer
)
from backend.utils.currency import CurrencyService


class PropertyViewSet(viewsets.ModelViewSet):
    """
    High-Performance ViewSet for Properties:
    - Supports category filtering (Apartments, Rooms, Commercial, Hotels, Rental, Plots / Land)
    - Supports advertiser filtering: Direct Owner, Verified Agent, Developer
    - Supports price range filtering with dynamic currency normalization
    - Supports PostGIS spatial distance and radius queries
    - Supports full text search across state, LGA, neighbourhood, and title
    """
    queryset = Property.objects.filter(is_active=True).select_related(
        'owner_or_agent', 'verification_record'
    ).prefetch_related('images')
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'id'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PropertyDetailSerializer
        return PropertyListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params

        # 1. Category Filter
        category = params.get('category')
        if category and category != 'All' and category != 'Cities':
            qs = qs.filter(category__iexact=category)

        # 2. Advertiser / Listing Type Filter
        advertiser = params.get('advertiser') or params.get('listing_type')
        if advertiser:
            if 'direct' in advertiser.lower():
                qs = qs.filter(listing_type='Direct Owner')
            elif 'agent' in advertiser.lower():
                qs = qs.filter(listing_type='Verified Agent')
            elif 'developer' in advertiser.lower():
                qs = qs.filter(listing_type='Developer')

        # 3. Location / Search Term Query
        query = params.get('search') or params.get('q') or params.get('location')
        if query:
            qs = qs.filter(
                Q(state__icontains=query) |
                Q(neighbourhood__icontains=query) |
                Q(lga__icontains=query) |
                Q(address__icontains=query) |
                Q(title_translations__icontains=query)
            )

        # 4. Bedroom Count Filter
        bedrooms = params.get('bedrooms')
        if bedrooms and bedrooms != 'Any':
            try:
                num = int(bedrooms.split()[0].replace('+', ''))
                if '+' in bedrooms:
                    qs = qs.filter(bedrooms__gte=num)
                else:
                    qs = qs.filter(bedrooms=num)
            except (ValueError, IndexError):
                pass

        # 5. Price Min/Max (Normalized from request currency)
        req_currency = params.get('currency', 'NGN').upper()
        min_price = params.get('min_price')
        max_price = params.get('max_price')

        if min_price:
            try:
                min_val = Decimal(min_price)
                # Convert min_val from requested currency to base NGN for comparison
                min_ngn = CurrencyService.convert(min_val, req_currency, 'NGN')
                qs = qs.filter(base_price__gte=min_ngn)
            except Exception:
                pass

        if max_price:
            try:
                max_val = Decimal(max_price)
                max_ngn = CurrencyService.convert(max_val, req_currency, 'NGN')
                qs = qs.filter(base_price__lte=max_ngn)
            except Exception:
                pass

        # 6. PostGIS Geo-Spatial Radius Search (if lat & lng provided)
        lat = params.get('lat')
        lng = params.get('lng')
        radius_km = params.get('radius_km', 25)

        if lat and lng:
            try:
                user_point = Point(float(lng), float(lat), srid=4326)
                qs = qs.filter(location__distance_lte=(user_point, D(km=float(radius_km))))
            except Exception:
                pass

        # 7. Digital Billboard featured listings
        if params.get('featured') == 'true':
            qs = qs.filter(featured_in_billboard=True)

        # 8. Virtual Tour Available Only (Zero Inspection Fee)
        if params.get('virtual_tour') == 'true' or params.get('virtual_look') == 'true':
            qs = qs.filter(has_virtual_tour=True)

        # 9. Land Action Filter (Buy Land vs Rent / Lease Land)
        land_action = params.get('land_action')
        if land_action and land_action != 'Any':
            qs = qs.filter(land_action__iexact=land_action)

        return qs

    def perform_create(self, serializer):
        # Auto-assign authenticated owner/agent
        serializer.save(owner_or_agent=self.request.user)


# ============================================================================
# Auth Views (Zero-Key Manual Registration for Initial Setup)
# ============================================================================
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user(request):
    """
    Registers a new user (Owner, Agent, Developer, or Renter).
    Zero external API key dependencies during initial setup.
    """
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'message': 'User registered successfully on KeyDirect.',
            'token': token.key,
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_user(request):
    email = request.data.get('email')
    password = request.data.get('password')

    user = authenticate(username=email, password=password)
    if not user:
        return Response({'error': 'Invalid email or password credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        'token': token.key,
        'user': UserSerializer(user).data
    })


# ============================================================================
# Currency & Internationalization Views
# ============================================================================
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_currency_rates(request):
    rates = {
        code: {
            'code': code,
            'symbol': CurrencyService.get_symbol(code),
            'rate_to_usd': float(CurrencyService.get_rate(code))
        }
        for code in ['NGN', 'USD', 'EUR', 'GBP', 'CAD', 'AED', 'ZAR', 'AUD', 'CNY']
    }
    return Response(rates)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def set_user_currency(request):
    currency_code = request.data.get('currency', 'NGN').upper()
    request.user.preferred_currency = currency_code
    request.user.save(update_fields=['preferred_currency'])
    return Response({'status': 'success', 'preferred_currency': currency_code})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def set_user_language(request):
    language_code = request.data.get('language', 'en').lower()
    request.user.preferred_language = language_code
    request.user.save(update_fields=['preferred_language'])
    return Response({'status': 'success', 'preferred_language': language_code})


# ============================================================================
# In-App Chat History ViewSet
# ============================================================================
class ChatViewSet(viewsets.ModelViewSet):
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        property_id = self.request.query_params.get('property_id')
        qs = ChatMessage.objects.filter(Q(sender=user) | Q(receiver=user))
        if property_id:
            qs = qs.filter(property_id=property_id)
        return qs.order_by('timestamp')

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)
