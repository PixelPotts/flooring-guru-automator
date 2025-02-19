import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, DollarSign, Users, TrendingUp, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, John</h1>
        <p className="text-gray-600 dark:text-gray-400">Here's what's happening with your business today.</p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[
          { title: 'Active Projects', value: '12', icon: <Briefcase />, trend: '+2.5%', path: '/projects', color: 'blue' },
          { title: 'Total Revenue', value: '$24,500', icon: <DollarSign />, trend: '+15.2%', path: '/analytics', color: 'green' },
          { title: 'New Clients', value: '8', icon: <Users />, trend: '+4.1%', path: '/clients', color: 'purple' },
          { title: 'Conversion Rate', value: '64%', icon: <TrendingUp />, trend: '+2.8%', path: '/analytics', color: 'indigo' },
        ].map((stat, index) => (
          <motion.button
            key={index}
            variants={item}
            onClick={() => navigate(stat.path)}
            whileHover={{ scale: 1.02, translateY: -5 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 bg-${stat.color}-100 dark:bg-${stat.color}-900/30 rounded-xl`}>
                {React.cloneElement(stat.icon as React.ReactElement, {
                  className: `w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`,
                })}
              </div>
              <span className="text-green-500 text-sm font-medium">{stat.trend}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stat.value}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">{stat.title}</p>
          </motion.button>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Projects</h2>
            <button
              onClick={() => navigate('/projects')}
              className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
            >
              View all
            </button>
          </div>
          <div className="space-y-4">
            {[
              { client: 'Modern Living Spaces', date: 'Mar 15', type: 'Hardwood Installation' },
              { client: 'Coastal Homes', date: 'Mar 18', type: 'Tile Flooring' },
              { client: 'Urban Apartments', date: 'Mar 22', type: 'Carpet Installation' },
            ].map((project, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/projects')}
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200"
              >
                <div className="flex items-center space-x-4">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white">{project.client}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{project.type}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">{project.date}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Estimates</h2>
            <button
              onClick={() => navigate('/estimates')}
              className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
            >
              View all
            </button>
          </div>
          <div className="space-y-4">
            {[
              { client: 'Sarah Johnson', amount: '$4,500', status: 'Pending' },
              { client: 'Mike Williams', amount: '$6,800', status: 'Approved' },
              { client: 'Emma Davis', amount: '$3,200', status: 'In Review' },
            ].map((estimate, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/estimates')}
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200"
              >
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">{estimate.client}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{estimate.amount}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  estimate.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  estimate.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}>
                  {estimate.status}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;