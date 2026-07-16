import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '../hooks/use-toast';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const user = JSON.parse(window.localStorage.getItem('arise-current-user') || 'null');
    setCurrentUser(user);
  }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    window.localStorage.removeItem('arise-current-user');
    setCurrentUser(null);
    toast({
      title: '[LOGOUT]',
      description: 'You have exited the system. Good luck, hunter.',
    });
    navigate('/');
  };

  const links = [
    { label: 'Ranks', href: '#ranks' },
    { label: 'Quests', href: '#quests' },
    { label: 'Stats', href: '#stats' },
    { label: 'Hunters', href: '#hunters' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all ${scrolled ? 'bg-black/85 backdrop-blur-md border-b border-cyan-400/10' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 flex items-center justify-center border border-cyan-400/50 bg-cyan-400/10 relative">
            <Shield className="w-4.5 h-4.5 text-cyan-300" strokeWidth={2.5} />
            <div className="absolute -top-0.5 -left-0.5 w-2 h-2 border-t border-l border-red-500" />
            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 border-b border-r border-red-500" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg font-black text-slate-50 tracking-widest">ARISE</div>
            <div className="font-mono text-[9px] tracking-[0.25em] text-cyan-300">RANKED PROTOCOL</div>
          </div>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="font-display text-sm tracking-widest text-slate-300 hover:text-cyan-300 transition-colors">
              {l.label.toUpperCase()}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {currentUser ? (
            <>
              <Button asChild variant="ghost" className="font-display tracking-widest text-slate-300 hover:text-cyan-300 hover:bg-cyan-400/5 rounded-none">
                <Link to="/dashboard">DASHBOARD</Link>
              </Button>
              <Button onClick={handleLogout} className="h-10 px-5 bg-red-500 hover:bg-red-400 text-white font-display tracking-widest rounded-none">
                LOGOUT
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" className="font-display tracking-widest text-slate-300 hover:text-cyan-300 hover:bg-cyan-400/5 rounded-none">
                <Link to="/login">LOGIN</Link>
              </Button>
              <Button asChild className="h-10 px-5 bg-red-500 hover:bg-red-400 text-white font-display tracking-widest rounded-none">
                <Link to="/signup">AWAKEN</Link>
              </Button>
            </>
          )}
        </div>

        <button onClick={() => setOpen((o) => !o)} className="md:hidden text-slate-100 p-2" aria-label="menu">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-cyan-400/10 bg-black/95">
          <div className="px-6 py-4 flex flex-col gap-4">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="font-display tracking-widest text-slate-200 hover:text-cyan-300">
                {l.label.toUpperCase()}
              </a>
            ))}
            {currentUser ? (
              <>
                <Button asChild variant="ghost" className="h-10 text-slate-300 hover:text-cyan-300 hover:bg-cyan-400/5 font-display tracking-widest rounded-none w-full">
                  <Link to="/dashboard" onClick={() => setOpen(false)}>DASHBOARD</Link>
                </Button>
                <Button onClick={() => { handleLogout(); setOpen(false); }} className="h-10 bg-red-500 hover:bg-red-400 text-white font-display tracking-widest rounded-none w-full">
                  LOGOUT
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" className="h-10 text-slate-300 hover:text-cyan-300 hover:bg-cyan-400/5 font-display tracking-widest rounded-none w-full">
                  <Link to="/login" onClick={() => setOpen(false)}>LOGIN</Link>
                </Button>
                <Button asChild className="h-10 bg-red-500 hover:bg-red-400 text-white font-display tracking-widest rounded-none w-full">
                  <Link to="/signup" onClick={() => setOpen(false)}>AWAKEN</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
