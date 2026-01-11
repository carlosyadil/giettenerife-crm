
import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { storage } from '../storage.ts';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (isLogin) {
        const { error } = await storage.signIn(email, pass);
        if (error) throw error;
      } else {
        const { error, data } = await storage.signUp(email, pass);
        if (error) throw error;
        
        // Si hay sesión inmediata, el usuario entrará solo por el estado de App.tsx
        // Si no hay sesión, es que requiere confirmación
        if (data?.user && !data?.session) {
          setSuccess('Cuenta creada. Si no recibes el correo, desactiva "Confirm Email" en el panel de Supabase.');
          setIsLogin(true);
        } else {
          setSuccess('¡Cuenta creada con éxito! Entrando...');
        }
      }
    } catch (err: any) {
      if (err.message?.includes('Database error saving next auth response')) {
        setError('Error de base de datos. Asegúrate de haber ejecutado el SQL inicial en Supabase.');
      } else {
        setError(err.message || 'Error en la autenticación.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-900/40 rounded-full blur-[100px] -ml-20 -mb-20"></div>

      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden relative z-10 p-8 md:p-12 animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">GietCRM</h1>
          <p className="text-slate-500 mt-2 font-medium">
            {isLogin ? 'Gestión Comercial' : 'Crea tu cuenta de comercial'}
          </p>
        </div>

        {!isLogin && (
          <div className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 text-xs text-blue-700 leading-relaxed">
            <Info size={20} className="flex-shrink-0" />
            <p><strong>Tip:</strong> Si el correo de confirmación no llega, recuerda desactivar "Confirm Email" en Authentication {'>'} Providers en tu panel de Supabase.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-in slide-in-from-top-2">
              <AlertCircle size={18} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-in slide-in-from-top-2">
              <CheckCircle2 size={18} className="flex-shrink-0" />
              {success}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="email" 
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="password" 
                placeholder="••••••••"
                value={pass}
                onChange={e => setPass(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                required
                minLength={6}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Registrar Cuenta')}
          </button>

          <div className="text-center mt-6">
            <button 
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setSuccess(null);
              }}
              className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate gratis' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </form>
      </div>
      
      <p className="mt-8 text-slate-500 text-xs font-medium relative z-10">
        GietCRM v1.0 • Sistema Seguro de Gestión de Visitas
      </p>
    </div>
  );
};

export default Auth;
