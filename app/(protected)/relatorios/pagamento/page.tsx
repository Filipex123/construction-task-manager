'use client';
import { useObras } from '@/app/context/Obras.context';
import { usePageTitle } from '@/app/context/PageTitle.context';
import { tarefaService } from '@/app/services/tarefaService';
import { Obra, Tarefa } from '@/app/types';
import { ChevronLeft, ChevronRight, Loader2, Printer, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Option } from '../../components/InputSelect';
import { MultiFilterSelect } from '../../components/MultiFilterSelect';
import { SingleFilterSelect } from '../../components/SingleFilterSelect';

const DEFAULT_OBRA = { id: 0, name: '' } as Obra;

const PaymentReport: React.FC = () => {
  const { obras } = useObras();

  const { setTitle, setSubtitle } = usePageTitle();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filteredTasks, setFilteredTasks] = useState<Tarefa[]>([]);
  const [selectedObra, setSelectedObra] = useState<Obra>(DEFAULT_OBRA);
  const [empreiteiraOptions, setEmpreiteiraOptions] = useState<Option[]>([]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      if (selectedObra.id !== 0) {
        const data = await tarefaService.listar(selectedObra.id!, { paymentStatus: ['PENDENTE'] }, false);
        setFilteredTasks(Array.isArray(data.items) ? data.items : []);
        const empreiteiraOptionsUnique: Option[] = Array.from(
          new Map(
            data.items.map((task) => [
              task.empreiteira.id,
              {
                id: task.empreiteira.id,
                name: task.empreiteira.name?.toString() || '',
              } as Option,
            ])
          ).values()
        );

        setEmpreiteiraOptions(empreiteiraOptionsUnique);
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtros
  const [filters, setFilters] = useState({
    local: '',
    atividade: '',
    empreiteiras: [] as Option[],
    dataInicio: '',
    dataFim: '',
    dataInicioVencimento: '',
    dataFimVencimento: '',
  });

  // Filtrar dados
  const filteredData = useMemo(() => {
    return filteredTasks.filter((item) => {
      const matchesSearch = searchTerm === '' || Object.values(item).some((value) => value.toString().toLowerCase().includes(searchTerm.toLowerCase()));

      const concatenedLocais = item.localNivel1.name + ' ' + (item.localNivel2 ? item.localNivel2.name + ' ' : '') + (item.localNivel3 ? item.localNivel3.name : '');
      const matchesLocal = filters.local === '' || concatenedLocais.includes(filters.local);
      const matchesAtividade = filters.atividade === '' || item.atividade.name?.includes(filters.atividade);
      const matchesEmpreiteira = filters.empreiteiras.length === 0 || filters.empreiteiras.some((e) => e.id === item.empreiteira.id);

      let matchesDataInicio = true;
      let matchesDataFim = true;

      if (filters.dataInicio) {
        matchesDataInicio = new Date(item.measurementDate!) >= new Date(filters.dataInicio);
      }

      if (filters.dataFim) {
        matchesDataFim = new Date(item.measurementDate!) <= new Date(filters.dataFim);
      }

      if (filters.dataInicioVencimento) {
        matchesDataInicio = new Date(item.dueDate!) >= new Date(filters.dataInicioVencimento);
      }

      if (filters.dataFimVencimento) {
        matchesDataInicio = new Date(item.dueDate!) >= new Date(filters.dataInicioVencimento);
      }

      return matchesSearch && matchesLocal && matchesAtividade && matchesEmpreiteira && matchesDataInicio && matchesDataFim;
    });
  }, [filteredTasks, searchTerm, filters]);

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
      empreiteiras: [],
      dataInicio: '',
      dataFim: '',
      dataInicioVencimento: '',
      dataFimVencimento: '',
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
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    /* =========================
     * Agrupar por Empreiteira
     * ========================= */
    const groupedByEmpreiteira = filteredData.reduce<
      Record<
        number,
        {
          empreiteiraNome: string;
          items: Tarefa[];
        }
      >
    >((acc, item) => {
      const id = item.empreiteira?.id ?? -1;
      const nome = item.empreiteira?.name ?? 'Sem empreiteira';

      if (!acc[id]) {
        acc[id] = {
          empreiteiraNome: nome,
          items: [],
        };
      }

      acc[id].items.push(item);
      return acc;
    }, {});

    /* =========================
     * Totais Gerais
     * ========================= */
    const totalQuantidadeGeral = filteredData.reduce((sum, i) => sum + i.quantity, 0);
    const totalValorGeral = filteredData.reduce((sum, i) => sum + i.totalPrice, 0);
    const totalEmpreiteiras = Object.keys(groupedByEmpreiteira).length;

    /* =========================
     * Render tabela por empreiteira
     * ========================= */
    const renderEmpreiteira = (empreiteiraNome: string, items: Tarefa[]) => {
      const totalQuantidade = items.reduce((sum, i) => sum + i.quantity, 0);
      const totalValor = items.reduce((sum, i) => sum + i.totalPrice, 0);

      return `
          <section class="empreiteira-section">
            <h2>${empreiteiraNome}</h2>

            <table>
              <thead>
                <tr>
                  <th>Local</th>
                  <th>Atividade</th>
                  <th>Unidade</th>
                  <th>Quantidade</th>
                  <th>Valor Unitário</th>
                  <th>Valor Total</th>
                  <th>Data de Medição</th>
                  <th>Data Vencimento</th>
                </tr>
              </thead>
              <tbody>
                ${items
                  .map(
                    (item) => `
                  <tr>
                    <td>
                      ${[item.localNivel1?.name, item.localNivel2?.name, item.localNivel3?.name, item.localNivel4?.name].filter(Boolean).join(' / ')}
                    </td>
                    <td>${item.atividade.name}</td>
                    <td>${item.unidadeDeMedida.name}</td>
                    <td>${item.quantity.toLocaleString('pt-BR')}</td>
                    <td>${formatCurrency(item.totalAmount)}</td>
                    <td>${formatCurrency(item.totalPrice)}</td>
                    <td>${formatDate(item.measurementDate!)}</td>
                    <td>${formatDate(item.dueDate!)}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>

            <div class="totals">
              <p><strong>Total de Quantidade:</strong> ${totalQuantidade.toLocaleString('pt-BR')}</p>
              <p><strong>Valor Total da Empreiteira:</strong> ${formatCurrency(totalValor)}</p>
              <p><strong>Total de Registros:</strong> ${items.length}</p>
            </div>
          </section>
        `;
    };

    /* =========================
     * HTML final
     * ========================= */
    const printContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Relatório de Medição</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
                color: #333;
              }

              h1 {
                text-align: center;
                margin-bottom: 10px;
              }

              .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #333;
                padding-bottom: 15px;
              }

              .empreiteira-section {
                margin-top: 40px;
                page-break-inside: avoid;
              }

              .empreiteira-section h2 {
                border-bottom: 2px solid #444;
                padding-bottom: 5px;
                margin-bottom: 15px;
              }

              table {
                width: 100%;
                border-collapse: collapse;
                font-size: 12px;
              }

              th, td {
                border: 1px solid #ddd;
                padding: 6px;
                vertical-align: top;
              }

              th {
                background-color: #f2f2f2;
              }

              tr:nth-child(even) {
                background-color: #fafafa;
              }

              .totals {
                margin-top: 10px;
                padding: 10px;
                background-color: #f5faff;
                border-radius: 4px;
              }

              .totals p {
                margin: 4px 0;
                font-weight: bold;
              }

              .resumo-geral {
                margin-top: 50px;
                padding: 15px;
                background-color: #e3f2fd;
                border-top: 2px solid #333;
              }

              .footer {
                margin-top: 40px;
                text-align: center;
                font-size: 11px;
                color: #666;
              }

              @media print {
                body {
                  margin: 0;
                }

                .empreiteira-section {
                  page-break-after: always;
                }

                .resumo-geral {
                  page-break-before: always;
                }
              }
            </style>
          </head>

          <body>
            <div class="header">
              <h1>Relatório de Medição</h1>
              <p>Data de geração: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
              <p>Total de Registros: ${filteredData.length}</p>
            </div>

            ${Object.values(groupedByEmpreiteira)
              .map((group) => renderEmpreiteira(group.empreiteiraNome, group.items))
              .join('')}

            <div class="resumo-geral">
              <h2>Resumo Geral</h2>
              <p>Total Geral de Quantidade: ${totalQuantidadeGeral.toLocaleString('pt-BR')}</p>
              <p>Valor Total Geral: ${formatCurrency(totalValorGeral)}</p>
              <p>Total de Empreiteiras: ${totalEmpreiteiras}</p>
            </div>

            <div class="footer">
              Relatório gerado automaticamente pelo sistema em ${new Date().toLocaleString('pt-BR')}
            </div>
          </body>
        </html>
      `;

    printWindow.document.write(printContent);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  React.useEffect(() => {
    setTitle('Relatórios');
  }, []);

  React.useEffect(() => {
    fetchTasks();
  }, [selectedObra]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Relatório de Medição</h1>

        <div className="flex flex-col gap-3 w-full md:flex-row md:items-center md:gap-4 md:max-w-md">
          <div className="w-full">
            <SingleFilterSelect
              options={obras?.map((o) => ({ id: o.id, name: o.name })) as Option[]}
              value={selectedObra.id !== 0 ? { id: selectedObra.id!, name: selectedObra.name! } : null}
              placeholder="Selecione uma obra"
              onChange={(value) => {
                if (value) {
                  const selected = obras?.find((l) => l.id === value.id) ?? value;
                  setSelectedObra(selected);
                }
              }}
            />
          </div>

          <button onClick={handlePrint} className="flex items-center justify-center w-full md:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </button>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white rounded-lg shadow-md">
        {true && (
          <div className="bg-white grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
              <input
                type="text"
                value={filters.local}
                onChange={(e) => handleFilterChange('local', e.target.value)}
                className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                placeholder="Filtrar por local"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Atividade</label>
              <input
                type="text"
                value={filters.atividade}
                onChange={(e) => handleFilterChange('atividade', e.target.value)}
                className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                placeholder="Filtrar por atividade"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Empreiteira</label>
              <MultiFilterSelect
                options={empreiteiraOptions}
                value={filters.empreiteiras}
                placeholder="Selecione empreiteiras"
                onChange={(values) =>
                  setFilters((prev) => ({
                    ...prev,
                    empreiteiras: values,
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Início - Medição</label>
              <input
                type="date"
                value={filters.dataInicio}
                onChange={(e) => handleFilterChange('dataInicio', e.target.value)}
                className="w-full text-black/50 px-3 py-2 border border-gray-300 rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim - Medição</label>
              <input
                type="date"
                value={filters.dataFim}
                onChange={(e) => handleFilterChange('dataFim', e.target.value)}
                className="w-full text-black/50 px-3 py-2 border border-gray-300 rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div className="lg:col-span-5 flex justify-end">
              <button onClick={clearFilters} className="flex flex-row px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors rounded-lg">
                <X className="w-5 h-5 text-gray-400 mr-2" />
                Limpar Filtros
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        {isLoading ? (
          <div className="absolute inset-0 bg-white/60 z-50 flex items-center justify-center top-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {filteredData.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-2">Nenhuma tarefa encontrada</div>
                <p className="text-gray-500">Adicione a primeira tarefa desta obra</p>
              </div>
            ) : (
              <>
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
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Unitário</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empreiteira</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Medição</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Vencimento</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedData.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.localNivel1.name + '\n' + item.localNivel2.name + '\n' + item.localNivel3.name + '\n' + item.localNivel4.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.atividade.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.unidadeDeMedida.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity.toLocaleString('pt-BR')}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(item.totalAmount)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(item.totalPrice)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.empreiteira.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.measurementDate!)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.dueDate!)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.paymentStatus}</td>
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
                          className="ml-4 px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentReport;
