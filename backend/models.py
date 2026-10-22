"""
KeyDirect Real Estate - Database Models
Parent Company: SimeonJrStudios
Leadership: CEO Afolabi Oluwadamilare Simeon
PostgreSQL + PostGIS Optimized with Multi-Currency & Multi-Language JSONB Support
"""

import uuid
from decimal import Decimal
from django.contrib.auth.models import AbstractUser
from django.contrib.gis.db import models as gis_models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.utils.translation import gettext_lazy as _


class UserRole(models.TextChoices):
    OWNER = 'OWNER', _('Direct Property Owner')
    AGENT = 'AGENT', _('Verified Agent')
    DEVELOPER = 'DEVELOPER', _('Property Developer')
    RENTER = 'RENTER', _('Property Searcher / Renter')


class VerificationStatus(models.TextChoices):
    PENDING = 'PENDING', _('Pending Document Review')
    APPROVED = 'APPROVED', _('Verified & Approved')
    REJECTED = 'REJECTED', _('Rejected / Incomplete')


class DocumentType(models.TextChoices):
    DEED_OF_ASSIGNMENT = 'DEED_OF_ASSIGNMENT', _('Deed of Assignment')
    CERTIFICATE_OF_OCCUPANCY = 'C_OF_O', _('Certificate of Occupancy (C of O)')
    GOVERNORS_CONSENT = 'GOVERNORS_CONSENT', _("Governor's Consent")
    GAZETTE = 'GAZETTE', _('Excision / Gazette')
    REGISTERED_SURVEY = 'REGISTERED_SURVEY', _('Registered Survey Plan')
    UTILITY_BILL = 'UTILITY_BILL', _('Utility Bill / Proof of Address')


class PropertyCategory(models.TextChoices):
    APARTMENTS = 'Apartments', _('Apartments')
    ROOMS = 'Rooms', _('Rooms')
    COMMERCIAL = 'Commercial', _('Commercial')
    HOTELS = 'Hotels', _('Hotels')
    RENTAL = 'Rental', _('Rental')
    PLOTS_LAND = 'Plots / Land', _('Plots / Land')
    CITIES = 'Cities', _('Cities')


class ListingType(models.TextChoices):
    DIRECT_OWNER = 'Direct Owner', _('Direct Owner (0% Commission)')
    VERIFIED_AGENT = 'Verified Agent', _('Verified Agent')
    DEVELOPER = 'Developer', _('Developer')


class PricePeriod(models.TextChoices):
    PER_ANNUM = 'per annum', _('Per Annum')
    MONTHLY = 'monthly', _('Monthly')
    TOTAL_PURCHASE = 'total purchase', _('Total Purchase')


