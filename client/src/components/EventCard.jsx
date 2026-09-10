import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
  const { id, title, date, venue, city, state, image_url, min_price } = event;
  
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -5 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-md hover:shadow-2xl overflow-hidden flex flex-col h-full border border-blush"
    >
      <Link to={`/events/${id}`} className="flex flex-col h-full">
        <div className="relative h-48 w-full overflow-hidden">
          <img 
            src={image_url || 'https://images.unsplash.com/photo-1540039155732-6761b54cbaca?w=800'} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-midnight/80 to-transparent"></div>
          
          <div className="absolute top-4 right-4 bg-gold text-midnight font-bold py-1 px-3 rounded-md text-sm shadow-md">
            {formattedDate}
          </div>
          
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white font-display text-xl font-bold truncate">{title}</h3>
          </div>
        </div>
        
        <div className="p-5 flex flex-col flex-grow bg-cream">
          <div className="flex items-start mb-2">
            <svg className="w-5 h-5 text-gold mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <div>
              <p className="text-charcoal font-semibold">{venue}</p>
              <p className="text-charcoal/70 text-sm">{city}, {state}</p>
            </div>
          </div>
          
          <div className="mt-auto pt-4 border-t border-gold/20">
            <span className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-gold to-gold-dark text-midnight font-bold py-2.5 px-4 rounded-lg shadow-sm group-hover:shadow-md transition-all text-xs uppercase tracking-wider">
              Purchase Tickets
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default EventCard;
