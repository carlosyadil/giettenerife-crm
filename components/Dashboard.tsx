
import React, { useState, useEffect } from 'react';
import { storage } from '../storage.ts';
import { Client, Visit, Reminder } from '../types.ts';
import { 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  CalendarDays,
  ChevronRight,
  Plus,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsData, visitsData, remindersData] = await Promise.all([
          storage.getClients(),
          storage.getVisits(),
          storage.getReminders()
        ]);
        setClients(clientsData);
        setVisits(visitsData);
        setReminders(remindersData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    };
    fetchData();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const visitsToday = visits.filter(v => v.date.startsWith(todayStr));
  const pendingReminders = reminders.filter(r => !r.completed);
  const activeClients = clients.length;
  
  const interestedCount = visits.filter(v => v.result === 'Interesado').length;

  const stats = [
    { label: 'Clientes', value: activeClients, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Visitas Hoy', value: visitsToday.length, icon: CalendarDays, color: 'bg-green-100 text-green-600' },
    { label: 'Pendientes', value: pendingReminders.length, icon: AlertCircle, color: 'bg-orange-100 text-orange-600' },
    { label: 'Oportunidades', value: interestedCount, icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hola de nuevo</h2>
          <p className="text-gray-500">Resumen de tu actividad comercial.</p>
        </div>
        <Link 
          to="/visitas" 
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-transform active:scale-95 flex items-center gap-2 md:px-5 md:rounded-xl"
        >
          <Plus size={24} />
          <span className="hidden md:inline font-semibold">Nueva Visita</span>
        </Link>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon size={20} />
            </div>
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Próximos Seguimientos</h3>
            <Link to="/agenda" className="text-blue-600 text-sm font-semibold hover:underline">Ver agenda</Link>
          </div>
          
          <div className="space-y-4">
            {pendingReminders.length > 0 ? pendingReminders.slice(0, 4).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(reminder => {
              const client = clients.find(c => c.id === reminder.clientId);
              const rDate = new Date(reminder.date);
              return (
                <div key={reminder.id} className="flex items-start gap-4 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex-shrink-0 flex items-center justify-center">
                    <CalendarDays size={18} className="text-blue-500" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-semibold text-sm leading-tight truncate">{client?.name || 'Cliente Desconocido'}</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                       <Clock size={10} /> {rDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{rDate.toLocaleDateString()}</p>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-10 text-gray-400">
                <CheckCircle2 size={40} className="mx-auto mb-2 opacity-20" />
                <p>No tienes tareas pendientes</p>
              </div>
            )}
          </div>
        </section>

        <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-6">Actividad Reciente</h3>
          <div className="space-y-6">
            {visits.length > 0 ? visits.slice(0, 5).map(visit => {
              const client = clients.find(c => c.id === visit.clientId);
              const vDate = new Date(visit.date);
              return (
                <div key={visit.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-10 rounded-full ${
                      visit.result === 'Interesado' ? 'bg-green-500' : 
                      visit.result === 'Vendido' ? 'bg-blue-500' : 'bg-gray-300'
                    }`} />
                    <div>
                      <p className="font-semibold text-sm">{client?.name}</p>
                      <p className="text-xs text-gray-500">
                        {visit.type} - <span className="font-bold">{vDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-300" />
                </div>
              );
            }) : (
              <p className="text-center py-10 text-gray-400">Sin visitas registradas aún.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
