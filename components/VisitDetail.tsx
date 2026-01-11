
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storage } from '../storage.ts';
import { Visit, Client, VisitType, VisitResult } from '../types.ts';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Tag, 
  FileText, 
  Save, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';

const VisitDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [visit, setVisit] = useState<Visit | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    date: '',
    type: 'Seguimiento' as VisitType,
    result: 'Pendiente' as VisitResult,
    notes: '',
    followUpDate: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const visitData = await storage.getVisitById(id);
        if (visitData) {
          setVisit(visitData);
          setFormData({
            date: new Date(visitData.date).toISOString().slice(0, 16),
            type: visitData.type,
            result: visitData.result,
            notes: visitData.notes,
            followUpDate: visitData.followUpDate ? new Date(visitData.followUpDate).toISOString().slice(0, 16) : ''
          });
          const clientData = await storage.getClientById(visitData.clientId);
          setClient(clientData);
        }
      } catch (error) {
        console.error("Error fetching visit detail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !visit) return;
    setSaving(true);
    try {
      await storage.updateVisit(id, {
        ...formData,
        date: new Date(formData.date).toISOString(),
        followUpDate: formData.followUpDate ? new Date(formData.followUpDate).toISOString() : undefined
      });
      alert("Reporte actualizado correctamente.");
      navigate(-1);
    } catch (error) {
      alert("Error al actualizar visita.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (confirm("¿Estás seguro de eliminar este reporte de visita? Esta acción no se puede deshacer.")) {
      try {
        await storage.deleteVisit(id);
        navigate(-1);
      } catch (error) {
        alert("Error al eliminar visita.");
      }
    }
  };

  if (loading) {
    return <div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div></div>;
  }

  if (!visit || !client) {
    return (
      <div className="text-center py-20">
        <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
        <h2 className="text-xl font-bold">Reporte no encontrado</h2>
        <button onClick={() => navigate('/visitas')} className="mt-4 text-blue-600 font-bold underline">Volver al historial</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-gray-200">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Detalle de Gestión</h2>
            <p className="text-slate-500 font-medium">Editando reporte del {new Date(visit.date).toLocaleDateString()}</p>
          </div>
        </div>
        <button 
          onClick={handleDelete}
          className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-colors flex items-center gap-2 font-bold text-sm"
        >
          <Trash2 size={18} />
          <span className="hidden md:inline">Eliminar Reporte</span>
        </button>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Info del Cliente */}
        <div className="lg:col-span-1 space-y-4">
          <div 
            onClick={() => navigate(`/clientes/${client.id}`)}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-blue-200 cursor-pointer group transition-all"
          >
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Cliente Asociado</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl uppercase">
                {client.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-slate-900 truncate group-hover:text-blue-600">{client.name}</h4>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin size={10} /> {client.city}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-blue-600 font-bold group-hover:translate-x-1 transition-transform">
              Ver ficha completa <ExternalLink size={12} />
            </div>
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
             <div className="flex items-center gap-3 mb-4">
               <div className={`w-3 h-3 rounded-full animate-pulse ${
                 visit.result === 'Vendido' ? 'bg-blue-400' :
                 visit.result === 'Interesado' ? 'bg-green-400' : 'bg-amber-400'
               }`}></div>
               <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Estado Actual</span>
             </div>
             <p className="text-2xl font-black">{visit.result}</p>
             <p className="text-xs text-slate-400 mt-2">Visita de tipo: {visit.type}</p>
          </div>
        </div>

        {/* Formulario de Edición */}
        <div className="lg:col-span-2">
          <form onSubmit={handleUpdate} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                  <Calendar size={14} className="text-blue-500" /> Fecha y Hora
                </label>
                <input 
                  type="datetime-local" 
                  required 
                  value={formData.date} 
                  onChange={e => setFormData({...formData, date: e.target.value})} 
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-medium" 
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                  <Tag size={14} className="text-blue-500" /> Tipo de Gestión
                </label>
                <select 
                  value={formData.type} 
                  onChange={e => setFormData({...formData, type: e.target.value as VisitType})} 
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-medium"
                >
                  <option value="Primera Visita">Primera Visita</option>
                  <option value="Seguimiento">Seguimiento</option>
                  <option value="Postventa">Postventa</option>
                  <option value="Cierre">Cierre</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                  <CheckCircle2 size={14} className="text-blue-500" /> Resultado de la Visita
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(['Pendiente', 'Interesado', 'No Interesado', 'Vendido'] as VisitResult[]).map((res) => (
                    <button
                      key={res}
                      type="button"
                      onClick={() => setFormData({...formData, result: res})}
                      className={`p-3 rounded-xl text-[10px] font-black uppercase tracking-tighter border-2 transition-all ${
                        formData.result === res 
                          ? 'border-blue-600 bg-blue-50 text-blue-700' 
                          : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                  <FileText size={14} className="text-blue-500" /> Notas Detalladas
                </label>
                <textarea 
                  rows={4} 
                  placeholder="Describe qué ocurrió en la visita..."
                  value={formData.notes} 
                  onChange={e => setFormData({...formData, notes: e.target.value})} 
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-medium" 
                />
              </div>

              <div className="space-y-2 md:col-span-2 pt-4 border-t border-gray-50">
                <label className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider ml-1">
                  <Clock size={14} /> Reprogramar Seguimiento
                </label>
                <input 
                  type="datetime-local" 
                  value={formData.followUpDate} 
                  onChange={e => setFormData({...formData, followUpDate: e.target.value})} 
                  className="w-full p-4 bg-amber-50 border border-amber-100 text-amber-700 rounded-2xl outline-none font-bold" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={saving}
              className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-bold text-lg shadow-xl shadow-blue-200 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              <Save size={22} />
              {saving ? 'Guardando cambios...' : 'Guardar Actualización'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VisitDetail;
