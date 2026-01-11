
import React, { useState, useEffect } from 'react';
import { storage } from '../storage.ts';
import { Client, Visit, VisitType, VisitResult, Reminder } from '../types.ts';
import { Plus, History, Calendar, CheckCircle2, MoreVertical, Search, ClipboardList, Clock } from 'lucide-react';

const Visits: React.FC = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const getNowForInput = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    clientId: '',
    date: getNowForInput(),
    type: 'Seguimiento' as VisitType,
    result: 'Pendiente' as VisitResult,
    notes: '',
    followUpDate: ''
  });

  const fetchData = async () => {
    try {
      const [visitsData, clientsData] = await Promise.all([
        storage.getVisits(),
        storage.getClients()
      ]);
      setVisits(visitsData);
      setClients(clientsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) return alert('Selecciona un cliente');

    try {
      const visitDate = new Date(formData.date).toISOString();

      const newVisit: Partial<Visit> = {
        clientId: formData.clientId,
        date: visitDate,
        type: formData.type,
        result: formData.result,
        notes: formData.notes,
        followUpDate: formData.followUpDate ? new Date(formData.followUpDate).toISOString() : undefined
      };

      await storage.saveVisit(newVisit);

      if (formData.followUpDate) {
        const newReminder: Partial<Reminder> = {
          clientId: formData.clientId,
          title: `Seguimiento tras ${formData.type}`,
          date: new Date(formData.followUpDate).toISOString(),
          completed: false
        };
        await storage.saveReminder(newReminder);
      }

      await fetchData();
      setIsModalOpen(false);
      setFormData({ 
        clientId: '', 
        date: getNowForInput(),
        type: 'Seguimiento', 
        result: 'Pendiente', 
        notes: '', 
        followUpDate: '' 
      });
    } catch (error) {
      console.error("Error saving visit/reminder:", error);
      alert("Error al registrar la visita.");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Registro de Visitas</h2>
          <p className="text-gray-500">Historial de gestiones comerciales.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors"
        >
          <ClipboardList size={20} />
          <span>Reportar Visita</span>
        </button>
      </header>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Fecha y Hora</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Resultado</th>
                <th className="px-6 py-4">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visits.length > 0 ? visits.map(visit => {
                const client = clients.find(c => c.id === visit.clientId);
                const vDate = new Date(visit.date);
                return (
                  <tr key={visit.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-blue-500" />
                        <span className="font-semibold text-sm">{vDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock size={12} className="text-gray-400" />
                        <span className="text-[10px] text-gray-400 font-bold uppercase">
                          {vDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-sm text-gray-900">{client?.name || '---'}</p>
                      <p className="text-xs text-blue-600">{client?.city}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded-md text-gray-600">{visit.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tight ${
                        visit.result === 'Interesado' ? 'bg-green-100 text-green-700' :
                        visit.result === 'Vendido' ? 'bg-blue-100 text-blue-700' :
                        visit.result === 'No Interesado' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {visit.result}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-500 line-clamp-1 max-w-[200px]">{visit.notes || '-'}</p>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-gray-400 italic">No hay visitas registradas aún.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
            <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Nuevo Reporte</h3>
                <p className="text-blue-100 text-xs">Registro con calendario y hora</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-white hover:opacity-70 text-2xl font-light">&times;</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Cliente Visitado</label>
                  <select 
                    required 
                    value={formData.clientId} 
                    onChange={e => setFormData({...formData, clientId: e.target.value})}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none"
                  >
                    <option value="">Selecciona un taller...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.city})</option>)}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Fecha y Hora</label>
                  <input 
                    type="datetime-local"
                    required
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tipo</label>
                  <select 
                    value={formData.type} 
                    onChange={e => setFormData({...formData, type: e.target.value as VisitType})}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none appearance-none"
                  >
                    <option value="Primera Visita">Primera Visita</option>
                    <option value="Seguimiento">Seguimiento</option>
                    <option value="Postventa">Postventa</option>
                    <option value="Cierre">Cierre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Resultado</label>
                  <select 
                    value={formData.result} 
                    onChange={e => setFormData({...formData, result: e.target.value as VisitResult})}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none appearance-none"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Interesado">Interesado</option>
                    <option value="No Interesado">No Interesado</option>
                    <option value="Vendido">Vendido</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Notas Rápidas</label>
                <textarea 
                  rows={2}
                  placeholder="Observaciones de la visita..."
                  value={formData.notes} 
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <label className="block text-xs font-bold text-blue-600 uppercase mb-3 flex items-center gap-1">
                  <Calendar size={12} /> Programar Seguimiento
                </label>
                <input 
                  type="datetime-local" 
                  value={formData.followUpDate} 
                  onChange={e => setFormData({...formData, followUpDate: e.target.value})}
                  className="w-full p-3 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 hover:bg-blue-700">
                <CheckCircle2 size={20} />
                Guardar Visita
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Visits;
