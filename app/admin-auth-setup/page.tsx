"use client";

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import * as OTPAuth from 'otpauth';
import { ShieldCheck, Copy, CheckCircle2 } from 'lucide-react';

export default function AdminAuthSetup() {
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Generar un nuevo secreto aleatorio al cargar
    let newSecret = new OTPAuth.Secret({ size: 20 }).base32;
    setSecret(newSecret);

    // Generar URI otpauth
    let totp = new OTPAuth.TOTP({
      issuer: "TechoPropioSistema",
      label: "Admin",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: newSecret
    });
    
    const otpauth = totp.toString();

    // Generar QR
    QRCode.toDataURL(otpauth, (err, imageUrl) => {
      if (!err) setQrCodeUrl(imageUrl);
    });
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans selection:bg-sky-500/30">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Decorative background glow */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-sky-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center">
          
          <div className="w-16 h-16 bg-sky-500/20 text-sky-400 rounded-2xl flex items-center justify-center mb-6 border border-sky-500/30">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h1 className="text-3xl font-bold font-[family-name:var(--font-montserrat)] mb-3">Configuración de Seguridad Master</h1>
          <p className="text-slate-400 mb-8 max-w-sm">
            Escanea este código con tu aplicación de autenticación (ej. "Mis contraseñas" en iPhone, Authy, o Google Authenticator).
          </p>

          <div className="bg-white p-4 rounded-xl shadow-lg shadow-black/50 mb-8 border-4 border-slate-800">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-slate-500">Generando...</div>
            )}
          </div>

          <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-6 text-left mb-6 relative">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Paso 1: Copia tu Secreto</h3>
            <p className="text-sm text-slate-500 mb-2">Este es tu código secreto. No lo compartas con nadie.</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-slate-900 text-sky-400 p-3 rounded-lg border border-slate-700 font-mono text-center tracking-widest">
                {secret}
              </code>
              <button 
                onClick={copyToClipboard}
                className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors flex items-center justify-center group"
                title="Copiar secreto"
              >
                {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-slate-400 group-hover:text-white" />}
              </button>
            </div>
          </div>

          <div className="w-full bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-6 text-left">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-2">Paso 2: Configura Vercel</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Ve a tu panel de Vercel, entra a <strong>Settings {'>'} Environment Variables</strong> y agrega una nueva variable:
            </p>
            <ul className="text-sm text-slate-400 mt-4 space-y-2 font-mono">
              <li><span className="text-white">Key:</span> ADMIN_TOTP_SECRET</li>
              <li><span className="text-white">Value:</span> (Pega el secreto copiado arriba)</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
