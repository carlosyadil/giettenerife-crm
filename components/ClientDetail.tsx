
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storage } from '../storage.ts';
import { Client, Visit, VisitType, VisitResult, Reminder } from '../types.ts';
import { 
  ArrowLeft, 
  Phone, 
  MapPin, 
  Mail, 
  Calendar, 
  History, 
  Plus, 
  ExternalLink, 
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado para el modal de visita rápida
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 16),
    type: 'Seguimiento' as VisitType,
    result: 'Pendiente' as VisitResult,
    notes: '',
    followUpDate: ''
  });

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const clientData = await storage.getClientById(id);
      const visitsData = await storage.getVisitsByClientId(id);
      setClient(clientData);
      setVisits(visitsData);
    } catch (error) {
      console.error("Error fetching client detail:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSaveVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      const newVisit: Partial<Visit> = {
        clientId: id,
        date: new Date(formData.date).toISOString(),
        type: formData.type,
        result: formData.result,
        notes: formData.notes,
        followUpDate: formData.followUpDate ? new Date(formData.followUpDate).toISOString() : undefined
      };

      await storage.saveVisit(newVisit);

      if (formData.followUpDate) {
        await storage.saveReminder({
          clientId: id,
          title: `Seguimiento tras ${formData.type}`,
          date: new Date(formData.followUpDate).toISOString(),
          completed: false
        });
      }

      await fetchData();
      setIsModalOpen(false);
      setFormData({ 
        date: new Date().toISOString().slice(0, 16),
        type: 'Seguimiento', 
        result: 'Pendiente', 
        notes: '', 
        followUpDate: '' 
      });
    } catch (error) {
      alert("Error al registrar visita.");
    }
  };

  if (loading) {
    return <div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  if (!client) {
    return (
      <div className="text-center py-20">
        <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
        <h2 className="text-xl font-bold">Cliente no encontrado</h2>
        <button onClick={() => navigate('/clientes')} className="mt-4 text-blue-600 font-bold">Volver a la lista</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate('/clientes')} className="p-2 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-gray-200">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{client.name}</h2>
          <p className="text-slate-500 font-medium">{client.city}</p>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Ficha de Información */}
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Información de Contacto</h3>
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Phone size={18} /></div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Teléfono</p>
                  <a href={`tel:${client.phone}`} className="font-bold text-slate-800 hover:text-blue-600 transition-colors">{client.phone || 'No disponible'}</a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><MessageCircle size={18} /></div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">WhatsApp</p>
                  <a href={`https://wa.me/${client.phone?.replace(/\s/g, '')}`} target="_blank" className="font-bold text-slate-800 hover:text-green-600 transition-colors">Enviar mensaje</a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center"><Mail size={18} /></div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Email</p>
                  <a href={`mailto:${client.email}`} className="font-bold text-slate-800 truncate block max-w-[180px] hover:text-blue-600">{client.email || 'No disponible'}</a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center"><MapPin size={18} /></div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Ubicación</p>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(client.address + ' ' + client.city)}`} target="_blank" className="font-bold text-slate-800 hover:text-blue-600 flex items-center gap-1">
                    Ver en Mapas <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Notas Técnicas</h3>
            <p className="text-sm text-slate-300 italic leading-relaxed">
              {client.notes ? `"${client.notes}"` : 'Sin notas registradas aún.'}
            </p>
          </section>
        </div>

        {/* Historial de Actividad */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <History size={20} className="text-blue-600" />
              Historial de Gestiones
            </h3>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200"
            >
              <Plus size={18} />
              Reportar Visita
            </button>
          </div>

          <div className="space-y-4">
            {visits.length > 0 ? visits.map((visit, index) => (
              <div key={visit.id} className="relative pl-8 pb-4">
                {/* Línea del timeline */}
                {index !== visits.length - 1 && <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gray-100"></div>}
                
                <div className="absolute left-0 top-1.5 w-[24px] h-[24px] bg-white border-2 border-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-blue-100 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{visit.type}</span>
                      <h4 className={`text-sm font-bold mt-1 ${
                        visit.result === 'Vendido' ? 'text-blue-700' : 
                        visit.result === 'Interesado' ? 'text-green-700' : 'text-slate-700'
                      }`}>
                        Resultado: {visit.result}
                      </h4>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-800">{new Date(visit.date).toLocaleDateString()}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(visit.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border-l-4 border-slate-200">
                    {visit.notes || 'Sin descripción detallada.'}
                  </p>
                  {visit.followUpDate && (
                    <div className="mt-3 flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 w-fit px-3 py-1.5 rounded-lg border border-amber-100">
                      <Calendar size={12} /> Próximo seguimiento: {new Date(visit.followUpDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-gray-200">
                <Clock size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-400 italic">No hay visitas registradas para este taller.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Visita Rápida */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10">
            <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Reportar para {client.name}</h3>
                <p className="text-blue-100 text-xs">Añadir historial a la ficha</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-white text-2xl font-light">&times;</button>
            </div>
            
            <form onSubmit={handleSaveVisit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Fecha y Hora</label>
                  <input type="datetime-local" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tipo</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as VisitType})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                    <option value="Primera Visita">Primera Visita</option>
                    <option value="Seguimiento">Seguimiento</option>
                    <option value="Postventa">Postventa</option>
                    <option value="Cierre">Cierre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Resultado</label>
                  <select value={formData.result} onChange={e => setFormData({...formData, result: e.target.value as VisitResult})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                    <option value="Pendiente">Pendiente</option>
                    <option value="Interesado">Interesado</option>
                    <option value="No Interesado">No Interesado</option>
                    <option value="Vendido">Vendido</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Descripción de la Gestión</label>
                <textarea rows={3} placeholder="¿Qué se habló? ¿Qué máquinas necesitan?..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <label className="block text-xs font-bold text-blue-600 uppercase mb-3 flex items-center gap-1">
                  <Calendar size={12} /> Programar Seguimiento
                </label>
                <input type="datetime-local" value={formData.followUpDate} onChange={e => setFormData({...formData, followUpDate: e.target.value})} className="w-full p-3 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl outline-none font-semibold" />
              </div>

              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                <CheckCircle2 size={20} />
                Guardar Gestión
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDetail;
