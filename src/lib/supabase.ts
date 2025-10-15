import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Ihre Supabase Konfiguration - bitte durch Ihre echten Werte ersetzen
const supabaseUrl = 'https://idtbkabbinkmajdghvdz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkdGJrYWJiaW5rbWFqZGdodmR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NDIwODYsImV4cCI6MjA1OTExODA4Nn0.2KNzbfMJe94etIKxd0dpDWFwZZybIl-p1GRiLrJYDTU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // React Native spezifische Einstellungen
    storage: undefined, // Wird automatisch AsyncStorage verwenden
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});