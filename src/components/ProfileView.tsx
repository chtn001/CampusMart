import React from 'react';
import { User as UserIcon, Award, Phone, Send, List, PlusCircle, LogOut, CheckCircle2, ShieldAlert } from 'lucide-react';
import { User, Listing } from '../types';

interface ProfileViewProps {
  currentUser: User | null;
  listings: Listing[];
  onNavigate: (page: string) => void;
  onLogout: () => void;
  addToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  listings,
  onNavigate,
  onLogout,
  addToast,
}) => {
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 text-center" id="profile-not-logged-in">
        <p className="text-slate-500 text-sm mb-4">Please log in to view your student profile.</p>
        <button
          onClick={() => onNavigate('login')}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-xs"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Calculate statistics for current user
  const userListings = listings.filter((l) => l.sellerId === currentUser.id);
  const activeListingsCount = userListings.filter((l) => !l.isSold).length;
  const soldListingsCount = userListings.filter((l) => l.isSold).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8" id="profile-view">
      {/* Intro Header */}
      <div>
        <h1 className="font-sans font-bold text-2xl text-slate-900 tracking-tight">
          Student Dashboard
        </h1>
        <p className="text-slate-500 text-sm">
          Manage your personal information, active selling items, and statistics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
            <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl shrink-0">
              <UserIcon className="h-8 w-8" />
            </div>
            <div>
              <h2 className="font-sans font-bold text-xl text-slate-900">{currentUser.fullName}</h2>
              <span className="text-xs font-mono font-medium text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-md">
                Student Account
              </span>
            </div>
          </div>

          {/* Student Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                College Roll Number
              </p>
              <div className="flex items-center gap-2 text-slate-800 text-sm font-mono font-medium">
                <Award className="h-4 w-4 text-slate-400 shrink-0" />
                {currentUser.rollNumber}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                Mobile Number (Confidential)
              </p>
              <div className="flex items-center gap-2 text-slate-800 text-sm font-mono font-medium">
                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                {currentUser.mobileNumber}
              </div>
              <p className="text-[10px] text-slate-400 italic">Hidden from potential buyers for your privacy.</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                Telegram Username (Visible)
              </p>
              <div className="flex items-center gap-2 text-blue-600 text-sm font-mono font-medium">
                <Send className="h-4 w-4 text-blue-500 shrink-0" />
                @{currentUser.telegramUsername}
              </div>
              <p className="text-[10px] text-slate-400 italic">Buyers will contact you directly on Telegram.</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                Account Created
              </p>
              <p className="text-slate-800 text-sm font-mono font-medium">
                {new Date(currentUser.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Statistics Sidebar */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-5">
            <h3 className="font-sans font-bold text-sm text-slate-400 tracking-wider uppercase font-mono">
              Marketplace Activity
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-100/50 p-4 rounded-2xl text-center">
                <p className="text-2xl font-extrabold text-slate-900 font-mono">
                  {activeListingsCount}
                </p>
                <p className="text-[11px] font-semibold text-slate-500 uppercase font-mono tracking-wider mt-1">
                  Active
                </p>
              </div>

              <div className="bg-emerald-50/50 border border-emerald-100/30 p-4 rounded-2xl text-center">
                <p className="text-2xl font-extrabold text-emerald-600 font-mono">
                  {soldListingsCount}
                </p>
                <p className="text-[11px] font-semibold text-emerald-600 uppercase font-mono tracking-wider mt-1">
                  Sold
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-50 text-xs text-blue-800 leading-relaxed">
              <span className="font-bold">Listing Cap</span>: Students are limited to a maximum of <strong>5 active listings</strong> to prevent spam on the homepage.
            </div>
          </div>

          <div className="pt-6 space-y-2.5 border-t border-slate-50 mt-6 md:mt-0">
            <button
              onClick={() => onNavigate('add-listing')}
              disabled={activeListingsCount >= 5}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-medium text-sm py-2.5 rounded-xl shadow-xs hover:shadow-md transition-all active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
              id="profile-add-btn"
            >
              <PlusCircle className="h-4 w-4" />
              Add New Listing
            </button>

            <button
              onClick={() => onNavigate('my-listings')}
              className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium text-sm py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              id="profile-listings-btn"
            >
              <List className="h-4 w-4" />
              Manage My Listings ({userListings.length})
            </button>

            <button
              onClick={() => {
                onLogout();
                addToast('Logged out successfully', 'info');
              }}
              className="w-full bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-100 font-medium text-sm py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              id="profile-logout-btn"
            >
              <LogOut className="h-4 w-4" />
              Logout Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
