import React from 'react';
import { motion } from 'motion/react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "w-24 h-24" }) => {
  return (
    <div className={`relative ${className} flex items-center justify-center`}>
      <motion.div
        animate={{ 
          filter: ["drop-shadow(0 0 5px rgba(0,209,255,0.3))", "drop-shadow(0 0 15px rgba(0,209,255,0.6))", "drop-shadow(0 0 5px rgba(0,209,255,0.3))"] 
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className="w-full h-full"
      >
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Lightning Bolt Background */}
          <path 
            d="M65 5L25 55H45L35 95L75 45H55L65 5Z" 
            fill="black" 
            stroke="#00D1FF" 
            strokeWidth="2"
          />
          {/* Fist Detail */}
          <path 
            d="M65 28C65 28 68 25 72 28M68 31C68 31 71 28 75 31" 
            stroke="black" 
            strokeWidth="1" 
            strokeLinecap="round"
          />
        </svg>
      </motion.div>
    </div>
  );
};

export default Logo;
