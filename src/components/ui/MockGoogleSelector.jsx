import React, { useState } from 'react';
import { Mail, User, X, Zap } from 'lucide-react';
import { Button } from './button';

const MOCK_ACCOUNTS = [
  { name: 'Sung Jinwoo', email: 'jinwoo@gmail.com' },
  { name: 'Cha Hae-In', email: 'haein@gmail.com' },
  { name: 'Go Gunhee', email: 'gunhee@gmail.com' },
];

export default function MockGoogleSelector({ isOpen, onClose, onSelect, title = 'CHOOSE ACCOUNT', subtitle = 'SELECT A PROFILE TO SYNC WITH GOOGLE' }) {
  const [customEmail, setCustomEmail] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const isGmailAddress = (email) => /^[^\s@]+@gmail\.com$/i.test(email.trim());

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const emailTrimmed = customEmail.trim();
    if (!emailTrimmed) {
      setError('Please enter a Gmail address.');
      return;
    }
    if (!isGmailAddress(emailTrimmed)) {
      setError('Must be a valid Gmail address ending in @gmail.com.');
      return;
    }
    setError('');
    onSelect(emailTrimmed, emailTrimmed.split('@')[0]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-br from-slate-950 via-black to-slate-950 border border-slate-800 p-6 md:p-8 bracket-corners shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-cyan-300 transition-colors"
          aria-label="Close selector"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="font-mono text-[10px] text-cyan-400 tracking-[0.2em] mb-1">// SECURE MOCK AUTHENTICATION</div>
          <h2 className="font-display text-xl text-slate-100 tracking-widest font-black uppercase">{title}</h2>
          <p className="mt-2 text-xs text-slate-400 font-mono tracking-wide">{subtitle}</p>
        </div>

        <div className="space-y-3">
          {MOCK_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => onSelect(acc.email, acc.name)}
              className="w-full text-left p-4 bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/60 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-cyan-300 group-hover:border-cyan-500/35">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-200 group-hover:text-slate-100">{acc.name}</div>
                  <div className="text-xs text-slate-500 font-mono">{acc.email}</div>
                </div>
              </div>
              <Mail className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:rune-glow" />
            </button>
          ))}
        </div>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-800" />
          <span className="font-mono text-[9px] text-slate-500 tracking-widest">OR USE A CUSTOM ACCOUNT</span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        <form onSubmit={handleCustomSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono text-slate-400 tracking-wider mb-2">CUSTOM GMAIL ADDRESS</label>
            <div className="relative flex h-11 border border-slate-800 bg-black focus-within:border-cyan-500">
              <input
                type="email"
                value={customEmail}
                onChange={(e) => {
                  setCustomEmail(e.target.value);
                  setError('');
                }}
                placeholder="hunter.name@gmail.com"
                className="w-full bg-transparent px-4 text-xs text-slate-100 outline-none placeholder-slate-600"
              />
            </div>
            {error && <span className="mt-1.5 block text-[10px] text-red-400 font-mono">{error}</span>}
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-cyan-400 text-black hover:bg-cyan-300 font-display font-bold tracking-wider rounded-none text-xs"
          >
            CALIBRATE PROFILE <Zap className="w-3.5 h-3.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
