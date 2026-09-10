import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import FanCard from '../components/FanCard';

const MyTicketsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tickets');
  const [tickets, setTickets] = useState([]);
  const [mgPackages, setMgPackages] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchMyItems = async () => {
      try {
        const [ticketsRes, mgRes, cardsRes] = await Promise.all([
          api.get('/tickets/my-tickets').catch(() => ({data: []})),
          api.get('/meetgreet/my-bookings').catch(() => ({data: []})), // Assuming this endpoint exists based on patterns
          api.get('/fancards/my-collection').catch(() => ({data: []}))
        ]);
        
        if (ticketsRes.data) setTickets(ticketsRes.data);
        if (mgRes.data) setMgPackages(mgRes.data);
        if (cardsRes.data) setCards(cardsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyItems();
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-cream pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-midnight mb-8 text-center md:text-left">
          MY TICKETS & COLLECTION
        </h1>

        {/* Tabs */}
        <div className="flex border-b border-gray-300 mb-8 overflow-x-auto">
          {['tickets', 'meetgreet', 'fancards'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-8 font-bold text-lg whitespace-nowrap transition-colors ${
                activeTab === tab 
                  ? 'border-b-4 border-gold text-midnight' 
                  : 'text-gray-500 hover:text-midnight'
              }`}
            >
              {tab === 'tickets' ? 'Concert Tickets' : tab === 'meetgreet' ? 'Meet & Greet' : 'Fan Cards'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div className="min-h-[400px]">
            {/* Tickets Tab */}
            {activeTab === 'tickets' && (
              tickets.length === 0 ? (
                <EmptyState title="No tickets yet" text="You haven't purchased any tickets for the upcoming tour." link="/events" linkText="Browse Events" />
              ) : (
                <div className="space-y-6">
                  {tickets.map((ticket, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-md border border-blush overflow-hidden flex flex-col md:flex-row">
                      <div className="bg-midnight text-white p-6 md:w-1/4 flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r border-gold/30">
                        <div className="text-sm text-gold mb-1 font-bold tracking-widest uppercase">{new Date(ticket.event_date).toLocaleString('default', { month: 'short' })}</div>
                        <div className="text-5xl font-display font-bold mb-1">{new Date(ticket.event_date).getDate()}</div>
                        <div className="text-sm opacity-80">{new Date(ticket.event_date).getFullYear()}</div>
                      </div>
                      
                      <div className="p-6 flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-2xl font-display font-bold text-charcoal">{ticket.event?.title || ticket.event_title}</h3>
                            {ticket.status === 'pending_approval' ? (
                              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
                                Pending Verification ⏳
                              </span>
                            ) : ticket.status === 'rejected' ? (
                              <span className="bg-red-100 text-red-800 border border-red-300 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
                                Payment Rejected ✕
                              </span>
                            ) : (
                              <span className="bg-green-100 text-green-800 border border-green-300 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
                                Active & Valid ✓
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-4">{ticket.event?.venue || ticket.venue} • {ticket.event?.city || ticket.city}</p>
                        </div>
                        
                        <div className="space-y-2 border-t border-gray-100 pt-4">
                          {ticket.seats && ticket.seats.length > 0 ? (
                            <div className="flex flex-wrap gap-4">
                              {ticket.seats.map((seat, sIdx) => (
                                <div key={sIdx} className="bg-cream/60 px-3 py-1.5 rounded-lg border border-gold/30 text-xs">
                                  <span className="font-bold text-midnight font-mono">Sec {seat.section}</span>, Row <span className="font-bold">{seat.row}</span>, Seat <span className="font-bold">{seat.seatNumber || seat.seat_number}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex gap-6">
                              <div>
                                <div className="text-xs text-gray-400 uppercase">Section</div>
                                <div className="font-bold text-midnight text-lg">{ticket.section}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-400 uppercase">Row</div>
                                <div className="font-bold text-midnight text-lg">{ticket.row}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-400 uppercase">Seat</div>
                                <div className="font-bold text-midnight text-lg">{ticket.seat_number}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-6 md:w-48 flex items-center justify-center border-t md:border-t-0 md:border-l border-gray-200">
                        {ticket.status === 'pending_approval' ? (
                          <div className="w-32 h-32 bg-amber-50 border-2 border-dashed border-amber-300 rounded flex flex-col items-center justify-center text-amber-700 p-2 text-center">
                            <span className="text-2xl mb-1">⏳</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider">Awaiting Verification</span>
                          </div>
                        ) : (
                          <div className="w-32 h-32 bg-white border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400">
                            <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                            <span className="text-xs font-bold tracking-widest">QR CODE</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Meet & Greet Tab */}
            {activeTab === 'meetgreet' && (
              mgPackages.length === 0 ? (
                <EmptyState title="No Meet & Greet Packages" text="Upgrade your experience by booking a VIP package." link="/meet-and-greet" linkText="View Packages" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mgPackages.map((pkg, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-md border border-gold overflow-hidden">
                      <div className="bg-gold text-midnight p-4 font-bold flex justify-between items-center">
                        <span>VIP EXPERIENCE</span>
                        {pkg.status === 'pending_approval' ? (
                          <span className="text-xs bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full font-bold uppercase">
                            Pending Verification ⏳
                          </span>
                        ) : pkg.status === 'rejected' ? (
                          <span className="text-xs bg-red-100 text-red-800 border border-red-300 px-2.5 py-1 rounded-full font-bold uppercase">
                            Payment Rejected ✕
                          </span>
                        ) : (
                          <span className="text-xs bg-midnight text-white px-2.5 py-1 rounded-full font-bold">
                            Confirmed ✓
                          </span>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-display font-bold mb-1">{pkg.title || pkg.package_title}</h3>
                        <p className="font-bold text-midnight mb-1 flex items-center gap-1.5">
                          <span className="text-gold-dark">📍</span>
                          <span>{pkg.location_city || pkg.event_city || 'Nashville'}, {pkg.location_state || pkg.event_state || 'Tennessee'}</span>
                        </p>
                        <p className="text-gray-600 text-sm mb-4">
                          {pkg.event_venue || pkg.venue || 'Private VIP Venue & Lounge'} • The Young Tour 2026
                        </p>
                        <div className="bg-blush p-4 rounded text-sm text-charcoal border border-rose/30">
                          Please arrive 2 hours before doors open. Bring photo ID matching the purchaser name. Instructions will be emailed 48 hours before the event.
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Fan Cards Tab */}
            {activeTab === 'fancards' && (
              cards.length === 0 ? (
                <EmptyState title="No Fan Cards" text="Start your digital collection today." link="/fan-cards" linkText="Collect Cards" />
              ) : (
                <div>
                  <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-blush flex justify-between items-center">
                    <span className="font-bold text-charcoal">Total Cards: {cards.length}</span>
                    <Link to="/fan-cards" className="text-gold-dark font-bold hover:underline">Complete Your Collection &rarr;</Link>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
                    {cards.map((card, i) => (
                      <div key={i} className="transform scale-90 origin-top">
                        <FanCard card={{...card, id: card.card_id || card.id}} owned={true} onPurchase={() => {}} />
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const EmptyState = ({ title, text, link, linkText }) => (
  <div className="bg-white rounded-xl shadow-sm border border-dashed border-gray-300 p-12 text-center flex flex-col items-center justify-center">
    <div className="w-16 h-16 bg-blush rounded-full flex items-center justify-center mb-4 text-rose">
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4M8 16l-4-4 4-4"></path></svg>
    </div>
    <h3 className="text-2xl font-bold text-charcoal mb-2">{title}</h3>
    <p className="text-gray-500 mb-6 max-w-md">{text}</p>
    <Link to={link} className="px-6 py-3 bg-midnight text-gold font-bold rounded-md hover:bg-charcoal transition-colors">
      {linkText}
    </Link>
  </div>
);

export default MyTicketsPage;
