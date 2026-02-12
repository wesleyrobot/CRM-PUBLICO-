'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Power,
  Activity,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Webhook,
  Link as LinkIcon,
  Zap,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import api from '@/lib/api';

interface Integration {
  id: string;
  name: string;
  description?: string;
  type: string;
  url: string;
  active: boolean;
  success_count: number;
  error_count: number;
  last_triggered_at?: string;
  last_error?: string;
  events: string[];
  created_at: string;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
  total_success: number;
  total_errors: number;
}

// Ícones SVG dos logos oficiais
const SystemIcons = {
  Zapier: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full">
      <rect fill="#FF4A00" width="256" height="256" rx="30" />
      <path
        fill="#fff"
        d="M128 60L185 128L128 196L71 128z M128 85v86 M85 128h86"
        strokeWidth="0"
      />
    </svg>
  ),
  Make: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full">
      <defs>
        <linearGradient id="makeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6B21F5" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>
      <rect fill="url(#makeGrad)" width="256" height="256" rx="50" />
      <circle cx="128" cy="70" r="18" fill="#fff" />
      <circle cx="80" cy="100" r="18" fill="#fff" />
      <circle cx="176" cy="100" r="18" fill="#fff" />
      <circle cx="128" cy="128" r="22" fill="#fff" />
      <circle cx="70" cy="156" r="18" fill="#fff" />
      <circle cx="186" cy="156" r="18" fill="#fff" />
      <circle cx="128" cy="186" r="18" fill="#fff" />
    </svg>
  ),
  N8n: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full">
      <rect fill="#EA4B71" width="256" height="256" rx="45" />
      <path
        fill="#fff"
        d="M70 75 L110 75 L110 145 Q110 165 90 165 L70 165z M145 110 L185 110 L185 165 Q185 180 170 180 L145 180z"
      />
      <text x="93" y="155" fontSize="85" fontWeight="900" fill="#fff" fontFamily="Arial, sans-serif">
        n
      </text>
      <text x="158" y="175" fontSize="65" fontWeight="900" fill="#fff" fontFamily="Arial, sans-serif">
        8
      </text>
    </svg>
  ),
  Webhook: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full">
      <defs>
        <linearGradient id="webhookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      <rect fill="url(#webhookGrad)" width="256" height="256" rx="50" />
      <circle cx="128" cy="128" r="28" fill="#fff" />
      <circle cx="68" cy="128" r="18" fill="#60A5FA" />
      <circle cx="188" cy="128" r="18" fill="#60A5FA" />
      <circle cx="128" cy="68" r="18" fill="#60A5FA" />
      <circle cx="128" cy="188" r="18" fill="#60A5FA" />
      <line x1="128" y1="100" x2="128" y2="68" stroke="#fff" strokeWidth="8" />
      <line x1="100" y1="128" x2="68" y2="128" stroke="#fff" strokeWidth="8" />
      <line x1="156" y1="128" x2="188" y2="128" stroke="#fff" strokeWidth="8" />
      <line x1="128" y1="156" x2="128" y2="188" stroke="#fff" strokeWidth="8" />
    </svg>
  ),
  Salesforce: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full">
      <rect fill="#00A1E0" width="256" height="256" rx="25" />
      <ellipse cx="85" cy="105" rx="35" ry="32" fill="#fff" />
      <ellipse cx="145" cy="95" rx="38" ry="35" fill="#fff" />
      <ellipse cx="105" cy="145" rx="40" ry="35" fill="#fff" />
      <ellipse cx="165" cy="138" rx="32" ry="30" fill="#fff" />
    </svg>
  ),
  HubSpot: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full">
      <rect fill="#FF7A59" width="256" height="256" rx="35" />
      <circle cx="182" cy="78" r="22" fill="#fff" />
      <rect x="105" y="65" width="16" height="72" fill="#fff" rx="2" />
      <circle cx="75" cy="155" r="28" fill="#fff" />
      <path d="M121 90 L175 72" stroke="#fff" strokeWidth="16" strokeLinecap="round" />
    </svg>
  ),
  RDStation: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full">
      <defs>
        <linearGradient id="rdGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00CC99" />
          <stop offset="100%" stopColor="#009977" />
        </linearGradient>
      </defs>
      <rect fill="url(#rdGrad)" width="256" height="256" rx="40" />
      <text x="128" y="165" fontSize="110" fontWeight="900" fill="#fff" textAnchor="middle" fontFamily="Arial, sans-serif">
        RD
      </text>
    </svg>
  ),
  Slack: () => (
    <svg viewBox="0 0 256 256" className="w-full h-full">
      <rect fill="#4A154B" width="256" height="256" rx="50" />
      <rect x="82" y="98" width="26" height="62" rx="13" fill="#E01E5A" />
      <rect x="148" y="98" width="26" height="62" rx="13" fill="#36C5F0" />
      <rect x="98" y="82" width="62" height="26" rx="13" fill="#2EB67D" />
      <rect x="98" y="148" width="62" height="26" rx="13" fill="#ECB22E" />
    </svg>
  ),
};

