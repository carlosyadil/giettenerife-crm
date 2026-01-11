
export type VisitType = 'Primera Visita' | 'Seguimiento' | 'Postventa' | 'Cierre';
export type VisitResult = 'Interesado' | 'No Interesado' | 'Pendiente' | 'Vendido';

export interface Client {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes: string;
  createdAt: string;
}

export interface Visit {
  id: string;
  clientId: string;
  date: string;
  type: VisitType;
  result: VisitResult;
  notes: string;
  followUpDate?: string;
}

export interface Reminder {
  id: string;
  clientId: string;
  title: string;
  date: string;
  completed: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
}
