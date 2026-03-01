import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, reset } from '../features/auth/store/authSlice';
import { useTranslation } from 'react-i18next';
import { LogOut, LayoutDashboard, CheckCircle2, Dumbbell, GraduationCap, Wallet, Sparkles, Menu, X } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'DASHBOARD', icon: <LayoutDashboard size={18} />, color: 'text-blue-400' },
    { to: '/finance', label: 'FINANCE', icon: <Wallet size={18} />, color: 'text-emerald-400' },
    { to: '/habits', label: 'HABITS', icon: <CheckCircle2 size={18} />, color: 'text-indigo-400' },
    { to: '/fitness', label: 'FITNESS', icon: <Dumbbell size={18} />, color: 'text-rose-400' },
    { to: '/upskill', label: 'UPSKILL', icon: <GraduationCap size={18} />, color: 'text-orange-400' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
      isScrolled ? 'bg-[#0a0a0c]/80 backdrop-blur-2xl border-b border-slate-800/50 py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <div className="relative">
              {/* <Sparkles className="w-5 h-5 text-white animate-pulse absolute -top-1 -left-1 opacity-50" /> */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                <Wallet className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-3">
              <span className="text-xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tighter italic uppercase">
                FINTRACKER
              </span>
              <div className="h-[2px] w-0 group-hover:w-full bg-blue-500 transition-all duration-500" />
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center bg-slate-900/40 backdrop-blur-md border border-slate-800/50 rounded-2xl p-1 px-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black tracking-widest transition-all duration-300 ${
                  isActive(link.to) 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 scale-105' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <span className={isActive(link.to) ? 'text-white' : link.color}>{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Controls */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol User</span>
              <span className="text-sm font-bold text-white">{user?.name}</span>
            </div>
            
            <div className="flex items-center bg-slate-900/40 backdrop-blur-md border border-slate-800/50 rounded-2xl p-1">
              <LanguageSwitcher />
              <div className="w-[1px] h-6 bg-slate-800 mx-1" />
              <button
                onClick={onLogout}
                className="p-2.5 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 rounded-xl transition-all duration-300 group"
                title="TERMINATE_SESSION"
              >
                <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
              </button>
            </div>

            {/* Mobile Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#0a0a0c] border-b border-slate-800 p-4 lg:hidden animate-in slide-in-from-top duration-300">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-4 p-4 rounded-2xl text-xs font-black tracking-widest transition-all ${
                  isActive(link.to) ? 'bg-blue-600 text-white' : 'bg-slate-900/50 text-slate-400'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
