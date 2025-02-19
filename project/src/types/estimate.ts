export interface EstimateItem {
  id: string;
  description: string;
  area: number;
  unitPrice: number;
  quantity: number;
  total: number;
  type: 'labor' | 'material';
  room: string;
  roomArea?: number;
  // Material fields
  materialType?: string;
  brand?: string;
  color?: string;
  // Labor fields
  laborType?: string;
  hourlyRate?: number;
  hours?: number;
}

export interface Estimate {
  id: string;
  clientId: string;
  clientName: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  date: string;
  items: EstimateItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes: string;
  rooms: string[];
  roomDimensions?: {
    [key: string]: {
      length: number;
      width: number;
      sqft: number;
    };
  };
  shareUrl?: string;
  shareToken?: string;
  clientFeedback?: string;
  clientViewedAt?: string;
  clientRespondedAt?: string;
  expiresAt?: string;
}

export interface EstimateShare {
  id: string;
  estimateId: string;
  token: string;
  url: string;
  expiresAt: string;
  viewedAt?: string;
  respondedAt?: string;
  response?: 'approved' | 'rejected';
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}