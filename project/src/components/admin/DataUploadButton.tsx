import React, { useState } from 'react';
import { supabase } from '../../config/firebase';
import { Loader } from 'lucide-react';

const sampleData = {
  clients: [
    {
      name: 'Sarah Johnson',
      company: 'Modern Living Spaces',
      email: 'sarah@modernliving.com',
      phone: '(555) 123-4567',
      address: '123 Main St, Suite 100, Boston, MA 02108',
      type: 'Commercial',
      status: 'Active',
      totalProjects: 3,
      totalRevenue: 24500,
    },
    {
      name: 'Mike Williams',
      company: 'Coastal Homes',
      email: 'mike@coastalhomes.com',
      phone: '(555) 234-5678',
      address: '456 Ocean Ave, Miami, FL 33139',
      type: 'Residential',
      status: 'Active',
      totalProjects: 2,
      totalRevenue: 18500,
    }
  ],
  materials: [
    {
      name: 'Premium Oak Hardwood',
      description: 'High-quality oak flooring with natural finish',
      materialType: 'Hardwood',
      brand: 'Premium Woods',
      defaultUnitPrice: 8.99,
      unit: 'sqft',
      category: 'Hardwood'
    },
    {
      name: 'Luxury Vinyl Planks',
      description: 'Waterproof luxury vinyl with wood-look finish',
      materialType: 'Vinyl',
      brand: 'LuxuryVinyl',
      defaultUnitPrice: 4.99,
      unit: 'sqft',
      category: 'Vinyl'
    }
  ],
  labor: [
    {
      name: 'Basic Installation',
      description: 'Standard flooring installation service',
      laborType: 'Installation',
      defaultHourlyRate: 65,
      estimatedHours: 8,
      category: 'Installation',
      unit: 'hour'
    },
    {
      name: 'Floor Preparation',
      description: 'Subfloor leveling and repair',
      laborType: 'Preparation',
      defaultHourlyRate: 55,
      estimatedHours: 4,
      category: 'Preparation',
      unit: 'hour'
    }
  ]
};

const DataUploadButton: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const uploadSampleData = async () => {
    setIsUploading(true);
    setStatus('idle');

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No authenticated user');

      // Call Supabase RPC function to handle sample data upload
      const { error } = await supabase.rpc('upload_sample_data', {
        sample_data: {
          clients: sampleData.clients,
          materials: sampleData.materials,
          labor: sampleData.labor,
          created_by: user.id
        }
      });

      if (error) throw error;

      setStatus('success');
      console.log('Sample data uploaded successfully');
    } catch (error) {
      console.error('Error uploading sample data:', error);
      setStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4">
      <button
        onClick={uploadSampleData}
        disabled={isUploading}
        className={`px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 ${
          status === 'success'
            ? 'bg-green-500 text-white'
            : status === 'error'
            ? 'bg-red-500 text-white'
            : 'bg-blue-500 text-white'
        } hover:opacity-90 transition-opacity disabled:opacity-50`}
      >
        {isUploading ? (
          <Loader className="animate-spin h-5 w-5" />
        ) : (
          <span>Upload Sample Data</span>
        )}
      </button>
    </div>
  );
};

export default DataUploadButton;