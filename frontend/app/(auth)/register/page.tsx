'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';

const registerSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmarSenha: z.string(),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: 'Senhas não conferem',
  path: ['confirmarSenha'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError('');
      await registerUser({
        nome: data.nome,
        email: data.email,
        senha: data.senha,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar conta');
    }
  };

  return (
    <Card className="w-full max-w-md" padding="lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <span className="text-lg font-bold text-white">CRM</span>
        </div>
        <CardTitle className="text-2xl">Criar conta</CardTitle>
        <CardDescription>
          Preencha os dados abaixo para criar sua conta
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Input
            label="Nome completo"
            type="text"
            placeholder="Seu nome"
            leftIcon={<User className="h-4 w-4" />}
            error={errors.nome?.message}
            {...register('nome')}
          />

          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            placeholder="Mínimo 6 caracteres"
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            }
            error={errors.senha?.message}
            {...register('senha')}
          />

          <Input
            label="Confirmar senha"
            type={showPassword ? 'text' : 'password'}
            placeholder="Repita a senha"
            leftIcon={<Lock className="h-4 w-4" />}
            error={errors.confirmarSenha?.message}
            {...register('confirmarSenha')}
          />

          <Button
            type="submit"
            className="w-full"
            loading={isSubmitting}
          >
            Criar conta
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Já tem uma conta?{' '}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Fazer login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
