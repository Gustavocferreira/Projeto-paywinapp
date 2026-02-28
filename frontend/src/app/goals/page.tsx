'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { pythonApi } from '@/lib/api';

interface Goal {
  id: number;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  due_date?: string;
  is_completed: boolean;
  progress_percentage: number;
  remaining_amount: number;
  created_at: string;
}

export default function GoalsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_amount: '',
    due_date: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    loadGoals();
  }, [router]);

  const loadGoals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await pythonApi.get('/goals/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGoals(response.data);
    } catch (err: any) {
      console.error('Erro ao carregar metas:', err);
      setError('Erro ao carregar metas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      if (!formData.name || !formData.target_amount || parseFloat(formData.target_amount) <= 0) {
        throw new Error('Preencha todos os campos obrigatórios');
      }

      const goalData = {
        name: formData.name,
        description: formData.description || null,
        target_amount: parseFloat(formData.target_amount),
        due_date: formData.due_date || null,
        source: 'manual'
      };

      await pythonApi.post('/goals/', goalData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Meta criada com sucesso!');
      setFormData({ name: '', description: '', target_amount: '', due_date: '' });
      setShowForm(false);
      loadGoals();

    } catch (err: any) {
      console.error('Erro ao criar meta:', err);
      setError(err.response?.data?.detail || err.message || 'Erro ao criar meta');
    }
  };

  const handleUpdateAmount = async (goalId: number, newAmount: number) => {
    try {
      const token = localStorage.getItem('token');
      await pythonApi.patch(`/goals/${goalId}`, 
        { current_amount: newAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadGoals();
    } catch (err: any) {
      console.error('Erro ao atualizar meta:', err);
      setError('Erro ao atualizar progresso da meta');
    }
  };

  const handleDeleteGoal = async (goalId: number) => {
    if (!confirm('Deseja realmente excluir esta meta?')) return;

    try {
      const token = localStorage.getItem('token');
      await pythonApi.delete(`/goals/${goalId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Meta excluída com sucesso!');
      loadGoals();
    } catch (err: any) {
      console.error('Erro ao excluir meta:', err);
      setError('Erro ao excluir meta');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Sem prazo';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando metas...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Minhas Metas</h1>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showForm ? 'Cancelar' : '+ Nova Meta'}
            </button>
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

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">{success}</p>
          </div>
        )}

        {/* Formulário de Nova Meta */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Criar Nova Meta</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Meta *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder="Ex: Viagem de férias, Reserva de emergência..."
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  id="description"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder="Detalhes sobre a meta..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="target_amount" className="block text-sm font-medium text-gray-700 mb-2">
                    Valor Alvo (R$) *
                  </label>
                  <input
                    type="number"
                    id="target_amount"
                    step="0.01"
                    min="0.01"
                    required
                    value={formData.target_amount}
                    onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="0,00"
                  />
                </div>

                <div>
                  <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-2">
                    Data Limite
                  </label>
                  <input
                    type="date"
                    id="due_date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
              >
                Criar Meta
              </button>
            </form>
          </div>
        )}

        {/* Lista de Metas */}
        {goals.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma meta cadastrada
            </h3>
            <p className="text-gray-600 mb-6">
              Crie sua primeira meta financeira e comece a acompanhar seu progresso!
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Criar Primeira Meta
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <div key={goal.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{goal.name}</h3>
                      {goal.description && (
                        <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Progresso</span>
                      <span className="font-semibold text-gray-900">
                        {goal.progress_percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          goal.progress_percentage >= 100
                            ? 'bg-green-500'
                            : goal.progress_percentage >= 50
                            ? 'bg-blue-500'
                            : 'bg-yellow-500'
                        }`}
                        style={{ width: `${Math.min(goal.progress_percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Valores */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Atual:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(goal.current_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Alvo:</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(goal.target_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Faltam:</span>
                      <span className="font-semibold text-orange-600">
                        {formatCurrency(goal.remaining_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t">
                      <span className="text-gray-600">Prazo:</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(goal.due_date)}
                      </span>
                    </div>
                  </div>

                  {/* Adicionar Valor */}
                  {!goal.is_completed && (
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Adicionar valor
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="R$ 0,00"
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const input = e.target as HTMLInputElement;
                              const addAmount = parseFloat(input.value);
                              if (addAmount > 0) {
                                handleUpdateAmount(goal.id, goal.current_amount + addAmount);
                                input.value = '';
                              }
                            }
                          }}
                        />
                        <button
                          onClick={(e) => {
                            const input = (e.target as HTMLButtonElement).previousElementSibling as HTMLInputElement;
                            const addAmount = parseFloat(input.value);
                            if (addAmount > 0) {
                              handleUpdateAmount(goal.id, goal.current_amount + addAmount);
                              input.value = '';
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  {goal.is_completed && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                      <span className="text-green-700 font-semibold text-sm">
                        ✓ Meta Concluída!
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
