
import React, { useState, useEffect } from 'react';
import { storage } from '../storage.ts';
import { Reminder, Client } from '../types.ts';
import { useNavigate } from 'react-router-dom';
// Add History to imports to avoid conflict with global window.History
import { CheckCircle2, Circle, Calendar, Clock, MapPin, Trash2, ChevronRight, User, History } from 'lucide-react';

const Agenda: React.FC = () => {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

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
      <header>
        <h2 className="text-2xl font-bold">Agenda de Seguimiento</h2>
        <p className="text-gray-500">Haz clic en una tarea para ir a la ficha del cliente.</p>
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
    </div>
  );
};

export default Agenda;
