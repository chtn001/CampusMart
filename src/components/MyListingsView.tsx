import React, { useState } from 'react';
import { List, CheckCircle, Trash2, Edit, Plus, Eye, CheckCircle2, ChevronRight, AlertTriangle } from 'lucide-react';
import { Listing, User } from '../types';
import { optimizeCloudinaryUrl } from '../lib/cloudinary';

interface MyListingsViewProps {
  currentUser: User | null;
  listings: Listing[];
  onEditListing: (id: string) => void;
  onDeleteListing: (id: string) => void;
  onMarkAsSold: (id: string) => void;
  onNavigate: (page: string) => void;
  onSelectListing: (id: string) => void;
  addToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const MyListingsView: React.FC<MyListingsViewProps> = ({
  currentUser,
  listings,
  onEditListing,
  onDeleteListing,
  onMarkAsSold,
  onNavigate,
  onSelectListing,
  addToast,
}) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 text-center" id="listings-not-logged-in">
        <p className="text-slate-500 text-sm mb-4">Please log in to manage your listings.</p>
        <button
          onClick={() => onNavigate('login')}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-xs"
        >
          Sign In
        </button>
      </div>
    );
  }

  const myListings = listings.filter((l) => l.sellerId === currentUser.id);

  const handleDelete = (id: string) => {
    onDeleteListing(id);
    setDeleteConfirmId(null);
    addToast('Listing deleted successfully.', 'success');
  };

  const handleMarkSold = (id: string) => {
    onMarkAsSold(id);
    addToast('Product marked as Sold! It is now hidden from the homepage.', 'success');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8" id="my-listings-view">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans font-bold text-2xl text-slate-900 tracking-tight">
            My Listings
          </h1>
          <p className="text-slate-500 text-sm">
            Edit, delete, and mark your listed products as sold.
          </p>
        </div>
        <button
          onClick={() => onNavigate('add-listing')}
          disabled={myListings.filter(l => !l.isSold).length >= 5}
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-xs hover:shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
          id="mylistings-add-btn"
        >
          <Plus className="h-4 w-4" />
          Add New Listing
        </button>
      </div>

      {myListings.length > 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
          <div className="divide-y divide-slate-100">
            {myListings.map((listing) => (
              <div
                key={listing.id}
                className="p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors"
                id={`listing-item-${listing.id}`}
              >
                {/* Left side: Image and details */}
                <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                  <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl bg-slate-50 border border-slate-100 shrink-0 overflow-hidden">
                    <img
                      src={optimizeCloudinaryUrl(listing.images[0])}
                      alt={listing.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-contain bg-slate-50"
                    />
                    {listing.isSold && (
                      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-slate-950/80 px-1.5 py-0.5 rounded">
                          Sold
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        {listing.category}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {listing.type === 'rent' ? 'Rent' : 'Sell'}
                      </span>
                    </div>
                    <h3 className="font-sans font-bold text-base text-slate-900 truncate pr-4">
                      {listing.title}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-slate-900 font-mono">
                        ₹{listing.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(listing.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side: Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto">
                  {/* Mark as sold button */}
                  {!listing.isSold ? (
                    <button
                      onClick={() => handleMarkSold(listing.id)}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer"
                      id={`btn-marksold-${listing.id}`}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Mark Sold
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                      <CheckCircle2 className="h-4 w-4" />
                      Sold
                    </span>
                  )}

                  {/* View Details button */}
                  <button
                    onClick={() => onSelectListing(listing.id)}
                    className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-100 transition-colors cursor-pointer"
                    title="View Product Page"
                  >
                    <Eye className="h-4.5 w-4.5" />
                  </button>

                  {/* Edit button */}
                  <button
                    onClick={() => onEditListing(listing.id)}
                    className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-100 transition-colors cursor-pointer"
                    title="Edit Details"
                    id={`btn-edit-${listing.id}`}
                  >
                    <Edit className="h-4.5 w-4.5" />
                  </button>

                  {/* Delete button or confirmation */}
                  {deleteConfirmId === listing.id ? (
                    <div className="flex items-center gap-1.5 bg-red-50 border border-red-100 p-1 rounded-xl">
                      <span className="text-[10px] text-red-700 font-bold px-1.5">Sure?</span>
                      <button
                        onClick={() => handleDelete(listing.id)}
                        className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg cursor-pointer"
                        id={`btn-delete-confirm-${listing.id}`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="text-slate-500 hover:text-slate-700 text-[10px] font-semibold px-2 py-1"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(listing.id)}
                      className="p-2 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-xl border border-slate-100 hover:border-red-100 transition-all cursor-pointer"
                      title="Delete Product"
                      id={`btn-delete-${listing.id}`}
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty state */
        <div className="py-16 text-center bg-white border border-slate-100 rounded-3xl" id="mylistings-empty">
          <div className="bg-slate-50 text-slate-400 p-4 rounded-2xl inline-flex mb-4">
            <List className="h-8 w-8" />
          </div>
          <h3 className="font-sans font-bold text-lg text-slate-950 mb-1">
            No listings created yet
          </h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
            You don't have any products on CampusMart. Sell textbook notes, electronic devices, or rent out items to earn extra cash!
          </p>
          <button
            onClick={() => onNavigate('add-listing')}
            className="mt-5 text-sm font-semibold text-white bg-blue-600 px-5 py-2.5 rounded-xl hover:bg-blue-700 shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add First Listing
          </button>
        </div>
      )}

      {/* Cap notification warning if reaching limit */}
      {myListings.filter(l => !l.isSold).length >= 5 && (
        <div className="p-4 bg-amber-50 border border-amber-100 text-amber-800 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-sans font-bold text-sm">Listing Cap Limit Reached</h4>
            <p className="text-xs text-amber-700 leading-relaxed mt-0.5">
              You currently have 5 active listings. To add another listing, please delete an existing active listing or mark one of your listings as Sold.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
