export const pricingTiers = {
  basic: {
    name: 'Basic',
    color: 'blue',
    description: 'Quality hardwood flooring essentials',
    features: [
      'Select Red Oak or White Oak',
      'Standard finish options',
      'Basic installation ($3.50/sqft)',
      'Standard warranty',
      '1-year finish guarantee'
    ],
    priceRange: '$8-10/sqft',
    materialGrade: '#1 Common',
    installRate: 3.50,
    trimRate: 4.50
  },
  premium: {
    name: 'Premium',
    color: 'purple', 
    description: 'Enhanced quality and customization',
    features: [
      'Premium Oak, Maple, or Hickory',
      'Custom stain options',
      'Professional installation ($4.50/sqft)',
      'Extended warranty',
      '3-year finish guarantee',
      'Free maintenance kit'
    ],
    priceRange: '$11-13/sqft',
    materialGrade: 'Select',
    installRate: 4.50,
    trimRate: 5.50
  },
  elite: {
    name: 'Elite',
    color: 'amber',
    description: 'Luxury materials and premium service',
    features: [
      'Exotic hardwoods available',
      'Custom patterns and inlays',
      'White glove installation ($5.50/sqft)',
      'Lifetime warranty',
      '5-year finish guarantee',
      'Annual maintenance service',
      'Priority support'
    ],
    priceRange: '$14-18/sqft',
    materialGrade: 'Clear',
    installRate: 5.50,
    trimRate: 6.50
  }
};

export const hardwoodSpecies = [
  { 
    name: 'White Oak',
    priceRange: { basic: 8, premium: 11, elite: 14 }
  },
  {
    name: 'Red Oak',
    priceRange: { basic: 7.5, premium: 10.5, elite: 13.5 }
  },
  {
    name: 'Maple',
    priceRange: { basic: 8.5, premium: 11.5, elite: 14.5 }
  },
  {
    name: 'Hickory',
    priceRange: { basic: 9, premium: 12, elite: 15 }
  },
  {
    name: 'Walnut',
    priceRange: { basic: 10, premium: 13, elite: 16 }
  }
];