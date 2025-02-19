import { EstimateItem } from '../types/estimate';

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
  // Initialize empty arrays for items
  const materialItems: EstimateItem[] = [];
  const laborItems: EstimateItem[] = [];

  // If rooms are provided, calculate based on room dimensions
  if (rooms && rooms.length > 0) {
    for (const room of rooms) {
      const sqft = dimensions[room]?.sqft || 0;
      const materialTotal = Math.round(sqft * config.materialPrice * 100) / 100;
      const laborTotal = Math.round(sqft * config.installRate * 100) / 100;
      const hours = Math.ceil(sqft / 100); // Estimate 1 hour per 100 sqft

      // Add material item
      materialItems.push({
        id: Date.now().toString() + Math.random(),
        description: `${materialType} Hardwood Flooring - ${room}`,
        area: sqft,
        unitPrice: config.materialPrice,
        quantity: sqft,
        total: materialTotal,
        type: 'material',
        materialType,
        brand: `Premium ${materialGrade}`,
        room
      });

      // Add labor item
      laborItems.push({
        id: Date.now().toString() + Math.random(),
        description: `Professional Installation - ${room}`,
        area: sqft,
        unitPrice: config.installRate,
        quantity: sqft,
        total: laborTotal,
        type: 'labor',
        laborType: 'Installation',
        hourlyRate: config.installRate,
        hours: hours,
        room
      });
    }
  }

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
  // If no rooms are provided, estimate is still valid
  if (!rooms || rooms.length === 0) {
    return { isValid: true };
  }

  // If rooms are provided, validate their dimensions
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