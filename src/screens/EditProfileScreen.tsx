import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Alert,
} from 'react-native';
import { User, Phone, MapPin, Save } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile } from '@/lib/api';
import ScreenHeader from '@/components/ScreenHeader';

const PRIMARY = '#1B4332';
const LIGHT_GREEN = '#52B788';
const TEXT_SECONDARY = '#888888';

export default function EditProfileScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [city, setCity] = useState(profile?.city || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      await updateProfile(user.id, {
        full_name: fullName,
        phone,
        city,
      });
      await refreshProfile();
      Alert.alert('تم', 'تم تحديث الملف الشخصي بنجاح');
    } catch (err: any) {
      Alert.alert('خطأ', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="تعديل الملف الشخصي" />

      <View style={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <User size={18} color={TEXT_SECONDARY} />
            <TextInput
              style={styles.input}
              placeholder="الاسم الكامل"
              value={fullName}
              onChangeText={setFullName}
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Phone size={18} color={TEXT_SECONDARY} />
            <TextInput
              style={styles.input}
              placeholder="رقم الهاتف"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <MapPin size={18} color={TEXT_SECONDARY} />
            <TextInput
              style={styles.input}
              placeholder="المدينة"
              value={city}
              onChangeText={setCity}
              textAlign="right"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Save size={18} color="#fff" />
          <Text style={styles.saveBtnText}>
            {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },

  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#F0FFF4', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: LIGHT_GREEN,
  },
  avatarEmoji: { fontSize: 36 },

  form: { gap: 8 },
  inputGroup: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8F8F8', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 4,
    marginBottom: 4, borderWidth: 1, borderColor: '#E8E8E8',
  },
  input: { flex: 1, fontSize: 14, color: '#1A1A1A', marginLeft: 10, textAlign: 'right', paddingVertical: 10 },

  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: PRIMARY, borderRadius: 12,
    paddingVertical: 14, marginTop: 20,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
