import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Wrench, DollarSign } from 'lucide-react';
import type { DamageAnalysis } from '../../types/damage';

interface DamageReportProps {
  analysis: DamageAnalysis;
}

const DamageReport: React.FC<DamageReportProps> = ({ analysis }) => {
  const getSeverityColor = (severity: number) => {
    if (severity < 0.3) return 'text-green-500';
    if (severity < 0.7) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSeverityText = (severity: number) => {
    if (severity < 0.3) return 'Low';
    if (severity < 0.7) return 'Medium';
    return 'High';
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
      >
        <div className="flex items-center mb-4">
          <AlertTriangle className={`h-6 w-6 mr-2 ${getSeverityColor(analysis.severity)}`} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Damage Assessment
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Severity</span>
              <span className={`font-medium ${getSeverityColor(analysis.severity)}`}>
                {getSeverityText(analysis.severity)}
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
              <div
                className={`h-full rounded-full ${
                  analysis.severity < 0.3
                    ? 'bg-green-500'
                    : analysis.severity < 0.7
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${analysis.severity * 100}%` }}
              />
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Detected Issues
            </h4>
            <ul className="space-y-2">
              {analysis.issues.map((issue, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start"
                >
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                  <span className="text-gray-600 dark:text-gray-400">{issue}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
      >
        <div className="flex items-center mb-4">
          <Wrench className="h-6 w-6 text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recommended Actions
          </h3>
        </div>

        <ul className="space-y-3">
          {analysis.recommendations.map((recommendation, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-start"
            >
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mr-3">
                {index + 1}
              </span>
              <span className="text-gray-600 dark:text-gray-400">{recommendation}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
      >
        <div className="flex items-center mb-4">
          <DollarSign className="h-6 w-6 text-green-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Cost Estimate
          </h3>
        </div>

        <div className="space-y-3">
          {analysis.costs.map((cost, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex justify-between items-center"
            >
              <span className="text-gray-600 dark:text-gray-400">{cost.item}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ${cost.amount.toLocaleString()}
              </span>
            </motion.div>
          ))}
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center font-medium">
              <span className="text-gray-900 dark:text-white">Total Estimate</span>
              <span className="text-green-600 dark:text-green-400">
                ${analysis.costs.reduce((sum, cost) => sum + cost.amount, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DamageReport;