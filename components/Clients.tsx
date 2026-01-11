
import React, { useState, useEffect } from 'react';
import { storage } from '../storage.ts';
import { Client } from '../types.ts';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Phone, MapPin, ExternalLink, Edit, Trash2, AlertCircle, X, ChevronRight } from 'lucide-react';

const Clients: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    notes: ''
  });

  const fetchClients = async () => {
    try {
      const data = await storage.getClients();
      setClients(data);
    } catch (err: any) {
      console.error("Error fetching clients:", err);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleOpenModal = (e: React.MouseEvent, client?: Client) => {
    e.stopPropagation(); // Evitar navegar a la ficha al querer editar
    setError(null);
    if (client) {
      setEditingClient(client);
      setFormData({ 
        name: client.name || '',
        contactPerson: client.contactPerson || '',
        phone: client.phone || '',
        email: client.email || '',
        address: client.address || '',
        city: client.city || '',
        notes: client.notes || ''
      });
    } else {
      setEditingClient(null);
      setFormData({
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("El nombre del taller es obligatorio");
      return;
    }

    setIsSaving(true);
    setError(null);
    
    try {
      const clientToSave = editingClient ? { ...formData, id: editingClient.id } : formData;
      await storage.saveClient(clientToSave);
      await fetchClients();
      setIsModalOpen(false);
    } catch (err: any) {
      const errorMsg = err.details || err.message || "Error desconocido en la base de datos";
      setError(`No se pudo guardar: ${errorMsg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de eliminar este cliente? Se borrarán también sus visitas.')) {
      try {
        await storage.deleteClient(id);
        await fetchClients();
      } catch (err: any) {
        alert("Error al eliminar: " + (err.message || "Permiso denegado"));
      }
    }
  };

  const getMapsUrl = (address: string, city: string) => {
    if (!address && !city) return null;
    const query = encodeURIComponent(`${address || ''} ${city || ''}`.trim());
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  const filteredClients = clients.filter(c => 
    (c.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (c.contactPerson || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.city || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Cartera de Clientes</h2>
          <p className="text-gray-500">Haz clic en un taller para ver su ficha completa.</p>
        </div>
        <button 
          onClick={(e) => handleOpenModal(e)}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
        >
          <UserPlus size={20} />
          <span>Añadir Cliente</span>
        </button>
      </header>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Buscar taller o ciudad..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.map(client => (
          <div 
            key={client.id} 
            onClick={() => navigate(`/clientes/${client.id}`)}
            className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer relative group overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight size={20} className="text-blue-500" />
            </div>
            
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-lg uppercase">
                {client.name?.charAt(0) || '?'}
              </div>
              <div className="flex gap-1">
                <button onClick={(e) => handleOpenModal(e, client)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                <button onClick={(e) => handleDelete(e, client.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
              </div>
            </div>
            
            <h4 className="font-bold text-lg mb-1 leading-tight group-hover:text-blue-600 transition-colors">{client.name}</h4>
            <p className="text-blue-600 font-medium text-sm mb-4">{client.contactPerson || 'Sin contacto'}</p>
            
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-gray-400" />
                <span className="font-medium">{client.phone || 'No disponible'}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-gray-400 mt-1 flex-shrink-0" />
                <span className="leading-tight">{client.address}{client.address && client.city ? ', ' : ''}{client.city}</span>
              </div>
            </div>
          </div>
        ))}
        {filteredClients.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 italic bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            {clients.length === 0 ? 'Todavía no has añadido ningún cliente.' : 'No se han encontrado clientes con esa búsqueda.'}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">{editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 text-sm font-semibold border border-red-100">
                  <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                  <span className="flex-1">{error}</span>
                </div>
              )}
              
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Nombre del Taller *</label>
                <input required placeholder="Ej: Talleres Mecánicos García" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Contacto</label>
                  <input placeholder="Persona de contacto" value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Teléfono</label>
                  <input type="tel" placeholder="600 000 000" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email Corporativo</label>
                <input type="email" placeholder="taller@ejemplo.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Dirección</label>
                <input placeholder="Calle, número, polígono..." value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Ciudad / Provincia</label>
                <input placeholder="Ej: Madrid" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Notas Comerciales</label>
                <textarea rows={3} placeholder="Detalles sobre maquinaria..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
              </div>

              <button type="submit" disabled={isSaving} className="w-full py-5 bg-blue-600 text-white rounded-[1.25rem] font-bold text-lg shadow-xl shadow-blue-100 active:scale-[0.98] transition-all disabled:opacity-50 mt-2">
                {isSaving ? 'Guardando...' : (editingClient ? 'Actualizar' : 'Registrar Cliente')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
