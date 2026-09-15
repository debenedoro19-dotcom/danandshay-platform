import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import EventCard from '../components/EventCard';
import api from '../api';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMonth, setFilterMonth] = useState('Upcoming');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events');
        if (res.data) setEvents(res.data);
      } catch (err) {
        console.error("Failed to load events", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const now = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.city.toLowerCase().includes(search.toLowerCase()) || 
                          e.venue.toLowerCase().includes(search.toLowerCase()) ||
                          e.title.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filterMonth === 'All') return true;

    if (filterMonth === 'Upcoming') {
      return new Date(e.date) >= now;
    }
    
    const month = new Date(e.date).toLocaleString('default', { month: 'short' });
    return month === filterMonth;
  });

  // Split into upcoming and past for "All" view
  const upcomingEvents = filteredEvents.filter(e => new Date(e.date) >= now);
  const pastEvents = filteredEvents.filter(e => new Date(e.date) < now);

  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-cream pt-24 pb-20">
      {/* Header */}
      <div className="bg-midnight text-white py-16 mb-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-display font-bold text-gold tracking-widest mb-4">THE YOUNG TOUR 2026</h1>
          <p className="text-xl md:text-2xl font-light text-cream/80">26 Cities Across North America</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 bg-white p-4 rounded-xl shadow-sm border border-blush">
          <div className="flex flex-wrap gap-2">
            {['Upcoming', 'All', 'Sep', 'Oct', 'Nov'].map(m => (
              <button
                key={m}
                onClick={() => setFilterMonth(m)}
                className={`px-6 py-2 rounded-full font-bold transition-colors ${
                  filterMonth === m ? 'bg-gold text-midnight' : 'bg-gray-100 text-charcoal hover:bg-gray-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <input 
              type="text" 
              placeholder="Search city or venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
            />
            <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="animate-pulse bg-white h-96 rounded-xl overflow-hidden border border-gray-200">
                <div className="bg-gray-300 h-48 w-full"></div>
                <div className="p-5 space-y-4">
                  <div className="h-6 bg-gray-300 w-3/4 rounded"></div>
                  <div className="h-4 bg-gray-300 w-1/2 rounded"></div>
                  <div className="h-8 bg-gray-300 w-full rounded mt-8"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-charcoal mb-2">No events found</h3>
            <p className="text-gray-500">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <>
                {(filterMonth === 'All' && pastEvents.length > 0) && (
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <h2 className="text-xl font-display font-bold text-midnight">Upcoming Shows</h2>
                    <span className="text-xs font-bold bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full">{upcomingEvents.length} remaining</span>
                  </div>
                )}
                <motion.div 
                  variants={containerVars}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {upcomingEvents.map(event => (
                    <motion.div key={event.id} variants={itemVars}>
                      <EventCard event={event} />
                    </motion.div>
                  ))}
                </motion.div>
              </>
            )}

            {/* Divider between upcoming and past */}
            {(filterMonth === 'All' && upcomingEvents.length > 0 && pastEvents.length > 0) && (
              <div className="flex items-center gap-4 my-14">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Past Events
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              </div>
            )}

            {/* Past Events */}
            {pastEvents.length > 0 && filterMonth !== 'Upcoming' && (
              <motion.div 
                variants={containerVars}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {pastEvents.map(event => (
                  <motion.div key={event.id} variants={itemVars}>
                    <EventCard event={event} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EventsPage;

