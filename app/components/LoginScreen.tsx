/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { Lock, User, ArrowRight, AlertCircle, Mail, Eye, EyeOff } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);

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
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, username, password }),
        });
        const data = await res.json();
        if (data.success) {
          onLogin();
        } else {
          setError(data.message || "Error al registrar la cuenta.");
        }
      } else {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (data.success) {
          onLogin();
        } else {
          setError(data.message || "Usuario o contraseña incorrectos");
        }
      }
    } catch {
      setError("Error de conexión al servidor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-root">
      {/* ── ANIMATED BACKGROUND ── */}
      <div className="login-bg">
        {/* Grid pattern overlay */}
        <div className="login-grid" />
        {/* Glow blobs */}
        <div className="login-blob login-blob-1" />
        <div className="login-blob login-blob-2" />
        <div className="login-blob login-blob-3" />
      </div>

      {/* ── CONTENT ── */}
      <div className="login-content">

        {/* LOGO */}
        <div className="login-logo-wrap">
          <div className="login-logo-glow" />
          <div className="login-logo-frame">
            <img
              src="/logo.jpg"
              alt="Maza Quiroz Constructora"
              className="login-logo-img"
            />
          </div>
        </div>

        {/* CARD */}
        <div className="login-card">

          {/* Card Header */}
          <div className="login-card-header">
            <h1 className="login-title">
              {isRegistering ? "Crear una cuenta" : "Bienvenido de nuevo"}
            </h1>
            <p className="login-subtitle">
              {isRegistering
                ? "Ingresa tus datos para registrarte"
                : "Inicia sesión para acceder a tu panel de control"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">

            {/* Email – only when registering */}
            {isRegistering && (
              <div className="login-field">
                <div className="login-input-wrap">
                  <Mail className="login-icon" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="login-input"
                    autoComplete="email"
                  />
                </div>
              </div>
            )}

            {/* Username */}
            <div className="login-field">
              <div className="login-input-wrap">
                <User className="login-icon" />
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ej. admin"
                  className="login-input"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div className="login-field">
              <div className="login-input-wrap">
                <Lock className="login-icon" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="login-input login-input-pw"
                  autoComplete={isRegistering ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="login-eye-btn"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="login-error">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="login-btn"
            >
              {isLoading ? (
                <span className="login-spinner" />
              ) : (
                <>
                  <span>{isRegistering ? "Crear cuenta" : "Ingresar al sistema"}</span>
                  <ArrowRight className="w-4 h-4 login-btn-arrow" />
                </>
              )}
            </button>

            {/* Toggle register / login */}
            <p className="login-toggle-text">
              {isRegistering ? "¿Ya tienes una cuenta?" : "¿No tienes cuenta?"}{" "}
              <button
                type="button"
                onClick={() => { setIsRegistering(!isRegistering); setError(""); }}
                className="login-toggle-btn"
              >
                {isRegistering ? "Inicia sesión" : "Regístrate"}
              </button>
            </p>
          </form>
        </div>

        {/* Footer */}
        <footer className="login-footer">
          © {new Date().getFullYear()} <span className="login-footer-brand">Maza Quiroz Constructora</span>. Todos los derechos reservados.
        </footer>
      </div>

      {/* ── INLINE STYLES (no Tailwind utility conflicts) ── */}
      <style>{`
        /* ─── Root ─────────────────────────────────────────────── */
        .login-root {
          min-height: 100svh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          font-family: var(--font-outfit, 'Outfit', sans-serif);
          background-color: #0b1120;
        }

        /* ─── Background ────────────────────────────────────────── */
        .login-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }

        /* Dark blue/navy grid — matches reference image */
        .login-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(30,60,120,0.18) 1px, transparent 1px),
            linear-gradient(90deg, rgba(30,60,120,0.18) 1px, transparent 1px);
          background-size: 40px 40px;
          background-color: #0b1827;
        }

        .login-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.45;
        }
        .login-blob-1 {
          width: 55%;
          height: 55%;
          top: -15%;
          left: -10%;
          background: radial-gradient(circle, #0d3d6e 0%, transparent 70%);
        }
        .login-blob-2 {
          width: 50%;
          height: 50%;
          bottom: -20%;
          right: -10%;
          background: radial-gradient(circle, #0a2a54 0%, transparent 70%);
        }
        .login-blob-3 {
          width: 40%;
          height: 40%;
          top: 40%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, #163b6e 0%, transparent 70%);
        }

        /* ─── Content wrapper ───────────────────────────────────── */
        .login-content {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 480px;
          padding: 24px 16px 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        /* ─── Logo ──────────────────────────────────────────────── */
        .login-logo-wrap {
          position: relative;
          width: 200px;
          animation: fadeSlideDown 0.7s ease both;
        }
        @media (max-width: 400px) {
          .login-logo-wrap { width: 160px; }
        }

        .login-logo-glow {
          position: absolute;
          inset: -20px;
          background: radial-gradient(ellipse at center, rgba(30,144,255,0.25) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        .login-logo-frame {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          border: 2px solid rgba(255,255,255,0.08);
          box-shadow: 0 0 40px rgba(30,100,200,0.3);
          background: rgba(255,255,255,0.03);
        }
        .login-logo-img {
          width: 100%;
          height: auto;
          display: block;
          object-fit: contain;
        }

        /* ─── Card ──────────────────────────────────────────────── */
        .login-card {
          width: 100%;
          background: rgba(11,22,42,0.72);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04);
          animation: fadeSlideUp 0.7s 0.15s ease both;
        }

        .login-card-header {
          padding: 28px 28px 20px;
          text-align: center;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .login-title {
          font-size: clamp(1.25rem, 4vw, 1.5rem);
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.02em;
          margin: 0 0 6px;
        }
        .login-subtitle {
          font-size: 0.85rem;
          color: #8fa3c0;
          margin: 0;
          font-weight: 400;
        }

        /* ─── Form ──────────────────────────────────────────────── */
        .login-form {
          padding: 24px 28px 28px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        @media (max-width: 400px) {
          .login-card-header { padding: 22px 20px 16px; }
          .login-form { padding: 20px 20px 24px; }
        }

        .login-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .login-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .login-icon {
          position: absolute;
          left: 14px;
          width: 18px;
          height: 18px;
          color: #4a7aa8;
          pointer-events: none;
          flex-shrink: 0;
          transition: color 0.2s;
        }
        .login-input-wrap:focus-within .login-icon {
          color: #3b82f6;
        }

        .login-input {
          width: 100%;
          padding: 13px 14px 13px 44px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          color: #e8f0fe;
          font-size: 0.95rem;
          font-weight: 400;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          -webkit-appearance: none;
        }
        .login-input::placeholder { color: #455a74; }
        .login-input:focus {
          border-color: #3b82f6;
          background: rgba(59,130,246,0.06);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
        }
        /* Password input with eye button space */
        .login-input-pw { padding-right: 44px; }

        .login-eye-btn {
          position: absolute;
          right: 12px;
          color: #4a7aa8;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: color 0.2s;
          display: flex;
          align-items: center;
        }
        .login-eye-btn:hover { color: #93c5fd; }

        /* ─── Error ─────────────────────────────────────────────── */
        .login-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 11px 14px;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 10px;
          color: #fca5a5;
          font-size: 0.8rem;
          font-weight: 500;
          animation: fadeIn 0.25s ease;
        }

        /* ─── Submit button ─────────────────────────────────────── */
        .login-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 14px;
          margin-top: 4px;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: #fff;
          font-size: 0.95rem;
          font-weight: 700;
          font-family: inherit;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(37,99,235,0.4);
          -webkit-appearance: none;
          letter-spacing: 0.01em;
        }
        .login-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          box-shadow: 0 6px 28px rgba(59,130,246,0.5);
          transform: translateY(-1px);
        }
        .login-btn:active:not(:disabled) { transform: translateY(0); }
        .login-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .login-btn-arrow {
          transition: transform 0.2s;
        }
        .login-btn:hover .login-btn-arrow { transform: translateX(3px); }

        /* Loading spinner */
        .login-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.75s linear infinite;
        }

        /* ─── Toggle text ────────────────────────────────────────── */
        .login-toggle-text {
          text-align: center;
          font-size: 0.8rem;
          color: #8fa3c0;
          margin: 2px 0 0;
        }
        .login-toggle-btn {
          background: none;
          border: none;
          color: #38bdf8;
          font-weight: 700;
          font-size: inherit;
          font-family: inherit;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s;
        }
        .login-toggle-btn:hover { color: #7dd3fc; }

        /* ─── Footer ─────────────────────────────────────────────── */
        .login-footer {
          font-size: 0.75rem;
          color: #3e5370;
          text-align: center;
          animation: fadeSlideUp 0.7s 0.3s ease both;
        }
        .login-footer-brand { color: #38bdf8; font-weight: 600; }

        /* ─── Animations ─────────────────────────────────────────── */
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ─── Safe area for notched phones ──────────────────────── */
        @supports (padding: max(0px)) {
          .login-content {
            padding-top: max(24px, env(safe-area-inset-top));
            padding-bottom: max(32px, env(safe-area-inset-bottom));
          }
        }

        /* ─── Very small screens (< 360px) ──────────────────────── */
        @media (max-width: 360px) {
          .login-title { font-size: 1.1rem; }
          .login-subtitle { font-size: 0.78rem; }
          .login-btn { font-size: 0.88rem; padding: 12px; }
        }
      `}</style>
    </div>
  );
}
