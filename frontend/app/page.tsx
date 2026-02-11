'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function SplashPage() {
  const router = useRouter();
  const [showCredit, setShowCredit] = useState(false);

  useEffect(() => {
    // Mostrar crédito após 1.5s
    const creditTimer = setTimeout(() => {
      setShowCredit(true);
    }, 1500);

    // Redirecionar para login após 3.5s
    const redirectTimer = setTimeout(() => {
      router.push('/login');
    }, 3500);

    return () => {
      clearTimeout(creditTimer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  const title = "CRM PÚBLICO";
  const letters = title.split('');

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Título com letras animadas */}
      <div className="flex items-center justify-center mb-8">
        {letters.map((letter, index) => {
          // Alternar direção: índice par vem da esquerda, ímpar da direita
          const fromLeft = index % 2 === 0;

          return (
            <motion.span
              key={index}
              initial={{
                x: fromLeft ? -200 : 200,
                opacity: 0,
              }}
              animate={{
                x: 0,
                opacity: 1,
              }}
              transition={{
                duration: 0.8,
                delay: index * 0.1,
                type: "spring",
                stiffness: 100,
                damping: 15,
              }}
              className={`text-6xl md:text-8xl font-bold ${
                letter === ' ' ? 'w-4' : ''
              } ${
                letter === 'P' || letter === 'Ú' || letter === 'B' || letter === 'L' || letter === 'I' || letter === 'C' || letter === 'O'
                  ? 'text-blue-500'
                  : 'text-white'
              }`}
            >
              {letter === ' ' ? '\u00A0' : letter}
            </motion.span>
          );
        })}
      </div>

      {/* Linha decorativa */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{
          duration: 0.8,
          delay: 1.2,
          ease: "easeInOut"
        }}
        className="w-64 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mb-8"
      />

      {/* Crédito - fade in após título */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: showCredit ? 1 : 0,
          y: showCredit ? 0 : 20,
        }}
        transition={{
          duration: 0.6,
          ease: "easeOut"
        }}
        className="text-center"
      >
        <p className="text-gray-400 text-lg md:text-xl">
          Feito pelo{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-semibold">
            Wesley A.Costa
          </span>
        </p>
      </motion.div>

      {/* Loading indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.5,
          delay: 2,
        }}
        className="absolute bottom-12 flex items-center gap-2"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-2 h-2 bg-blue-500 rounded-full"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            delay: 0.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-2 h-2 bg-purple-500 rounded-full"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            delay: 0.4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-2 h-2 bg-pink-500 rounded-full"
        />
      </motion.div>
    </div>
  );
}
