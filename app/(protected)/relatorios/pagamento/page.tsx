'use client';
import { usePageTitle } from '@/app/context/PageTitle.context';
import { mockRelatorio } from '@/app/mockData';
import { ChevronLeft, ChevronRight, Download, Eye, Printer } from 'lucide-react';
import React, { useMemo, useState } from 'react';

const PaymentReport: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { setTitle, setSubtitle, setDescription } = usePageTitle();

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Filtros
  const [filters, setFilters] = useState({
    local: '',
    atividade: '',
    empreiteira: '',
    dataInicio: '',
    dataFim: '',
  });

  const hasActiveFilters = filters.local.length > 0 || filters.atividade.length > 0 || filters.empreiteira.length > 0 || filters.dataInicio.length > 0 || filters.dataFim.length > 0;

  // Filtrar dados
  const filteredData = useMemo(() => {
    return mockRelatorio.filter((item) => {
      const matchesSearch = searchTerm === '' || Object.values(item).some((value) => value.toString().toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesLocal = filters.local === '' || item.local.includes(filters.local);
      const matchesAtividade = filters.atividade === '' || item.atividade.includes(filters.atividade);
      const matchesEmpreiteira = filters.empreiteira === '' || item.empreiteira.includes(filters.empreiteira);

      let matchesDataInicio = true;
      let matchesDataFim = true;

      if (filters.dataInicio) {
        matchesDataInicio = new Date(item.dataPagamento) >= new Date(filters.dataInicio);
      }

      if (filters.dataFim) {
        matchesDataFim = new Date(item.dataPagamento) <= new Date(filters.dataFim);
      }

      return matchesSearch && matchesLocal && matchesAtividade && matchesEmpreiteira && matchesDataInicio && matchesDataFim;
    });
  }, [mockRelatorio, searchTerm, filters]);

  // Paginação
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      local: '',
      atividade: '',
      empreiteira: '',
      dataInicio: '',
      dataFim: '',
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handlePrint = () => {
    // Criar uma nova janela para impressão
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Calcular totais
    const totalQuantidade = filteredData.reduce((sum, item) => sum + item.quantidade, 0);
    const totalValor = filteredData.reduce((sum, item) => sum + item.valor, 0);

    // HTML para impressão
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório de Pagamento</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              color: #333;
            }
            .header p {
              margin: 5px 0;
              color: #666;
            }
            .filters-info {
              margin-bottom: 20px;
              padding: 15px;
              background-color: #f8f9fa;
              border-radius: 5px;
            }
            .filters-info h3 {
              margin: 0 0 10px 0;
              font-size: 16px;
            }
            .filters-info p {
              margin: 5px 0;
              font-size: 14px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              font-size: 12px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f8f9fa;
              font-weight: bold;
              color: #333;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .totals {
              margin-top: 20px;
              padding: 15px;
              background-color: #e3f2fd;
              border-radius: 5px;
            }
            .totals h3 {
              margin: 0 0 10px 0;
              color: #1976d2;
            }
            .totals p {
              margin: 5px 0;
              font-weight: bold;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 15px;
            }
            @media print {
              body { margin: 0; }
              .header { page-break-after: avoid; }
              table { page-break-inside: avoid; }
              tr { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Relatório de Pagamento</h1>
            <p>Data de Geração: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
            <p>Total de Registros: ${filteredData.length}</p>
          </div>
          
          ${
            Object.values(filters).some((filter) => filter !== '') || searchTerm
              ? `
          <div class="filters-info">
            <h3>Filtros Aplicados:</h3>
            ${searchTerm ? `<p><strong>Busca:</strong> ${searchTerm}</p>` : ''}
            ${filters.local ? `<p><strong>Local:</strong> ${filters.local}</p>` : ''}
            ${filters.atividade ? `<p><strong>Atividade:</strong> ${filters.atividade}</p>` : ''}
            ${filters.empreiteira ? `<p><strong>Empreiteira:</strong> ${filters.empreiteira}</p>` : ''}
            ${filters.dataInicio ? `<p><strong>Data Início:</strong> ${formatDate(filters.dataInicio)}</p>` : ''}
            ${filters.dataFim ? `<p><strong>Data Fim:</strong> ${formatDate(filters.dataFim)}</p>` : ''}
          </div>
          `
              : ''
          }
          
          <table>
            <thead>
              <tr>
                <th>Local</th>
                <th>Atividade</th>
                <th>Unidade</th>
                <th>Quantidade</th>
                <th>Valor</th>
                <th>Empreiteira</th>
                <th>Data Limite</th>
                <th>Data Pagamento</th>
                <th>Responsável</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData
                .map(
                  (item) => `
                <tr>
                  <td>${item.local}</td>
                  <td>${item.atividade}</td>
                  <td>${item.unidade}</td>
                  <td>${item.quantidade.toLocaleString('pt-BR')}</td>
                  <td>${formatCurrency(item.valor)}</td>
                  <td>${item.empreiteira}</td>
                  <td>${formatDate(item.dataLimite)}</td>
                  <td>${formatDate(item.dataPagamento)}</td>
                  <td>${item.usuarioResponsavel}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <h3>Resumo Geral</h3>
            <p>Total de Quantidade: ${totalQuantidade.toLocaleString('pt-BR')}</p>
            <p>Valor Total: ${formatCurrency(totalValor)}</p>
            <p>Número de Empreiteiras: ${new Set(filteredData.map((item) => item.empreiteira)).size}</p>
            <p>Número de Locais: ${new Set(filteredData.map((item) => item.local)).size}</p>
          </div>
          
          <div class="footer">
            <p>Relatório gerado automaticamente pelo sistema - ${new Date().toLocaleString('pt-BR')}</p>
          </div>
        </body>
      </html>
    `;

    // Escrever o conteúdo na nova janela
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Aguardar o carregamento e imprimir
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  React.useEffect(() => {
    setTitle('Relatórios');
    setSubtitle('Relatório de Pagamentos');
  }, []);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex space-x-3">
            <button onClick={handlePrint} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </button>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Local</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Atividade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empreiteira</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Limite</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Pagamento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsável</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.local}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.atividade}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.unidade}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantidade.toLocaleString('pt-BR')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(item.valor)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.empreiteira}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.dataLimite)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.dataPagamento)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.usuarioResponsavel}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-blue-600 hover:text-blue-900 transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{startIndex + 1}</span> a <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> de{' '}
                  <span className="font-medium">{filteredData.length}</span> resultados
                </p>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="text-gray-600 ml-4 px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={10}>10 por página</option>
                  <option value={25}>25 por página</option>
                  <option value={50}>50 por página</option>
                </select>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentReport;
