'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { pythonApi } from '@/lib/api';

interface DashboardData {
  summary: {
    total_income: number;
    total_expense: number;
    balance: number;
    savings: number;
    period_start: string;
    period_end: string;
  };
  expenses_by_category: Array<{
    category_name: string;
    category_icon?: string;
    total: number;
    percentage: number;
  }>;
  recent_transactions: Array<{
    id: number;
    amount: number;
    type: string;
    description?: string;
    occurred_at: string;
    category?: {
      name: string;
      icon?: string;
    };
  }>;
  active_goals: Array<{
    id: number;
    name: string;
    target_amount: number;
    current_amount: number;
    progress_percentage: number;
  }>;
}

export default function ReportsPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodDays, setPeriodDays] = useState(30);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    loadDashboardData();
  }, [router, periodDays]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await pythonApi.get(`/dashboard/?period_days=${periodDays}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                ← Voltar
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Relatórios Financeiros</h1>
            </div>
            
            {/* Seletor de Período */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Período:</label>
              <select
                value={periodDays}
                onChange={(e) => setPeriodDays(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value={7}>Últimos 7 dias</option>
                <option value={15}>Últimos 15 dias</option>
                <option value={30}>Últimos 30 dias</option>
                <option value={60}>Últimos 60 dias</option>
                <option value={90}>Últimos 90 dias</option>
                <option value={180}>Últimos 6 meses</option>
                <option value={365}>Último ano</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {data && (
          <>
            {/* Período */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Período de análise:</span>{' '}
                {formatDate(data.summary.period_start)} até {formatDate(data.summary.period_end)}
              </p>
            </div>

            {/* Cards de Resumo */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Receitas</h3>
                  <span className="text-2xl">💰</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(data.summary.total_income)}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Despesas</h3>
                  <span className="text-2xl">💸</span>
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(data.summary.total_expense)}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Saldo</h3>
                  <span className="text-2xl">📊</span>
                </div>
                <p className={`text-2xl font-bold ${
                  data.summary.balance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(data.summary.balance)}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Economia</h3>
                  <span className="text-2xl">💎</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(data.summary.savings)}
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* Gastos por Categoria */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Gastos por Categoria
                </h2>
                
                {data.expenses_by_category.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhuma despesa registrada no período</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.expenses_by_category.map((cat, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {cat.category_icon && <span>{cat.category_icon}</span>}
                            <span className="text-sm font-medium text-gray-700">
                              {cat.category_name}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">
                              {formatCurrency(cat.total)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {cat.percentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${cat.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Metas Ativas */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Progresso das Metas
                </h2>
                
                {data.active_goals.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhuma meta ativa</p>
                    <button
                      onClick={() => router.push('/goals')}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Criar Meta
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.active_goals.map((goal) => (
                      <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{goal.name}</h3>
                          <span className="text-sm font-semibold text-blue-600">
                            {goal.progress_percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              goal.progress_percentage >= 100
                                ? 'bg-green-500'
                                : goal.progress_percentage >= 50
                                ? 'bg-blue-500'
                                : 'bg-yellow-500'
                            }`}
                            style={{ width: `${Math.min(goal.progress_percentage, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>{formatCurrency(goal.current_amount)}</span>
                          <span>{formatCurrency(goal.target_amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Transações Recentes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Transações Recentes
              </h2>
              
              {data.recent_transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhuma transação registrada</p>
                  <button
                    onClick={() => router.push('/transactions/new')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Criar Transação
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Data/Hora
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Descrição
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Categoria
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                          Valor
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recent_transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {formatDateTime(transaction.occurred_at)}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {transaction.description || '-'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {transaction.category ? (
                              <span>
                                {transaction.category.icon} {transaction.category.name}
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className={`py-3 px-4 text-sm font-semibold text-right ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Insights */}
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                💡 Insights Rápidos
              </h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="bg-white bg-opacity-70 rounded-lg p-4">
                  <p className="text-gray-700">
                    {data.summary.balance >= 0 ? (
                      <>
                        <span className="font-semibold text-green-600">Parabéns!</span> Você 
                        teve um saldo positivo de {formatCurrency(data.summary.balance)} no período.
                      </>
                    ) : (
                      <>
                        <span className="font-semibold text-red-600">Atenção!</span> Suas 
                        despesas superaram as receitas em {formatCurrency(Math.abs(data.summary.balance))}.
                      </>
                    )}
                  </p>
                </div>
                <div className="bg-white bg-opacity-70 rounded-lg p-4">
                  <p className="text-gray-700">
                    {data.expenses_by_category.length > 0 && (
                      <>
                        Sua maior categoria de gasto é{' '}
                        <span className="font-semibold text-blue-600">
                          {data.expenses_by_category[0].category_name}
                        </span>{' '}
                        com {formatCurrency(data.expenses_by_category[0].total)}.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