# ============================================================================
# 1. User & Authentication Model (Anti-Scam Verified Identity)
# ============================================================================
class CustomUser(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(_('email address'), unique=True, db_index=True)
    phone_number = models.CharField(max_length=25, unique=True, db_index=True)
    role = models.CharField(max_length=20, choices=UserRole.choices, default=UserRole.RENTER)
    is_verified = models.BooleanField(
        default=False, 
        help_text=_('True if user has completed NIN/BVN and government ID verification')
    )
    
    # Nigerian Identity Anti-Scam Check Hashes
    nin_hash = models.CharField(max_length=128, blank=True, null=True, db_index=True)
    bvn_hash = models.CharField(max_length=128, blank=True, null=True, db_index=True)
    
    # Global User Preferences
    preferred_currency = models.CharField(max_length=3, default='USD', db_index=True)
    preferred_language = models.CharField(max_length=10, default='en', db_index=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'phone_number']

    class Meta:
        db_table = 'keydirect_users'
        indexes = [
            models.Index(fields=['email', 'role']),
            models.Index(fields=['is_verified']),
        ]

    def __str__(self):
        return f"{self.email} ({self.get_role_display()}) - {'Verified' if self.is_verified else 'Unverified'}"


# ============================================================================
# 2. Currency Exchange Rate Cache Model
# ============================================================================
class CurrencyRate(models.Model):
    code = models.CharField(max_length=3, unique=True, db_index=True, help_text='ISO-4217 Currency Code (e.g. USD, NGN, EUR)')
    name = models.CharField(max_length=50)
    symbol = models.CharField(max_length=10)
    rate_to_usd = models.DecimalField(
        max_digits=18, decimal_places=6, 
        help_text='Exchange rate relative to USD (USD=1.0, NGN=1580.0, EUR=0.92)'
    )
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'keydirect_currency_rates'
        ordering = ['code']

    def __str__(self):
        return f"{self.code} ({self.symbol}) - 1 USD = {self.rate_to_usd} {self.code}"


# ============================================================================
# 3. Property Listing Model (PostGIS Geospatial + Multi-Currency/i18n)
# ============================================================================
class Property(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner_or_agent = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='properties',
        db_index=True
    )
    slug = models.SlugField(max_length=255, unique=True, db_index=True)
    
    # Translatable content stored as JSONB: {"en": "...", "fr": "...", "yo": "...", "ha": "...", "ig": "..."}
    title_translations = models.JSONField(
        default=dict, 
        help_text=_('Localized property titles mapped by language code')
    )
    description_translations = models.JSONField(
        default=dict,
        help_text=_('Localized property descriptions mapped by language code')
    )

    category = models.CharField(max_length=30, choices=PropertyCategory.choices, db_index=True)
    listing_type = models.CharField(max_length=30, choices=ListingType.choices, default=ListingType.DIRECT_OWNER, db_index=True)
    
    # Financials (Base Currency standard)
    base_currency = models.CharField(max_length=3, default='NGN', db_index=True)
    base_price = models.DecimalField(max_digits=15, decimal_places=2, db_index=True)
    price_period = models.CharField(max_length=20, choices=PricePeriod.choices, default=PricePeriod.PER_ANNUM)
    
    # Spatial & Structural Specs
    bedrooms = models.PositiveSmallIntegerField(default=0, db_index=True)
    bathrooms = models.PositiveSmallIntegerField(default=1)
    sitting_rooms = models.PositiveSmallIntegerField(default=1)
    area_sq_ft = models.PositiveIntegerField(blank=True, null=True)
    
    # Nigerian / Global Address Hierarchy
    country_code = models.CharField(max_length=2, default='NG', db_index=True)
    state = models.CharField(max_length=100, db_index=True)
    lga = models.CharField(max_length=100, blank=True)
    neighbourhood = models.CharField(max_length=150, db_index=True)
    address = models.CharField(max_length=255)
    
    # PostGIS Geospatial Point (Longitude, Latitude) for precise spatial distance queries
    location = gis_models.PointField(geography=True, srid=4326, null=True, blank=True, spatial_index=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Anti-Scam & Trust Verification
    is_active = models.BooleanField(default=True, db_index=True)
    is_verified_listing = models.BooleanField(default=False, db_index=True)
    featured_in_billboard = models.BooleanField(default=False, db_index=True)
    
    # Virtual Look & ₦0 Inspection Fee Guarantee Fields
    has_virtual_tour = models.BooleanField(default=True, db_index=True, help_text=_('Enables 100% online 360 walk-through for free'))
    virtual_tour_url = models.URLField(max_length=500, blank=True, help_text='360 Interactive Panorama / Matterport URL')
    video_tour_url = models.URLField(max_length=500, blank=True, help_text='Full HD Video Walkthrough Stream URL')
    floor_plan_url = models.URLField(max_length=500, blank=True, help_text='Verified Architectural 2D Floor Plan')
    
    # Land Action & Party/Event Specifications
    land_action = models.CharField(max_length=30, blank=True, null=True, help_text='Buy Land vs Rent / Lease Land')
    party_event_specs = models.JSONField(default=dict, blank=True, help_text='guest_capacity, allows_dj, pool_party, soundproof')

    # Amenities stored as array/JSON
    amenities = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'keydirect_properties'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category', 'listing_type', 'is_active']),
            models.Index(fields=['state', 'neighbourhood']),
            models.Index(fields=['base_price', 'base_currency']),
            models.Index(fields=['bedrooms', 'category']),
        ]

    def get_title(self, lang='en'):
        return self.title_translations.get(lang) or self.title_translations.get('en', 'Property Listing')

    def get_description(self, lang='en'):
        return self.description_translations.get(lang) or self.description_translations.get('en', '')

    def __str__(self):
        return f"[{self.listing_type}] {self.get_title()} - {self.neighbourhood}, {self.state}"


# ============================================================================
# 4. Property Verification & Legal Title Model (Zero-Scam Guarantee)
# ============================================================================
class PropertyVerification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property = models.OneToOneField(
        Property, 
        on_delete=models.CASCADE, 
        related_name='verification_record'
    )
    verified_by = models.ForeignKey(
        CustomUser, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='inspections_performed'
    )
    verification_status = models.CharField(
        max_length=20, 
        choices=VerificationStatus.choices, 
        default=VerificationStatus.PENDING,
        db_index=True
    )
    document_type = models.CharField(max_length=30, choices=DocumentType.choices)
    document_file_url = models.URLField(max_length=500, blank=True)
    land_registry_number = models.CharField(max_length=100, blank=True, null=True, help_text='State Land Registry Reference')
    
    # Field notes from on-site verification officer
    inspection_notes = models.TextField(blank=True)
    physical_inspection_date = models.DateField(blank=True, null=True)
    verified_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'keydirect_property_verifications'

    def __str__(self):
        return f"Verification for {self.property_id}: {self.verification_status} ({self.document_type})"


# ============================================================================
# 5. Property Media Models
# ============================================================================
class PropertyImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='images')
    image_url = models.URLField(max_length=500)
    is_cover = models.BooleanField(default=False)
    display_order = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'keydirect_property_images'
        ordering = ['display_order', 'created_at']


