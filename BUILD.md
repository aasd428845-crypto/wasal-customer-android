# بناء APK - Build Instructions

## طريقة GitHub Actions (الأسهل)

1. ادمج Pull Request `add-supabase-config`
2. ادخل إلى تبويب **Actions** في GitHub
3. اختر workflow **Build Android APK**
4. اضغط **Run workflow**
5. انتظر 5-10 دقائق
6. تحميل APK من قسم **Artifacts**

## طريقة البناء المحلي

### المتطلبات
- Node.js 20+
- Java 17
- Android SDK

### الخطوات
```bash
# 1. تثبيت الحزم
npm install

# 2. إنشاء مشروع Android
npx expo prebuild -p android

# 3. بناء APK
cd android
chmod +x gradlew
./gradlew assembleRelease
```

### ملف APK النهائي
```
android/app/build/outputs/apk/release/app-release.apk
```
