import React, { useState } from 'react';
import { Shield, Users, List, Trash2, Ban, ShieldCheck, AlertCircle, Phone, Award, Send } from 'lucide-react';
import { User, Listing } from '../types';
import { optimizeCloudinaryUrl } from '../lib/cloudinary';

interface AdminViewProps {
  currentUser: User | null;
  users: User[];
  listings: Listing[];
  onDeleteListing: (id: string) => void;
  onBanUser: (id: string) => void;
  onUnbanUser: (id: string) => void;
  onNavigate: (page: string) => void;
  addToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  currentUser,
  users,
  listings,
  onDeleteListing,
  onBanUser,
  onUnbanUser,
  onNavigate,
  addToast,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'listings'>('users');

  if (!currentUser || !currentUser.isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 text-center" id="admin-unauthorized">
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl inline-flex mb-4">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h3 className="font-sans font-bold text-lg text-slate-950 mb-1">
          Access Denied
        </h3>
        <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed mb-4">
          You do not have administrative privileges to access this secure terminal.
        </p>
        <button
          onClick={() => onNavigate('home')}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-xs"
        >
          Return Home
        </button>
      </div>
    );
  }

  const handleBanToggle = (user: User) => {
    if (user.isAdmin) {
      addToast('Cannot ban another Administrator.', 'error');
      return;
    }

    if (user.isBanned) {
      onUnbanUser(user.id);
      addToast(`User ${user.fullName} has been unbanned.`, 'success');
    } else {
      onBanUser(user.id);
      addToast(`User ${user.fullName} has been banned. Their active listings are hidden from buyers.`, 'success');
    }
  };

  const handleDeleteListing = (id: string, title: string) => {
    onDeleteListing(id);
    addToast(`Listing "${title}" removed successfully by Admin.`, 'success');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8" id="admin-view">
      {/* Admin Title */}
      <div className="flex items-center gap-3">
        <div className="bg-red-50 text-red-600 p-2.5 rounded-xl">
          <Shield className="h-5.5 w-5.5" />
        </div>
        <div>
          <h1 className="font-sans font-bold text-2xl text-slate-900 tracking-tight">
            Campus Administrator Dashboard
          </h1>
          <p className="text-slate-500 text-sm">
            Review student accounts, audit confidential mobile records, and moderate listed items.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-5 py-3.5 border-b-2 font-medium text-sm transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          id="admin-tab-users"
        >
          <Users className="h-4 w-4" />
          Students ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('listings')}
          className={`flex items-center gap-2 px-5 py-3.5 border-b-2 font-medium text-sm transition-all cursor-pointer ${
            activeTab === 'listings'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          id="admin-tab-listings"
        >
          <List className="h-4 w-4" />
          Market Listings ({listings.length})
        </button>
      </div>

      {/* Users Moderation Grid/Table */}
      {activeTab === 'users' ? (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="admin-users-table">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 font-mono text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-4 px-6">Roll & Name</th>
                  <th className="py-4 px-6">Mobile (Admin Only)</th>
                  <th className="py-4 px-6">Telegram Handles</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/30 transition-colors" id={`admin-user-row-${user.id}`}>
                    {/* Name */}
                    <td className="py-4 px-6">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          {user.fullName}
                          {user.isAdmin && (
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.2 rounded-sm uppercase tracking-wide">
                              Staff
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono text-slate-400 flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          {user.rollNumber}
                        </div>
                      </div>
                    </td>

                    {/* Mobile */}
                    <td className="py-4 px-6 font-mono text-xs">
                      <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        {user.mobileNumber}
                      </div>
                    </td>

                    {/* Telegram */}
                    <td className="py-4 px-6 font-mono text-xs">
                      <a
                        href={`https://t.me/${user.telegramUsername}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-blue-600 font-medium hover:underline"
                      >
                        <Send className="h-3.5 w-3.5 text-blue-400" />
                        @{user.telegramUsername}
                      </a>
                    </td>

                    {/* Status Pill */}
                    <td className="py-4 px-6 text-center">
                      {user.isBanned ? (
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-100 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Banned
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Active
                        </span>
                      )}
                    </td>

                    {/* Moderation Actions */}
                    <td className="py-4 px-6 text-right">
                      {user.isAdmin ? (
                        <span className="text-xs text-slate-400 italic">Self</span>
                      ) : (
                        <button
                          onClick={() => handleBanToggle(user)}
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                            user.isBanned
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-100'
                              : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-100'
                          }`}
                          id={`btn-ban-${user.id}`}
                        >
                          <Ban className="h-3.5 w-3.5" />
                          {user.isBanned ? 'Unban Student' : 'Ban Student'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Product Listing Moderation */
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="admin-listings-table">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 font-mono text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-4 px-6">Product Details</th>
                  <th className="py-4 px-6">Seller Name</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6 text-center">Sale Type</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                {listings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-slate-50/30 transition-colors" id={`admin-listing-row-${listing.id}`}>
                    {/* Item title & image */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={optimizeCloudinaryUrl(listing.images[0])}
                          alt={listing.title}
                          referrerPolicy="no-referrer"
                          className="h-10 w-10 rounded-lg object-cover bg-slate-50 border border-slate-100"
                        />
                        <div className="min-w-0 max-w-xs space-y-0.5">
                          <div className="font-semibold text-slate-900 truncate">
                            {listing.title}
                          </div>
                          <div className="text-xs text-slate-400 font-mono">
                            ID: {listing.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Seller name */}
                    <td className="py-4 px-6 font-medium text-slate-800">
                      {listing.sellerName}
                    </td>

                    {/* Price */}
                    <td className="py-4 px-6 font-mono text-xs font-bold text-slate-900">
                      ₹{listing.price.toLocaleString('en-IN')}
                    </td>

                    {/* Category */}
                    <td className="py-4 px-6 text-xs text-slate-500 font-mono">
                      {listing.category}
                    </td>

                    {/* Rent / Sell badge */}
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                        listing.type === 'rent'
                          ? 'bg-blue-50 text-blue-700 border border-blue-100'
                          : 'bg-slate-100 text-slate-700 border border-slate-100'
                      }`}>
                        {listing.type === 'rent' ? 'Rent' : 'Sell'}
                      </span>
                    </td>

                    {/* Actions delete */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDeleteListing(listing.id, listing.title)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-red-100 bg-red-50 hover:bg-red-100 text-red-700 cursor-pointer transition-colors"
                        id={`btn-admin-deletelist-${listing.id}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {listings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No active listings found on the campus marketplace.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
