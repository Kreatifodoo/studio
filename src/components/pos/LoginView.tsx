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
    // Simulate a small delay for better UX
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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F9FBFF] p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-primary p-4 rounded-[2rem] shadow-2xl shadow-primary/20 mb-6">
            <UtensilsCrossed className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-[#1a1f2b]">{storeSettings.name}</h1>
          <p className="text-muted-foreground font-bold mt-2">Sistem Point of Sale Modern</p>
        </div>

        <Card className="border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] rounded-[3rem] p-4 bg-white overflow-hidden">
          <CardHeader className="text-center pb-8 pt-8">
            <CardTitle className="text-2xl font-black">Masuk ke Sistem</CardTitle>
            <CardDescription className="font-medium">Masukkan kredensial Anda untuk memulai sesi kerja</CardDescription>
          </CardHeader>
          
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-6 px-8">
              <div className="space-y-3">
                <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Username</Label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                  <Input 
                    placeholder="Masukkan username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-14 rounded-2xl border-2 focus-visible:ring-primary/20 pl-12 font-bold"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center ml-1">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Kata Sandi</Label>
                  <button type="button" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Lupa Sandi?</button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                  <Input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan kata sandi"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 rounded-2xl border-2 focus-visible:ring-primary/20 pl-12 pr-12 font-bold"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="px-8 pb-10 pt-6">
              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full h-16 rounded-2xl text-lg font-black bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 gap-3"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    Masuk Sekarang
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <p className="text-center mt-10 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
          &copy; {new Date().getFullYear()} NextPOS • Kelola Bisnis Jadi Lebih Mudah
        </p>
      </div>
    </div>
  );
}