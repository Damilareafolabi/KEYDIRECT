import React, { useState } from 'react';
import { X, Lock, Mail, Phone, ShieldCheck, UserCheck, KeyRound, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; role: UserRole; email: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<UserRole>('Renter');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+234 ');
  const [password, setPassword] = useState('');
  const [ninPlaceholder, setNinPlaceholder] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      onLoginSuccess({
        name: email.split('@')[0] || 'KeyDirect User',
        role,
        email: email || 'user@keydirect.ng',
      });
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-6 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white">
              <KeyRound className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <h3 className="font-heading font-black text-base tracking-tight">
                {mode === 'login' ? 'Sign In to KeyDirect' : 'Create Verified Account'}
              </h3>
              <p className="text-[11px] text-stone-400">
                Zero-Key Local Auth (Django JWT Ready)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-heading font-bold text-lg text-stone-900">
              Authenticated Successfully!
            </h4>
            <p className="text-xs text-stone-500">
              Session active with role: <strong>{role}</strong>
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            
            {/* Mode switch */}
            <div className="flex bg-stone-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'login' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'register' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Register
              </button>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                Select Your Role
              </label>
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {(['Renter', 'Owner', 'Agent', 'Developer'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 rounded-lg font-bold transition-all cursor-pointer border text-center ${
                      role === r
                        ? 'bg-red-50 border-red-500 text-red-600'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">
                  Email Address
                </label>
                <div className="flex items-center bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5">
                  <Mail className="w-4 h-4 text-stone-400 mr-2 shrink-0" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. user@gmail.com"
                    className="w-full bg-transparent outline-none text-stone-900"
                  />
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">
                    Phone Number (Nigerian Mobile)
                  </label>
                  <div className="flex items-center bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5">
                    <Phone className="w-4 h-4 text-stone-400 mr-2 shrink-0" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 803 000 0000"
                      className="w-full bg-transparent outline-none text-stone-900"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">
                  Password
                </label>
                <div className="flex items-center bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5">
                  <Lock className="w-4 h-4 text-stone-400 mr-2 shrink-0" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent outline-none text-stone-900"
                  />
                </div>
              </div>

              {mode === 'register' && (role === 'Owner' || role === 'Agent') && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-bold mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>NIN Verification Placeholder</span>
                  </div>
                  <input
                    type="text"
                    value={ninPlaceholder}
                    onChange={(e) => setNinPlaceholder(e.target.value)}
                    placeholder="11-digit NIN (Zero external key demo)"
                    className="w-full bg-white border border-emerald-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-900 outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer text-xs uppercase tracking-wider mt-2"
              >
                {mode === 'login' ? 'Sign In' : 'Complete Registration'}
              </button>
            </form>

            <div className="pt-2 text-center text-[11px] text-stone-400">
              Protected by SimeonJrStudios Anti-Scam Biometric Protocol
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
