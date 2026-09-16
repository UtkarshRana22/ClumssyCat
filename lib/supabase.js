import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// ClumssyCat's dedicated Supabase project (see /areas/clumssycat.md).
const SUPABASE_URL = 'https://smznwayqrvkwywqkcoxn.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_aO6uoDx0kltyRUlS-rGDWQ_df7f09I5';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
