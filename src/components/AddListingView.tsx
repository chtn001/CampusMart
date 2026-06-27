import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, Check, Image as ImageIcon, AlertCircle, Sparkles } from 'lucide-react';
import { Listing, ListingCategory, ListingCondition, ListingType, User } from '../types';
import { optimizeCloudinaryUrl } from '../lib/cloudinary';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AddListingViewProps {
  currentUser: User | null;
  editingListingId: string | null;
  listings: Listing[];
  onAddListing: (listing: Omit<Listing, 'id' | 'sellerId' | 'sellerName' | 'sellerTelegram' | 'sellerMobile' | 'isSold' | 'createdAt'>) => void;
  onUpdateListing: (id: string, updatedFields: Partial<Listing>) => void;
  onNavigate: (page: string) => void;
  addToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

const CATEGORIES: ListingCategory[] = [
  'Books', 'Electronics', 'Cycle & Transport', 'Lab & Drawing', 'Hostel Essentials', 'Clothing & Sports', 'Others'
];

const CONDITIONS: { value: ListingCondition; label: string; desc: string }[] = [
  { value: 'new', label: 'Brand New', desc: 'Unopened, original packaging, unused.' },
  { value: 'like-new', label: 'Like New', desc: 'Opened, used once or twice, perfect condition.' },
  { value: 'good', label: 'Good', desc: 'Slight wear, fully functional, minor scratches.' },
  { value: 'fair', label: 'Fair', desc: 'Visible wear, fully functional, budget price.' }
];

// Curated stock photos for rapid student listings
const PRESET_PHOTOS = [
  { url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400', label: 'Textbook' },
  { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400', label: 'Headphones' },
  { url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=400', label: 'Bicycle' },
  { url: 'https://images.unsplash.com/photo-1618944913480-b67ee16d7b77?auto=format&fit=crop&q=80&w=400', label: 'Cooler / Fan' },
  { url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=400', label: 'Lab Kit' }
];

// Helper to compress and optimize image to high-fidelity JPEG using HTML5 canvas
const compressAndOptimizeImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Max dimensions for optimization (e.g., max 1200px width/height)
        const MAX_DIM = 1200;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string); // Fallback to original base64 if canvas context fails
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Export as optimized JPEG with 0.8 quality (80% compression is excellent and keeps files tiny)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export const AddListingView: React.FC<AddListingViewProps> = ({
  currentUser,
  editingListingId,
  listings,
  onAddListing,
  onUpdateListing,
  onNavigate,
  addToast,
}) => {
  const isEditMode = !!editingListingId;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<ListingCategory>('Books');
  const [type, setType] = useState<ListingType>('sell');
  const [condition, setCondition] = useState<ListingCondition>('good');
  
  // Image states
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  // Hydrate form in Edit Mode
  useEffect(() => {
    if (isEditMode && editingListingId) {
      const existing = listings.find(l => l.id === editingListingId);
      if (existing) {
        setTitle(existing.title);
        setDescription(existing.description);
        setPrice(existing.price.toString());
        setCategory(existing.category);
        setType(existing.type);
        setCondition(existing.condition);
        setUploadedUrls(existing.images);
      }
    } else {
      // Clear fields if creating
      setTitle('');
      setDescription('');
      setPrice('');
      setCategory('Books');
      setType('sell');
      setCondition('good');
      setUploadedUrls([]);
    }
  }, [isEditMode, editingListingId, listings]);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 text-center" id="add-not-logged-in">
        <p className="text-slate-500 text-sm mb-4">Please log in to add products to the marketplace.</p>
        <button
          onClick={() => onNavigate('login')}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-xs"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Active listings capacity check (Only on create!)
  const activeListingsCount = listings.filter(l => l.sellerId === currentUser.id && !l.isSold).length;
  const isCapReached = !isEditMode && activeListingsCount >= 5;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (uploadedUrls.length + files.length > 3) {
      setError('You can upload a maximum of 3 images.');
      addToast('Maximum 3 images allowed', 'error');
      return;
    }

    setIsUploading(true);
    setError('');

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

    // Validate all files first before starting uploads
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!allowedTypes.includes(file.type)) {
        setError(`Invalid format for ${file.name}. Only JPG, JPEG, PNG, and WEBP files are allowed.`);
        addToast('Invalid image format', 'error');
        setIsUploading(false);
        return;
      }
      if (file.size > maxSizeBytes) {
        setError(`File ${file.name} is too large. Max size is 5 MB.`);
        addToast('File exceeds 5 MB limit', 'error');
        setIsUploading(false);
        return;
      }
    }

    try {
      const newUrls: string[] = [];
      let isFallbackUsed = false;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 1. Client-side canvas compression & optimization to minimize upload payload size
        const compressedBase64 = await compressAndOptimizeImage(file);

        let uploadedUrl = '';
        try {
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };

          if (isSupabaseConfigured()) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token) {
              headers['Authorization'] = `Bearer ${session.access_token}`;
            }
          }

          // 2. Upload to our secure Express backend proxy route
          const response = await fetch('/api/upload', {
            method: 'POST',
            headers,
            body: JSON.stringify({ image: compressedBase64 }),
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'Server rejected upload');
          }

          const data = await response.json();
          if (data.url) {
            uploadedUrl = data.url;
          }
        } catch (uploadErr: any) {
          console.warn('Cloudinary upload bypassed/failed, falling back to client-side optimized image:', uploadErr);
          // Fallback: Use the client-side compressed base64 string
          uploadedUrl = compressedBase64;
          isFallbackUsed = true;
        }

        if (uploadedUrl) {
          newUrls.push(uploadedUrl);
        }
      }

      setUploadedUrls(prev => [...prev, ...newUrls]);
      if (isFallbackUsed) {
        addToast('Images optimized & loaded locally (Cloudinary unconfigured)', 'info');
      } else {
        addToast('Images uploaded to Cloudinary successfully!', 'success');
      }
    } catch (err: any) {
      console.error('IMAGE_UPLOAD_ERROR_CONSOLE:', err);
      setError(`Upload failed: ${err.message || 'Check server configuration.'}`);
      addToast('Image upload failed', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setUploadedUrls(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const handlePresetSelect = (url: string) => {
    if (uploadedUrls.length >= 3) {
      setError('You can upload a maximum of 3 images.');
      addToast('Maximum 3 images allowed', 'error');
      return;
    }
    setUploadedUrls(prev => [...prev, url]);
    addToast('Curated asset pre-loaded!', 'info');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isCapReached) {
      setError('Submission blocked. You have reached the maximum active limit of 5 listings. Please delete or mark another product as sold.');
      addToast('Listing capacity limit reached', 'error');
      return;
    }

    if (!title.trim() || !description.trim() || !price) {
      setError('Please fill in all required fields.');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setError('Price must be a valid number.');
      return;
    }

    // Default placeholder image if none uploaded
    const finalImages = uploadedUrls.length > 0 
      ? uploadedUrls 
      : ['https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=600'];

    if (isEditMode && editingListingId) {
      onUpdateListing(editingListingId, {
        title: title.trim(),
        description: description.trim(),
        price: priceNum,
        category,
        type,
        condition,
        images: finalImages,
      });
      addToast('Listing updated successfully!', 'success');
      onNavigate('my-listings');
    } else {
      onAddListing({
        title: title.trim(),
        description: description.trim(),
        price: priceNum,
        category,
        type,
        condition,
        images: finalImages,
      });
      addToast('New product added to CampusMart!', 'success');
      onNavigate('home');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8" id="add-listing-view">
      {/* View Header */}
      <div>
        <h1 className="font-sans font-bold text-2xl text-slate-900 tracking-tight">
          {isEditMode ? 'Edit Listing' : 'List a Product'}
        </h1>
        <p className="text-slate-500 text-sm">
          {isEditMode 
            ? 'Modify product specifications and details immediately.' 
            : 'Sell or rent used notes, bikes, electronics and graphical components.'}
        </p>
      </div>

      {isCapReached && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-800 rounded-2xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-sans font-bold text-sm">Action Restricted</h4>
            <p className="text-xs text-red-700 leading-relaxed mt-0.5">
              You currently have 5 active listings, which is the absolute limit for student accounts. You cannot add a new listing until you delete one or mark an existing listing as sold.
            </p>
          </div>
        </div>
      )}

      {/* Main Form Box */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold leading-relaxed flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* 1. Image Upload Block */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-500 tracking-wide uppercase font-mono">
            Product Images (Max 3) <span className="text-red-500">*</span>
          </label>
          
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* Upload Area Button */}
            <div 
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isUploading 
                  ? 'bg-slate-50 border-slate-200 cursor-not-allowed' 
                  : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50 hover:border-blue-300'
              }`}
              id="file-upload-trigger"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading || uploadedUrls.length >= 3}
                className="hidden"
              />
              {isUploading ? (
                <div className="space-y-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mx-auto"></div>
                  <p className="text-[11px] font-medium text-slate-500 font-mono">Simulating CDN...</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Upload className="h-6 w-6 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">Browse Photos</p>
                  <p className="text-[10px] text-slate-400">PNG, JPG up to 5MB</p>
                </div>
              )}
            </div>

            {/* Uploaded Previews */}
            {uploadedUrls.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden group">
                <img
                  src={optimizeCloudinaryUrl(url)}
                  alt={`Upload preview ${index + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain bg-slate-50"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-slate-900/85 hover:bg-red-600 text-white p-1 rounded-full shadow-xs transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            {/* Empty slots placeholders */}
            {Array.from({ length: Math.max(0, 3 - uploadedUrls.length) }).map((_, i) => {
              if (i === 0 && uploadedUrls.length === 0) return null; // Don't duplicate slot 1
              return (
                <div key={i} className="hidden sm:flex aspect-square rounded-2xl border border-slate-100 bg-slate-50/30 items-center justify-center text-slate-300">
                  <ImageIcon className="h-5 w-5" />
                </div>
              );
            })}
          </div>

          {/* Quick Preset Selector for Easy Testing */}
          <div className="pt-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-blue-500" /> Or pick a high-fidelity campus item photo:
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {PRESET_PHOTOS.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handlePresetSelect(preset.url)}
                  disabled={uploadedUrls.length >= 3}
                  className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-100 hover:border-blue-300 rounded-lg text-slate-600 font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
                >
                  <ImageIcon className="h-3.5 w-3.5 text-slate-400" />
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Text Fields Block */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Title */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 tracking-wide uppercase font-mono">
              Product Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isCapReached}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Drafting Board A1 size with Stand"
              className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-hidden focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all font-sans"
              id="form-title"
            />
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 tracking-wide uppercase font-mono">
              Price (₹ INR) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="0"
              disabled={isCapReached}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g., 500"
              className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-hidden focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all font-mono"
              id="form-price"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 tracking-wide uppercase font-mono">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              disabled={isCapReached}
              onChange={(e) => setCategory(e.target.value as ListingCategory)}
              className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-hidden focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer font-sans"
              id="form-category"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Type Selector (Sell or Rent) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 tracking-wide uppercase font-mono">
              Listing Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3" id="form-type-selector">
              <button
                type="button"
                disabled={isCapReached}
                onClick={() => setType('sell')}
                className={`py-3 rounded-xl text-xs font-semibold tracking-wide border transition-all cursor-pointer ${
                  type === 'sell'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                For Sale
              </button>
              <button
                type="button"
                disabled={isCapReached}
                onClick={() => setType('rent')}
                className={`py-3 rounded-xl text-xs font-semibold tracking-wide border transition-all cursor-pointer ${
                  type === 'rent'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                For Rent
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 tracking-wide uppercase font-mono">
              Product Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              disabled={isCapReached}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="State working condition, accessories included, and typical pick-up spot on campus (e.g. Hostel 3 lobby, Academic block canteen)..."
              className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-hidden focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all font-sans"
              id="form-description"
            />
          </div>

          {/* Condition Select Box */}
          <div className="sm:col-span-2 space-y-2.5">
            <label className="text-xs font-semibold text-slate-500 tracking-wide uppercase font-mono">
              Product Condition <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="form-condition-grid">
              {CONDITIONS.map((cond) => {
                const isSelected = condition === cond.value;
                return (
                  <button
                    key={cond.value}
                    type="button"
                    disabled={isCapReached}
                    onClick={() => setCondition(cond.value)}
                    className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-100'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <Check className="h-2.5 w-2.5" />}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{cond.label}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 pl-6 leading-relaxed">{cond.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Submit Actions Button */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onNavigate(isEditMode ? 'my-listings' : 'home')}
            className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isCapReached}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
            id="form-submit-btn"
          >
            {isEditMode ? 'Save Changes' : 'Publish Listing'}
          </button>
        </div>
      </form>
    </div>
  );
};
