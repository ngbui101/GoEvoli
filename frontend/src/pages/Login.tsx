import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, User as UserIcon, Lock, Eye, EyeOff, Loader2, Sparkles, UserPlus } from 'lucide-react';
import { CardShell } from '../components/cards/CardShell';
import { authApi } from '../api/auth';
import { CardArtwork, FINAL_EVOLUTIONS } from '../components/cards/CardArtwork';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [randomEvo, setRandomEvo] = useState(FINAL_EVOLUTIONS[0]);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Select a random evolution on mount to make the login screen feel special and collectible
    setRandomEvo(FINAL_EVOLUTIONS[Math.floor(Math.random() * FINAL_EVOLUTIONS.length)]);
  }, []);

  useEffect(() => {
    if (user) {
      navigate('/projects');
    }
  }, [user, navigate]);

  const validateEmail = (val: string): boolean => {
    if (!val) return true; // Let HTML5 'required' handle empty strings
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      const msg = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
      setError(msg);
      return false;
    }
    if (error && error.includes('E-Mail')) {
      setError(null);
    }
    return true;
  };

  const handleEmailBlur = async () => {
    if (!validateEmail(email) || !email) return;
    
    setIsCheckingEmail(true);
    try {
      const { exists } = await authApi.checkEmail(email);
      if (exists) {
        setAuthMode('login');
      } else {
        setAuthMode('register');
        // Default name from email if not set
        if (!name) {
          const prefix = email.split('@')[0];
          setName(prefix.charAt(0).toUpperCase() + prefix.slice(1));
        }
      }
    } catch (err) {
      console.error("Email check failed:", err);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateEmail(email)) {
      toast.error('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (authMode === 'register') {
        await authApi.register({ name, email, password });
        toast.success('Beschwörer-Konto erstellt!');
      }
      await login({ email, password });
      navigate('/projects');
    } catch (err: any) {
      let msg = err.message || 'Anmeldung fehlgeschlagen.';
      // Check if it's a 401 error or contains the invalid credentials message
      if (msg.includes('401') || msg.toLowerCase().includes('invalid credentials')) {
        msg = 'Zugriff verweigert: Email oder Passwort falsch.';
      }
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-evoli-bg px-4 py-12 playmat-grid">
      <div className="relative z-10 animate-in fade-in zoom-in duration-500">
        <CardShell
          size="active"
          title="Beschwörung"
          headerRight={
            <div className="px-2 py-0.5 bg-evoli-primary/10 rounded-full border border-evoli-primary/20 text-[7px] font-black uppercase tracking-widest text-evoli-primary">
               Summoner Card
            </div>
          }
          artwork={
            <CardArtwork
              imageName={randomEvo.file}
              imageLabel={randomEvo.label}
              holo={randomEvo.holo}
              status="FINAL_EVOLUTION"
              isBoard={false}
            />
          }
           footer={
              <div className="flex flex-col items-center justify-center w-full gap-2">
                 <Button
                   type="submit"
                   form="login-form"
                   isLoading={isSubmitting}
                   className="w-full h-10 text-xs shadow-md transition-all duration-500 overflow-hidden relative group"
                   size="sm"
                 >
                   <div className="relative flex items-center justify-center w-full h-full">
                      <div className={clsx(
                        "flex items-center justify-center transition-all duration-500 absolute",
                        authMode === 'login' ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
                      )}>
                        <LogIn className="w-4 h-4 mr-2" />
                        <span>Einloggen</span>
                      </div>
                      <div className={clsx(
                        "flex items-center justify-center transition-all duration-500 absolute",
                        authMode === 'register' ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
                      )}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        <span>Registrieren</span>
                      </div>
                   </div>
                 </Button>
                 <div className="text-center text-evoli-text/30 font-black uppercase tracking-widest text-[7px]">
                    GoEvoli Identity Protocol v2.0
                 </div>
              </div>
           }
          className="shadow-2xl"
        >
          <div className="h-full flex flex-col justify-center p-4">
            <form id="login-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-3">
                <div className="relative">
                   <UserIcon className="absolute left-3 top-[34px] w-3.5 h-3.5 text-evoli-text/20" />
                   <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error && error.includes('E-Mail')) setError(null);
                    }}
                    onBlur={handleEmailBlur}
                    required
                    placeholder="name@projekt.com"
                    id="login-email"
                    className="pl-9 h-10 bg-[#FFF6DD]/40 border-[#7A4A2D]/10 focus:border-evoli-primary/40 font-bold text-xs"
                  />
                  {isCheckingEmail && (
                    <div className="absolute right-3 top-[34px] animate-spin">
                      <Loader2 className="w-3.5 h-3.5 text-evoli-primary/50" />
                    </div>
                  )}
                </div>

                <div className="relative">
                   <Lock className="absolute left-3 top-[34px] w-3.5 h-3.5 text-evoli-text/20" />
                   <Input
                    label="Passwort"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    id="login-password"
                    className="pl-9 pr-10 h-10 bg-[#FFF6DD]/40 border-[#7A4A2D]/10 focus:border-evoli-primary/40 font-bold text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[34px] p-0.5 text-evoli-text/20 hover:text-evoli-primary transition-colors focus:outline-none"
                    aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                  {/* Reserved space for error message to prevent jumping */}
                  <div className="h-4 mt-1">
                    {error && (
                      <p className="text-[7px] font-black uppercase tracking-widest text-red-600 animate-in fade-in slide-in-from-top-1 duration-300">
                        {error}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </CardShell>
      </div>
      
      {/* Decorative ornaments for the login screen background */}
      <div className="fixed top-20 left-20 w-40 h-40 bg-evoli-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 right-20 w-60 h-60 bg-evoli-secondary/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};
