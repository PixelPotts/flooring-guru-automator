import { EstimateItem } from '../../types/estimate';

interface RoomDimension {
  length: number;
  width: number;
  sqft: number;
}

interface PricingConfig {
  materialPrice: number;
  installRate: number;
  taxRate: number;
}

interface AIRecommendation {
  materials: {
    priceAdjustment: number;
  };
  labor: {
    rateAdjustment: number;
  };
}

export const calculateEstimateItems = (
  rooms: string[],
  dimensions: Record<string, RoomDimension>,
  config: PricingConfig,
  materialType: string,
  materialGrade: string,
  aiRecommendation?: AIRecommendation
): {
  items: EstimateItem[];
  subtotal: number;
  tax: number;
  total: number;
} => {
  if (!rooms || rooms.length === 0) {
    return { items: [], subtotal: 0, tax: 0, total: 0 };
  }

  // Apply AI recommendations if available
  const adjustedConfig = aiRecommendation ? {
    materialPrice: config.materialPrice * (1 + (aiRecommendation.materials.priceAdjustment || 0)),
    installRate: config.installRate * (1 + (aiRecommendation.labor.rateAdjustment || 0)),
    taxRate: config.taxRate
  } : config;

  // Create material items
  const materialItems: EstimateItem[] = rooms.map(room => {
    const sqft = dimensions[room]?.sqft || 0;
    const total = Math.round(sqft * adjustedConfig.materialPrice * 100) / 100;
    
    return {
      id: Date.now().toString() + Math.random(),
      description: `${materialType} Hardwood Flooring - ${room}`,
      area: sqft,
      unitPrice: adjustedConfig.materialPrice,
      quantity: sqft,
      total: total,
      type: 'material',
      materialType,
      brand: `Premium ${materialGrade}`,
      room
    };
  });

  // Create labor items
  const laborItems: EstimateItem[] = rooms.map(room => {
    const sqft = dimensions[room]?.sqft || 0;
    const total = Math.round(sqft * adjustedConfig.installRate * 100) / 100;
    const hours = Math.ceil(sqft / 100); // Estimate 1 hour per 100 sqft

    return {
      id: Date.now().toString() + Math.random(),
      description: `Professional Installation - ${room}`,
      area: sqft,
      unitPrice: adjustedConfig.installRate,
      quantity: sqft,
      total: total,
      type: 'labor',
      laborType: 'Installation',
      hourlyRate: adjustedConfig.installRate,
      hours: hours,
      room
    };
  });

  const allItems = [...materialItems, ...laborItems];
  const subtotal = Math.round(allItems.reduce((sum, item) => sum + item.total, 0) * 100) / 100;
  const tax = Math.round(subtotal * config.taxRate * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  return {
    items: allItems,
    subtotal,
    tax,
    total
  };
};

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateEstimate = (
  rooms: string[],
  dimensions: Record<string, RoomDimension>
): ValidationResult => {
  if (!Array.isArray(rooms) || rooms.length === 0) {
    return { isValid: false, error: 'Please add at least one room' };
  }

  for (const room of rooms) {
    const dims = dimensions[room];
    if (!dims) {
      return {
        isValid: false,
        error: `Please add dimensions for ${room}`
      };
    }

    if (typeof dims.length !== 'number' || dims.length <= 0) {
      return {
        isValid: false,
        error: `Please enter a valid length for ${room}`
      };
    }

    if (typeof dims.width !== 'number' || dims.width <= 0) {
      return {
        isValid: false,
        error: `Please enter a valid width for ${room}`
      };
    }

    // Validate reasonable dimensions
    if (dims.length > 200 || dims.width > 200) {
      return {
        isValid: false,
        error: `Room dimensions for ${room} seem unusually large (max 200ft). Please verify.`
      };
    }
  }

  return { isValid: true };
};