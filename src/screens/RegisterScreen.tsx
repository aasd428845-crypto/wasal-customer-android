import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { User, Mail, Lock, Phone, ArrowLeft } from 'lucide-react-native';
import { supabase } from '@/integrations/supabase/client';
import type { RootStackParamList } from '@/navigation/AppNavigator';

const PRIMARY = '#1B4332';
const LIGHT_GREEN = '#52B788';
const TEXT_SECONDARY = '#888888';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !phone || !password) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('خطأ', 'كلمتا المرور غير متطابقتين');
      return;
    }
    if (password.length < 6) {
      Alert.alert('خطأ', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);
    try {
      // Create email from phone
      const userEmail = email.trim() || `${phone.replace(/\+/g, '').replace(/\s/g, '')}@wasal.app`;

      const { data, error } = await supabase.auth.signUp({
        email: userEmail,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
          },
        },
      });

      if (error) throw error;

      // Create profile
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          user_id: data.user.id,
          full_name: fullName,
          phone,
          account_status: 'active',
        });

        if (profileError) {
          console.error('Profile error:', profileError);
        }

        // Assign customer role
        await supabase.from('user_roles').insert({
          user_id: data.user.id,
          role: 'customer',
        });
      }

      Alert.alert(
        'تم التسجيل بنجاح!',
        'تم إنشاء حسابك. يمكنك الآن تسجيل الدخول.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (err: any) {
      Alert.alert('خطأ', err.message || 'حدث خطأ أثناء التسجيل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={PRIMARY} />
        </TouchableOpacity>

        <Text style={styles.title}>إنشاء حساب جديد</Text>
        <Text style={styles.subtitle}>انضم إلى وصل واستمتع بخدمات التوصيل</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <User size={18} color={TEXT_SECONDARY} />
            <TextInput
              style={styles.input}
              placeholder="الاسم الكامل *"
              placeholderTextColor={TEXT_SECONDARY}
              value={fullName}
              onChangeText={setFullName}
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Phone size={18} color={TEXT_SECONDARY} />
            <TextInput
              style={styles.input}
              placeholder="رقم الهاتف *"
              placeholderTextColor={TEXT_SECONDARY}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Mail size={18} color={TEXT_SECONDARY} />
            <TextInput
              style={styles.input}
              placeholder="البريد الإلكتروني (اختياري)"
              placeholderTextColor={TEXT_SECONDARY}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Lock size={18} color={TEXT_SECONDARY} />
            <TextInput
              style={styles.input}
              placeholder="كلمة المرور *"
              placeholderTextColor={TEXT_SECONDARY}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Lock size={18} color={TEXT_SECONDARY} />
            <TextInput
              style={styles.input}
              placeholder="تأكيد كلمة المرور *"
              placeholderTextColor={TEXT_SECONDARY}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              textAlign="right"
            />
          </View>

          <TouchableOpacity
            style={[styles.registerBtn, loading && styles.registerBtnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerBtnText}>
              {loading ? 'جاري التسجيل...' : 'إنشاء الحساب'}
            </Text>
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>لديك حساب بالفعل؟ </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>تسجيل الدخول</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  scroll: { flexGrow: 1, padding: 24 },

  backBtn: { marginTop: 8, marginBottom: 16, alignSelf: 'flex-start' },

  title: { fontSize: 22, fontWeight: '900', color: '#1A1A1A', textAlign: 'right' },
  subtitle: { fontSize: 13, color: TEXT_SECONDARY, marginTop: 4, textAlign: 'right', marginBottom: 20 },

  form: { gap: 4 },

  inputGroup: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8F8F8', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 4,
    marginBottom: 10, borderWidth: 1, borderColor: '#E8E8E8',
  },
  input: { flex: 1, fontSize: 14, color: '#1A1A1A', marginLeft: 10, textAlign: 'right', paddingVertical: 10 },

  registerBtn: {
    backgroundColor: PRIMARY, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 8,
  },
  registerBtnDisabled: { opacity: 0.6 },
  registerBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  loginText: { fontSize: 13, color: TEXT_SECONDARY },
  loginLink: { fontSize: 13, color: LIGHT_GREEN, fontWeight: '700' },
});
