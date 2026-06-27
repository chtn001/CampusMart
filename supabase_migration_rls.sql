-- ============================================================================
-- CAMPUSMART SUPABASE SECURITY MIGRATION: RECURSIVE-PROOF RLS HARDENING
-- ============================================================================
-- Act: Senior Supabase Security Engineer
-- Purpose: Remediate RLS recursion, Privilege Escalation, Self-Unbanning, 
--          Admin Lockouts, and Search Path Vulnerabilities.
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. DEFINE RECURSION-PROOF SECURITY DEFINER HELPERS
-- ============================================================================
-- These functions use SECURITY DEFINER and SET search_path = public to bypass 
-- RLS when querying the profiles table. This guarantees ZERO recursive policy
-- evaluation, which would otherwise crash with "stack depth limit exceeded".

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN COALESCE(
        (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
        false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_banned()
RETURNS boolean AS $$
BEGIN
    RETURN COALESCE(
        (SELECT is_banned FROM public.profiles WHERE id = auth.uid()),
        false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ============================================================================
-- 2. HARDEN TRIGGER FUNCTIONS (SECURITY DEFINER & SEARCH PATH)
-- ============================================================================
ALTER FUNCTION public.check_active_listings_limit() 
    SECURITY DEFINER 
    SET search_path = public;


-- ============================================================================
-- 3. HARDEN public.profiles ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy A.1: Profiles are publicly readable (Anyone can select)
DROP POLICY IF EXISTS "Profiles are publicly readable" ON public.profiles;
CREATE POLICY "Profiles are publicly readable"
ON public.profiles
FOR SELECT
USING (true);

-- Policy A.2: Users can insert their own profile during sign-up
-- Prevents self-promotion (is_admin = true) and self-banning override during insert.
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (
    auth.uid() = id 
    AND is_admin = false 
    AND is_banned = false
);

-- Policy A.3: Users can update their own profiles & Admins can update any profile
-- Uses our helper functions to avoid recursive RLS on profiles.
-- Prevents regular users from unbanning themselves or escalating their admin privileges.
DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users or Admins can update profiles" ON public.profiles;

CREATE POLICY "Users or Admins can update profiles"
ON public.profiles
FOR UPDATE
USING (
    auth.uid() = id
    OR public.is_admin()
)
WITH CHECK (
    public.is_admin()
    OR (
        auth.uid() = id
        AND NOT public.is_banned() -- Banned users cannot update their profile
        AND is_admin = false       -- Non-admins cannot self-promote to admin
        AND is_banned = false      -- Non-admins cannot unban themselves
    )
);


-- ============================================================================
-- 4. HARDEN public.listings ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Policy B.1: Anyone can read listings unless the listing owner is banned OR the viewer is banned
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
    AND NOT public.is_banned()
);

-- Policy B.2: Authenticated and unbanned users can create listings
DROP POLICY IF EXISTS "Authenticated users can create listings" ON public.listings;
CREATE POLICY "Authenticated users can create listings"
ON public.listings
FOR INSERT
WITH CHECK (
    auth.uid() = owner_id
    AND NOT public.is_banned()
);

-- Policy B.3: Owners can update their listings, and Admins can update any listing
-- Prevents regular users from changing the owner of a listing.
DROP POLICY IF EXISTS "Owners or Admins can update listings" ON public.listings;
CREATE POLICY "Owners or Admins can update listings"
ON public.listings
FOR UPDATE
USING (
    (auth.uid() = owner_id AND NOT public.is_banned())
    OR public.is_admin()
)
WITH CHECK (
    (auth.uid() = owner_id AND NOT public.is_banned())
    OR public.is_admin()
);

-- Policy B.4: Owners can delete their listings, and Admins can delete any listing
DROP POLICY IF EXISTS "Owners or Admins can delete listings" ON public.listings;
CREATE POLICY "Owners or Admins can delete listings"
ON public.listings
FOR DELETE
USING (
    (auth.uid() = owner_id AND NOT public.is_banned())
    OR public.is_admin()
);

COMMIT;
