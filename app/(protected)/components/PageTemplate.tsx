import { usePageTitle } from '@/app/context/PageTitle.context';
import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface PageTemplateProps {
  children: React.ReactNode;
}

export const PageTemplate: React.FC<PageTemplateProps> = ({ children }) => {
  const { title, subtitle, descrition } = usePageTitle();

  const [userName, setUserName] = React.useState<string>("");
  const [userEmail, setUserEmail] = React.useState<string>("");

  React.useEffect(() => {
    const login = localStorage.getItem("usuarioName") || "";
    const email = localStorage.getItem("usuarioLogin") || ""; // se quiser tratar email diferente, mude aqui

    setUserName(login);
    setUserEmail(email);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar userName={userName} userEmail={userEmail} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-6">
            <div className="mb-8 py-6 ">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{subtitle}</h2>
              <p className="text-gray-600">{descrition}</p>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