# ============================================================================
# 6. Direct Messaging & In-App Chat (Django Channels Real-Time)
# ============================================================================
class ChatMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='sent_messages', db_index=True)
    receiver = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='received_messages', db_index=True)
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='chat_inquiries', db_index=True)
    message_text = models.TextField()
    
    # Multi-language translation cache of the message
    auto_translated_text = models.JSONField(
        default=dict, 
        blank=True,
        help_text=_('Automated language translations for recipient locale')
    )
    is_read = models.BooleanField(default=False, db_index=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'keydirect_chat_messages'
        ordering = ['timestamp']
        indexes = [
            models.Index(fields=['sender', 'receiver', 'timestamp']),
            models.Index(fields=['property', 'timestamp']),
        ]

    def __str__(self):
        return f"Message from {self.sender} to {self.receiver} @ {self.timestamp}"


# ============================================================================
# 7. Property Reviews & Verified Renter Ratings (High-Trust Anti-Scam Network)
# ============================================================================
class TransactionType(models.TextChoices):
    APARTMENT_LEASE = 'Apartment Lease', _('Apartment Lease')
    PARTY_BOOKING = 'Party Booking', _('Party / Event Apartment Booking')
    EVENT_CENTER_HIRE = 'Event Center Hire', _('Event Center Hall Hire')
    ROOM_RENTAL = 'Room Rental', _('Room Rental')
    LAND_PURCHASE = 'Land Purchase', _('Land Purchase / Outright Acquisition')
    COMMERCIAL_LEASE = 'Commercial Lease', _('Commercial Space Lease')


class PropertyReview(models.Model):
    """
    Verified reviews written by renters who have completed a transaction.
    Calculates agent commission saved and street inspection fee avoided.
    Enforces authentic owner ratings without scam manipulation.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property = models.ForeignKey(
        Property, 
        on_delete=models.CASCADE, 
        related_name='reviews', 
        db_index=True
    )
    renter = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='reviews_given', 
        db_index=True
    )
    owner = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='reviews_received', 
        db_index=True
    )
    
    # 1 to 5 Star Quantitative Ratings
    overall_rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text=_('Overall experience rating from 1 to 5')
    )
    accuracy_rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text=_('Accuracy of 360 virtual look and photos vs physical reality')
    )
    responsiveness_rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text=_('Landlord communication, speed, and courtesy')
    )
    value_rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text=_('Fairness of pricing with 0% agent commission')
    )
    
    # Verified Transaction Authentication
    transaction_type = models.CharField(
        max_length=40, 
        choices=TransactionType.choices, 
        default=TransactionType.APARTMENT_LEASE
    )
    transaction_reference = models.CharField(
        max_length=100, 
        unique=True, 
        db_index=True,
        help_text=_('Unique KeyDirect transaction escrow or booking reference code')
    )
    is_verified_transaction = models.BooleanField(
        default=True, 
        db_index=True,
        help_text=_('True if transaction escrow / title verification receipt was authenticated')
    )
    
    # Financial Transparency Badges (Nigerian Naira)
    inspection_fee_saved_ngn = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=Decimal('10000.00'),
        help_text=_('Physical inspection fee saved by inspecting online via 360 Virtual Look')
    )
    commission_saved_ngn = models.DecimalField(
        max_digits=14, 
        decimal_places=2, 
        default=Decimal('0.00'),
        help_text=_('10% agent commission saved by renting directly from owner')
    )
    
    # Qualitative Feedback
    headline = models.CharField(max_length=200, help_text=_('Short punchy summary'))
    review_text = models.TextField(help_text=_('Detailed review of stay, property condition, and owner transparency'))
    pros = models.JSONField(
        default=list, 
        blank=True,
        help_text=_('Key highlights (e.g. Accurate 360 Tour, Zero Noise, Clean Generator, Fast Landlord)')
    )
    stay_or_deal_date = models.CharField(max_length=50, blank=True, help_text=_('e.g. April 2026'))
    
    # Community Upvotes
    helpful_votes = models.PositiveIntegerField(default=0, db_index=True)
    
    # Landlord / Owner Verified Response
    owner_response = models.TextField(blank=True, help_text=_('Public response from property owner'))
    owner_responded_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'keydirect_property_reviews'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['property', 'overall_rating']),
            models.Index(fields=['owner', 'overall_rating']),
            models.Index(fields=['is_verified_transaction', 'created_at']),
        ]

    def __str__(self):
        return f"Review by {self.renter} for {self.property.slug} - {self.overall_rating}★"

