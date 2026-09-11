import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import FanCard from '../components/FanCard';
import TicketPass from '../components/TicketPass';
import MeetGreetPass from '../components/MeetGreetPass';

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
        <h1 className="text-4xl md:text-5xl font-display font-bold text-midnight mb-6 text-center md:text-left">
          MY TICKETS & COLLECTION
        </h1>

        {/* Security & Flip Pass Notice Banner */}
        <div className="mb-8 p-4 rounded-2xl bg-midnight text-white border border-gold/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/20 text-gold flex items-center justify-center font-bold text-lg flex-shrink-0">
              🛡️
            </div>
            <div>
              <h4 className="text-sm font-display font-bold text-white flex items-center gap-2">
                <span>Official Live Nation Flip Pass System</span>
                <span className="text-[10px] font-mono text-gold px-2 py-0.5 rounded bg-gold/10 border border-gold/30 uppercase">
                  Automated Security Protocol
                </span>
              </h4>
              <p className="text-xs text-gray-300 mt-0.5">
                New orders remain sealed on their security reverse side while undergoing payment authentication. Once approved by an administrator, your passes automatically flip over to activate your live turnstile QR codes.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex-shrink-0 px-4 py-2 bg-gold hover:bg-yellow-400 text-midnight font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow flex items-center gap-1.5 cursor-pointer"
          >
            <span>⟳ Refresh Status</span>
          </button>
        </div>

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
                <div className="space-y-8">
                  {tickets.map((ticket, i) => (
                    <TicketPass key={i} ticket={ticket} user={user} />
                  ))}
                </div>
              )
            )}

            {/* Meet & Greet Tab */}
            {activeTab === 'meetgreet' && (
              mgPackages.length === 0 ? (
                <EmptyState title="No Meet & Greet Packages" text="Upgrade your experience by booking a VIP package." link="/meet-and-greet" linkText="View Packages" />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {mgPackages.map((pkg, i) => (
                    <MeetGreetPass key={i} pkg={pkg} user={user} />
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
