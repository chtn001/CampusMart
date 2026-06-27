-- CAMPUSMART DATABASE SCHEMA FOR SUPABASE POSTGRESQL
-- This file contains the complete SQL script to set up tables, relationships, constraints, indexes, 
-- Row Level Security (RLS) policies, and triggers for CampusMart.

-- ==========================================
-- 1. CLEANUP (Optional / Re-runnable)
-- ==========================================
-- To perform a clean installation, you can uncomment these lines. Be aware that this drops all existing data.
-- DROP TRIGGER IF EXISTS enforce_listings_limit ON public.listings;
-- DROP FUNCTION IF EXISTS public.check_active_listings_limit();
-- DROP TABLE IF EXISTS public.listings;
-- DROP TABLE IF EXISTS public.profiles;

-- ==========================================
-- 2. PROFILES TABLE
-- ==========================================
-- Mapped 1:1 with Supabase Auth users. This table stores essential student profiles,
-- contact coordinates, and administration level privileges.
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    roll_number TEXT NOT NULL UNIQUE,
    mobile_number TEXT NOT NULL UNIQUE,
    telegram_username TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT false NOT NULL,
    is_banned BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- String length constraints to prevent blank entries
    CONSTRAINT roll_number_not_empty CHECK (char_length(trim(roll_number)) >= 1),
    CONSTRAINT mobile_number_not_empty CHECK (char_length(trim(mobile_number)) >= 1)
);

-- ==========================================
-- 3. LISTINGS TABLE
-- ==========================================
-- Stores campus marketplace items posted by students for selling or renting.
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    category TEXT NOT NULL,
    condition TEXT NOT NULL,
    listing_type TEXT NOT NULL, -- 'Sell' or 'Rent'
    image_urls TEXT[] NOT NULL DEFAULT '{}', -- up to 3 URLs
    status TEXT NOT NULL DEFAULT 'Active', -- 'Active' or 'Sold'
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Constraint: Validate listing status (Active or Sold)
    CONSTRAINT valid_listing_status CHECK (status IN ('Active', 'Sold')),

    -- Constraint: Validate listing type (Sell or Rent)
    CONSTRAINT valid_listing_type CHECK (listing_type IN ('Sell', 'Rent')),

    -- Constraint: Validate category (matching the frontend ListingCategory type)
    CONSTRAINT valid_category CHECK (category IN (
        'Books', 'Electronics', 'Cycle & Transport', 'Lab & Drawing', 
        'Hostel Essentials', 'Clothing & Sports', 'Others'
    )),

    -- Constraint: Validate condition (matching the frontend ListingCondition type)
    CONSTRAINT valid_condition CHECK (condition IN (
        'new', 'like-new', 'good', 'fair'
    )),

    -- Constraint: Maximum of 3 images per listing
    CONSTRAINT image_urls_limit CHECK (
        cardinality(image_urls) <= 3
    ),

    -- Constraint: Guarantee positive listing price
    CONSTRAINT positive_price CHECK (price >= 0)
);

-- ==========================================
-- 4. PERFORMANCE INDEXES
-- ==========================================
-- Index 1: Speed up homepage listings query (filtering out sold items and ordering by date)
CREATE INDEX IF NOT EXISTS idx_listings_active_recent
ON public.listings (status, created_at DESC)
WHERE status = 'Active';

-- Index 2: Speed up queries filtering/searching listings by category
CREATE INDEX IF NOT EXISTS idx_listings_category_active
ON public.listings (category, status)
WHERE status = 'Active';

-- Index 3: Speed up querying a specific student's own listings list
CREATE INDEX IF NOT EXISTS idx_listings_owner_id
ON public.listings (owner_id);

-- ==========================================
-- 5. CONSTRAINT: MAX 5 ACTIVE LISTINGS TRIGGER
-- ==========================================
-- Enforce that a user cannot have more than 5 active listings at any point in time.
CREATE OR REPLACE FUNCTION public.check_active_listings_limit()
RETURNS TRIGGER AS $$
DECLARE
    active_count INTEGER;
BEGIN
    -- This constraint logic runs when:
    -- - Inserting a new listing with 'Active' status
    -- - Updating an existing listing's status to 'Active'
    IF (TG_OP = 'INSERT' AND NEW.status = 'Active') OR
       (TG_OP = 'UPDATE' AND NEW.status = 'Active' AND OLD.status != 'Active') THEN
        
        SELECT COUNT(*) INTO active_count
        FROM public.listings
        WHERE owner_id = NEW.owner_id AND status = 'Active';

        IF active_count >= 5 THEN
            RAISE EXCEPTION 'You cannot have more than 5 active listings at the same time. Please mark one of your current items as Sold or delete it to proceed.'
                USING ERRCODE = 'restrict_violation';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger before INSERT or UPDATE
DROP TRIGGER IF EXISTS enforce_listings_limit ON public.listings;
CREATE TRIGGER enforce_listings_limit
BEFORE INSERT OR UPDATE ON public.listings
FOR EACH ROW
EXECUTE FUNCTION public.check_active_listings_limit();

-- ==========================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
-- Enable Row Level Security on both tables to secure client-side database calls
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------
-- A. PROFILES POLICIES
-- ------------------------------------------

-- Policy A.1: Anyone can read profiles (publicly readable so listings can display owner info)
DROP POLICY IF EXISTS "Profiles are publicly readable" ON public.profiles;
CREATE POLICY "Profiles are publicly readable"
ON public.profiles
FOR SELECT
USING (true);

-- Policy A.2: Users can insert their own profile details during sign up
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy A.3: Users can update their own profile but cannot change is_admin to true unless they already are admins
DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;
CREATE POLICY "Users can update their own profiles"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id 
    AND (
        -- Admins can update any field
        (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
        OR
        -- Non-admins cannot escalate themselves to is_admin = true
        is_admin = false
    )
);

-- ------------------------------------------
-- B. LISTINGS POLICIES
-- ------------------------------------------

-- Policy B.1: Anyone can view listings, unless the listing owner's profile is banned
DROP POLICY IF EXISTS "Listings are publicly readable" ON public.listings;
CREATE POLICY "Listings are publicly readable"
ON public.listings
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = listings.owner_id
          AND profiles.is_banned = false
    )
);

-- Policy B.2: Authenticated and unbanned users can create their own listings
DROP POLICY IF EXISTS "Authenticated users can create listings" ON public.listings;
CREATE POLICY "Authenticated users can create listings"
ON public.listings
FOR INSERT
WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
          AND profiles.is_banned = false
    )
);

-- Policy B.3: Owners can update their listings, and Admins can update any listing
DROP POLICY IF EXISTS "Owners or Admins can update listings" ON public.listings;
CREATE POLICY "Owners or Admins can update listings"
ON public.listings
FOR UPDATE
USING (
    auth.uid() = owner_id
    OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- Policy B.4: Owners can delete their listings, and Admins can delete any listing
DROP POLICY IF EXISTS "Owners or Admins can delete listings" ON public.listings;
CREATE POLICY "Owners or Admins can delete listings"
ON public.listings
FOR DELETE
USING (
    auth.uid() = owner_id
    OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);
