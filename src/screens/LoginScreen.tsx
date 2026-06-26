import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Mail, Lock, ArrowLeft } from 'lucide-react-native';
import { supabase } from '@/integrations/supabase/client';
import type { RootStackParamList } from '@/navigation/AppNavigator';

const PRIMARY = '#1B4332';
const LIGHT_GREEN = '#52B788';
const TEXT_SECONDARY = '#888888';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('خطأ', 'يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      // Success - navigation will automatically switch via AuthContext
    } catch (err: any) {
      Alert.alert('خطأ في تسجيل الدخول', err.message || 'حدث خطأ ما');
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
        {/* Back */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={PRIMARY} />
        </TouchableOpacity>

        {/* Logo Area */}
        <View style={styles.logoArea}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🚚</Text>
          </View>
          <Text style={styles.appName}>وصل</Text>
          <Text style={styles.appTagline}>توصيل الطعام والخدمات</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.title}>تسجيل الدخول</Text>

          <View style={styles.inputGroup}>
            <Mail size={18} color={TEXT_SECONDARY} />
            <TextInput
              style={styles.input}
              placeholder="البريد الإلكتروني أو رقم الهاتف"
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
              placeholder="كلمة المرور"
              placeholderTextColor={TEXT_SECONDARY}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textAlign="right"
            />
          </View>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>نسيت كلمة المرور؟</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginBtnText}>
              {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
            </Text>
          </TouchableOpacity>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>ليس لديك حساب؟ </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>سجل الآن</Text>
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

  logoArea: { alignItems: 'center', marginVertical: 24 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#F0FFF4', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: LIGHT_GREEN,
  },
  logoEmoji: { fontSize: 36 },
  appName: { fontSize: 28, fontWeight: '900', color: PRIMARY, marginTop: 12 },
  appTagline: { fontSize: 13, color: TEXT_SECONDARY, marginTop: 4 },

  form: { marginTop: 16 },
  title: { fontSize: 20, fontWeight: '900', color: '#1A1A1A', marginBottom: 20, textAlign: 'right' },

  inputGroup: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8F8F8', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 4,
    marginBottom: 12, borderWidth: 1, borderColor: '#E8E8E8',
  },
  input: { flex: 1, fontSize: 14, color: '#1A1A1A', marginLeft: 10, textAlign: 'right', paddingVertical: 10 },

  forgotBtn: { alignSelf: 'flex-end', marginBottom: 16 },
  forgotText: { fontSize: 12, color: LIGHT_GREEN, fontWeight: '600' },

  loginBtn: {
    backgroundColor: PRIMARY, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  registerText: { fontSize: 13, color: TEXT_SECONDARY },
  registerLink: { fontSize: 13, color: LIGHT_GREEN, fontWeight: '700' },
});
