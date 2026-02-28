'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { pythonApi as api } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [dataConsent, setDataConsent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');

  const validatePasswordStrength = (password: string): string => {
    if (password.length < 8) return 'fraca';
    
    let strength = 0;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    if (strength < 3) return 'fraca';
    if (strength < 4) return 'média';
    return 'forte';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });

    // Validar força da senha em tempo real
    if (name === 'password') {
      setPasswordStrength(validatePasswordStrength(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações de segurança
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    // Validar senha forte
    const strength = validatePasswordStrength(formData.password);
    if (strength === 'fraca') {
      setError('Senha muito fraca. Use pelo menos 8 caracteres com letras maiúsculas, minúsculas e números');
      return;
    }

    // Validar nome (prevenir injeção)
    if (formData.name.length < 2 || formData.name.length > 255) {
      setError('Nome deve ter entre 2 e 255 caracteres');
      return;
    }

    // Validar email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email inválido');
      return;
    }

    if (!dataConsent) {
      setError('Você precisa aceitar a política de privacidade e consentir com o uso dos dados');
      return;
    }

    setLoading(true);

    try {
      // Sanitizar dados antes de enviar
      const sanitizedData = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        data_consent_given: dataConsent,
      };

      console.log('🚀 Tentando criar usuário...', { email: sanitizedData.email });

      // Criar usuário
      const registerResponse = await api.post('/api/v1/auth/register', sanitizedData);
      console.log('✅ Usuário criado com sucesso:', registerResponse.data);

      // Fazer login automático
      console.log('🔐 Fazendo login automático...');
      
      // FastAPI OAuth2 espera form-data, não JSON
      const loginFormData = new URLSearchParams();
      loginFormData.append('username', sanitizedData.email);
      loginFormData.append('password', formData.password);
      
      const loginResponse = await api.post('/api/v1/auth/login', loginFormData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token } = loginResponse.data;
      localStorage.setItem('token', access_token);

      // Redirecionar para dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Erro ao criar conta:', err);
      
      // Extrair mensagem de erro de forma segura
      let errorMessage = 'Erro ao criar conta. Tente novamente.';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Se for um erro de validação do Pydantic (array de erros)
        if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map((e: any) => {
            const field = e.loc?.join(' > ') || 'campo';
            return `${field}: ${e.msg}`;
          }).join('; ');
        }
        // Se for uma string simples
        else if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        }
        // Se for outro formato
        else if (errorData.message) {
          errorMessage = errorData.message;
        }
        // Tratamento de erros específicos por status
        else if (err.response?.status === 400) {
          errorMessage = 'Email já cadastrado ou dados inválidos';
        } else if (err.response?.status === 422) {
          errorMessage = 'Dados inválidos. Verifique todos os campos';
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Criar Conta
          </h1>
          <p className="text-gray-600">
            Comece a organizar suas finanças agora
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div 
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label 
              htmlFor="name" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nome Completo
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="Seu nome"
              disabled={loading}
            />
          </div>

          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="seu@email.com"
              disabled={loading}
            />
          </div>

          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="Mínimo 8 caracteres"
              disabled={loading}
            />
            {/* Requisitos de senha */}
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-semibold text-blue-900 mb-1">⚠️ Requisitos da senha:
              </p>
              <ul className="text-xs text-blue-800 space-y-0.5 ml-4 list-disc">
                <li>Mínimo de 8 caracteres</li>
                <li>Pelo menos uma letra maiúscula (A-Z)</li>
                <li>Pelo menos uma letra minúscula (a-z)</li>
                <li>Pelo menos um número (0-9)</li>
                <li>Evite senhas comuns (123456, password, etc)</li>
              </ul>
            </div>
            {/* Indicador de força */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-gray-700">Força da senha:</p>
                  <span className={`text-xs font-bold ${
                    passwordStrength === 'forte' ? 'text-green-600' :
                    passwordStrength === 'média' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {passwordStrength.toUpperCase()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      passwordStrength === 'forte' ? 'bg-green-600 w-full' :
                      passwordStrength === 'média' ? 'bg-yellow-600 w-2/3' : 'bg-red-600 w-1/3'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label 
              htmlFor="confirmPassword" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirmar Senha
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent text-gray-900 bg-white ${
                formData.confirmPassword && formData.password !== formData.confirmPassword
                  ? 'border-red-500 focus:ring-red-500'
                  : formData.confirmPassword && formData.password === formData.confirmPassword
                  ? 'border-green-500 focus:ring-green-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Digite a senha novamente"
              disabled={loading}
            />
            {/* Alerta de senhas não coincidem */}
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <svg className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-red-800 font-medium">
                  As senhas não coincidem. Digite a mesma senha nos dois campos.
                </p>
              </div>
            )}
            {/* Confirmação visual de senhas iguais */}
            {formData.confirmPassword && formData.password === formData.confirmPassword && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-xs text-green-800 font-medium">
                  As senhas coincidem!
                </p>
              </div>
            )}
          </div>

          {/* LGPD Consent */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-start">
              <input
                id="dataConsent"
                type="checkbox"
                checked={dataConsent}
                onChange={(e) => setDataConsent(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                required
              />
              <label htmlFor="dataConsent" className="ml-3 text-sm text-gray-700">
                Eu li e concordo com a{' '}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-700" target="_blank">
                  Política de Privacidade
                </Link>{' '}
                e autorizo o tratamento dos meus dados pessoais conforme a LGPD.
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-sm text-gray-500">ou</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-gray-600">
            Já tem uma conta?{' '}
            <Link 
              href="/auth/login" 
              className="text-blue-600 font-semibold hover:text-blue-700"
            >
              Fazer login
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link 
            href="/" 
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Voltar para página inicial
          </Link>
        </div>
      </div>
    </main>
  );
}
