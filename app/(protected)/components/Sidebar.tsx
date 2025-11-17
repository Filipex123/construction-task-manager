import { useSidebar } from '@/app/context/Sidebar.context';
import { ChevronDown, ChevronRight, ClipboardList, DollarSign, LogOut, Menu, Plus, Ruler, User, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

interface SidebarProps {
  userName: string;
  userEmail: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ userName, userEmail }) => {
  const { isOpen, toggleSidebar } = useSidebar();
  const [isCadastroOpen, setIsCadastroOpen] = React.useState<boolean>(false);
  const [isCadastroLocaisOpen, setIsCadastroLocaisOpen] = React.useState<boolean>(false);

  const router = useRouter();

  const logout = () => {
    localStorage.removeItem('logged');
    localStorage.removeItem('idUsuario');
    localStorage.removeItem('usuarioLogin');
    localStorage.removeItem('usuarioName');
    localStorage.removeItem('isAdmin');

    router.push('/login'); // redireciona para o login
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={toggleSidebar} />}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-slate-900 text-white z-30 transform transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 ${isOpen ? 'w-64' : 'lg:w-16'} flex flex-col justify-between`}
      >
        {/* Conteúdo principal */}
        <div>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <div className={`flex items-center space-x-3 ${!isOpen && 'lg:justify-center'}`}>
              <div className="bg-blue-600 p-2 rounded-lg">
                <Image src="/favicon.ico" alt="Logo" width={24} height={24} />
              </div>
              {isOpen && <h1 className="text-xl font-bold">Vital Gestão - Medição</h1>}
            </div>
            <button onClick={toggleSidebar} className="p-1 rounded hover:bg-slate-700 transition-colors lg:hidden">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col mt-8 gap-2">
            {/* Pagamento */}
            {localStorage.getItem('isAdmin') === 'true' && (
              <div className="px-4">
                <Link href="/" className={`flex items-center space-x-3 px-3 py-3 rounded-lg bg-blue-700 text-white ${!isOpen && 'lg:justify-center lg:px-2'}`}>
                  <DollarSign className="w-5 h-5 flex-shrink-0" />
                  {isOpen && <span className="font-medium">Pagamento</span>}
                </Link>
              </div>
            )}

            {/* Medição */}
            <div className="px-4">
              <Link href="/medicao" className={`flex items-center space-x-3 px-3 py-3 rounded-lg bg-blue-700 text-white ${!isOpen && 'lg:justify-center lg:px-2'}`}>
                <Ruler className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="font-medium">Medição</span>}
              </Link>
            </div>
            {/* Cadastro (collapsible) */}
            <div className="px-4">
              <button
                type="button"
                onClick={() => setIsCadastroOpen((prev) => !prev)}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-lg bg-blue-700 text-white ${!isOpen && 'lg:justify-center lg:px-2'}`}
              >
                <span className={`flex items-center ${!isOpen ? 'lg:justify-center w-full' : 'space-x-3'}`}>
                  <Plus className="w-5 h-5 flex-shrink-0" />
                  {isOpen && <span className="font-medium">Cadastro</span>}
                </span>
                {isOpen && (isCadastroOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
              </button>

              {/* Subitems */}
              {isOpen && isCadastroOpen && (
                <div className="mt-2 ml-6 flex flex-col gap-1">
                  <Link href="/nova-obra" className="block px-3 py-2 rounded-md hover:bg-blue-600/60">
                    <span className="text-sm">Cadastro de Obra e Local</span>
                  </Link>
                  <Link href="/tarefa" className="block px-3 py-2 rounded-md hover:bg-blue-600/60">
                    <span className="text-sm">Cadastro de Tarefa</span>
                  </Link>
                  <Link href="/atividades" className="block px-3 py-2 rounded-md hover:bg-blue-600/60">
                    <span className="text-sm">Cadastro de Atividades</span>
                  </Link>
                  <Link href="/empreiteira" className="block px-3 py-2 rounded-md hover:bg-blue-600/60">
                    <span className="text-sm">Cadastro de Empreiteiras</span>
                  </Link>
                  <Link href="/unidade-medidas" className="block px-3 py-2 rounded-md hover:bg-blue-600/60">
                    <span className="text-sm">Cadastro de Unidade</span>
                  </Link>
                </div>
              )}
            </div>

           {/* Cadastro (collapsible) */}
            <div className="px-4">
              <button
                type="button"
                onClick={() => setIsCadastroLocaisOpen((prev) => !prev)}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-lg bg-blue-700 text-white ${!isOpen && 'lg:justify-center lg:px-2'}`}
              >
                <span className={`flex items-center ${!isOpen ? 'lg:justify-center w-full' : 'space-x-3'}`}>
                  <Plus className="w-5 h-5 flex-shrink-0" />
                  {isOpen && <span className="font-medium">Cadastro de Locais</span>}
                </span>
                {isOpen && (isCadastroLocaisOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
              </button>

              {/* Subitems */}
              {isOpen && isCadastroLocaisOpen && (
                <div className="mt-2 ml-6 flex flex-col gap-1">
                  <Link href="/nivel1" className="block px-3 py-2 rounded-md hover:bg-blue-600/60">
                    <span className="text-sm">Cadastro Local Nivel 1</span>
                  </Link>
                  <Link href="/nivel2" className="block px-3 py-2 rounded-md hover:bg-blue-600/60">
                    <span className="text-sm">Cadastro Local Nivel 2</span>
                  </Link>
                  <Link href="/nivel3" className="block px-3 py-2 rounded-md hover:bg-blue-600/60">
                    <span className="text-sm">Cadastro Local Nivel 3</span>
                  </Link>
                  <Link href="/nivel4" className="block px-3 py-2 rounded-md hover:bg-blue-600/60">
                      <span className="text-sm">Cadastro Local Nivel 4</span>
                  </Link>                 
                </div>
              )}
            </div>

            {/* Relatorio */}
             {localStorage.getItem('isAdmin') === 'true' && (
            <div className="px-4">
              <a href="/relatorios/pagamento" className={`flex items-center space-x-3 px-3 py-3 rounded-lg bg-blue-700 text-white ${!isOpen && 'lg:justify-center lg:px-2'}`}>
                <ClipboardList className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="font-medium">Relatório</span>}
              </a>
            </div>
             )}
            {/* usuarios */}
          {localStorage.getItem('isAdmin') === 'true' && (
            <div className="px-4">
              <a href="/usuarios" className={`flex items-center space-x-3 px-3 py-3 rounded-lg bg-blue-700 text-white ${!isOpen && 'lg:justify-center lg:px-2'}`}>
                <User className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="font-medium">Usuários</span>}
              </a>
            </div>
          )}
          </nav>
        </div>

        {/* Footer do usuário */}
        <div className="p-4 border-t border-slate-700">
          <div className={`flex items-center ${!isOpen ? 'justify-center' : 'justify-start'} mb-3`}>
            {!isOpen ? (
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            ) : (
              <>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="ml-3 max-w-[150px] overflow-hidden">
                  <p className="text-sm font-medium truncate">{userName}</p>
                  <p className="text-xs text-gray-400 truncate">{userEmail}</p>
                </div>
              </>
            )}
          </div>
          <button
            onClick={logout}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ${!isOpen ? 'justify-center' : 'justify-start'}`}
          >
            <LogOut className={`h-4 w-4 ${!isOpen ? '' : 'mr-2'}`} />
            {isOpen && 'Sair'}
          </button>
        </div>

        {/* Toggle Button for Desktop */}
        <button onClick={toggleSidebar} className="hidden lg:block absolute -right-3 top-20 bg-white border border-slate-300 rounded-full p-1 shadow-lg hover:bg-slate-50 transition-colors">
          <Menu className="w-4 h-4 text-slate-600" />
        </button>
      </div>
    </>
  );
};
