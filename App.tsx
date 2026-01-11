
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { storage, supabase } from './storage.ts';
import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard.tsx';
import Clients from './components/Clients.tsx';
import Visits from './components/Visits.tsx';
import Agenda from './components/Agenda.tsx';
import Auth from './components/Auth.tsx';
import { AlertTriangle, ExternalLink } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(storage.isConfigured());

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

      return () => subscription.unsubscribe();
    }
  }, [isConfigured]);

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6 text-white text-center">
        <div className="max-w-md bg-white text-slate-900 p-8 rounded-[2rem] shadow-2xl">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={32} />
          </div>
          <h1 className="text-2xl font-black mb-4">Configuración Requerida</h1>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Para que <strong>GietCRM</strong> funcione, necesitas configurar las variables de entorno de <strong>Supabase</strong> en Vercel.
          </p>
          <div className="space-y-3 text-left bg-slate-50 p-4 rounded-xl font-mono text-xs border border-slate-200 mb-6">
            <p>VITE_SUPABASE_URL=...</p>
            <p>VITE_SUPABASE_ANON_KEY=...</p>
          </div>
          <a 
            href="https://supabase.com/dashboard" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all"
          >
            Ir a Supabase Dashboard <ExternalLink size={16} />
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <Router>
      <Layout onLogout={() => storage.logout()}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clientes" element={<Clients />} />
          <Route path="/visitas" element={<Visits />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
