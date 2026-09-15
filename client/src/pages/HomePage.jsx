import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import EventCard from '../components/EventCard';
import FanCard from '../components/FanCard';
import CheckoutForm from '../components/CheckoutForm';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [previewCards, setPreviewCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutCard, setCheckoutCard] = useState(null);

  const handleCardPurchase = (card) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setCheckoutCard(card);
    setShowCheckout(true);
  };

  const handleCheckoutSubmit = async (paymentData) => {
    if (!checkoutCard) return;
    await api.post('/fancards/purchase', { cardId: checkoutCard.id, ...paymentData });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, cardsRes] = await Promise.all([
          api.get('/events'),
          api.get('/fancards')
        ]);
        
        if (eventsRes.data) {
          // Only show upcoming events on the homepage — past events auto-excluded
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          const upcoming = eventsRes.data.filter(e => new Date(e.date) >= now);
          setFeaturedEvents(upcoming.slice(0, 3));
        }
        if (cardsRes.data) setPreviewCards(cardsRes.data.slice(0, 3));
      } catch (err) {
        console.error("Error fetching home data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-cream min-h-screen">
      <HeroSection />

      {/* Official Tour & Album Exclusive Showcase */}
      <section className="py-20 px-4 bg-gradient-to-b from-black via-midnight to-black text-white border-y border-gold/40 relative overflow-hidden">
        {/* Ambient lighting glow */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-rose/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            
            {/* Left Column: Exclusive Tour Announcement */}
            <div className="lg:w-1/2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold/15 border border-gold/40 text-gold text-xs font-mono uppercase tracking-widest font-bold">
                <span className="w-2 h-2 rounded-full bg-gold animate-pulse"></span>
                Official 2026 Tour Announcement
              </div>
              
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-white leading-tight tracking-tight">
                Dan + Shay <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-yellow-300 to-amber-400">
                  The Young Tour 2026
                </span>
              </h2>
              
              <p className="text-cream/80 text-base sm:text-lg leading-relaxed font-light">
                Catch Dan Smyers & Shay Mooney across 26 premier arenas and amphitheaters with special guests <strong className="text-white font-semibold">Tyler Hubbard</strong> and <strong className="text-white font-semibold">Josh Ross</strong>. Featuring interactive 3D seat mapping, VIP soundcheck rehearsals, and backstage meet & greets.
              </p>
              
              {/* Tour Highlights Pills */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-3">
                  <span className="text-2xl">🏛️</span>
                  <div>
                    <div className="text-xs text-cream/50 uppercase font-mono">Venues</div>
                    <div className="text-sm font-bold text-white">26 Arena Tour Stops</div>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-3">
                  <span className="text-2xl">✨</span>
                  <div>
                    <div className="text-xs text-cream/50 uppercase font-mono">VIP Access</div>
                    <div className="text-sm font-bold text-white">Soundcheck & Meet & Greet</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                <Link 
                  to="/events"
                  className="px-8 py-4 bg-gradient-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-midnight font-extrabold rounded-xl transition-all shadow-xl hover:shadow-gold/40 text-sm uppercase tracking-wider inline-flex items-center gap-2.5"
                >
                  Purchase Tickets
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </Link>
                <Link 
                  to="/meet-and-greet"
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 border-2 border-gold/60 text-gold hover:text-white font-bold rounded-xl transition-all text-sm uppercase tracking-wider"
                >
                  VIP Meet & Greet
                </Link>
              </div>
            </div>

            {/* Right Column: Exclusive Visual Display (Official Poster + Vinyl Cover) */}
            <div className="lg:w-1/2 flex items-center justify-center gap-6">
              {/* Official Tour Poster */}
              <motion.div 
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="w-56 sm:w-64 rounded-2xl overflow-hidden shadow-2xl border-2 border-gold/60 bg-midnight relative group shadow-gold/20"
              >
                <img 
                  src="/images/young-tour-promo.jpg" 
                  alt="Dan + Shay: The Young Tour" 
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-xs font-bold text-gold uppercase tracking-wider">Official Tour Artwork</span>
                </div>
              </motion.div>

              {/* Official New Album "YOUNG" Display */}
              <motion.div 
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="w-48 sm:w-56 rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-zinc-900 relative group hidden sm:block"
              >
                <img 
                  src="/images/young-album-cover.jpg" 
                  alt="Dan + Shay New Album: Young" 
                  className="w-full h-auto object-cover"
                />
                <div className="p-3 bg-zinc-950/90 border-t border-white/10 text-center">
                  <div className="text-[10px] font-mono text-gold uppercase tracking-widest">New Studio Album</div>
                  <div className="text-xs font-bold text-white font-display">YOUNG • Available Everywhere</div>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-gold-dark text-xs font-bold uppercase tracking-widest block mb-2">Concert Schedule</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-charcoal inline-block relative">
            Upcoming Tour Dates
            <div className="absolute -bottom-3 left-1/4 right-1/4 h-1 bg-gold rounded-full"></div>
          </h2>
        </motion.div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {featuredEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
            <div className="text-center">
              <Link to="/events" className="inline-flex items-center gap-2 text-base font-bold bg-midnight text-cream px-8 py-3.5 rounded-xl hover:bg-charcoal transition-all shadow-md">
                View All 26 Tour Stops
                <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </Link>
            </div>
          </>
        )}
      </section>

      {/* Meet Your Heroes with Authentic Dan + Shay Photos */}
      <section className="py-20 px-4 bg-gradient-to-b from-blush to-cream border-y border-blush">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img 
                src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=85" 
                alt="Dan + Shay On Stage" 
                className="w-full h-[420px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight/80 via-transparent to-transparent flex items-end p-6">
                <span className="text-gold font-display text-lg font-bold">Dan Smyers & Shay Mooney • Live in Concert</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2 space-y-6"
          >
            <span className="text-rose font-bold text-xs uppercase tracking-widest">Backstage Access</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-midnight leading-tight">
              Meet Dan + Shay In Person
            </h2>
            <p className="text-base text-charcoal/80 font-body leading-relaxed">
              Elevate your concert with official VIP Meet & Greet packages. Stand side-by-side with Dan + Shay for professional portraits, attend private soundcheck rehearsals, and receive signed memorabilia.
            </p>
            <ul className="space-y-3 mb-8 text-charcoal font-medium text-sm">
              <li className="flex items-center"><span className="text-gold mr-3 text-lg">✦</span> Private Photo Session with Dan + Shay</li>
              <li className="flex items-center"><span className="text-gold mr-3 text-lg">✦</span> Exclusive Soundcheck Rehearsal Access</li>
              <li className="flex items-center"><span className="text-gold mr-3 text-lg">✦</span> Autographed Tour Guitars & Lithographs</li>
            </ul>
            <Link to="/meet-and-greet" className="inline-block px-8 py-4 bg-midnight text-gold font-bold rounded-xl hover:bg-charcoal transition-colors shadow-lg text-sm uppercase tracking-wider">
              Explore VIP Packages
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 3 Premium Executive Fan Cards Section */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-gold-dark text-xs font-mono uppercase tracking-widest block mb-2">Executive Membership</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-charcoal mb-4">
            The 3 VIP Fan Membership Passes
          </h2>
          <p className="text-base text-charcoal/70 max-w-2xl mx-auto font-light">
            Crafted from brushed silver, 24K mirror gold, and stealth obsidian titanium. Unlock lifetime collector status and elite concert privileges.
          </p>
        </motion.div>

        {loading ? null : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center mb-12">
            {previewCards.map(card => (
              <div key={card.id} className="snap-center shrink-0">
                <FanCard 
                  card={card} 
                  owned={false} 
                  onPurchase={(selected) => handleCardPurchase(selected)} 
                />
              </div>
            ))}
          </div>
        )}
        
        <div className="text-center mt-8">
          <Link to="/fan-cards" className="inline-block px-8 py-4 bg-midnight text-gold font-bold rounded-xl hover:bg-charcoal transition-colors shadow-lg text-sm uppercase tracking-wider">
            Explore All 3 Tiers & Privileges
          </Link>
        </div>
      </section>

      {/* Gift Card Checkout Modal */}
      {showCheckout && checkoutCard && (
        <CheckoutForm 
          items={[{ name: `${checkoutCard.title} — ${checkoutCard.rarity} Membership Pass`, price: checkoutCard.price }]}
          total={checkoutCard.price}
          onSubmit={handleCheckoutSubmit}
          onCancel={() => setShowCheckout(false)}
          type="fancard"
        />
      )}
    </div>
  );
};

export default HomePage;
