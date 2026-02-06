'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(1, 'Senha é obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      await login(data.email, data.senha);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login');
    }
  };

  return (
    <div className="auth-container">
      {/* Robot 3D Background */}
      <div className="robot-container">
        {mounted && (
          // @ts-expect-error - spline-viewer is a web component loaded via script
          <spline-viewer
            className="robot-3d"
            url="https://prod.spline.design/Qr2knMM4aKElH8x7/scene.splinecode"
          />
        )}
      </div>

      {/* Content */}
      <div className="auth-content">
        {/* Header / Logo */}
        <header className={`auth-header ${mounted ? 'animate-fade-down' : 'opacity-0'}`}>
          <h1 className="auth-logo">
            CRM Público <span className="auth-logo-accent">Mr.Robot</span>
          </h1>
        </header>

        {/* Login Form */}
        <div className={`auth-card ${mounted ? 'animate-fade-up' : 'opacity-0'}`}>
          <div className="auth-card-header">
            <div className="auth-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h2 className="auth-card-title">Acesse sua conta</h2>
            <p className="auth-card-description">
              Entre com suas credenciais para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            {error && (
              <div className="auth-error">
                <AlertCircle className="auth-error-icon" />
                <span>{error}</span>
              </div>
            )}

            {/* Email */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="email">Email</label>
              <div className="auth-input-wrapper">
                <Mail className="auth-input-icon" />
                <input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className={`auth-input ${errors.email ? 'auth-input-error' : ''}`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <span className="auth-field-error">{errors.email.message}</span>
              )}
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="senha">Senha</label>
              <div className="auth-input-wrapper">
                <Lock className="auth-input-icon" />
                <input
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha"
                  className={`auth-input ${errors.senha ? 'auth-input-error' : ''}`}
                  {...register('senha')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-toggle-password"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.senha && (
                <span className="auth-field-error">{errors.senha.message}</span>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="auth-submit"
            >
              {isSubmitting ? (
                <span className="auth-spinner" />
              ) : null}
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="auth-footer-text">
            Não tem uma conta?{' '}
            <Link href="/register" className="auth-link">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
