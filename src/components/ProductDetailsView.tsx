import React, { useState } from 'react';
import { ArrowLeft, Tag, Calendar, Send, ShieldAlert, BadgeInfo, CheckCircle, MessageSquare } from 'lucide-react';
import { Listing } from '../types';
import { optimizeCloudinaryUrl } from '../lib/cloudinary';

interface ProductDetailsViewProps {
  listingId: string;
  listings: Listing[];
  onNavigate: (page: string) => void;
  isLoggedIn: boolean;
  onOpenInterestModal: (listing: Listing) => void;
}

export const ProductDetailsView: React.FC<ProductDetailsViewProps> = ({
  listingId,
  listings,
  onNavigate,
  isLoggedIn,
  onOpenInterestModal,
}) => {
  const listing = listings.find((l) => l.id === listingId);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!listing) {
    return (
      <div className="max-w-xl mx-auto my-16 text-center" id="details-not-found">
        <p className="text-slate-500 text-sm mb-4">Listing not found or has been removed.</p>
        <button
          onClick={() => onNavigate('home')}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl"
        >
          Return Home
        </button>
      </div>
    );
  }

  const getConditionStyle = (cond: string) => {
    switch (cond) {
      case 'new': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'like-new': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'good': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'fair': return 'bg-orange-50 text-orange-700 border-orange-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const getConditionLabel = (cond: string) => {
    switch (cond) {
      case 'new': return 'Brand New';
      case 'like-new': return 'Like New';
      case 'good': return 'Good';
      case 'fair': return 'Fair';
      default: return cond;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6" id="product-details-view">
      {/* Back Button Header */}
      <div className="flex items-center">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl transition-all cursor-pointer"
          id="btn-back-home"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Marketplace
        </button>
      </div>

      {/* Main product Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs">
        {/* Left Side: Images Gallery */}
        <div className="space-y-4">
          <div className="aspect-4/3 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden relative">
            <img
              src={optimizeCloudinaryUrl(listing.images[activeImageIndex]) || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=600'}
              alt={listing.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain bg-slate-50"
              id="details-main-img"
            />
            {listing.isSold && (
              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center">
                <span className="text-sm font-extrabold text-white uppercase tracking-wider bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
                  Sold Out
                </span>
              </div>
            )}
            {listing.type === 'rent' && (
              <div className="absolute top-4 right-4">
                <span className="text-[11px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-md bg-blue-600 text-white shadow-sm border border-blue-500">
                  Rent
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails list */}
          {listing.images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1" id="details-thumbnails">
              {listing.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative h-16 w-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    activeImageIndex === idx ? 'border-blue-500 scale-95' : 'border-slate-100 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={optimizeCloudinaryUrl(img)}
                    alt={`Thumbnail ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-contain bg-slate-50"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Meta & Contact */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                {listing.category}
              </span>
              <span className={`text-xs font-bold tracking-wide px-2 py-0.5 rounded-md border ${getConditionStyle(listing.condition)}`}>
                {getConditionLabel(listing.condition)}
              </span>
            </div>

            <h1 className="font-sans font-bold text-xl sm:text-2xl text-slate-900 leading-tight">
              {listing.title}
            </h1>

            {/* Price section */}
            <div className="flex items-baseline gap-1 bg-slate-50 border border-slate-100/50 p-4 rounded-2xl">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">
                ₹{listing.price.toLocaleString('en-IN')}
              </span>
              {listing.type === 'rent' && (
                <span className="text-sm font-medium text-slate-500 font-sans ml-1">
                  / cycle (rent)
                </span>
              )}
              {listing.type === 'sell' && (
                <span className="text-xs font-medium text-slate-400 font-sans ml-2">
                  (one-time buy)
                </span>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                Description
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {listing.description}
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-100">
            {/* Meta Row: Date & Trust Info */}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono font-medium text-slate-400">
              <div className="space-y-1">
                <span className="block uppercase tracking-wider text-[10px] text-slate-300">Listed By</span>
                <span className="text-slate-700 font-sans font-semibold">{listing.sellerName}</span>
              </div>
              <div className="space-y-1">
                <span className="block uppercase tracking-wider text-[10px] text-slate-300">Listed Date</span>
                <span className="text-slate-700">
                  {new Date(listing.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {/* Contact Alert Banner */}
            <div className="p-3.5 bg-blue-50/50 border border-blue-50 text-blue-800 text-xs rounded-xl leading-relaxed flex items-start gap-2.5">
              <BadgeInfo className="h-4.5 w-4.5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <strong>Student Privacy Lock</strong>: Contact information is strictly protected. Real mobile phone numbers are invisible. Exchange details securely via direct Telegram chat.
              </div>
            </div>

            {/* Buy Action Button */}
            {!listing.isSold ? (
              <button
                onClick={() => onOpenInterestModal(listing)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-2xl shadow-xs hover:shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                id="btn-details-interested"
              >
                <MessageSquare className="h-5 w-5" />
                Get Contact Details
              </button>
            ) : (
              <div className="w-full bg-slate-100 text-slate-400 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 border border-slate-200">
                <CheckCircle className="h-5 w-5" />
                This product is Sold
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
