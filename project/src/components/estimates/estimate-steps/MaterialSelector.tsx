import React, { useState } from 'react';
import PricingTierSelector from '../PricingTierSelector';
import { pricingTiers, hardwoodSpecies } from '../../../config/pricing';
import { calculateEstimateItems } from '../../../utils/estimateCalculator';

interface MaterialSelectorProps {
  formData: any;
  onUpdate: (data: any) => void;
  onBack: () => void;
  onNext: () => void;
}

const MaterialSelector: React.FC<MaterialSelectorProps> = ({
  formData,
  onUpdate,
  onBack,
  onNext
}) => {
  const [selectedTier, setSelectedTier] = useState<'basic' | 'premium' | 'elite'>('premium');
  const [selectedSpecies, setSelectedSpecies] = useState('White Oak');

  const handleTierSelect = (tier: 'basic' | 'premium' | 'elite') => {
    setSelectedTier(tier);
    // Update pricing based on tier selection
    const species = hardwoodSpecies.find(s => s.name === selectedSpecies);
    if (species) {
      const materialPrice = species.priceRange[tier];
      const installRate = pricingTiers[tier].installRate;
      
      const calculatedEstimate = calculateEstimateItems(
        formData.rooms,
        formData.roomDimensions,
        {
          materialPrice,
          installRate,
          taxRate: 0.08
        },
        selectedSpecies,
        pricingTiers[tier].materialGrade
      );
      
      onUpdate({
        ...formData,
        ...calculatedEstimate
      });
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Select Package Tier
      </h3>
      
      <PricingTierSelector
        selectedTier={selectedTier}
        onTierSelect={handleTierSelect}
        pricingTiers={pricingTiers}
      />

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Wood Species
        </label>
        <select
          value={selectedSpecies}
          onChange={(e) => {
            setSelectedSpecies(e.target.value);
            handleTierSelect(selectedTier);
          }}
          className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {hardwoodSpecies.map(species => (
            <option key={species.name} value={species.name}>
              {species.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="mt-4 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Next: Review Estimate
        </button>
      </div>
    </div>
  );
};

export default MaterialSelector;