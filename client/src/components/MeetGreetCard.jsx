import React from 'react';
import { motion } from 'framer-motion';

const MeetGreetCard = ({ pkg, onBook, selectedCity, selectedState }) => {
  const { 
    title, 
    description, 
    price, 
    spots_remaining, 
    spots_total, 
    perks, 
    event_title, 
    event_date, 
    event_venue, 
    event_city, 
    venue, 
    city 
  } = pkg;
  
  // Perks parsing — safe for both array and comma-separated string
  const perksList = Array.isArray(perks) 
    ? perks 
    : (typeof perks === 'string' ? perks.split(',').map(p => p.trim()).filter(Boolean) : []);

  const activeCity = selectedCity || event_city || city || 'Nashville';
  const activeState = selectedState || 'Tennessee';

  // Tier styling & Dan + Shay photos
  let containerStyles = "bg-white border-gray-200";
  let badgeStyles = "bg-gray-100 text-charcoal border-gray-300";
  let buttonStyles = "bg-charcoal text-white hover:bg-black";
  let tierImage = "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80"; // Dan + Shay live
  
  const titleLower = (title || '').toLowerCase();
  if (titleLower.includes('gold')) {
    containerStyles = "bg-gradient-to-b from-amber-50/50 to-white border-gold/60 shadow-gold/10";
    badgeStyles = "bg-gold/20 text-gold-dark border-gold/40";
    buttonStyles = "bg-gold text-midnight hover:bg-gold-dark font-bold shadow-md hover:shadow-gold/30";
    tierImage = "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80";
  } else if (titleLower.includes('platinum')) {
    containerStyles = "bg-gradient-to-b from-rose/10 to-white border-rose/50 shadow-rose/10";
    badgeStyles = "bg-rose/20 text-rose border-rose/30";
    buttonStyles = "bg-rose text-white hover:bg-rose/90 font-bold shadow-md";
    tierImage = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80";
  } else if (titleLower.includes('ultimate')) {
    containerStyles = "bg-midnight border-gold text-cream shadow-2xl shadow-gold/20";
    badgeStyles = "bg-gold text-midnight border-gold font-extrabold";
    buttonStyles = "bg-gradient-to-r from-gold to-yellow-500 text-midnight font-extrabold hover:brightness-110 shadow-lg shadow-gold/40";
    tierImage = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80";
  }

  const fillPercentage = spots_total ? Math.min(100, Math.max(0, ((spots_total - spots_remaining) / spots_total) * 100)) : 0;
  const isSoldOut = spots_remaining === 0;

  return (
    <motion.div 
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className={`rounded-2xl overflow-hidden shadow-lg border-2 flex flex-col h-full transition-all ${containerStyles}`}
    >
      {/* Tier Photo Header */}
      <div className="relative h-44 w-full overflow-hidden">
        <img 
          src={tierImage} 
          alt="Dan + Shay VIP Experience" 
          className="w-full h-full object-cover brightness-90 hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight/90 via-midnight/30 to-transparent"></div>
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider border ${badgeStyles}`}>
            VIP EXPERIENCE
          </span>
        </div>
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="font-display text-xl font-bold text-white tracking-wide drop-shadow-sm">{title}</h3>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        {/* Price Tag */}
        <div className="flex items-baseline justify-between mb-4 pb-4 border-b border-inherit/20">
          <div>
            <span className="text-3xl font-display font-extrabold text-gold">${price}</span>
            <span className="text-xs opacity-70 ml-1">/ person</span>
          </div>
          <span className="text-xs uppercase tracking-wider font-semibold text-gold-dark bg-gold/10 px-2.5 py-1 rounded">
            Exclusive
          </span>
        </div>
        
        {/* Nationwide VIP Location */}
        <div className="mb-4 text-xs opacity-90 flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-black/5 dark:bg-white/5 border border-inherit/20">
          <svg className="w-4 h-4 text-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
          </svg>
          <span className="font-bold text-inherit">{activeCity}, {activeState}</span>
          <span className="opacity-50">•</span>
          <span className="truncate opacity-75">Private VIP Venue</span>
        </div>
        
        <p className="text-sm mb-5 opacity-80 leading-relaxed font-light">
          {description}
        </p>
        
        {/* Perks List */}
        <div className="mb-6 flex-grow">
          <div className="text-xs font-bold uppercase tracking-wider text-gold mb-3">Included VIP Privileges</div>
          <ul className="space-y-2.5">
            {perksList.map((perk, i) => (
              <li key={i} className="flex items-start text-xs leading-snug">
                <svg className="w-4 h-4 mr-2 text-gold flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="opacity-90">{perk}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Spots Left Progress & CTA */}
        <div className="mt-auto pt-4 border-t border-inherit/20">
          <div className="flex justify-between text-xs mb-1.5 font-medium opacity-80">
            <span>VIP Availability</span>
            <span className={spots_remaining <= 5 ? 'text-rose font-bold' : ''}>
              {spots_remaining} of {spots_total} spots left
            </span>
          </div>
          <div className="w-full bg-black/20 rounded-full h-1.5 mb-5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-gold to-yellow-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${fillPercentage}%` }}
            ></div>
          </div>
          
          <button 
            onClick={() => onBook(pkg)}
            disabled={isSoldOut}
            className={`w-full py-3 px-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${buttonStyles}`}
          >
            {isSoldOut ? 'Sold Out' : 'Book VIP Experience'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MeetGreetCard;
