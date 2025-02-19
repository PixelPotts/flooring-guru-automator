export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  type: 'Residential' | 'Commercial';
  status: 'Active' | 'Inactive';
  totalProjects: number;
  totalRevenue: number;
  rooms?: Array<{
    name: string;
    length: number;
    width: number;
    sqft: number;
  }>;
  notes?: string;
}