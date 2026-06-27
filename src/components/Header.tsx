import React, { useState } from 'react';
import { ShoppingBag, HelpCircle, FileText, PlusCircle, List, User as UserIcon, LogOut, ShieldAlert, Menu, X } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User | null;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentPage,
  onNavigate,
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Home', page: 'home', icon: ShoppingBag },
    { label: 'Help', page: 'help', icon: HelpCircle },
    { label: 'Terms', page: 'terms', icon: FileText },
  ];

  const handleNav = (page: string) => {
    onNavigate(page);
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-100 shadow-xs backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div 
            onClick={() => handleNav('home')} 
            className="flex items-center gap-2.5 cursor-pointer group"
            id="nav-logo"
          >
            <div className="bg-blue-600 text-white p-2 rounded-xl transition-transform group-hover:scale-105 duration-200">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="font-sans font-bold text-xl tracking-tight text-slate-900">
              Campus<span className="text-blue-600">Mart</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.page;
              return (
                <button
                  key={item.page}
                  onClick={() => handleNav(item.page)}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-all cursor-pointer py-1.5 px-3 rounded-lg ${
                    isActive 
                      ? 'text-blue-600 bg-blue-50/50' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  id={`nav-item-${item.page}`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                {currentUser.isAdmin && (
                  <button
                    onClick={() => handleNav('admin')}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 transition-all cursor-pointer ${
                      currentPage === 'admin' ? 'bg-red-50' : ''
                    }`}
                    id="nav-admin"
                  >
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Admin
                  </button>
                )}
                
                <button
                  onClick={() => handleNav('add-listing')}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer hover:shadow-md active:scale-95"
                  id="nav-add-listing"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Listing
                </button>

                <button
                  onClick={() => handleNav('my-listings')}
                  className={`flex items-center gap-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-sm font-medium px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    currentPage === 'my-listings' ? 'bg-slate-50 text-slate-900' : ''
                  }`}
                  id="nav-my-listings"
                >
                  <List className="h-4 w-4" />
                  My Listings
                </button>

                <button
                  onClick={() => handleNav('profile')}
                  className={`flex items-center gap-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-sm font-medium px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    currentPage === 'profile' ? 'bg-slate-50 text-slate-900' : ''
                  }`}
                  id="nav-profile"
                >
                  <UserIcon className="h-4 w-4 text-blue-600" />
                  Profile
                </button>

                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 text-sm font-medium px-3 py-2 rounded-xl transition-all cursor-pointer"
                  title="Logout"
                  id="nav-logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleNav('login')}
                  className="text-slate-700 hover:text-slate-900 text-sm font-medium px-4 py-2 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                  id="nav-login-btn"
                >
                  Login
                </button>
                <button
                  onClick={() => handleNav('signup')}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-xs transition-all hover:shadow-md active:scale-95 cursor-pointer"
                  id="nav-signup-btn"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {currentUser?.isAdmin && (
              <button
                onClick={() => handleNav('admin')}
                className={`p-1.5 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 transition-all ${
                  currentPage === 'admin' ? 'bg-red-50' : ''
                }`}
                id="mobile-admin-btn"
              >
                <ShieldAlert className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
              aria-label="Toggle menu"
              id="mobile-menu-toggle"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => handleNav(item.page)}
                className={`flex w-full items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'text-blue-600 bg-blue-50/50' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}

          <div className="border-t border-slate-100 pt-3 mt-2">
            {currentUser ? (
              <div className="space-y-1.5">
                <div className="px-3 pb-2">
                  <p className="text-xs text-slate-400 font-mono">LOGGED IN AS</p>
                  <p className="text-sm font-semibold text-slate-800 truncate">{currentUser.fullName}</p>
                  <p className="text-xs text-slate-500 font-mono">{currentUser.rollNumber}</p>
                </div>

                <button
                  onClick={() => handleNav('add-listing')}
                  className="flex w-full items-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2.5 rounded-xl text-sm font-medium shadow-xs"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Listing
                </button>

                <button
                  onClick={() => handleNav('my-listings')}
                  className={`flex w-full items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    currentPage === 'my-listings' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'
                  }`}
                >
                  <List className="h-4 w-4" />
                  My Listings
                </button>

                <button
                  onClick={() => handleNav('profile')}
                  className={`flex w-full items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    currentPage === 'profile' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'
                  }`}
                >
                  <UserIcon className="h-4 w-4" />
                  Profile
                </button>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    onLogout();
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 text-sm font-medium transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 p-1">
                <button
                  onClick={() => handleNav('login')}
                  className="w-full text-center text-slate-700 hover:bg-slate-50 py-2.5 rounded-xl text-sm font-medium transition-all"
                >
                  Login
                </button>
                <button
                  onClick={() => handleNav('signup')}
                  className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium shadow-xs transition-all"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
