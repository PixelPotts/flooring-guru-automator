import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Crown } from 'lucide-react';

export interface PricingTier {
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  features: string[];
  priceRange: string;
  materialGrade: string;
  installRate: number;
  trimRate: number;
}

interface PricingTierSelectorProps {
  selectedTier: 'basic' | 'premium' | 'elite';
  onTierSelect: (tier: 'basic' | 'premium' | 'elite') => void;
  pricingTiers: Record<'basic' | 'premium' | 'elite', PricingTier>;
}

const PricingTierSelector: React.FC<PricingTierSelectorProps> = ({
  selectedTier,
  onTierSelect,
  pricingTiers
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {(Object.entries(pricingTiers) as [keyof typeof pricingTiers, PricingTier][]).map(([key, tier]) => (
        <motion.div
          key={key}
          whileHover={{ scale: 1.02 }}
          className={`relative p-6 bg-white dark:bg-gray-800 rounded-lg border-2 cursor-pointer ${
            selectedTier === key
              ? `border-${tier.color}-500 dark:border-${tier.color}-400 shadow-lg`
              : 'border-gray-200 dark:border-gray-700'
          }`}
          onClick={() => onTierSelect(key)}
        >
          {selectedTier === key && (
            <div className={`absolute -top-2 -right-2 p-1 bg-${tier.color}-500 rounded-full`}>
              <Check className="h-4 w-4 text-white" />
            </div>
          )}
          <div className="flex items-center mb-4">
            <div className={`p-2 bg-${tier.color}-100 dark:bg-${tier.color}-900/20 rounded-lg mr-3`}>
              {tier.icon}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {tier.name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tier.priceRange}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {tier.description}
          </p>
          <ul className="space-y-2">
            {tier.features.map((feature, index) => (
              <li key={index} className="flex items-center text-sm">
                <Check className={`h-4 w-4 text-${tier.color}-500 mr-2 flex-shrink-0`} />
                <span className="text-gray-600 dark:text-gray-400">{feature}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      ))}
    </div>
  );
};

export default PricingTierSelector;