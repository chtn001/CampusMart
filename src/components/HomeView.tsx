import React, { useState, useMemo } from 'react';
import { Search, Tag, Calendar, User as UserIcon, Send, MessageSquare, ArrowRight, BookOpen, Laptop, Bike, Award, Home as HomeIcon, Shirt, MoreHorizontal, Sparkles } from 'lucide-react';
import { Listing, ListingCategory } from '../types';
import { optimizeCloudinaryUrl } from '../lib/cloudinary';
import { motion } from 'motion/react';

interface HomeViewProps {
  listings: Listing[];
  onSelectListing: (id: string) => void;
  onNavigate: (page: string) => void;
  isLoggedIn: boolean;
  onOpenInterestModal: (listing: Listing) => void;
}

const CATEGORIES: { label: ListingCategory; icon: React.ReactNode }[] = [
  { label: 'Books', icon: <BookOpen className="h-4 w-4" /> },
  { label: 'Electronics', icon: <Laptop className="h-4 w-4" /> },
  { label: 'Cycle & Transport', icon: <Bike className="h-4 w-4" /> },
  { label: 'Lab & Drawing', icon: <Award className="h-4 w-4" /> },
  { label: 'Hostel Essentials', icon: <HomeIcon className="h-4 w-4" /> },
  { label: 'Clothing & Sports', icon: <Shirt className="h-4 w-4" /> },
  { label: 'Others', icon: <MoreHorizontal className="h-4 w-4" /> },
];

export const HomeView: React.FC<HomeViewProps> = ({
  listings,
  onSelectListing,
  onNavigate,
  isLoggedIn,
  onOpenInterestModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ListingCategory | 'All'>('All');

  // Filter listings: exclude sold, filter by category and search query
  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      if (listing.isSold) return false;
      
      const matchesCategory = selectedCategory === 'All' || listing.category === selectedCategory;
      const matchesSearch = 
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [listings, selectedCategory, searchQuery]);

  const formatPostedDate = (dateString: string): string => {
    try {
      const diffTime = Math.abs(new Date().getTime() - new Date(dateString).getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays}d ago`;
    } catch (e) {
      return 'Recent';
    }
  };

  const getConditionLabel = (cond: string) => {
    switch (cond) {
      case 'new': return { text: 'New', class: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
      case 'like-new': return { text: 'Like New', class: 'bg-blue-50 text-blue-700 border-blue-100' };
      case 'good': return { text: 'Good', class: 'bg-amber-50 text-amber-700 border-amber-100' };
      case 'fair': return { text: 'Fair', class: 'bg-orange-50 text-orange-700 border-orange-100' };
      default: return { text: cond, class: 'bg-slate-50 text-slate-700 border-slate-100' };
    }
  };

  return (
    <div className="space-y-10" id="home-view">
      {/* Hero Header Banner */}
      <section className="relative overflow-hidden bg-white border border-slate-100 rounded-3xl p-8 sm:p-12 shadow-xs text-center sm:text-left">
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 bg-radial from-blue-600/50 to-transparent pointer-events-none rounded-r-3xl"></div>
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
            <Sparkles className="h-3.5 w-3.5" />
            Official Single-Campus Marketplace
          </div>
          <h1 className="font-sans font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-slate-900 leading-tight">
            Buy, Sell & Rent <br className="hidden sm:inline" />
            Used Campus Essentials.
          </h1>
          <p className="text-slate-500 text-base max-w-lg leading-relaxed font-sans font-normal">
            A premium, reliable peer-to-peer student marketplace. Connect instantly with peers using secure Telegram usernames.
          </p>
          <div className="pt-3 flex flex-wrap gap-3 justify-center sm:justify-start">
            <button
              onClick={() => isLoggedIn ? onNavigate('add-listing') : onNavigate('login')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-xs hover:shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              id="hero-sell-btn"
            >
              Start Selling
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigate('terms')}
              className="text-slate-600 hover:text-slate-900 font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              How It Works
            </button>
          </div>
        </div>
      </section>

      {/* Sticky Filter and Search Panel */}
      <section className="space-y-6">
        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto" id="search-section">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search books, electronic gadgets, bicycles..."
            className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 text-sm focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-sans"
            id="search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Categories Grid/Scroller */}
        <div className="space-y-2.5" id="category-section">
          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase font-mono text-center md:text-left">
            Browse Categories
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
              id="category-btn-all"
            >
              <Tag className="h-4 w-4" />
              All Items
            </button>

            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.label;
              return (
                <button
                  key={cat.label}
                  onClick={() => setSelectedCategory(cat.label)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                  }`}
                  id={`category-btn-${cat.label.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  {cat.icon}
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product Cards Grid */}
      <section className="space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <h2 className="font-sans font-bold text-xl text-slate-900">
            {selectedCategory === 'All' ? 'Recent Listings' : `${selectedCategory}`}
          </h2>
          <span className="text-xs font-mono font-medium text-slate-400">
            {filteredListings.length} {filteredListings.length === 1 ? 'item' : 'items'} found
          </span>
        </div>

        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" id="product-grid">
            {filteredListings.map((listing) => {
              const cond = getConditionLabel(listing.condition);
              const isRent = listing.type === 'rent';

              return (
                <div
                  key={listing.id}
                  className="group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-200 transition-all duration-300 flex flex-col cursor-pointer"
                  onClick={() => onSelectListing(listing.id)}
                  id={`product-card-${listing.id}`}
                >
                  {/* Image wrapper */}
                  <div className="relative aspect-4/3 bg-slate-50 overflow-hidden shrink-0">
                    <img
                      src={optimizeCloudinaryUrl(listing.images[0]) || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=400'}
                      alt={listing.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain bg-slate-50 group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Floating Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                      <span className={`text-[11px] font-bold tracking-wide uppercase px-2 py-1 rounded-md border ${cond.class}`}>
                        {cond.text}
                      </span>
                    </div>

                    {isRent && (
                      <div className="absolute top-3 right-3">
                        <span className="text-[11px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-md bg-blue-600 text-white shadow-sm border border-blue-500">
                          Rent
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        {listing.category}
                      </span>
                      <h3 className="font-sans font-semibold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                        {listing.title}
                      </h3>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                      {/* Price & Rent Details */}
                      <div>
                        <span className="text-base font-extrabold text-slate-900">
                          ₹{listing.price.toLocaleString('en-IN')}
                        </span>
                        {isRent && <span className="text-[10px] font-medium text-slate-400 font-mono"> / cycle</span>}
                      </div>

                      {/* Posted date */}
                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 font-mono">
                        <Calendar className="h-3 w-3" />
                        {formatPostedDate(listing.createdAt)}
                      </span>
                    </div>

                    {/* Button Row */}
                    <div className="mt-4 pt-1 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenInterestModal(listing);
                        }}
                        className="flex-1 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-700 hover:text-blue-800 text-xs font-semibold tracking-wide transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                        id={`btn-interested-${listing.id}`}
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Interested
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty state */
          <div className="py-16 text-center bg-white border border-slate-100 rounded-3xl" id="empty-state">
            <div className="bg-slate-50 text-slate-400 p-4 rounded-2xl inline-flex mb-4">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="font-sans font-bold text-lg text-slate-950 mb-1">
              No listings found
            </h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
              We couldn't find any items matching your criteria. Try adjusting your search query or pick another category.
            </p>
            {(searchQuery !== '' || selectedCategory !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="mt-5 text-xs font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-all cursor-pointer"
              >
                Reset all filters
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
