# وصل - Wasal Customer App

تطبيق Android أصلي لواجهة العميل لمشروع وصل (Wasal) - منصة توصيل الطعام والخدمات.

## المميزات

- **الشاشة الرئيسية**: عرض المطاعم، العروض، التصنيفات، والأكثر تقييماً
- **المطاعم**: تصفح وبحث المطاعم مع فلترة حسب نوع المطبخ
- **قائمة الطعام**: عرض الأصناف مع إمكانية الإضافة للسلة
- **سلة التسوق**: إدارة الطلبات قبل الدفع
- **إتمام الطلب**: اختيار العنوان وطريقة الدفع
- **تتبع الطلبات**: متابعة حالة الطلب خطوة بخطوة
- **الحساب**: إدارة الملف الشخصي والعناوين
- **توصيل الطرود**: طلب توصيل من أي مكان لأي مكان

## التقنيات

- React Native + Expo
- TypeScript
- Supabase (نفس قاعدة بيانات الويب)
- Zustand (State Management)
- React Navigation
- AsyncStorage

## الاتصال بقاعدة البيانات

التطبيق يستخدم نفس مكتبة `@supabase/supabase-js` مع نفس الجداول:
- `profiles` - الملفات الشخصية
- `user_roles` - أدوار المستخدمين
- `restaurants` - المطاعم
- `menu_categories` - تصنيفات القائمة
- `menu_items` - أصناف الطعام
- `delivery_orders` - طلبات التوصيل
- `customer_addresses` - عناوين العملاء
- `delivery_banners` - البانرات
- `delivery_offers` - العروض

## طريقة الاستخدام

### 1. تثبيت المتطلبات

```bash
npm install
# أو
yarn install
```

### 2. إعداد Supabase

عدل ملف `src/integrations/supabase/client.ts` وأضف بيانات Supabase:

```typescript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

### 3. تشغيل التطبيق

```bash
npx expo start
```

### 4. بناء APK

```bash
npx eas build -p android --profile preview
```

## التطابق مع الويب

| شاشة الويب | شاشة التطبيق |
|-----------|-------------|
| DeliveryHubPage | HomeScreen |
| RestaurantsPage | RestaurantsScreen |
| RestaurantMenuPage | RestaurantMenuScreen |
| CartPage | CartScreen |
| CheckoutPage | CheckoutScreen |
| OrderTrackingPage | OrderTrackingScreen |
| HistoryPage | OrdersScreen |
| AccountPage | AccountScreen |
| LoginPage | LoginScreen |
| RegisterPage | RegisterScreen |
| AddressesPage | AddressesScreen |
| DeliveryRequestPage | DeliveryRequestScreen |

## الألوان والتصميم

نفس ألوان التطبيق الويب:
- Primary: `#1B4332`
- Light Green: `#52B788`
- Danger: `#E53935`
- خلفية بيضاء مع تصميم RTL كامل

## المساهمة

هذا المشروع مفتوح المصدر ويمكنك المساهمة في تطويره.

## الترخيص

MIT
