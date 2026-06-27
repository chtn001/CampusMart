import React, { useState } from 'react';
import { UserPlus, ArrowRight, User as UserIcon, Award, Phone, Send, Lock, ShieldAlert } from 'lucide-react';
import { User } from '../types';
import { supabase, mapSupabaseUser, isSupabaseConfigured } from '../lib/supabase';

interface SignupViewProps {
  onSignupSuccess: (user: User) => void;
  onNavigate: (page: string) => void;
  users: User[];
  addToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const SignupView: React.FC<SignupViewProps> = ({
  onSignupSuccess,
  onNavigate,
  users,
  addToast,
}) => {
  const [fullName, setFullName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !rollNumber.trim() || !mobileNumber.trim() || !telegramUsername.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (!acceptTerms) {
      setError('You must accept the Terms and Conditions to register.');
      return;
    }

    setIsLoading(true);
    const normalizedRoll = rollNumber.trim().toUpperCase();
    const normalizedMobile = mobileNumber.trim();

    // Offline fallback if Supabase is not configured
    if (!isSupabaseConfigured()) {
      const isRollTaken = users.some(u => u.rollNumber === normalizedRoll);
      if (isRollTaken) {
        setError('An account with this College Roll Number already exists.');
        addToast('Roll Number already registered', 'error');
        setIsLoading(false);
        return;
      }

      let cleanedTelegram = telegramUsername.trim();
      if (cleanedTelegram.startsWith('@')) {
        cleanedTelegram = cleanedTelegram.substring(1);
      }

      const newUser: User = {
        id: `user_${Date.now()}`,
        fullName: fullName.trim(),
        rollNumber: normalizedRoll,
        mobileNumber: normalizedMobile,
        telegramUsername: cleanedTelegram,
        isAdmin: normalizedRoll === 'ADMIN01' || normalizedRoll === '2408390100024',
        isBanned: false,
        createdAt: new Date().toISOString(),
      };

      onSignupSuccess(newUser);
      addToast('Account created successfully (offline mode)!', 'success');
      onNavigate('home');
      setIsLoading(false);
      return;
    }

    // 1. Uniqueness checking via profiles table in database
    try {
      const { data: existingProfiles, error: selectError } = await supabase
        .from('profiles')
        .select('roll_number, mobile_number');

      if (!selectError && existingProfiles) {
        const isRollTaken = existingProfiles.some(p => p.roll_number?.toUpperCase() === normalizedRoll);
        if (isRollTaken) {
          setError('An account with this College Roll Number already exists. Only one account is permitted per student.');
          addToast('Roll Number already registered', 'error');
          setIsLoading(false);
          return;
        }

        const isMobileTaken = existingProfiles.some(p => p.mobile_number?.replace(/\s+/g, '') === normalizedMobile.replace(/\s+/g, ''));
        if (isMobileTaken) {
          setError('An account with this Mobile Number already exists.');
          addToast('Mobile Number already registered', 'error');
          setIsLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Could not verify database profile uniqueness constraints. Proceeding with Auth signUp...', err);
    }

    // Clean Telegram username (remove @ if the student wrote it)
    let cleanedTelegram = telegramUsername.trim();
    if (cleanedTelegram.startsWith('@')) {
      cleanedTelegram = cleanedTelegram.substring(1);
    }

    // 2. Supabase Auth registration
    const email = `${normalizedRoll.toLowerCase()}@reck`;
    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            roll_number: normalizedRoll,
            mobile_number: normalizedMobile,
            telegram_username: cleanedTelegram,
            is_admin: false,
            is_banned: false,
          }
        }
      });

      if (signupError) {
        setError(signupError.message);
        addToast('Registration failed: ' + signupError.message, 'error');
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        // 3. Save into profiles table
        try {
          await supabase.from('profiles').insert({
            id: data.user.id,
            full_name: fullName.trim(),
            roll_number: normalizedRoll,
            mobile_number: normalizedMobile,
            telegram_username: cleanedTelegram,
            is_banned: false,
            is_admin: false,
          });
        } catch (dbErr) {
          console.error('Failed to write to profiles table, metadata remains safe in Auth.', dbErr);
        }

        const newUser = mapSupabaseUser(data.user);
        onSignupSuccess(newUser);
        addToast('Account created successfully!', 'success');
        onNavigate('home');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during signup.');
      addToast('An error occurred', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12" id="signup-view">
      <div className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-10 shadow-xs">
        {/* Header */}
        <div className="text-center space-y-2.5 mb-8">
          <div className="bg-blue-50 text-blue-600 p-3.5 rounded-2xl inline-flex">
            <UserPlus className="h-6 w-6" />
          </div>
          <h2 className="font-sans font-bold text-2xl text-slate-900 tracking-tight">
            Create Student Account
          </h2>
          <p className="text-slate-500 text-sm">
            Join CampusMart to buy, sell and rent products safely
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold leading-relaxed">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 tracking-wide uppercase font-mono">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <UserIcon className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., Jane Doe"
                className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-hidden focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                id="signup-name"
              />
            </div>
          </div>

          {/* Roll Number */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 tracking-wide uppercase font-mono">
              College Roll Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Award className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                required
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="13-digit Roll Number (e.g., 2408390100024)"
                className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-hidden focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all font-mono"
                id="signup-roll"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 tracking-wide uppercase font-mono">
              Mobile Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Phone className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="tel"
                required
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="e.g., +91 98765 43210"
                className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-hidden focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all font-mono"
                id="signup-phone"
              />
            </div>
          </div>

          {/* Telegram Username */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 tracking-wide uppercase font-mono flex items-center justify-between">
              <span>Telegram Username</span>
              <span className="text-[10px] text-slate-400 font-normal normal-case">For buyers to contact you</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Send className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                required
                value={telegramUsername}
                onChange={(e) => setTelegramUsername(e.target.value)}
                placeholder="e.g., janedoe_tg (without @)"
                className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-hidden focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all font-mono"
                id="signup-telegram"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 tracking-wide uppercase font-mono">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-hidden focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                id="signup-password"
              />
            </div>
          </div>

          {/* T&C Accept Box */}
          <div className="flex items-start gap-2.5 pt-2">
            <input
              type="checkbox"
              id="signup-accept-terms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="signup-accept-terms" className="text-xs text-slate-500 leading-normal">
              I read and accept the{' '}
              <button
                type="button"
                onClick={() => onNavigate('terms')}
                className="text-blue-600 font-semibold hover:underline"
              >
                CampusMart Terms & Conditions
              </button>{' '}
              for safe peer-to-peer trading.
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-98 cursor-pointer'} text-white font-medium text-sm py-3 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 mt-3`}
            id="signup-submit-btn"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
            {!isLoading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-blue-600 font-semibold hover:underline cursor-pointer"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
