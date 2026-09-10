import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FanCard from '../components/FanCard';
import CheckoutForm from '../components/CheckoutForm';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const TIER_COMPARISON = [
  { benefit: '48-Hour Concert Presale Window', silver: true, gold: true, obsidian: true },
  { benefit: 'Official Tour Metal Lanyard & Welcome Kit', silver: true, gold: true, obsidian: true },
  { benefit: 'Digital Memorabilia Vault & Unreleased Drops', silver: true, gold: true, obsidian: true },
  { benefit: 'Official Merch Privileges & Discounts', silver: '15%', gold: '25%', obsidian: '40%' },
  { benefit: 'Soundcheck Access at Concert Venues', silver: false, gold: true, obsidian: true },
  { benefit: 'Fast-Track VIP Venue Entrance', silver: false, gold: true, obsidian: true },
  { benefit: 'Authenticated Hand-Signed Tour Lithograph', silver: false, gold: true, obsidian: true },
  { benefit: 'Guaranteed Front-Row Reservation Priority', silver: false, gold: false, obsidian: true },
  { benefit: 'Private Backstage Artist Lounge Access', silver: false, gold: false, obsidian: true },
  { benefit: 'Annual Virtual Private Q&A with Dan + Shay', silver: false, gold: false, obsidian: true },
  { benefit: 'Signed Collector Vinyl Box Set Shipped', silver: false, gold: false, obsidian: true },
];

const FanCardsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'mine'
  const [allCards, setAllCards] = useState([]);
  const [myCards, setMyCards] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      try {
        const resAll = await api.get('/fancards');
        if (resAll.data) setAllCards(resAll.data);
        
        if (user) {
          const resMine = await api.get('/fancards/my-collection');
          if (resMine.data) setMyCards(resMine.data);
        }
      } catch (err) {
        console.error('Failed to load fan cards:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, [user]);

  const handlePurchaseClick = (card) => {
    if (!user) return navigate('/login');
    setSelectedCard(card);
    setShowCheckout(true);
  };

  const handleCheckoutSubmit = async (paymentData) => {
    await api.post('/fancards/purchase', { cardId: selectedCard.id, ...paymentData });
    const [resAll, resMine] = await Promise.all([
      api.get('/fancards'),
      api.get('/fancards/my-collection')
    ]);
    if (resAll.data) setAllCards(resAll.data);
    if (resMine.data) setMyCards(resMine.data);
  };

  const myCardIds = myCards.map(c => c.card_id || c.id);
  const displayCards = activeTab === 'all' ? allCards : myCards;

  return (
    <div className="min-h-screen bg-midnight text-white pt-20 pb-28">
      {/* Luxury Dan + Shay Hero Header */}
      <div className="relative overflow-hidden py-16 mb-12 border-b border-gold/30 bg-gradient-to-b from-black to-midnight">
        <div 
          className="absolute inset-0 opacity-25 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1920&q=80')` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-midnight via-midnight/95 to-black/80"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-3xl">
            <span className="inline-block text-gold text-xs font-mono font-bold tracking-widest uppercase px-3 py-1 bg-gold/10 border border-gold/40 rounded-full mb-3">
              Official Dan + Shay Founders Club
            </span>
            <h1 className="text-4xl sm:text-6xl font-display font-extrabold text-white mb-4 leading-tight">
              Executive VIP Fan Cards
            </h1>
            <p className="text-lg text-cream/80 font-light leading-relaxed max-w-2xl">
              Elevate your concert experience with authentic metallic membership passes. Gain unprecedented presale access, private soundchecks, backstage lounges, and lifetime collector privileges.
            </p>
          </div>
          
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="w-32 h-44 rounded-xl overflow-hidden border border-gold/40 shadow-xl hidden sm:block">
              <img 
                src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=500&q=80" 
                alt="Dan + Shay live" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-36 h-48 rounded-xl overflow-hidden border-2 border-gold shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=500&q=80" 
                alt="Dan + Shay acoustic" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-gold/30">
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-8 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'all' 
                  ? 'bg-gradient-to-r from-gold to-yellow-500 text-midnight shadow-lg font-extrabold' 
                  : 'text-cream hover:text-white'
              }`}
            >
              The 3 Membership Tiers
            </button>
            <button 
              onClick={() => {
                if (!user) navigate('/login');
                else setActiveTab('mine');
              }}
              className={`px-8 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'mine' 
                  ? 'bg-gradient-to-r from-gold to-yellow-500 text-midnight shadow-lg font-extrabold' 
                  : 'text-cream hover:text-white'
              }`}
            >
              My Vault & Passes {myCards.length > 0 && `(${myCards.length})`}
            </button>
          </div>
        </div>

        {/* Cards Display Grid */}
        {loading ? (
          <div className="flex justify-center py-28">
            <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : displayCards.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/20 p-8 max-w-xl mx-auto">
            <p className="text-xl text-cream/70 mb-4">No membership passes currently in your vault.</p>
            <button 
              onClick={() => setActiveTab('all')}
              className="px-6 py-2.5 bg-gold text-midnight rounded-xl font-bold text-sm uppercase tracking-wider"
            >
              Explore Tiers
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center mb-24">
            {displayCards.map(card => {
              const cardData = activeTab === 'mine' ? {
                ...card, 
                id: card.card_id || card.id,
                remaining: card.remaining !== undefined ? card.remaining : 1 
              } : card;
              
              const isOwned = activeTab === 'mine' || myCardIds.includes(cardData.id);
              
              return (
                <div key={cardData.id} className="flex flex-col items-center">
                  <FanCard 
                    card={cardData} 
                    owned={isOwned}
                    onPurchase={handlePurchaseClick}
                  />
                  {activeTab === 'mine' && card.acquired_at && (
                    <div className="mt-3 text-center text-xs text-gold/80 font-mono">
                      Issued on {new Date(card.acquired_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Premium Comparison Matrix */}
        <div className="mt-16 bg-white/[0.04] border border-gold/30 rounded-3xl p-8 sm:p-10 backdrop-blur-sm">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-gold mb-2">
              Membership Privileges Matrix
            </h2>
            <p className="text-sm text-cream/70">
              Detailed breakdown of official privileges included with each executive tier
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gold/30 text-xs uppercase tracking-widest text-gold font-mono">
                  <th className="py-4 px-4">Executive Benefit</th>
                  <th className="py-4 px-4 text-center text-slate-300">Silver ($150)</th>
                  <th className="py-4 px-4 text-center text-amber-300">Gold ($400)</th>
                  <th className="py-4 px-4 text-center text-yellow-400">Obsidian ($1,000)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-sm font-light">
                {TIER_COMPARISON.map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 text-cream/90 font-medium">{row.benefit}</td>
                    
                    {/* Silver */}
                    <td className="py-4 px-4 text-center">
                      {typeof row.silver === 'string' ? (
                        <span className="font-bold text-slate-300">{row.silver}</span>
                      ) : row.silver ? (
                        <span className="text-green-400 font-bold">✓</span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    
                    {/* Gold */}
                    <td className="py-4 px-4 text-center">
                      {typeof row.gold === 'string' ? (
                        <span className="font-bold text-amber-300">{row.gold}</span>
                      ) : row.gold ? (
                        <span className="text-green-400 font-bold">✓</span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    
                    {/* Obsidian */}
                    <td className="py-4 px-4 text-center">
                      {typeof row.obsidian === 'string' ? (
                        <span className="font-bold text-yellow-400">{row.obsidian}</span>
                      ) : row.obsidian ? (
                        <span className="text-gold font-bold">✓</span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showCheckout && selectedCard && (
        <CheckoutForm 
          items={[{ name: `${selectedCard.title} — ${selectedCard.rarity} Membership Pass`, price: selectedCard.price }]}
          total={selectedCard.price}
          onSubmit={handleCheckoutSubmit}
          onCancel={() => setShowCheckout(false)}
          type="fancard"
        />
      )}
    </div>
  );
};

export default FanCardsPage;
