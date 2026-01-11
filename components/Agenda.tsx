
import React, { useState, useEffect } from 'react';
import { storage } from '../storage.ts';
import { Reminder, Client } from '../types.ts';
import { CheckCircle2, Circle, Calendar, Clock, MapPin, Trash2 } from 'lucide-react';

const Agenda: React.FC = () => {
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

  const toggleComplete = async (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;
    try {
      await storage.updateReminder(id, { completed: !reminder.completed });
      await fetchData();
    } catch (error) {
      console.error("Error updating reminder:", error);
    }
  };

  const deleteReminder = async (id: string) => {
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
    
    return (
      <div className={`p-4 bg-white rounded-2xl border ${reminder.completed ? 'opacity-60 grayscale border-gray-100' : 'border-gray-200 shadow-sm'} flex items-start gap-4 transition-all hover:border-blue-200`}>
        <button onClick={() => toggleComplete(reminder.id)} className="mt-1 flex-shrink-0">
          {reminder.completed ? <CheckCircle2 className="text-green-500" size={24} /> : <Circle className="text-gray-300" size={24} />}
        </button>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h4 className={`font-bold text-gray-900 leading-tight ${reminder.completed ? 'line-through' : ''}`}>{client?.name || 'Cliente'}</h4>
            <div className="text-right flex-shrink-0">
               <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase block">{dateObj.toLocaleDateString()}</span>
               <span className="text-[10px] font-bold text-gray-400 mt-1 block tracking-wider">{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">{reminder.title}</p>
          <div className="flex items-center gap-3 mt-3 text-[11px] text-gray-400 font-medium">
            <div className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full">
              <MapPin size={10} /> {client?.city}
            </div>
            <div className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full">
              <Clock size={10} /> {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
        <button onClick={() => deleteReminder(reminder.id)} className="text-gray-300 hover:text-red-500 transition-colors self-center p-2">
          <Trash2 size={18} />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h2 className="text-2xl font-bold">Agenda Comercial</h2>
        <p className="text-gray-500">Gestión de próximos seguimientos.</p>
      </header>

      <div className="grid lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="text-blue-600" size={20} />
            <h3 className="font-bold text-lg">Próximas Tareas ({upcoming.length})</h3>
          </div>
          {upcoming.length > 0 ? (
            <div className="space-y-3">
              {upcoming.map(r => <ReminderItem key={r.id} reminder={r} />)}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
              No hay tareas próximas.
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="text-green-600" size={20} />
            <h3 className="font-bold text-lg">Historial Completado</h3>
          </div>
          {completed.length > 0 ? (
            <div className="space-y-3">
              {completed.map(r => <ReminderItem key={r.id} reminder={r} />)}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400">Sin tareas completadas recientemente.</div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Agenda;
