import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, RefreshControl, Alert,
} from 'react-native';
import { MapPin, Plus, Trash2, Check, X } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAddresses, createAddress, deleteAddress } from '@/lib/api';
import type { CustomerAddress } from '@/types';
import ScreenHeader from '@/components/ScreenHeader';

const PRIMARY = '#1B4332';
const LIGHT_GREEN = '#52B788';
const TEXT_SECONDARY = '#888888';
const DANGER = '#E53935';

export default function AddressesScreen() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await fetchAddresses(user.id);
      setAddresses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleAdd = async () => {
    if (!name || !address) {
      Alert.alert('خطأ', 'يرجى إدخال اسم العنوان والعنوان');
      return;
    }
    if (!user) return;

    try {
      const newAddr = await createAddress({
        customer_id: user.id,
        address_name: name,
        full_address: address,
        city,
        phone,
        is_default: isDefault,
      });
      setAddresses([newAddr as CustomerAddress, ...addresses]);
      setShowForm(false);
      setName(''); setAddress(''); setCity(''); setPhone(''); setIsDefault(false);
    } catch (err: any) {
      Alert.alert('خطأ', err.message);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('حذف العنوان', 'هل أنت متأكد؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف', style: 'destructive', onPress: async () => {
          try {
            await deleteAddress(id);
            setAddresses(addresses.filter(a => a.id !== id));
          } catch (err: any) {
            Alert.alert('خطأ', err.message);
          }
        }
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="عناويني" />

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY]} />}
        contentContainerStyle={styles.content}
      >
        {/* Add Button */}
        {!showForm && (
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
            <Plus size={20} color={LIGHT_GREEN} />
            <Text style={styles.addText}>إضافة عنوان جديد</Text>
          </TouchableOpacity>
        )}

        {/* Add Form */}
        {showForm && (
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>عنوان جديد</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <X size={20} color={TEXT_SECONDARY} />
              </TouchableOpacity>
            </View>

            <TextInput style={styles.formInput} placeholder="اسم العنوان (مثال: المنزل) *" value={name} onChangeText={setName} textAlign="right" />
            <TextInput style={styles.formInput} placeholder="العنوان الكامل *" value={address} onChangeText={setAddress} multiline textAlign="right" />
            <TextInput style={styles.formInput} placeholder="المدينة" value={city} onChangeText={setCity} textAlign="right" />
            <TextInput style={styles.formInput} placeholder="رقم الهاتف" value={phone} onChangeText={setPhone} keyboardType="phone-pad" textAlign="right" />

            <TouchableOpacity style={styles.defaultRow} onPress={() => setIsDefault(!isDefault)}>
              <View style={[styles.checkbox, isDefault && styles.checkboxActive]}>
                {isDefault && <Check size={14} color="#fff" />}
              </View>
              <Text style={styles.defaultLabel}>تعيين كعنوان افتراضي</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
              <Text style={styles.saveText}>حفظ العنوان</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Address List */}
        {addresses.map(addr => (
          <View key={addr.id} style={[styles.addressCard, addr.is_default && styles.addressCardActive]}>
            <View style={styles.addressHeader}>
              <View style={styles.addressLeft}>
                <MapPin size={16} color={addr.is_default ? LIGHT_GREEN : TEXT_SECONDARY} />
                <Text style={[styles.addressName, addr.is_default && { color: LIGHT_GREEN }]}>{addr.address_name}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(addr.id)}>
                <Trash2 size={16} color={DANGER} />
              </TouchableOpacity>
            </View>
            <Text style={styles.addressText}>{addr.full_address}</Text>
            {addr.city && <Text style={styles.addressCity}>{addr.city}</Text>}
            {addr.is_default && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>افتراضي</Text>
              </View>
            )}
          </View>
        ))}

        {addresses.length === 0 && !showForm && (
          <View style={styles.empty}>
            <MapPin size={48} color="#ccc" />
            <Text style={styles.emptyText}>لا توجد عناوين محفوظة</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 30 },

  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 2, borderColor: LIGHT_GREEN, borderStyle: 'dashed',
    borderRadius: 12, paddingVertical: 14, marginBottom: 12,
  },
  addText: { fontSize: 14, fontWeight: '700', color: LIGHT_GREEN },

  formCard: {
    backgroundColor: '#FAFAFA', borderRadius: 14, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: '#f0f0f0',
  },
  formHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  formTitle: { fontSize: 14, fontWeight: '900', color: '#1A1A1A' },
  formInput: {
    backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#E8E8E8',
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, marginBottom: 8, textAlign: 'right',
  },
  defaultRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 8 },
  checkbox: {
    width: 20, height: 20, borderRadius: 5, borderWidth: 2, borderColor: TEXT_SECONDARY,
    justifyContent: 'center', alignItems: 'center',
  },
  checkboxActive: { backgroundColor: LIGHT_GREEN, borderColor: LIGHT_GREEN },
  defaultLabel: { fontSize: 13, color: '#1A1A1A' },
  saveBtn: {
    backgroundColor: PRIMARY, borderRadius: 10,
    paddingVertical: 12, alignItems: 'center', marginTop: 8,
  },
  saveText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  addressCard: {
    backgroundColor: '#FAFAFA', borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: '#f0f0f0',
  },
  addressCardActive: { borderColor: LIGHT_GREEN, backgroundColor: '#F0FFF4' },
  addressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  addressLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addressName: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  addressText: { fontSize: 12, color: '#333', textAlign: 'right' },
  addressCity: { fontSize: 11, color: TEXT_SECONDARY, marginTop: 4, textAlign: 'right' },
  defaultBadge: {
    alignSelf: 'flex-start', backgroundColor: LIGHT_GREEN,
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 8,
  },
  defaultBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },

  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: TEXT_SECONDARY, marginTop: 12 },
});
