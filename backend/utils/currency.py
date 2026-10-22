"""
KeyDirect Real Estate - High-Performance Currency Engine
Parent Company: SimeonJrStudios
Leadership: CEO Afolabi Oluwadamilare Simeon
"""

from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Optional
from django.core.cache import cache
import logging

logger = logging.getLogger('keydirect.currency')

DEFAULT_FALLBACK_RATES: Dict[str, Dict[str, any]] = {
    'NGN': {'rate_to_usd': Decimal('1580.00'), 'symbol': '₦', 'name': 'Nigerian Naira'},
    'USD': {'rate_to_usd': Decimal('1.000000'), 'symbol': '$', 'name': 'US Dollar'},
    'EUR': {'rate_to_usd': Decimal('0.920000'), 'symbol': '€', 'name': 'Euro'},
    'GBP': {'rate_to_usd': Decimal('0.790000'), 'symbol': '£', 'name': 'British Pound'},
    'CAD': {'rate_to_usd': Decimal('1.360000'), 'symbol': 'CA$', 'name': 'Canadian Dollar'},
    'AED': {'rate_to_usd': Decimal('3.670000'), 'symbol': 'AED ', 'name': 'UAE Dirham'},
    'ZAR': {'rate_to_usd': Decimal('18.250000'), 'symbol': 'R', 'name': 'South African Rand'},
    'AUD': {'rate_to_usd': Decimal('1.520000'), 'symbol': 'AU$', 'name': 'Australian Dollar'},
    'CNY': {'rate_to_usd': Decimal('7.230000'), 'symbol': '¥', 'name': 'Chinese Yuan'},
}

CACHE_KEY_PREFIX = 'keydirect:currency_rate:'
CACHE_TTL_SECONDS = 3600  # 1 hour cache


class CurrencyService:
    """
    High-throughput currency service with Redis cache backing,
    database persistence, and zero-latency fallback defaults.
    """

    @classmethod
    def get_rate(cls, currency_code: str) -> Decimal:
        code = (currency_code or 'NGN').upper().strip()
        cache_key = f"{CACHE_KEY_PREFIX}{code}"
        cached_rate = cache.get(cache_key)

        if cached_rate is not None:
            return Decimal(str(cached_rate))

        # Check DB
        try:
            from backend.models import CurrencyRate
            obj = CurrencyRate.objects.filter(code=code).first()
            if obj:
                cache.set(cache_key, str(obj.rate_to_usd), timeout=CACHE_TTL_SECONDS)
                return obj.rate_to_usd
        except Exception as e:
            logger.warning(f"Error querying CurrencyRate model: {e}")

        # Fallback dictionary
        fallback = DEFAULT_FALLBACK_RATES.get(code, DEFAULT_FALLBACK_RATES['NGN'])
        return fallback['rate_to_usd']

    @classmethod
    def get_symbol(cls, currency_code: str) -> str:
        code = (currency_code or 'NGN').upper().strip()
        if code in DEFAULT_FALLBACK_RATES:
            return DEFAULT_FALLBACK_RATES[code]['symbol']
        return f"{code} "

    @classmethod
    def convert(
        cls, 
        amount: Decimal, 
        base_currency: str, 
        target_currency: str
    ) -> Decimal:
        """
        Converts an amount from base_currency into target_currency via USD pivot.
        """
        base = (base_currency or 'NGN').upper().strip()
        target = (target_currency or 'NGN').upper().strip()

        if base == target:
            return Decimal(amount).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        amount_dec = Decimal(str(amount))
        base_rate = cls.get_rate(base)
        target_rate = cls.get_rate(target)

        # Convert to USD first
        amount_usd = amount_dec / base_rate
        # Convert USD to target
        converted = amount_usd * target_rate

        # For NGN we round to whole currency unit, for USD/EUR to 2 decimal places
        if target == 'NGN':
            return converted.quantize(Decimal('1'), rounding=ROUND_HALF_UP)
        return converted.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    @classmethod
    def format_price(cls, amount: Decimal, currency_code: str) -> str:
        symbol = cls.get_symbol(currency_code)
        target = (currency_code or 'NGN').upper().strip()
        if target == 'NGN':
            return f"{symbol}{int(amount):,}"
        return f"{symbol}{amount:,.2f}"
