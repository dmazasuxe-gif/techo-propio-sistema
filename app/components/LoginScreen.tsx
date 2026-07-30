/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { Lock, User, ArrowRight, ShieldCheck, Mail, Building2, Sparkles, Command } from "lucide-react";

interface LoginScreenProps {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (isRegistering) {
        if (!email || !username || !password) {
          setError("Por favor completa todos los campos.");
          setIsLoading(false);
          return;
        }

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, username, password })
        });
        
        const data = await res.json();
        
        if (data.success) {
          onLogin();
        } else {
          setError(data.message || "Error al registrar la cuenta.");
        }
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        
        const data = await res.json();

        if (data.success) {
          onLogin();
        } else {
          setError(data.message || "Usuario o contraseña incorrectos");
        }
      }
    } catch (err) {
      setError("Error de conexión al servidor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#030712] font-sans selection:bg-sky-500/30 overflow-hidden relative">
      
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-sky-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-900/10 via-transparent to-transparent pointer-events-none blur-[50px]" />
        
        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      </div>

      <div className="w-full flex-1 flex flex-col items-center justify-center p-4 z-10 gap-4">
        
        {/* BRANDING LOGO */}
        <div className="relative w-full max-w-[220px] animate-in fade-in slide-in-from-top-10 duration-1000">
           {/* Glowing backdrop */}
           <div className="absolute inset-0 bg-sky-500/20 blur-3xl rounded-full" />
           
           {/* The Logo with radial mask to hide square edges */}
           <div 
             className="w-full relative z-10 flex items-center justify-center overflow-hidden rounded-xl py-4"
             style={{ 
               WebkitMaskImage: 'radial-gradient(ellipse at center, black 50%, transparent 80%)',
               maskImage: 'radial-gradient(ellipse at center, black 50%, transparent 80%)'
             }}
           >
             <img 
               src="/logo.jpg" 
               alt="Maza Quiroz" 
               className="w-full h-auto object-contain filter brightness-105 contrast-125"
             />
           </div>
        </div>

        {/* LOGIN FORM */}
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-white/5">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-sky-500/20">
                <Command className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {isRegistering ? "Crear una cuenta" : "Bienvenido de nuevo"}
              </h2>
              <p className="text-sm text-slate-400 mt-1.5 font-medium">
                {isRegistering ? "Ingresa tus datos para registrarte" : "Inicia sesión para acceder a tu panel de control"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {isRegistering && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Correo Electrónico</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 focus:border-sky-500 rounded-2xl text-white placeholder-slate-600 font-medium outline-none transition-all focus:ring-4 focus:ring-sky-500/10"
                      placeholder="tu@correo.com"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Usuario</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 focus:border-sky-500 rounded-2xl text-white placeholder-slate-600 font-medium outline-none transition-all focus:ring-4 focus:ring-sky-500/10"
                    placeholder="ej. admin"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Contraseña</label>
                  {!isRegistering && (
                    <a href="#" className="text-[11px] font-bold text-sky-400 hover:text-sky-300 transition-colors">
                      ¿Olvidaste tu contraseña?
                    </a>
                  )}
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 focus:border-sky-500 rounded-2xl text-white placeholder-slate-600 font-medium outline-none transition-all focus:ring-4 focus:ring-sky-500/10"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 animate-in slide-in-from-top-2">
                  <ShieldCheck className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="text-xs font-semibold text-rose-400">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="group w-full py-3.5 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl font-bold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {isRegistering ? "Crear cuenta" : "Ingresar al sistema"}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
            
            {/* Footer toggle */}
            <div className="px-8 py-5 border-t border-white/5 bg-slate-950/30 text-center">
              <p className="text-xs text-slate-400 font-medium">
                {isRegistering ? "¿Ya tienes una cuenta?" : "¿No tienes una cuenta?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError("");
                  }}
                  className="text-sky-400 font-bold hover:text-sky-300 transition-colors underline underline-offset-2 decoration-sky-500/30 hover:decoration-sky-400"
                >
                  {isRegistering ? "Inicia sesión" : "Regístrate"}
                </button>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
