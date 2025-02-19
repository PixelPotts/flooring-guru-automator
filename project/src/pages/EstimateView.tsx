import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, MessageSquare, Loader } from 'lucide-react';
import { Estimate } from '../types/estimate';
import { supabase } from '../lib/supabase';

const EstimateView: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<'approved' | 'rejected' | null>(null);

  useEffect(() => {
    if (!token) return;

    const loadEstimate = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get estimate by share token
        const { data, error } = await supabase
          .from('estimates')
          .select('*')
          .eq('share_token', token)
          .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error('Estimate not found');

        // Record view if not already viewed
        if (!data.client_viewed_at) {
          await supabase.rpc('record_estimate_view', { share_token: token });
        }

        setEstimate(data);
      } catch (err) {
        console.error('Error loading estimate:', err);
        setError(err instanceof Error ? err.message : 'Failed to load estimate');
      } finally {
        setLoading(false);
      }
    };

    loadEstimate();
  }, [token]);

  const handleSubmitResponse = async () => {
    if (!token || !response || !estimate) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.rpc('submit_estimate_response', {
        share_token: token,
        response_status: response,
        response_feedback: feedback
      });

      if (error) throw error;

      setEstimate(prev => prev ? {
        ...prev,
        status: response,
        clientFeedback: feedback,
        clientRespondedAt: new Date().toISOString()
      } : null);
    } catch (err) {
      console.error('Error submitting response:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit response');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !estimate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {error || 'Estimate not found'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            This link may have expired or is invalid.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
        >
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Estimate for {estimate.clientName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Created on {new Date(estimate.date).toLocaleDateString()}
            </p>
          </div>

          {/* Estimate details */}
          <div className="space-y-6 mb-8">
            {/* Items */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Items
              </h2>
              <div className="space-y-3">
                {estimate.items.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {item.description}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.quantity} × ${item.unitPrice.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        ${item.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>${estimate.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax</span>
                  <span>${estimate.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>${estimate.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {estimate.notes && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Notes
                </h2>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                  {estimate.notes}
                </p>
              </div>
            )}
          </div>

          {/* Response section */}
          {!estimate.clientRespondedAt && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Your Response
              </h2>
              
              <div className="space-y-6">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setResponse('approved')}
                    className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                      response === 'approved'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <CheckCircle className={`h-8 w-8 mx-auto mb-2 ${
                      response === 'approved'
                        ? 'text-green-500'
                        : 'text-gray-400'
                    }`} />
                    <span className={`block text-center font-medium ${
                      response === 'approved'
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      Approve
                    </span>
                  </button>

                  <button
                    onClick={() => setResponse('rejected')}
                    className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                      response === 'rejected'
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <XCircle className={`h-8 w-8 mx-auto mb-2 ${
                      response === 'rejected'
                        ? 'text-red-500'
                        : 'text-gray-400'
                    }`} />
                    <span className={`block text-center font-medium ${
                      response === 'rejected'
                        ? 'text-red-700 dark:text-red-300'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      Decline
                    </span>
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Feedback (Optional)
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Add any comments or questions..."
                      className="w-full pl-10 p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                    />
                  </div>
                </div>

                <button
                  onClick={handleSubmitResponse}
                  disabled={!response || isSubmitting}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="animate-spin h-5 w-5 mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Response'
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default EstimateView;