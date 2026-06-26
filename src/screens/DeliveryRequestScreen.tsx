import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Truck, MapPin, Phone, User, ChevronLeft, Package } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import ScreenHeader from '@/components/ScreenHeader';

const PRIMARY = '#1B4332';
const LIGHT_GREEN = '#52B788';
const TEXT_SECONDARY = '#888888';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function DeliveryRequestScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, profile } = useAuth();

  const [senderName, setSenderName] = useState(profile?.full_name || '');
  const [senderPhone, setSenderPhone] = useState(profile?.phone || '');
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('تنبيه', 'يرجى تسجيل الدخول أولاً', [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'تسجيل الدخول', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }

    if (!senderName || !senderPhone || !pickupAddress || !deliveryAddress || !itemDescription) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.from('delivery_orders').insert({
        customer_id: user.id,
        customer_name: senderName,
        customer_phone: senderPhone,
        customer_address: deliveryAddress,
        items: [{ name: itemDescription, quantity: 1, price: 0 }],
        subtotal: 0,
        delivery_fee: 0,
        total: 0,
        payment_method: 'cash',
        status: 'pending',
        payment_status: 'pending',
        order_type: 'parcel',
        notes: `اسم المرسل: ${senderName} | هاتف: ${senderPhone} | عنوان الاستلام: ${pickupAddress} | اسم المستلم: ${recipientName} | هاتف المستلم: ${recipientPhone}`,
      }).select('id').single();

      if (error) throw error;

      Alert.alert(
        'تم إرسال الطلب!',
        'سيتواصل معك أقرب مندوب',
        [{ text: 'OK', onPress: () => navigation.navigate('MainTabs') }]
      );
    } catch (err: any) {
      Alert.alert('خطأ', err.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="طلب توصيل" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Banner */}
        <View style={styles.banner}>
          <Truck size={32} color={LIGHT_GREEN} />
          <Text style={styles.bannerTitle}>نوصل لك أي شيء</Text>
          <Text style={styles.bannerSub}>أطلب توصيل طرود، مستندات، أو أي شيء آخر</Text>
        </View>

        {/* Sender Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات المرسل</Text>
          <View style={styles.inputGroup}>
            <User size={16} color={TEXT_SECONDARY} />
            <TextInput style={styles.input} placeholder="اسم المرسل *" value={senderName} onChangeText={setSenderName} textAlign="right" />
          </View>
          <View style={styles.inputGroup}>
            <Phone size={16} color={TEXT_SECONDARY} />
            <TextInput style={styles.input} placeholder="هاتف المرسل *" value={senderPhone} onChangeText={setSenderPhone} keyboardType="phone-pad" textAlign="right" />
          </View>
          <View style={styles.inputGroup}>
            <MapPin size={16} color={TEXT_SECONDARY} />
            <TextInput style={styles.input} placeholder="عنوان الاستلام *" value={pickupAddress} onChangeText={setPickupAddress} textAlign="right" />
          </View>
        </View>

        {/* Recipient Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات المستلم</Text>
          <View style={styles.inputGroup}>
            <User size={16} color={TEXT_SECONDARY} />
            <TextInput style={styles.input} placeholder="اسم المستلم" value={recipientName} onChangeText={setRecipientName} textAlign="right" />
          </View>
          <View style={styles.inputGroup}>
            <Phone size={16} color={TEXT_SECONDARY} />
            <TextInput style={styles.input} placeholder="هاتف المستلم" value={recipientPhone} onChangeText={setRecipientPhone} keyboardType="phone-pad" textAlign="right" />
          </View>
          <View style={styles.inputGroup}>
            <MapPin size={16} color={TEXT_SECONDARY} />
            <TextInput style={styles.input} placeholder="عنوان التوصيل *" value={deliveryAddress} onChangeText={setDeliveryAddress} textAlign="right" />
          </View>
        </View>

        {/* Item Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تفاصيل الشحنة</Text>
          <View style={[styles.inputGroup, styles.textArea]}>
            <Package size={16} color={TEXT_SECONDARY} />
            <TextInput
              style={styles.input}
              placeholder="وصف الشحنة * (مثال: طرد صغير، ملفات...)"
              value={itemDescription}
              onChangeText={setItemDescription}
              multiline
              textAlign="right"
            />
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitText}>
            {loading ? 'جاري الإرسال...' : 'إرسال الطلب'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 30 },

  banner: {
    backgroundColor: '#F0FFF4', borderRadius: 16,
    alignItems: 'center', paddingVertical: 24, marginBottom: 16,
  },
  bannerTitle: { fontSize: 18, fontWeight: '900', color: PRIMARY, marginTop: 8 },
  bannerSub: { fontSize: 12, color: TEXT_SECONDARY, marginTop: 4 },

  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '900', color: '#1A1A1A', marginBottom: 10, textAlign: 'right' },

  inputGroup: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8F8F8', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 4,
    marginBottom: 8, borderWidth: 1, borderColor: '#E8E8E8',
  },
  input: { flex: 1, fontSize: 13, color: '#1A1A1A', marginLeft: 8, textAlign: 'right', paddingVertical: 8 },
  textArea: { alignItems: 'flex-start', minHeight: 60 },

  submitBtn: {
    backgroundColor: PRIMARY, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 8,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
