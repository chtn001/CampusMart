import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Lock, User as UserIcon } from 'lucide-react';
import { User } from '../types';
import { supabase, mapSupabaseUser, isSupabaseConfigured } from '../lib/supabase';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
  onNavigate: (page: string) => void;
  users: User[];
  addToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onNavigate,
  users,
  addToast,
}) => {
  const [rollNumber, setRollNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!rollNumber.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    const normalizedRoll = rollNumber.trim().toUpperCase();

    // Offline fallback if Supabase is not configured
    if (!isSupabaseConfigured()) {
      const localUser = users.find(
        (u) => u.rollNumber === normalizedRoll
      );

      if (localUser) {
        if (localUser.isBanned) {
          setError('This account has been banned by the Administrator.');
          addToast('Account banned', 'error');
          setIsLoading(false);
          return;
        }
        onLoginSuccess(localUser);
        addToast(`Welcome back (offline mode), ${localUser.fullName}!`, 'success');
        onNavigate('home');
      } else {
        // Automatically create a temporary local session for testing
        const tempUser: User = {
          id: `user_${Date.now()}`,
          fullName: normalizedRoll === 'ADMIN01' ? 'System Administrator' : 'Campus Student',
          rollNumber: normalizedRoll,
          mobileNumber: '9988776655',
          telegramUsername: 'student_tg',
          isAdmin: normalizedRoll === 'ADMIN01' || normalizedRoll === '2408390100024',
          isBanned: false,
          createdAt: new Date().toISOString(),
        };
        onLoginSuccess(tempUser);
        addToast(`Logged in under offline fallback as ${tempUser.fullName}!`, 'success');
        onNavigate('home');
      }
      setIsLoading(false);
      return;
    }

    let email = `${normalizedRoll.toLowerCase()}@reck`;

    try {
      // 1. Find the user's email using the Roll Number from the profiles table.
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('roll_number', normalizedRoll)
          .maybeSingle();

        if (profileData) {
          // If the profile has an email property, use it; otherwise construct the derived email
          email = profileData.email || `${profileData.roll_number.toLowerCase()}@reck`;
        }
      } catch (err) {
        console.warn('Profiles table lookup failed or skipped. Falling back to derived email.', err);
      }

      // 2. Authenticate with Supabase Auth using that email and the entered password.
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        setError(loginError.message);
        addToast('Login failed: ' + loginError.message, 'error');
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        let profile = null;
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();
          profile = profileData;
        } catch (err) {
          console.warn('Profiles table check skipped or not yet created.', err);
        }

        const loggedInUser = mapSupabaseUser(data.user, profile);

        if (loggedInUser.isBanned) {
          await supabase.auth.signOut();
          setError('This account has been banned by the Administrator.');
          addToast('Account banned', 'error');
          setIsLoading(false);
          return;
        }

        onLoginSuccess(loggedInUser);
        addToast(`Welcome back, ${loggedInUser.fullName}!`, 'success');
        onNavigate('home');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during sign in.');
      addToast('An error occurred', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12" id="login-view">
      <div className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-10 shadow-xs">
        {/* Header */}
        <div className="text-center space-y-2.5 mb-8">
          <div className="bg-blue-50 text-blue-600 p-3.5 rounded-2xl inline-flex">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="font-sans font-bold text-2xl text-slate-900 tracking-tight">
            Welcome to CampusMart
          </h2>
          <p className="text-slate-500 text-sm">
            Sign in with your official college credentials
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold leading-relaxed">
              {error}
            </div>
          )}

          {/* Roll Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 tracking-wide uppercase font-mono">
              College Roll Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <UserIcon className="h-4.5 w-4.5 text-slate-400" />
              </div>
              <input
                type="text"
                required
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="13-digit Roll Number (e.g., 2408390100024)"
                className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-hidden focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all font-mono"
                id="login-roll-number"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 tracking-wide uppercase font-mono">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4.5 w-4.5 text-slate-400" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-hidden focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                id="login-password"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-98 cursor-pointer'} text-white font-medium text-sm py-3 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 mt-2`}
            id="login-submit-btn"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
            {!isLoading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('signup')}
              className="text-blue-600 font-semibold hover:underline cursor-pointer"
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
