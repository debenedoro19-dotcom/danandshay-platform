import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <div 
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-midnight"
      style={{
        backgroundImage: 'linear-gradient(to bottom, rgba(26, 26, 46, 0.75), rgba(26, 26, 46, 0.95)), url("https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1920&q=85")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/15 border border-gold/40 text-gold text-xs font-mono uppercase tracking-widest mb-6 font-bold"
        >
          <span>Official 2026 North American Tour</span>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-display text-5xl sm:text-7xl md:text-8xl text-white tracking-widest mb-6 font-extrabold uppercase leading-none drop-shadow-lg"
        >
          The Young Tour
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-cream/90 text-lg sm:text-2xl mb-10 font-body font-light max-w-2xl"
        >
          Dan + Shay live across 26 cities with Tyler Hubbard & Josh Ross. Interactive seat selection & VIP experiences.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <Link 
            to="/events"
            className="px-8 py-4 bg-gradient-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-midnight font-extrabold rounded-xl transition-all shadow-xl hover:shadow-gold/30 text-base uppercase tracking-wider text-center"
          >
            Purchase Tickets
          </Link>
          <Link 
            to="/meet-and-greet"
            className="px-8 py-4 bg-white/10 hover:bg-white/20 border-2 border-gold/70 text-gold hover:text-white font-bold rounded-xl transition-all text-base uppercase tracking-wider text-center backdrop-blur-sm"
          >
            VIP Meet & Greet
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
      >
        <span className="text-cream/70 text-sm mb-2 uppercase tracking-widest">Scroll</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="w-6 h-6 border-b-2 border-r-2 border-gold transform rotate-45"
        />
      </motion.div>
    </div>
  );
};

export default HeroSection;
