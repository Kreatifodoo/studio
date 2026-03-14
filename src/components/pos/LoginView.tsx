"use client";

import React, { useState } from 'react';
import { usePOS } from './POSContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, User as UserIcon, LogIn, UtensilsCrossed, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
          <div className="bg-primary p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl shadow-primary/20 mb-4 md:mb-6 flex items-center justify-center min-w-[60px] min-h-[60px] md:min-w-[80px] md:min-h-[80px]">
            {storeSettings.logoUrl ? (
              <img src={storeSettings.logoUrl} alt="Logo" className="h-8 w-8 md:h-12 md:w-12 object-contain invert brightness-0" />
            ) : (
              <UtensilsCrossed className="h-8 w-8 md:h-10 md:w-10 text-white" />
            )}
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-[#1a1f2b]">{storeSettings.name}</h1>
          <p className="text-muted-foreground font-bold mt-1 md:mt-2 uppercase tracking-widest text-[8px] md:text-[11px]">Sistem Point of Sale Modern</p>
        </div>

        <Card className="border-none shadow-[0_30px_60px_-12px_rgba(0,0,0,0.08)] rounded-[2rem] md:rounded-[3rem] p-2 md:p-4 bg-white overflow-hidden">
          <CardHeader className="text-center pb-4 md:pb-8 pt-6 md:pt-8 px-4">
            <CardTitle className="text-xl md:text-2xl font-black">Masuk</CardTitle>
            <CardDescription className="text-[10px] md:text-sm font-medium">Masukkan kredensial Anda untuk memulai sesi</CardDescription>
          </CardHeader>
          
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4 md:space-y-6 px-6 md:px-8">
              <div className="space-y-2">
                <Label className="font-black text-[9px] uppercase tracking-[0.2em] text-muted-foreground ml-1">Username</Label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                  <Input 
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-12 md:h-16 rounded-xl md:rounded-[1.25rem] border-2 bg-muted/5 focus-visible:ring-primary/20 pl-11 md:pl-14 font-bold text-sm md:text-lg"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <Label className="font-black text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Sandi</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                  <Input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Kata sandi"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 md:h-16 rounded-xl md:rounded-[1.25rem] border-2 bg-muted/5 focus-visible:ring-primary/20 pl-11 md:pl-14 pr-11 md:pr-14 font-bold text-sm md:text-lg"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="px-6 md:px-8 pb-8 md:pb-10 pt-4 md:pt-6">
              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full h-14 md:h-18 rounded-xl md:rounded-[1.25rem] text-base md:text-lg font-black bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 gap-3"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="h-5 w-5 md:h-6 md:w-6" />
                    Masuk Sekarang
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <p className="text-center mt-8 md:mt-12 text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-60">
          &copy; {new Date().getFullYear()} NEXTPOS • MODERN POS SYSTEM
        </p>
      </div>
    </div>
  );
}
