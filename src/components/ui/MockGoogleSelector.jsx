import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function MockGoogleSelector({ isOpen, onClose, onSelect, title = 'Choose an account', subtitle = 'to continue to arise-sandy.vercel.app' }) {
  const [view, setView] = useState('chooser'); // 'chooser' or 'login'
  const [customEmail, setCustomEmail] = useState('');
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);

  if (!isOpen) return null;

  const isGmailAddress = (email) => /^[^\s@]+@gmail\.com$/i.test(email.trim());

  const handleSelectAccount = (email, name) => {
    onSelect(email, name);
  };

  const handleUseAnother = () => {
    setView('login');
    setCustomEmail('');
    setError('');
  };

  const handleNext = (e) => {
    e.preventDefault();
    const emailTrimmed = customEmail.trim();
    if (!emailTrimmed) {
      setError('Enter an email or phone number');
      return;
    }
    if (!isGmailAddress(emailTrimmed)) {
      setError('Enter a valid Gmail address (e.g. name@gmail.com)');
      return;
    }
    setError('');
    onSelect(emailTrimmed, emailTrimmed.split('@')[0]);
  };

  const isLabelFloated = focused || customEmail;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-sans select-none animate-fade-in">
      <div className="w-full max-w-[448px] bg-[#131314] border border-[#3c4043] rounded-[28px] p-6 md:p-10 flex flex-col relative text-[#e3e3e3] shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-500 hover:text-slate-300 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {view === 'chooser' ? (
          <>
            {/* Google Logo */}
            <div className="flex items-center gap-2 mb-6 mt-2">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-6 h-6">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.5 24c0-1.61-.15-3.16-.42-4.69H24v8.89h12.64C35.1 31.06 31.9 33.5 27.5 35h.03l7.67 5.93c4.49-4.13 7.3-10.22 7.3-16.93z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.67-5.93c-2.15 1.45-4.92 2.3-8.22 2.3-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span className="text-sm font-medium text-slate-300">Sign in with Google</span>
            </div>

            <h1 className="text-2xl font-normal text-slate-100 mb-2">Choose an account</h1>
            <p className="text-sm text-slate-300 mb-8">
              to continue to <span className="text-[#8ab4f8] hover:underline cursor-pointer">arise-sandy.vercel.app</span>
            </p>

            {/* Account List */}
            <div className="flex flex-col border border-[#3c4043] rounded-2xl overflow-hidden mb-6">
              {/* Primary User Account */}
              <button
                type="button"
                onClick={() => handleSelectAccount('aravaswal20@gmail.com', 'Arav')}
                className="w-full text-left py-4 px-6 flex items-center gap-4 hover:bg-[#2c2c2e] transition-colors border-b border-[#3c4043] outline-none"
              >
                <div className="w-9 h-9 rounded-full bg-[#0a58ca] flex items-center justify-center text-white font-medium text-lg">
                  A
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-[#e3e3e3]">Arav</div>
                  <div className="text-xs text-[#c4c7c5]">aravaswal20@gmail.com</div>
                </div>
              </button>

              {/* Use another account */}
              <button
                type="button"
                onClick={handleUseAnother}
                className="w-full text-left py-4 px-6 flex items-center gap-4 hover:bg-[#2c2c2e] transition-colors outline-none"
              >
                <div className="w-9 h-9 rounded-full border border-[#3c4043] flex items-center justify-center text-[#e3e3e3]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-[#e3e3e3]">Use another account</div>
              </button>
            </div>
          </>
        ) : (
          /* Sign In Form */
          <form onSubmit={handleNext}>
            {/* Google Logo */}
            <div className="flex items-center gap-2 mb-6 mt-2">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-6 h-6">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.5 24c0-1.61-.15-3.16-.42-4.69H24v8.89h12.64C35.1 31.06 31.9 33.5 27.5 35h.03l7.67 5.93c4.49-4.13 7.3-10.22 7.3-16.93z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.67-5.93c-2.15 1.45-4.92 2.3-8.22 2.3-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span className="text-sm font-medium text-slate-300">Sign in with Google</span>
            </div>

            <h1 className="text-2xl font-normal text-slate-100 mb-2">Sign in</h1>
            <p className="text-sm text-slate-300 mb-8">
              to continue to <span className="text-[#8ab4f8] hover:underline cursor-pointer">arise-sandy.vercel.app</span>
            </p>

            <div className="relative w-full h-[56px] rounded border border-[#8e918f] focus-within:border-2 focus-within:border-[#a8c7fa] bg-transparent transition-all mb-1">
              <input
                type="email"
                className="w-full h-full bg-transparent px-4 pt-3 text-base text-[#e3e3e3] outline-none"
                value={customEmail}
                onChange={(e) => {
                  setCustomEmail(e.target.value);
                  setError('');
                }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                required
              />
              <span
                className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                  isLabelFloated
                    ? 'top-[-8px] text-xs text-[#a8c7fa] bg-[#131314] px-1.5'
                    : 'top-1/2 -translate-y-1/2 text-base text-[#8e918f]'
                }`}
              >
                Email or phone
              </span>
            </div>
            {error && (
              <div className="text-xs text-[#f2b8b5] mt-1.5 flex items-center gap-1.5 font-sans">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setView('chooser');
                setCustomEmail('');
                setError('');
              }}
              className="text-sm font-medium text-[#a8c7fa] hover:text-[#c2e7ff] transition-colors mt-4 block outline-none"
            >
              Forgot email?
            </button>

            <div className="flex items-center justify-between mt-10">
              <button
                type="button"
                onClick={() => {
                  setView('chooser');
                  setCustomEmail('');
                  setError('');
                }}
                className="text-sm font-medium text-[#a8c7fa] hover:text-[#c2e7ff] transition-colors outline-none"
              >
                Create account
              </button>
              <button
                type="submit"
                className="h-10 px-6 bg-[#a8c7fa] text-[#0f0f0f] hover:bg-[#c2e7ff] font-medium text-sm rounded-full transition-colors outline-none"
              >
                Next
              </button>
            </div>
          </form>
        )}

        {/* Footer Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-10 pt-6 border-t border-[#3c4043]/30 text-xs text-[#c4c7c5] gap-4">
          <div className="flex items-center gap-1 hover:bg-slate-800/30 px-2 py-1 rounded cursor-pointer transition-colors">
            <span>English (United States)</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:underline cursor-pointer">Help</span>
            <span className="hover:underline cursor-pointer">Privacy</span>
            <span className="hover:underline cursor-pointer">Terms</span>
          </div>
        </div>
      </div>
    </div>
  );
}
