'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export default function SplashScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
  }>>([]);

  // Generate particles only on client side to avoid hydration mismatch
  useEffect(() => {
    setParticles(
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 3 + 2,
      }))
    );
  }, []);

  useEffect(() => {
    // If user is authenticated, go directly to dashboard
    if (!loading && user) {
      router.push('/dashboard');
      return;
    }

    // If not authenticated, show splash then redirect to login
    if (!loading && !user) {
      const timer = setTimeout(() => {
        router.push('/login');
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [user, loading, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Don't show splash if authenticated (will redirect)
  if (user) {
    return null;
  }

  const letters = 'CRM PÚBLICO'.split('');

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* Animated particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-blue-500/20"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Main content */}
      <div className="relative z-10">
        <div className="flex items-center justify-center gap-2 md:gap-4">
          {letters.map((letter, index) => {
            const isSpace = letter === ' ';
            const isEven = index % 2 === 0;

            return (
              <motion.span
                key={index}
                className={`text-5xl md:text-7xl lg:text-8xl font-bold ${
                  isSpace ? 'w-4 md:w-8' : ''
                } ${isEven ? 'text-blue-500' : 'text-white'}`}
                style={{
                  textShadow: isEven
                    ? '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)'
                    : '0 0 20px rgba(255, 255, 255, 0.3)',
                }}
                initial={{
                  x: isEven ? -1000 : 1000,
                  opacity: 0,
                  rotate: isEven ? -180 : 180,
                  scale: 0,
                }}
                animate={{
                  x: 0,
                  opacity: 1,
                  rotate: 0,
                  scale: 1,
                }}
                transition={{
                  duration: 1.2,
                  delay: index * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {isSpace ? '\u00A0' : letter}
              </motion.span>
            );
          })}
        </div>

        {/* Subtitle */}
        <motion.p
          className="text-center mt-8 text-lg md:text-xl text-blue-400/80"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          Sistema de Gestão de Relacionamento
        </motion.p>

        {/* Loading indicator */}
        <motion.div
          className="flex justify-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 2 }}
        >
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-blue-500 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Credit Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.5 }}
          className="mt-16 text-center"
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
              className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-semibold"
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
      </div>

      {/* Bottom glow effect */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
    </div>
  );
}
