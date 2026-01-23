
import React, { useState, useEffect } from 'react';
import { storage } from '../storage.ts';
import { Reminder, Client } from '../types.ts';
import { useNavigate } from 'react-router-dom';
// Add History to imports to avoid conflict with global window.History
import { CheckCircle2, Circle, Calendar, Clock, MapPin, Trash2, ChevronRight, User, History, Plus, X } from 'lucide-react';

const Agenda: React.FC = () => {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState<Reminder[]>([]);
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
    title: ''
  });

  const fetchData = async () => {
    try {
      const [remindersData, clientsData] = await Promise.all([
        storage.getReminders(),
        storage.getClients()
      ]);
      setReminders(remindersData);
      setClients(clientsData);
    } catch (error) {
      console.error("Error fetching agenda data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleComplete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;
    try {
      await storage.updateReminder(id, { completed: !reminder.completed });
      await fetchData();
    } catch (error) {
      console.error("Error updating reminder:", error);
    }
  };

  const deleteReminder = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('¿Eliminar esta tarea?')) return;
    try {
      await storage.deleteReminder(id);
      await fetchData();
    } catch (error) {
      console.error("Error deleting reminder:", error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) return alert('Selecciona un cliente');
    if (!formData.title) return alert('Indica un motivo');

    try {
      await storage.saveReminder({
        clientId: formData.clientId,
        title: formData.title,
        date: new Date(formData.date).toISOString(),
        completed: false
      });

      await fetchData();
      setIsModalOpen(false);
      setFormData({
        clientId: '',
        date: getNowForInput(),
        title: ''
      });
    } catch (error) {
      console.error("Error saving reminder:", error);
      alert("Error al agendar la visita.");
    }
  };

  const sortedReminders = [...reminders].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const upcoming = sortedReminders.filter(r => !r.completed);
  const completed = sortedReminders.filter(r => r.completed);

  const ReminderItem = ({ reminder }: { reminder: Reminder }) => {
    const client = clients.find(c => c.id === reminder.clientId);
    const dateObj = new Date(reminder.date);
    const isToday = new Date().toDateString() === dateObj.toDateString();
    
    return (
      <div 
        onClick={() => client && navigate(`/clientes/${client.id}`)}
        className={`p-5 bg-white rounded-3xl border transition-all hover:shadow-lg cursor-pointer group ${
          reminder.completed ? 'opacity-50 grayscale border-gray-100' : 
          isToday ? 'border-amber-200 shadow-amber-50 shadow-sm' : 'border-gray-100 shadow-sm'
        } flex items-start gap-4`}
      >
        <button onClick={(e) => toggleComplete(e, reminder.id)} className="mt-1 flex-shrink-0">
          {reminder.completed ? <CheckCircle2 className="text-green-500" size={26} /> : <Circle className="text-gray-300 group-hover:text-blue-400 transition-colors" size={26} />}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h4 className={`font-black text-slate-900 text-lg leading-tight truncate ${reminder.completed ? 'line-through' : ''}`}>
                {client?.name || 'Cliente Desconocido'}
              </h4>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 mt-1">
                <MapPin size={12} />
                <span>{client?.city || 'Sin ciudad'}</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
               <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider block ${
                 isToday ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
               }`}>
                 {isToday ? 'Hoy' : dateObj.toLocaleDateString()}
               </span>
               <span className="text-xs font-bold text-slate-400 mt-1 block">
                 {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </span>
            </div>
          </div>

          <div className="mt-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 relative">
            <p className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
              <User size={14} className="text-slate-400" />
              Motivo: {reminder.title}
            </p>
            <div className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight size={18} />
            </div>
          </div>
        </div>

        <button onClick={(e) => deleteReminder(e, reminder.id)} className="text-gray-200 hover:text-red-500 transition-colors p-2 opacity-0 group-hover:opacity-100">
          <Trash2 size={20} />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Agenda de Seguimiento</h2>
          <p className="text-gray-500">Haz clic en una tarea para ir a la ficha del cliente.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Agendar Visita</span>
        </button>
      </header>

      <div className="grid lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
              <Calendar size={18} />
            </div>
            <h3 className="font-bold text-lg text-slate-800">Próximas Tareas ({upcoming.length})</h3>
          </div>
          {upcoming.length > 0 ? (
            <div className="space-y-4">
              {upcoming.map(r => <ReminderItem key={r.id} reminder={r} />)}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-400 bg-white rounded-[2rem] border border-dashed border-gray-200">
              <CheckCircle2 size={48} className="mx-auto mb-4 opacity-10 text-green-500" />
              <p className="font-medium">¡Todo al día! No tienes tareas pendientes.</p>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
              <History size={18} />
            </div>
            <h3 className="font-bold text-lg text-slate-800">Completadas</h3>
          </div>
          {completed.length > 0 ? (
            <div className="space-y-4">
              {completed.map(r => <ReminderItem key={r.id} reminder={r} />)}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-300 italic">No hay historial reciente.</div>
          )}
        </section>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10">
            <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Agendar Nueva Visita</h3>
                <p className="text-blue-100 text-xs">Programa un seguimiento o reunión</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-white hover:opacity-70 p-1 rounded-full hover:bg-white/10 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Cliente</label>
                <select
                  required
                  value={formData.clientId}
                  onChange={e => setFormData({...formData, clientId: e.target.value})}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none transition-all appearance-none"
                >
                  <option value="">Selecciona un taller...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.city})</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Fecha y Hora</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Motivo / Título</label>
                <input
                  type="text"
                  placeholder="Ej: Visita de cortesía, Demostración..."
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none"
                />
              </div>

              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4">
                <Calendar size={20} /> Confirmar Cita
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;
