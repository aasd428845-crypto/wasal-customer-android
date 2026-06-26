import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  User, MapPin, ClipboardList, Bell, Info, LogOut, ChevronLeft,
  Phone, Star,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import type { RootStackParamList } from '@/navigation/AppNavigator';

const PRIMARY = '#1B4332';
const LIGHT_GREEN = '#52B788';
const TEXT_SECONDARY = '#888888';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MENU_ITEMS = [
  { icon: MapPin, label: 'عناويني', screen: 'Addresses' },
  { icon: ClipboardList, label: 'طلباتي', screen: 'OrdersTab' },
  { icon: Bell, label: 'الإشعارات', screen: 'Notifications' },
  { icon: Info, label: 'عن التطبيق', screen: 'About' },
];

export default function AccountScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, profile, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('تسجيل الخروج', 'هل أنت متأكد من تسجيل الخروج؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'خروج', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarEmoji}>👤</Text>
          )}
        </View>

        {user ? (
          <>
            <Text style={styles.name}>{profile?.full_name || 'مستخدم'}</Text>
            <View style={styles.phoneRow}>
              <Phone size={13} color={TEXT_SECONDARY} />
              <Text style={styles.phone}>{profile?.phone || user.email || ''}</Text>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Text style={styles.editText}>تعديل الملف الشخصي</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.name}>ضيف</Text>
            <Text style={styles.subtitle}>سجل الدخول لاستخدام جميع الميزات</Text>
            <TouchableOpacity
              style={[styles.editBtn, { backgroundColor: PRIMARY }]}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={[styles.editText, { color: '#fff' }]}>تسجيل الدخول</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Menu Items */}
      <View style={styles.menu}>
        {MENU_ITEMS.map(item => (
          <TouchableOpacity
            key={item.screen}
            style={styles.menuItem}
            onPress={() => {
              if (item.screen === 'OrdersTab') {
                // @ts-ignore
                navigation.navigate('MainTabs', { screen: 'OrdersTab' });
              } else {
                navigation.navigate(item.screen as any);
              }
            }}
          >
            <item.icon size={20} color={PRIMARY} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <ChevronLeft size={18} color={TEXT_SECONDARY} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        ))}

        {user && (
          <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleSignOut}>
            <LogOut size={20} color="#E53935" />
            <Text style={[styles.menuLabel, { color: '#E53935' }]}>تسجيل الخروج</Text>
            <ChevronLeft size={18} color="#E53935" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },

  header: {
    alignItems: 'center', paddingVertical: 32,
    backgroundColor: '#F0FFF4', borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 6, elevation: 4,
    marginBottom: 12,
  },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
  avatarEmoji: { fontSize: 36 },
  name: { fontSize: 18, fontWeight: '900', color: '#1A1A1A' },
  subtitle: { fontSize: 12, color: TEXT_SECONDARY, marginTop: 4 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  phone: { fontSize: 12, color: TEXT_SECONDARY },
  editBtn: {
    marginTop: 12, paddingHorizontal: 20, paddingVertical: 8,
    backgroundColor: '#fff', borderRadius: 20,
    borderWidth: 1, borderColor: LIGHT_GREEN,
  },
  editText: { fontSize: 12, fontWeight: '700', color: LIGHT_GREEN },

  menu: { padding: 16, marginTop: 8 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, paddingHorizontal: 12,
    borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  menuLabel: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  logoutItem: { marginTop: 8, borderBottomWidth: 0 },
});
