import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Truck, Heart, Globe, Phone, Mail } from 'lucide-react-native';
import ScreenHeader from '@/components/ScreenHeader';

const PRIMARY = '#1B4332';
const LIGHT_GREEN = '#52B788';
const TEXT_SECONDARY = '#888888';

export default function AboutScreen() {
  return (
    <View style={styles.screen}>
      <ScreenHeader title="عن التطبيق" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🚚</Text>
          </View>
          <Text style={styles.appName}>وصل - Wasal</Text>
          <Text style={styles.version}>الإصدار 1.0.0</Text>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>من نحن</Text>
          <Text style={styles.cardText}>
            وصل هو تطبيق توصيل طعام وخدمات مصمم خصيصاً لليمن. نحن نربطك بأفضل المطاعم
            وشركات التوصيل لتوفير تجربة سلسة وسريعة لطلب الطعام وتوصيل الطرود.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ما يميزنا</Text>
          {[
            { icon: '🍔', title: 'مطاعم متنوعة', desc: 'أكثر من 100 مطعم شريك' },
            { icon: '🚚', title: 'توصيل سريع', desc: 'مناديب متاحون على مدار الساعة' },
            { icon: '💳', title: 'دفع آمن', desc: 'خيارات دفع متعددة وآمنة' },
            { icon: '⭐', title: 'تقييمات موثوقة', desc: 'تقييمات حقيقية من عملاء حقيقيين' },
          ].map((feat, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{feat.icon}</Text>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.featureTitle}>{feat.title}</Text>
                <Text style={styles.featureDesc}>{feat.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Contact */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>تواصل معنا</Text>
          <View style={styles.contactRow}>
            <Phone size={16} color={LIGHT_GREEN} />
            <Text style={styles.contactText}>+967-XXX-XXX-XXX</Text>
          </View>
          <View style={styles.contactRow}>
            <Mail size={16} color={LIGHT_GREEN} />
            <Text style={styles.contactText}>support@wasal.app</Text>
          </View>
        </View>

        <Text style={styles.footer}>© 2025 وصل - Wasal. جميع الحقوق محفوظة.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 30 },

  logoSection: { alignItems: 'center', marginVertical: 24 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#F0FFF4', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: LIGHT_GREEN,
  },
  logoEmoji: { fontSize: 36 },
  appName: { fontSize: 22, fontWeight: '900', color: PRIMARY, marginTop: 12 },
  version: { fontSize: 12, color: TEXT_SECONDARY, marginTop: 4 },

  card: {
    backgroundColor: '#FAFAFA', borderRadius: 14, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#f0f0f0',
  },
  cardTitle: { fontSize: 14, fontWeight: '900', color: '#1A1A1A', marginBottom: 10 },
  cardText: { fontSize: 13, color: '#444', lineHeight: 20, textAlign: 'right' },

  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  featureIcon: { fontSize: 24 },
  featureTitle: { fontSize: 13, fontWeight: '700', color: '#1A1A1A' },
  featureDesc: { fontSize: 11, color: TEXT_SECONDARY, marginTop: 2 },

  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  contactText: { fontSize: 13, color: '#1A1A1A' },

  footer: { textAlign: 'center', fontSize: 11, color: TEXT_SECONDARY, marginTop: 16 },
});
