'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

interface ImportResult {
  total: number;
  sucesso: number;
  erros: number;
  detalhes: {
    linha: number;
    dados: any;
    erro?: string;
    status: 'sucesso' | 'erro';
  }[];
}

export default function ImportLeadsPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isValidFile(droppedFile)) {
      setFile(droppedFile);
    } else {
      alert('Por favor, selecione um arquivo Excel (.xlsx, .xls) ou CSV (.csv)');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && isValidFile(selectedFile)) {
      setFile(selectedFile);
    } else {
      alert('Por favor, selecione um arquivo Excel (.xlsx, .xls) ou CSV (.csv)');
    }
  };

  const isValidFile = (file: File): boolean => {
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileName = file.name.toLowerCase();
    return validExtensions.some((ext) => fileName.endsWith(ext));
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/leads/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);
    } catch (error: any) {
      alert('Erro ao importar: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/leads/template/download', {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'template-leads.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Erro ao baixar template');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/leads"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Leads
          </Link>

          <h1 className="text-3xl font-bold text-white mb-2">Importar Leads</h1>
          <p className="text-gray-400">Importe múltiplos leads de uma vez usando arquivo Excel ou CSV</p>
        </div>

        {/* Download Template */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-cyan-500/20 rounded-lg">
                <FileSpreadsheet className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                  Importação Inteligente
                </h3>
                <p className="text-sm text-gray-400 mb-3">
                  Sistema com IA que entende planilhas bagunçadas e normaliza os dados automaticamente!
                </p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-cyan-400">Campos Aceitos:</p>
                    <ul className="text-xs text-gray-400 space-y-0.5">
                      <li>• <strong className="text-white">nome</strong> (obrigatório)</li>
                      <li>• email, telefone/celular/whatsapp</li>
                      <li>• razão social, empresa</li>
                      <li>• cargo, origem, observações</li>
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-green-400">Normalização Automática:</p>
                    <ul className="text-xs text-gray-400 space-y-0.5">
                      <li>✓ Telefone → formato WhatsApp</li>
                      <li>✓ DDD extraído automaticamente</li>
                      <li>✓ Nomes capitalizados corretamente</li>
                      <li>✓ Aceita colunas em qualquer ordem</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-3">
                  <p className="text-xs text-blue-400 font-medium mb-1">Exemplos de telefones aceitos:</p>
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-400">
                    <code className="bg-gray-900/50 px-2 py-1 rounded">11999999999</code>
                    <code className="bg-gray-900/50 px-2 py-1 rounded">(11) 99999-9999</code>
                    <code className="bg-gray-900/50 px-2 py-1 rounded">+55 11 99999-9999</code>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">→ Todos convertidos para: <code className="text-green-400">+55 (11) 99999-9999</code></p>
                </div>
                <p className="text-xs text-gray-500">
                  Formatos: .xlsx, .xls, .csv • Máx. 10MB • Aceita colunas com nomes variados (Nome/NOME/name, etc)
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-2 bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 transition-colors font-medium shadow-lg shadow-cyan-500/30"
            >
              <Download className="w-4 h-4" />
              Baixar Template
            </button>
          </div>
        </div>

        {/* Upload Area */}
        {!result && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-white mb-4">Selecione o Arquivo</h3>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
                dragging
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : file
                  ? 'border-green-500/50 bg-green-500/5'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              }`}
            >
              {file ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                    <FileSpreadsheet className="w-8 h-8 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium mb-1">{file.name}</p>
                    <p className="text-sm text-gray-400">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-sm text-gray-400 hover:text-red-400 transition-colors"
                  >
                    Remover arquivo
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-white mb-2">
                      Arraste e solte seu arquivo aqui
                    </p>
                    <p className="text-sm text-gray-400 mb-4">ou</p>
                    <label className="inline-flex items-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer border border-gray-700">
                      <FileSpreadsheet className="w-4 h-4" />
                      Selecionar Arquivo
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    Formatos aceitos: .xlsx, .xls, .csv (máx. 10MB)
                  </p>
                </div>
              )}
            </div>

            {file && (
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setFile(null)}
                  className="px-6 py-3 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-medium shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Importando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Importar Leads
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-800/50 backdrop-blur rounded-lg p-6 border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/30">
                    <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total</p>
                    <p className="text-2xl font-bold text-white">{result.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur rounded-lg p-6 border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/30">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Sucesso</p>
                    <p className="text-2xl font-bold text-green-400">{result.sucesso}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur rounded-lg p-6 border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/30">
                    <XCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Erros</p>
                    <p className="text-2xl font-bold text-red-400">{result.erros}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="font-bold text-white mb-4">Detalhes da Importação</h3>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {result.detalhes.map((detalhe, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      detalhe.status === 'sucesso'
                        ? 'bg-green-500/5 border-green-500/30'
                        : 'bg-red-500/5 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {detalhe.status === 'sucesso' ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400" />
                          )}
                          <span className="text-sm font-medium text-gray-300">
                            Linha {detalhe.linha}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              detalhe.status === 'sucesso'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {detalhe.status === 'sucesso' ? 'Sucesso' : 'Erro'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400 space-y-1">
                          <div>
                            {detalhe.dados.nome && (
                              <span>
                                <strong className="text-white">Nome:</strong> {detalhe.dados.nome}
                              </span>
                            )}
                            {detalhe.dados.email && (
                              <span className="ml-4">
                                <strong className="text-white">Email:</strong> {detalhe.dados.email}
                              </span>
                            )}
                          </div>
                          {detalhe.dados.telefone && (
                            <div className="flex items-center gap-2">
                              <strong className="text-white">WhatsApp:</strong>
                              <code className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded text-xs border border-green-500/30">
                                {detalhe.dados.telefone}
                              </code>
                              {detalhe.dados.ddd && (
                                <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">
                                  DDD: {detalhe.dados.ddd}
                                </span>
                              )}
                            </div>
                          )}
                          {detalhe.dados.razaoSocial && (
                            <div>
                              <strong className="text-white">Razão Social:</strong> {detalhe.dados.razaoSocial}
                            </div>
                          )}
                          {detalhe.dados.empresa && (
                            <div>
                              <strong className="text-white">Empresa:</strong> {detalhe.dados.empresa}
                            </div>
                          )}
                        </div>
                        {detalhe.erro && (
                          <div className="mt-2 flex items-start gap-2 text-sm text-red-400">
                            <AlertCircle className="w-4 h-4 mt-0.5" />
                            <span>{detalhe.erro}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between">
              <button
                onClick={() => {
                  setFile(null);
                  setResult(null);
                }}
                className="inline-flex items-center gap-2 bg-gray-800 border border-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Importar Outro Arquivo
              </button>

              <Link
                href="/leads"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-medium shadow-lg shadow-cyan-500/30"
              >
                Ver Todos os Leads
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
