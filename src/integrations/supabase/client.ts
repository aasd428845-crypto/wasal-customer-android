import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

// Supabase configuration - Wasal Customer App
const SUPABASE_URL = 'https://hhqhoqwpebnmfuhwhllw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_muPrRQdPNSwY0pCK8OJ7eQ_cdCTXJHa';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

export type AppRole = 'customer' | 'supplier' | 'delivery_company' | 'admin' | 'driver' | 'delivery_driver';
