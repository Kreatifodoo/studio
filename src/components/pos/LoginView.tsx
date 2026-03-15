
"use client";

import React, { useState } from 'react';
import { usePOS } from './POSContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, User as UserIcon, LogIn, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const KompakLogo = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 2 7 0 5-4 9-7 11z" />
    <path d="M9 20l-5-5" />
    <path d="M17 14l4-4" />
  </svg>
);

export function LoginView() {
  const { login, storeSettings } = usePOS();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setIsLoading(true);
    setTimeout(() => {
      const success = login(username, password);
      if (success) {
        toast({
          title: "Selamat Datang!",
          description: `Login berhasil sebagai ${username}.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Gagal Masuk",
          description: "Username atau password salah. Silakan coba lagi.",
        });
      }
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F9FBFF] p-4 font-poppins">
      <div className="w-full max-w-[340px] md:max-w-md">
        <div className="flex flex-col items-center mb-6 md:mb-10 text-center">
          <div className="bg-primary p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl shadow-primary/20 mb-4 md:mb-6 flex items-center justify-center min-w-[70px] min-h-[70px] md:min-w-[90px] md:min-h-[90px]">
            {storeSettings.logoUrl ? (
              <img src={storeSettings.logoUrl} alt="Logo" className="h-10 w-10 md:h-14 md:w-14 object-contain invert brightness-0" />
            ) : (
              <KompakLogo className="h-10 w-10 md:h-14 md:w-14 text-white" />
            )}
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-[#1a1f2b]">{storeSettings.name}</h1>
          <p className="text-muted-foreground font-bold mt-1 md:mt-2 uppercase tracking-[0.3em] text-[8px] md:text-[10px]">Sistem Kasir Enterprise</p>
        </div>

        <Card className="border-none shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] rounded-[2.5rem] md:rounded-[3.5rem] p-2 md:p-4 bg-white overflow-hidden">
          <CardHeader className="text-center pb-4 md:pb-8 pt-6 md:pt-10 px-4">
            <CardTitle className="text-xl md:text-2xl font-black">Masuk Akun</CardTitle>
            <CardDescription className="text-[10px] md:text-sm font-medium">Gunakan akses staf untuk memulai sesi kasir</CardDescription>
          </CardHeader>
          
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4 md:space-y-6 px-6 md:px-10">
              <div className="space-y-2">
                <Label className="font-black text-[9px] uppercase tracking-[0.2em] text-muted-foreground ml-1">Username</Label>
                <div className="relative">
                  <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/30" />
                  <Input 
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-14 md:h-16 rounded-2xl border-2 bg-muted/5 focus-visible:ring-primary/20 pl-14 font-bold text-sm md:text-lg"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="font-black text-[9px] uppercase tracking-[0.2em] text-muted-foreground ml-1">Kata Sandi</Label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/30" />
                  <Input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Sandi Staf"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 md:h-16 rounded-2xl border-2 bg-muted/5 focus-visible:ring-primary/20 pl-14 pr-14 font-bold text-sm md:text-lg"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="px-6 md:px-10 pb-10 md:pb-14 pt-6 md:pt-8">
              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full h-16 md:h-20 rounded-2xl text-base md:text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 gap-3"
              >
                {isLoading ? (
                  <div className="h-6 w-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="h-6 w-6" />
                    Buka Sesi Kasir
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <p className="text-center mt-10 md:mt-14 text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40">
          &copy; {new Date().getFullYear()} KOMPAK POS • PREMIUM ENTERPRISE SYSTEM
        </p>
      </div>
    </div>
  );
}
