export interface MaterialLineItem {
  id: string;
  name: string;
  description: string;
  material_type: string;
  brand: string;
  default_unit_price: number;
  unit: 'sqft' | 'piece' | 'box' | 'roll' | 'linear_ft' | 'yard' | 'meter';
  category: string;
  image?: string;
}

export interface LaborLineItem {
  id: string;
  name: string;
  description: string;
  labor_type: string;
  default_hourly_rate: number;
  estimated_hours: number;
  category: string;
  unit: 'hour' | 'day' | 'project' | 'sqft';
  image?: string;
}