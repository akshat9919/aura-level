import React from 'react';
import OracleAI from '../components/OracleAI';
import { motion } from 'motion/react';

const OraclePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="h-[calc(100vh-200px)]"
      >
        <OracleAI />
      </motion.div>
    </div>
  );
};

export default OraclePage;
