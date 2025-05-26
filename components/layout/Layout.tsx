
import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { AppName } from '../../constants';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const error = useAppStore((state) => state.error);
  const setError = useAppStore((state) => state.setError);

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-md p-4 z-10">
          <h1 className="text-2xl font-semibold text-slate-800">{AppName}</h1>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex justify-between items-center">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <span>Error: {error}</span>
              </div>
              <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
                &times;
              </button>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
