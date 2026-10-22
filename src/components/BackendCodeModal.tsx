import React, { useState } from 'react';
import { X, Code2, Copy, Check, FileText, Server, Database, Smartphone, Globe, Cpu } from 'lucide-react';

interface BackendCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackendCodeModal: React.FC<BackendCodeModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'models' | 'serializers' | 'views' | 'consumers' | 'currency' | 'mobile'>('models');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const codeSnippets: Record<string, { title: string; filename: string; language: string; content: string }> = {
    models: {
      title: 'Django Database Models & PostGIS Schema',
      filename: 'backend/models.py',
      language: 'python',
      content: `"""
KeyDirect Real Estate - Database Models
Parent Company: SimeonJrStudios | Leadership: CEO Afolabi Oluwadamilare Simeon
PostgreSQL + PostGIS Optimized with Multi-Currency & Multi-Language JSONB Support
"""
import uuid
from decimal import Decimal
from django.contrib.auth.models import AbstractUser
from django.contrib.gis.db import models as gis_models
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

class CustomUser(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(_('email address'), unique=True, db_index=True)
    phone_number = models.CharField(max_length=25, unique=True, db_index=True)
    role = models.CharField(max_length=20, choices=UserRole.choices, default=UserRole.RENTER)
    is_verified = models.BooleanField(default=False)
    nin_hash = models.CharField(max_length=128, blank=True, null=True, db_index=True)
    bvn_hash = models.CharField(max_length=128, blank=True, null=True, db_index=True)
    preferred_currency = models.CharField(max_length=3, default='USD', db_index=True)
    preferred_language = models.CharField(max_length=10, default='en', db_index=True)

class Property(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner_or_agent = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='properties')
    slug = models.SlugField(max_length=255, unique=True, db_index=True)
    title_translations = models.JSONField(default=dict)
    description_translations = models.JSONField(default=dict)
    category = models.CharField(max_length=30, db_index=True)
    listing_type = models.CharField(max_length=30, default='Direct Owner', db_index=True)
    base_currency = models.CharField(max_length=3, default='NGN', db_index=True)
    base_price = models.DecimalField(max_digits=15, decimal_places=2, db_index=True)
    price_period = models.CharField(max_length=20, default='per annum')
    bedrooms = models.PositiveSmallIntegerField(default=0, db_index=True)
    bathrooms = models.PositiveSmallIntegerField(default=1)
    state = models.CharField(max_length=100, db_index=True)
    neighbourhood = models.CharField(max_length=150, db_index=True)
    address = models.CharField(max_length=255)
    location = gis_models.PointField(geography=True, srid=4326, null=True, blank=True, spatial_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    is_verified_listing = models.BooleanField(default=False, db_index=True)
    featured_in_billboard = models.BooleanField(default=False, db_index=True)
    has_virtual_tour = models.BooleanField(default=True, db_index=True, help_text="Enables 100% online 360 walk-through for free")
    virtual_tour_url = models.URLField(max_length=500, blank=True, help_text="360 Interactive Panorama / Matterport URL")
    video_tour_url = models.URLField(max_length=500, blank=True, help_text="Full HD Video Walkthrough Stream URL")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)`
    },
    serializers: {
      title: 'Django REST Framework Serializers with CurrencyConversionMixin',
      filename: 'backend/serializers.py',
      language: 'python',
      content: `"""
KeyDirect Real Estate - REST API Serializers with Dynamic Currency & i18n Calculation
"""
from rest_framework import serializers
from backend.models import CustomUser, Property, PropertyVerification, PropertyImage, ChatMessage
from backend.utils.currency import CurrencyService

class CurrencyConversionMixin:
    def get_target_currency(self) -> str:
        request = self.context.get('request')
        if not request:
            return 'NGN'
        return request.query_params.get('currency') or request.headers.get('X-Currency') or 'NGN'

    def get_target_language(self) -> str:
        request = self.context.get('request')
        if not request:
            return 'en'
        lang = request.headers.get('Accept-Language') or request.query_params.get('lang')
        return lang[:2].lower() if lang else 'en'

class PropertyListSerializer(serializers.ModelSerializer, CurrencyConversionMixin):
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
            'bedrooms', 'bathrooms', 'state', 'neighbourhood', 'address',
            'is_verified_listing', 'featured_in_billboard', 'owner_name'
        ]

    def get_converted_price(self, obj):
        target = self.get_target_currency()
        return float(CurrencyService.convert(obj.base_price, obj.base_currency, target))`
    },
    views: {
      title: 'High-Performance DRF ViewSets & Spatial Filtering',
      filename: 'backend/views.py',
      language: 'python',
      content: `"""
KeyDirect Real Estate - REST API ViewSets & Views
"""
from decimal import Decimal
from django.db.models import Q
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from backend.models import Property, CustomUser
from backend.serializers import PropertyListSerializer, PropertyDetailSerializer
from backend.utils.currency import CurrencyService

class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.filter(is_active=True).select_related('owner_or_agent')
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params

        # Category Filter
        category = params.get('category')
        if category and category not in ['All', 'Cities']:
            qs = qs.filter(category__iexact=category)

        # Advertiser Filter (Direct Owners Only vs Agents vs Developers)
        advertiser = params.get('advertiser')
        if advertiser and 'direct' in advertiser.lower():
            qs = qs.filter(listing_type='Direct Owner')

        # Location query across states and neighbourhoods
        query = params.get('search') or params.get('location')
        if query:
            qs = qs.filter(Q(state__icontains=query) | Q(neighbourhood__icontains=query))

        # PostGIS Geospatial Radius Query
        lat, lng = params.get('lat'), params.get('lng')
        if lat and lng:
            point = Point(float(lng), float(lat), srid=4326)
            qs = qs.filter(location__distance_lte=(point, D(km=25)))

        return qs`
    },
    consumers: {
      title: 'Django Channels WebSockets for Real-Time Live Chat',
      filename: 'backend/consumers.py',
      language: 'python',
      content: `"""
KeyDirect Real Estate - Real-Time WebSocket Consumers (Django Channels)
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class PropertyChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.property_id = self.scope['url_route']['kwargs']['property_id']
        self.user = self.scope['user']
        self.room_group_name = f'chat_property_{self.property_id}'

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        await self.send(text_data=json.dumps({
            'type': 'system_notice',
            'message': 'KeyDirect Security: Direct owner verification certified. Zero off-platform fees.',
        }))

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_text = data.get('message', '').strip()

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'broadcast_message',
                'sender_id': str(self.user.id),
                'message': message_text,
            }
        )`
    },
    currency: {
      title: 'Multi-Currency Conversion Engine with Redis & Fallback Cache',
      filename: 'backend/utils/currency.py',
      language: 'python',
      content: `"""
KeyDirect Real Estate - High-Performance Currency Engine
"""
from decimal import Decimal, ROUND_HALF_UP
from django.core.cache import cache

DEFAULT_FALLBACK_RATES = {
    'NGN': {'rate_to_usd': Decimal('1580.00'), 'symbol': '₦'},
    'USD': {'rate_to_usd': Decimal('1.000000'), 'symbol': '$'},
    'EUR': {'rate_to_usd': Decimal('0.920000'), 'symbol': '€'},
    'GBP': {'rate_to_usd': Decimal('0.790000'), 'symbol': '£'},
    'AED': {'rate_to_usd': Decimal('3.670000'), 'symbol': 'AED '},
}

class CurrencyService:
    @classmethod
    def convert(cls, amount: Decimal, base_currency: str, target_currency: str) -> Decimal:
        base, target = base_currency.upper(), target_currency.upper()
        if base == target:
            return amount

        base_rate = cls.get_rate(base)
        target_rate = cls.get_rate(target)

        # Convert to USD standard pivot, then to target
        amount_usd = Decimal(str(amount)) / base_rate
        converted = amount_usd * target_rate

        if target == 'NGN':
            return converted.quantize(Decimal('1'), rounding=ROUND_HALF_UP)
        return converted.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)`
    },
    mobile: {
      title: 'Cross-Platform Mobile Sync Architecture (Flutter & React Native)',
      filename: 'backend/mobile_sync.md',
      language: 'markdown',
      content: `# KeyDirect Cross-Platform Synchronization Architecture (Android & iOS)
Parent Company: SimeonJrStudios | Leadership: CEO Afolabi Oluwadamilare Simeon

1. Unified Authentication & Secure JWT Storage:
- Flutter: flutter_secure_storage (Android Keystore / iOS Keychain)
- React Native: react-native-keychain hardware-backed encryption

2. Real-Time State Management & WebSocket Sync:
- Django Channels (Redis layer) <-> Mobile Client WebSocket (wss://api.keydirect.ng/ws/chat/{id}/)
- Exponential backoff auto-reconnect (1s, 2s, 4s, 8s, up to 30s)
- Offline message queue with local sync_status='pending'

3. Offline-First SQLite Cache:
- Cached listings stored in drift (Flutter) / WatermelonDB (React Native)
- 12h listing TTL, instant offline price calculation with synced CurrencyRate table.`
    },
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab].content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-stone-950 text-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-stone-800 flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-stone-900 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-lg tracking-wide uppercase">
                  KeyDirect Backend Architecture & Django Source Code
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-stone-800 text-stone-300 border border-stone-700">
                  Django 5.0 + DRF
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Production-Ready Schema, DRF Serializers, PostGIS Queries & Channels WebSockets
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-3 bg-stone-900/80 border-b border-stone-800 no-scrollbar">
          <button
            onClick={() => setActiveTab('models')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'models' ? 'bg-red-600 text-white shadow-xs' : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>models.py</span>
          </button>

          <button
            onClick={() => setActiveTab('serializers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'serializers' ? 'bg-red-600 text-white shadow-xs' : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>serializers.py</span>
          </button>

          <button
            onClick={() => setActiveTab('views')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'views' ? 'bg-red-600 text-white shadow-xs' : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>views.py</span>
          </button>

          <button
            onClick={() => setActiveTab('consumers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'consumers' ? 'bg-red-600 text-white shadow-xs' : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>consumers.py (WebSockets)</span>
          </button>

          <button
            onClick={() => setActiveTab('currency')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'currency' ? 'bg-red-600 text-white shadow-xs' : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>utils/currency.py</span>
          </button>

          <button
            onClick={() => setActiveTab('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'mobile' ? 'bg-red-600 text-white shadow-xs' : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>mobile_sync.md</span>
          </button>
        </div>

        {/* Code Content View */}
        <div className="flex-1 overflow-hidden flex flex-col bg-stone-950">
          <div className="px-6 py-2.5 bg-stone-900/60 border-b border-stone-800 flex items-center justify-between">
            <span className="font-mono text-xs text-stone-300 font-semibold">
              {codeSnippets[activeTab].filename}
            </span>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-200 transition-all cursor-pointer border border-stone-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          <pre className="flex-1 overflow-auto p-5 font-mono text-xs text-stone-300 bg-stone-950 leading-relaxed selection:bg-red-600 selection:text-white">
            <code>{codeSnippets[activeTab].content}</code>
          </pre>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-stone-900 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <span>All files written to workspace at <code>/backend/</code> directory</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-700 text-white rounded-lg font-semibold cursor-pointer"
          >
            Close Viewer
          </button>
        </div>

      </div>
    </div>
  );
};
