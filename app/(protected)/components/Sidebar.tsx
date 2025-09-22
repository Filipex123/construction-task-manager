import React from "react";
import Image from "next/image";
import { Menu, Home, X, Plus, User, LogOut } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  userName: string;
  userEmail: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, userName, userEmail }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={toggleSidebar} />}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-slate-900 text-white z-30 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0 ${isOpen ? "w-64" : "lg:w-16"} flex flex-col justify-between`}
      >
        {/* Conteúdo principal */}
        <div>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <div className={`flex items-center space-x-3 ${!isOpen && "lg:justify-center"}`}>
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
            <div className="px-4">
              <a
                href="#"
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg bg-blue-700 text-white ${
                  !isOpen && "lg:justify-center lg:px-2"
                }`}
              >
                <Home className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="font-medium">Pagamento</span>}
              </a>
            </div>
            <div className="px-4">
              <a
                href="/medicao"
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg bg-blue-700 text-white ${
                  !isOpen && "lg:justify-center lg:px-2"
                }`}
              >
                <Plus className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="font-medium">Medição</span>}
              </a>
            </div>
            <div className="px-4">
              <a
                href="/medicao"
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg bg-blue-700 text-white ${
                  !isOpen && "lg:justify-center lg:px-2"
                }`}
              >
                <Plus className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="font-medium">Cadastro de Local</span>}
              </a>
            </div>
            <div className="px-4">
              <a
                href="/medicao"
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg bg-blue-700 text-white ${
                  !isOpen && "lg:justify-center lg:px-2"
                }`}
              >
                <Plus className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="font-medium">Cadastro de Tarefa</span>}
              </a>
            </div>
            <div className="px-4">
              <a
                href="/medicao"
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg bg-blue-700 text-white ${
                  !isOpen && "lg:justify-center lg:px-2"
                }`}
              >
                <Plus className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="font-medium">Empreiteros</span>}
              </a>
            </div>
            <div className="px-4">
              <a
                href="/relatorios/pagamento"
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg bg-blue-700 text-white ${
                  !isOpen && "lg:justify-center lg:px-2"
                }`}
              >
                <Plus className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="font-medium">Relatório de Pagamento</span>}
              </a>
            </div>
            <div className="px-4">
              <a
                href="/unidadeMedidas"
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg bg-blue-700 text-white ${
                  !isOpen && "lg:justify-center lg:px-2"
                }`}
              >
                <Plus className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="font-medium">Unidade de Medida</span>}
              </a>
            </div>
          </nav>
        </div>

        {/* Footer do usuário */}
        <div className="p-4 border-t border-slate-700">
          <div className={`flex items-center ${!isOpen ? "justify-center" : "justify-start"} mb-3`}>
            {!isOpen ? (
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            ) : (
              <>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-gray-400">{userEmail}</p>
                </div>
              </>
            )}
          </div>
          <button
            
            className={`w-full flex items-center px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ${
              !isOpen ? "justify-center" : "justify-start"
            }`}
          >
            <LogOut className={`h-4 w-4 ${!isOpen ? "" : "mr-2"}`} />
            {isOpen && "Sair"}
          </button>
        </div>

        {/* Toggle Button for Desktop */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:block absolute -right-3 top-20 bg-white border border-slate-300 rounded-full p-1 shadow-lg hover:bg-slate-50 transition-colors"
        >
          <Menu className="w-4 h-4 text-slate-600" />
        </button>
      </div>
    </>
  );
};
