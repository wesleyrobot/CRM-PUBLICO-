'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
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
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop')`,
        }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 60 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 1,
          ease: [0.16, 1, 0.3, 1],
          delay: 0.2
        }}
        className="relative z-10 w-full max-w-md"
      >
        <motion.div
          className="bg-black/70 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10"
          initial={{ boxShadow: "0 0 0 rgba(168, 85, 247, 0)" }}
          animate={{
            boxShadow: [
              "0 0 0 rgba(168, 85, 247, 0)",
              "0 0 30px rgba(168, 85, 247, 0.3)",
              "0 0 0 rgba(168, 85, 247, 0)"
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.5,
              ease: "easeOut"
            }}
            className="text-3xl md:text-4xl font-bold text-white mb-8"
          >
            Faça seu login
            <motion.span
              animate={{
                scale: [1, 1.3, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400"
            >
              .
            </motion.span>
          </motion.h1>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.7,
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              <label htmlFor="email" className="block text-white text-sm mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  placeholder=""
                  className={`w-full pl-11 pr-4 py-3 bg-white/5 border ${
                    errors.email ? 'border-red-500/50' : 'border-white/10'
                  } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-400">{errors.email.message}</p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.9,
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              <label htmlFor="senha" className="block text-white text-sm mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  placeholder=""
                  className={`w-full pl-11 pr-12 py-3 bg-white/5 border ${
                    errors.senha ? 'border-red-500/50' : 'border-white/10'
                  } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all`}
                  {...register('senha')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.senha && (
                <p className="mt-1.5 text-sm text-red-400">{errors.senha.message}</p>
              )}
            </motion.div>

            {/* Forgot Password Link */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="flex justify-center"
            >
              <Link
                href="#"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Esqueci minha senha
              </Link>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.5, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 1.3,
                ease: [0.16, 1, 0.3, 1]
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 40px rgba(168, 85, 247, 0.6)"
              }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-lg font-medium text-white bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              )}
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </motion.button>
          </form>

          {/* Register Link */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.5 }}
            className="mt-6 text-center"
          >
            <Link
              href="/register"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Ainda não tenho uma conta
            </Link>
          </motion.div>

          {/* Credit Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.7 }}
            className="mt-8 pt-6 border-t border-white/10 text-center"
          >
            <motion.p
              className="text-xs text-gray-500"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              CRM Público • Desenvolvido por{' '}
              <motion.span
                className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-semibold"
                animate={{
                  backgroundPosition: ["0%", "100%", "0%"]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                Wesley A.Costa
              </motion.span>
            </motion.p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
