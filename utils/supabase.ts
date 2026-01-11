import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// REPLACE THESE WITH YOUR ACTUAL KEYS FROM SUPABASE DASHBOARD
const supabaseUrl = 'https://mmgnxnzrtyldpxdkfhpx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tZ254bnpydHlsZHB4ZGtmaHB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5OTgxNDEsImV4cCI6MjA4MzU3NDE0MX0.cvJFeGg1FR7Lu6G_NPSGWs2UweVSzALwpFroR0fB3v4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage, // Keeps the user logged in even if they close the app
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});