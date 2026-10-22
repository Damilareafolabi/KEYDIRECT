"""
KeyDirect Real Estate - REST API Serializers
Parent Company: SimeonJrStudios
Leadership: CEO Afolabi Oluwadamilare Simeon
"""

from rest_framework import serializers
from backend.models import (
    CustomUser, Property, PropertyVerification, PropertyImage, ChatMessage, CurrencyRate, PropertyReview
)
from backend.utils.currency import CurrencyService



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'phone_number', 'role', 
            'is_verified', 'preferred_currency', 'preferred_language', 'created_at'
        ]
        read_only_fields = ['id', 'is_verified', 'created_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    nin_placeholder = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = CustomUser
        fields = [
            'email', 'username', 'phone_number', 'role', 
            'password', 'preferred_currency', 'preferred_language', 'nin_placeholder'
        ]

    def create(self, validated_data):
        password = validated_data.pop('password')
        nin_placeholder = validated_data.pop('nin_placeholder', '')
        user = CustomUser(**validated_data)
        user.set_password(password)
        if nin_placeholder:
            user.nin_hash = f"nin_mock_hash_{nin_placeholder[-4:]}"
            user.is_verified = True  # Mock verified in demo/development
        user.save()
        return user


class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ['id', 'image_url', 'is_cover', 'display_order']


class PropertyVerificationSerializer(serializers.ModelSerializer):
    inspector_name = serializers.CharField(source='verified_by.get_full_name', read_only=True)

    class Meta:
        model = PropertyVerification
        fields = [
            'id', 'verification_status', 'document_type', 
            'document_file_url', 'land_registry_number', 'verified_at', 'inspector_name'
        ]


class CurrencyConversionMixin:
    """
    Mixin that inspects request headers ('X-Currency' or query param '?currency=...')
    and appends converted_price, currency_code, and formatted_price to serializer output.
    """
    def get_target_currency(self) -> str:
        request = self.context.get('request')
        if not request:
            return 'NGN'
        
        # Check query param first, then custom header, then user preference
        query_curr = request.query_params.get('currency')
        if query_curr:
            return query_curr.upper()

        header_curr = request.headers.get('X-Currency')
        if header_curr:
            return header_curr.upper()

        if request.user and request.user.is_authenticated and hasattr(request.user, 'preferred_currency'):
            return request.user.preferred_currency

        return 'NGN'

    def get_target_language(self) -> str:
        request = self.context.get('request')
        if not request:
            return 'en'
        lang = request.headers.get('Accept-Language') or request.query_params.get('lang')
        if lang:
            # take first 2 chars
            return lang[:2].lower()
        return 'en'


class PropertyListSerializer(serializers.ModelSerializer, CurrencyConversionMixin):
    images = PropertyImageSerializer(many=True, read_only=True)
    verification = PropertyVerificationSerializer(source='verification_record', read_only=True)
    owner_name = serializers.CharField(source='owner_or_agent.get_full_name', read_only=True)
    owner_role = serializers.CharField(source='owner_or_agent.role', read_only=True)
    owner_is_verified = serializers.BooleanField(source='owner_or_agent.is_verified', read_only=True)
    
    # Dynamic i18n and Currency fields
    title = serializers.SerializerMethodField()
    converted_price = serializers.SerializerMethodField()
    display_currency = serializers.SerializerMethodField()
    display_symbol = serializers.SerializerMethodField()
    formatted_price = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            'id', 'slug', 'title', 'category', 'listing_type',
            'base_currency', 'base_price', 'price_period',
            'converted_price', 'display_currency', 'display_symbol', 'formatted_price',
            'bedrooms', 'bathrooms', 'sitting_rooms', 'area_sq_ft',
            'state', 'lga', 'neighbourhood', 'address', 'latitude', 'longitude',
            'is_verified_listing', 'featured_in_billboard',
            'has_virtual_tour', 'virtual_tour_url', 'video_tour_url', 'floor_plan_url',
            'land_action', 'party_event_specs',
            'owner_name', 'owner_role', 'owner_is_verified',
            'images', 'verification', 'amenities', 'created_at'
        ]

    def get_title(self, obj):
        lang = self.get_target_language()
        return obj.get_title(lang)

    def get_display_currency(self, obj):
        return self.get_target_currency()

    def get_display_symbol(self, obj):
        curr = self.get_target_currency()
        return CurrencyService.get_symbol(curr)

    def get_converted_price(self, obj):
        target = self.get_target_currency()
        return float(CurrencyService.convert(obj.base_price, obj.base_currency, target))

    def get_formatted_price(self, obj):
        target = self.get_target_currency()
        converted = CurrencyService.convert(obj.base_price, obj.base_currency, target)
        return CurrencyService.format_price(converted, target)


class PropertyDetailSerializer(PropertyListSerializer):
    description = serializers.SerializerMethodField()
    owner_details = serializers.SerializerMethodField()

    class Meta(PropertyListSerializer.Meta):
        fields = PropertyListSerializer.Meta.fields + ['description', 'owner_details']

    def get_description(self, obj):
        lang = self.get_target_language()
        return obj.get_description(lang)

    def get_owner_details(self, obj):
        owner = obj.owner_or_agent
        return {
            'id': owner.id,
            'name': owner.get_full_name() or owner.username,
            'role': owner.role,
            'phone': owner.phone_number,
            'is_verified': owner.is_verified,
            'member_since': owner.created_at.strftime('%Y-%m-%d'),
        }


class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    sender_role = serializers.CharField(source='sender.role', read_only=True)

    class Meta:
        model = ChatMessage
        fields = [
            'id', 'property', 'sender', 'sender_name', 'sender_role',
            'receiver', 'message_text', 'auto_translated_text', 'is_read', 'timestamp'
        ]
        read_only_fields = ['id', 'sender', 'auto_translated_text', 'timestamp']


class PropertyReviewSerializer(serializers.ModelSerializer):
    renter_name = serializers.CharField(source='renter.get_full_name', read_only=True)
    renter_role = serializers.CharField(source='renter.role', read_only=True)
    property_title = serializers.CharField(source='property.title', read_only=True)
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)

    class Meta:
        model = PropertyReview
        fields = [
            'id', 'property', 'property_title', 'renter', 'renter_name', 'renter_role',
            'owner', 'owner_name', 'overall_rating', 'accuracy_rating',
            'responsiveness_rating', 'value_rating', 'transaction_type',
            'transaction_reference', 'is_verified_transaction',
            'inspection_fee_saved_ngn', 'commission_saved_ngn',
            'headline', 'review_text', 'pros', 'stay_or_deal_date',
            'helpful_votes', 'owner_response', 'owner_responded_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'is_verified_transaction', 'helpful_votes',
            'owner_response', 'owner_responded_at', 'created_at', 'updated_at'
        ]

