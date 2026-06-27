import { createClient, User as SupabaseAuthUser } from '@supabase/supabase-js';
import { User as LocalUser } from '../types';

export function sanitizeValue(val: string | undefined | null): string {
  if (!val) return '';
  let cleaned = val.trim();
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1);
  } else if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
    cleaned = cleaned.slice(1, -1);
  }
  cleaned = cleaned.trim();
  
  // Strip trailing /rest/v1/ or /rest/v1 or trailing slashes for Supabase URL compatibility
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    cleaned = cleaned.replace(/\/rest\/v1\/?$/, '');
    cleaned = cleaned.replace(/\/+$/, '');
  }
  
  return cleaned;
}

const rawUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const rawKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabaseUrl = sanitizeValue(rawUrl);
export const supabaseAnonKey = sanitizeValue(rawKey);

export function isSupabaseConfigured(): boolean {
  const url = sanitizeValue((import.meta as any).env.VITE_SUPABASE_URL);
  const key = sanitizeValue((import.meta as any).env.VITE_SUPABASE_ANON_KEY);
  if (!url || !key) return false;
  
  const u = url.toLowerCase();
  const k = key.toLowerCase();
  
  if (
    u === '' ||
    u === 'https://placeholder.supabase.co' ||
    u.includes('your-project') ||
    u.includes('placeholder')
  ) {
    return false;
  }
  
  if (
    k === '' ||
    k === 'placeholder-key' ||
    k.includes('your-anon-key') ||
    k.includes('placeholder')
  ) {
    return false;
  }
  
  return true;
}

if (!isSupabaseConfigured()) {
  console.warn(
    'Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are missing or set to placeholders. Local offline fallback mode will be used.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SupabaseProfile {
  id: string;
  full_name: string;
  roll_number: string;
  mobile_number: string;
  telegram_username: string;
  is_banned: boolean;
  is_admin: boolean;
  created_at: string;
}

export function mapSupabaseUser(authUser: SupabaseAuthUser, profile?: any): LocalUser {
  const metadata = authUser.user_metadata || {};
  const fullName = profile?.full_name || metadata.full_name || 'Campus Student';
  const rollNumber = profile?.roll_number || metadata.roll_number || '';
  const mobileNumber = profile?.mobile_number || metadata.mobile_number || '';
  const telegramUsername = profile?.telegram_username || metadata.telegram_username || '';
  
  // Make Chetan Laria, ADMIN01, or 2408390100024 always an Admin automatically
  const isChetanOrAdminRoll = 
    fullName.toLowerCase() === 'chetan laria' || 
    rollNumber.toUpperCase() === 'ADMIN01' || 
    rollNumber === '2408390100024' ||
    telegramUsername.toLowerCase() === 'chtn001';

  return {
    id: authUser.id,
    fullName,
    rollNumber,
    mobileNumber,
    telegramUsername,
    isBanned: profile?.is_banned !== undefined ? profile.is_banned : (metadata.is_banned || false),
    isAdmin: isChetanOrAdminRoll ? true : (profile?.is_admin !== undefined ? profile.is_admin : (metadata.is_admin || false)),
    createdAt: profile?.created_at || authUser.created_at || new Date().toISOString(),
  };
}
