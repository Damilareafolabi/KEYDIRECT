# KeyDirect Cross-Platform Synchronization Architecture (Android & iOS)
**Parent Company:** SimeonJrStudios  
**Executive Leadership:** CEO Afolabi Oluwadamilare Simeon  
**Core Mission:** Zero Unnecessary Agent Commissions, Direct Owner Verification, Real-Time Sync.

---

## 1. Unified Authentication & Secure JWT Storage
To guarantee persistent, tamper-proof user sessions across Android, iOS, and Web without exposing private keys:

### A. Mobile Secure Storage Implementation
- **Flutter:** Use `flutter_secure_storage` (backed by Android Keystore on Android, iOS Keychain on iOS).
- **React Native:** Use `react-native-keychain` or `expo-secure-store` with hardware-backed encryption.

```dart
// Flutter Secure Token Handler
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class KeyDirectAuthStorage {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
  );

  static Future<void> saveToken(String token, String refreshToken) async {
    await _storage.write(key: 'jwt_access', value: token);
    await _storage.write(key: 'jwt_refresh', value: refreshToken);
  }

  static Future<String?> getToken() async => await _storage.read(key: 'jwt_access');
}
```

---

## 2. Real-Time State Management & WebSocket Synchronization
Syncing live chats, verified listing changes, and digital billboards with Django backend channels:

```
[ Django Backend (Channels + Redis) ]
                |
     WebSocket wss://api.keydirect.ng/ws/chat/{property_id}/
                |
   +------------+------------+
   |                         |
[ Flutter Client ]    [ React Native Client ]
   | (Bloc / Riverpod)       | (Zustand / TanStack Query)
   v                         v
[ Local SQLite Cache ]  [ Local WatermelonDB / SQLite ]
```

### Auto-Reconnection & Heartbeat Protocol
1. **Exponential Backoff:** Mobile client reconnects after 1s, 2s, 4s, 8s, up to 30s max on network interruptions (e.g., Nigerian telecom cellular handoffs).
2. **Offline Message Queue:** Messages composed while offline are stored in local SQLite with `sync_status = 'pending'`, and auto-dispatched once connection restores.

---

## 3. Offline-First SQLite Local Cache Strategy
Allows users to browse properties, inspection checklists, and verified owner credentials even with zero mobile data:

### Local Schema (`drift` for Flutter / `WatermelonDB` for React Native):
```sql
CREATE TABLE cached_properties (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  base_price REAL NOT NULL,
  base_currency TEXT NOT NULL,
  category TEXT NOT NULL,
  listing_type TEXT NOT NULL,
  state TEXT NOT NULL,
  neighbourhood TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  images_json TEXT NOT NULL,
  verification_json TEXT NOT NULL,
  owner_json TEXT NOT NULL,
  cached_at INTEGER NOT NULL
);
```

### Cache Invalidation Policy:
- **TTL:** 12 hours for listings, 30 days for offline inspection checklist and saved favorites.
- **Delta Sync:** Mobile app sends `GET /api/properties/?since_timestamp=1730000000` to fetch only modified or newly verified listings.

---

## 4. Multi-Currency & Offline Localized Display
- The exchange rate table (`CurrencyRate`) is synced on app startup and stored in SQLite.
- Mobile client calculates `converted_price` synchronously on device using `CurrencyService.convert()`, guaranteeing smooth 60/120fps scrolling in property lists without waiting for network responses.