const POPULAR_INTEGRATIONS = [
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Conecte com mais de 5000 aplicativos',
    color: 'from-orange-500 to-orange-600',
    glowColor: 'shadow-orange-500/20',
    category: 'Automação',
    Icon: SystemIcons.Zapier,
  },
  {
    id: 'make',
    name: 'Make',
    description: 'Automação visual poderosa',
    color: 'from-purple-500 to-purple-600',
    glowColor: 'shadow-purple-500/20',
    category: 'Automação',
    Icon: SystemIcons.Make,
  },
  {
    id: 'n8n',
    name: 'n8n',
    description: 'Workflow automation open source',
    color: 'from-pink-500 to-pink-600',
    glowColor: 'shadow-pink-500/20',
    category: 'Automação',
    Icon: SystemIcons.N8n,
  },
  {
    id: 'webhook',
    name: 'Webhook Custom',
    description: 'Configure seu próprio webhook',
    color: 'from-blue-500 to-blue-600',
    glowColor: 'shadow-blue-500/20',
    category: 'Personalizado',
    Icon: SystemIcons.Webhook,
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Sincronize com Salesforce CRM',
    color: 'from-cyan-500 to-cyan-600',
    glowColor: 'shadow-cyan-500/20',
    category: 'CRM',
    Icon: SystemIcons.Salesforce,
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Integre com HubSpot Marketing',
    color: 'from-orange-400 to-red-500',
    glowColor: 'shadow-orange-500/20',
    category: 'Marketing',
    Icon: SystemIcons.HubSpot,
  },
  {
    id: 'rdstation',
    name: 'RD Station',
    description: 'Marketing automation brasileiro',
    color: 'from-teal-500 to-teal-600',
    glowColor: 'shadow-teal-500/20',
    category: 'Marketing',
    Icon: SystemIcons.RDStation,
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Notificações em tempo real',
    color: 'from-purple-400 to-purple-600',
    glowColor: 'shadow-purple-500/20',
    category: 'Comunicação',
    Icon: SystemIcons.Slack,
  },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'webhook',
    url: '',
    method: 'POST',
    auth_token: '',
    events: ['lead_created'],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [integrationsRes, statsRes] = await Promise.all([
        api.get('/integrations'),
        api.get('/integrations/stats'),
      ]);
      setIntegrations(integrationsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/integrations', formData);
      setShowModal(false);
      loadData();
      resetForm();
    } catch (error: any) {
      alert('Erro: ' + (error.response?.data?.message || error.message));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'webhook',
      url: '',
      method: 'POST',
      auth_token: '',
      events: ['lead_created'],
    });
    setSelectedTemplate(null);
  };

  const handleToggle = async (id: string) => {
    try {
      await api.patch(`/integrations/${id}/toggle`);
      loadData();
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    try {
      const response = await api.post(`/integrations/${id}/test`);
      alert(
        response.data.success
          ? `✅ Teste bem-sucedido!\nStatus: ${response.data.status}`
          : `❌ Teste falhou!\n${response.data.error}`
      );
    } catch (error: any) {
      alert('Erro ao testar: ' + (error.response?.data?.message || error.message));
    } finally {
      setTestingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta integração?')) return;
    try {
      await api.delete(`/integrations/${id}`);
      loadData();
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const openTemplateModal = (template: typeof POPULAR_INTEGRATIONS[0]) => {
    setSelectedTemplate(template.id);
    setFormData({
      ...formData,
      name: template.name,
      description: template.description,
      type: template.id,
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4 shadow-lg shadow-cyan-500/50"></div>
          <p className="text-gray-400 font-medium">Carregando integrações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Integrações</h1>
              <p className="text-gray-400">
                Conecte o CRM com outras ferramentas e automatize seus processos
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-medium shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
            >
              <Plus className="w-5 h-5" />
              Nova Integração
            </button>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
              <div className="bg-gray-800/50 backdrop-blur rounded-lg p-4 border border-gray-700/50 hover:border-cyan-500/50 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30 group-hover:border-cyan-500/50 transition-all">
                    <LinkIcon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur rounded-lg p-4 border border-gray-700/50 hover:border-green-500/50 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/30 group-hover:border-green-500/50 transition-all">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Ativas</p>
                    <p className="text-2xl font-bold text-green-400">{stats.active}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur rounded-lg p-4 border border-gray-700/50 hover:border-gray-500/50 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-500/10 rounded-lg border border-gray-500/30 group-hover:border-gray-500/50 transition-all">
                    <Power className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Inativas</p>
                    <p className="text-2xl font-bold text-gray-300">{stats.inactive}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur rounded-lg p-4 border border-gray-700/50 hover:border-blue-500/50 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/30 group-hover:border-blue-500/50 transition-all">
                    <Activity className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Execuções</p>
                    <p className="text-2xl font-bold text-blue-400">{stats.total_success}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur rounded-lg p-4 border border-gray-700/50 hover:border-red-500/50 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/30 group-hover:border-red-500/50 transition-all">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Erros</p>
                    <p className="text-2xl font-bold text-red-400">{stats.total_errors}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Integrações Populares */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Integrações Populares</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {POPULAR_INTEGRATIONS.map((template) => {
              const existingIntegration = integrations.find((i) => i.type === template.id);
              const isConnected = existingIntegration?.active;

              return (
                <div
                  key={template.id}
                  className={`bg-gray-800/50 backdrop-blur rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-all cursor-pointer group relative overflow-hidden ${
                    !existingIntegration ? 'hover:shadow-lg ' + template.glowColor : ''
                  }`}
                  onClick={() => !existingIntegration && openTemplateModal(template)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-lg shadow-lg ${template.glowColor} transition-all group-hover:scale-110`}>
                      <template.Icon />
                    </div>
                    {isConnected && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full border border-green-500/30">
                        <CheckCircle className="w-3 h-3" />
                        Conectado
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-white mb-1 text-lg">{template.name}</h3>
                  <p className="text-sm text-gray-400 mb-3 leading-relaxed">{template.description}</p>
                  <span className="inline-block px-3 py-1 bg-gray-700/50 text-gray-300 text-xs font-medium rounded-full border border-gray-600">
                    {template.category}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Minhas Integrações */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Minhas Integrações</h2>
            <button
              onClick={loadData}
              className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 text-sm font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </button>
          </div>

          {integrations.length === 0 ? (
            <div className="bg-gray-800/30 backdrop-blur rounded-lg border-2 border-dashed border-gray-700 p-12 text-center">
              <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-600">
                <Webhook className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Nenhuma integração configurada</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Conecte seu CRM com outras ferramentas para automatizar processos e aumentar a produtividade
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-medium shadow-lg shadow-cyan-500/30"
              >
                <Plus className="w-5 h-5" />
                Criar Primeira Integração
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {integrations.map((integration) => {
                const template = POPULAR_INTEGRATIONS.find((t) => t.id === integration.type);

                return (
                  <div
                    key={integration.id}
                    className="bg-gray-800/50 backdrop-blur rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          {template ? (
                            <div className={`w-12 h-12 rounded-lg shadow-lg ${template.glowColor}`}>
                              <template.Icon />
                            </div>
                          ) : (
                            <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                              <Zap className="w-8 h-8 text-cyan-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-bold text-white text-lg">{integration.name}</h3>
                            {integration.description && (
                              <p className="text-sm text-gray-400">{integration.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mb-4 pl-16">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full ${
                              integration.active
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                            }`}
                          >
                            <div className={`w-2 h-2 rounded-full ${integration.active ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                            {integration.active ? 'Ativa' : 'Inativa'}
                          </span>
                          <span className="px-3 py-1 bg-gray-700/50 text-gray-300 text-sm font-medium rounded-full border border-gray-600">
                            {integration.type}
                          </span>
                          <span className="text-sm text-gray-500">
                            {integration.success_count} execuções • {integration.error_count} erros
                          </span>
                        </div>

                        <div className="pl-16 space-y-2">
                          <div className="flex items-center gap-2">
                            <ExternalLink className="w-4 h-4 text-gray-500" />
                            <code className="text-sm text-gray-300 bg-gray-900/50 px-3 py-1 rounded border border-gray-700 font-mono">
                              {integration.url}
                            </code>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-gray-500">Eventos:</span>
                            {integration.events.map((event, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-xs font-medium rounded border border-cyan-500/30"
                              >
                                {event}
                              </span>
                            ))}
                          </div>

                          {integration.last_triggered_at && (
                            <p className="text-sm text-gray-500">
                              Última execução: {new Date(integration.last_triggered_at).toLocaleString('pt-BR')}
                            </p>
                          )}

                          {integration.last_error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                              <p className="text-sm font-medium text-red-400 mb-1">Último erro:</p>
                              <p className="text-sm text-red-300">{integration.last_error}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTest(integration.id)}
                          disabled={testingId === integration.id}
                          className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all border border-cyan-500/30 hover:border-cyan-500/50"
                          title="Testar"
                        >
                          {testingId === integration.id ? (
                            <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Activity className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleToggle(integration.id)}
                          className={`p-2 rounded-lg transition-all border ${
                            integration.active
                              ? 'text-green-400 hover:bg-green-500/10 border-green-500/30 hover:border-green-500/50'
                              : 'text-gray-400 hover:bg-gray-500/10 border-gray-500/30 hover:border-gray-500/50'
                          }`}
                          title={integration.active ? 'Desativar' : 'Ativar'}
                        >
                          <Power className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(integration.id)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all border border-red-500/30 hover:border-red-500/50"
                          title="Excluir"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Criação */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Nova Integração</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome da Integração *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-500"
                  placeholder="Ex: Webhook Principal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-500"
                  rows={2}
                  placeholder="Descrição opcional"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                  >
                    <option value="webhook">Webhook</option>
                    <option value="zapier">Zapier</option>
                    <option value="make">Make</option>
                    <option value="n8n">n8n</option>
                    <option value="salesforce">Salesforce</option>
                    <option value="hubspot">HubSpot</option>
                    <option value="rdstation">RD Station</option>
                    <option value="slack">Slack</option>
                    <option value="custom">Personalizado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Método</label>
                  <select
                    value={formData.method}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                  >
                    <option value="POST">POST</option>
                    <option value="GET">GET</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">URL *</label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-500 font-mono text-sm"
                  placeholder="https://seu-sistema.com/webhook"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Token de Autenticação
                </label>
                <input
                  type="text"
                  value={formData.auth_token}
                  onChange={(e) => setFormData({ ...formData, auth_token: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-500 font-mono text-sm"
                  placeholder="Token opcional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Eventos que disparam
                </label>
                <div className="space-y-2">
                  {['lead_created', 'lead_updated', 'lead_deleted', 'client_created', 'client_updated'].map(
                    (event) => (
                      <label
                        key={event}
                        className="flex items-center p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.events.includes(event)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, events: [...formData.events, event] });
                            } else {
                              setFormData({
                                ...formData,
                                events: formData.events.filter((ev) => ev !== event),
                              });
                            }
                          }}
                          className="w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                        />
                        <span className="ml-3 text-sm text-gray-300">{event}</span>
                      </label>
                    )
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-medium shadow-lg shadow-cyan-500/30"
                >
                  Criar Integração
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
