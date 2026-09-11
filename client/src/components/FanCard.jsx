import React, { useState } from 'react';
import { motion } from 'framer-motion';

const FanCard = ({ card, owned = false, onPurchase }) => {
  // Only owned cards can flip to reveal exclusive client details/benefits.
  // Unpurchased cards only display the front face.
  const [isFlipped, setIsFlipped] = useState(false);

  const { id, title, description, image_url, rarity, price, total_supply, remaining, order_status } = card;
  const isPending = owned && (order_status === 'pending_approval' || card.status === 'pending_approval');

  // Tier design configurations
  const isObsidian = rarity?.toLowerCase() === 'obsidian' || title?.toLowerCase().includes('obsidian');
  const isGold = rarity?.toLowerCase() === 'gold' || title?.toLowerCase().includes('gold');
  const isSilver = !isObsidian && !isGold;

  let theme = {
    tierName: 'SILVER ALL-ACCESS',
    cardGradient: 'from-slate-200 via-gray-300 to-slate-400 text-charcoal border-gray-300',
    metalSheen: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    chipColor: 'from-amber-200 to-yellow-500',
    textColor: 'text-slate-800',
    accentColor: 'text-slate-600',
    badge: 'bg-slate-700 text-white',
    borderGlow: 'hover:shadow-[0_0_25px_rgba(203,213,225,0.8)]',
    borderTheme: 'border-slate-300',
    serialPrefix: 'SLV-2026',
    editionTag: 'LIMITED TO 1,000 PASSES',
    perksList: [
      '48-Hour Concert Ticket Presale Window',
      'Digital Collector Vault & Unreleased Drops',
      'Official Tour Metal Lanyard & Welcome Kit',
      '15% Official Merch Privileges'
    ]
  };

  if (isGold) {
    theme = {
      tierName: 'GOLD EXECUTIVE VIP',
      cardGradient: 'from-amber-200 via-yellow-400 to-amber-500 text-midnight border-amber-300',
      metalSheen: 'linear-gradient(135deg, #ffe066 0%, #d4af37 50%, #aa7c11 100%)',
      chipColor: 'from-yellow-100 to-amber-400',
      textColor: 'text-midnight',
      accentColor: 'text-amber-900',
      badge: 'bg-midnight text-gold border border-gold',
      borderGlow: 'hover:shadow-[0_0_30px_rgba(212,175,55,0.8)] shadow-gold/20',
      borderTheme: 'border-gold/60',
      serialPrefix: 'GLD-2026',
      editionTag: 'NUMBERED EDITION • 500 PASSES',
      perksList: [
        'VIP Soundcheck Access at Concert Venues',
        'Fast-Track VIP Venue Entrance',
        'Authenticated Hand-Signed Tour Lithograph',
        '25% Official Merch Discount & Acoustic Drops'
      ]
    };
  } else if (isObsidian) {
    theme = {
      tierName: 'OBSIDIAN FOUNDERS RESERVE',
      cardGradient: 'from-zinc-900 via-black to-zinc-950 text-white border-gold/70',
      metalSheen: 'linear-gradient(135deg, #18181b 0%, #09090b 50%, #27272a 100%)',
      chipColor: 'from-gold via-yellow-200 to-gold-dark',
      textColor: 'text-white',
      accentColor: 'text-gold',
      badge: 'bg-gold text-midnight font-black shadow-md',
      borderGlow: 'hover:shadow-[0_0_35px_rgba(201,168,76,0.9)] shadow-2xl shadow-gold/30',
      borderTheme: 'border-gold',
      serialPrefix: 'OBS-001',
      editionTag: 'ULTRA RARE • ONLY 50 MINTED',
      perksList: [
        'Guaranteed Front-Row Reservation Priority',
        'Private Backstage Artist Lounge Access',
        'Annual Virtual Private Q&A with Dan + Shay',
        'Signed Collector Vinyl Box Set Shipped'
      ]
    };
  }

  return (
    <div 
      className="w-80 h-[480px] perspective-1000 select-none group"
    >
      <div 
        className={`relative w-full h-full transition-transform duration-700 preserve-3d rounded-2xl shadow-2xl ${theme.borderGlow} ${isFlipped ? 'rotate-y-180' : ''}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* ============================================================ */}
        {/* FACE 1: "THIS FACE" (THE ISSUED METALLIC VIP PASS)           */}
        {/* Visible when BOUGHT, or on click preview                     */}
        {/* ============================================================ */}
        <div 
          className={`absolute w-full h-full backface-hidden rounded-2xl p-6 flex flex-col justify-between overflow-hidden border-2 ${theme.cardGradient}`}
          style={{ background: theme.metalSheen }}
        >
          {/* Subtle Metallic Reflex Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-black/20 pointer-events-none"></div>

          {/* Top Bar: D+S Crest & Tier Badge */}
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className="font-display font-black text-xl tracking-widest uppercase flex items-center gap-1.5">
                <span>DAN + SHAY</span>
              </div>
              <div className={`text-[10px] font-mono tracking-widest uppercase opacity-75 ${theme.accentColor}`}>
                Official Membership Pass
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`px-2.5 py-1 text-[10px] font-black tracking-widest rounded-full uppercase ${theme.badge}`}>
                {rarity} Tier
              </span>
              {owned && (
                isPending ? (
                  <span className="text-[9px] font-bold text-amber-900 bg-amber-200/90 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping"></span>
                    Pending Clearance 🔒
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-green-800 bg-green-200/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Active Pass ✓
                  </span>
                )
              )}
            </div>
          </div>

          {/* EMV Smart Chip & Contactless Glyph */}
          <div className="relative z-10 my-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* EMV Chip */}
              <div className={`w-12 h-9 rounded-md bg-gradient-to-br ${theme.chipColor} border border-amber-900/30 shadow-inner flex flex-col justify-around p-1`}>
                <div className="w-full h-0.5 bg-black/30 rounded"></div>
                <div className="w-full h-0.5 bg-black/30 rounded"></div>
                <div className="w-full h-0.5 bg-black/30 rounded"></div>
              </div>
              
              {/* Contactless Wave */}
              <svg className={`w-6 h-6 opacity-60 ${theme.textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.393 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
            </div>

            {/* Dan + Shay Photo Cameo for VIP authenticity */}
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-current/30 shadow-md">
              <img 
                src={image_url || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80'} 
                alt="Dan + Shay" 
                className="w-full h-full object-cover grayscale contrast-125"
              />
            </div>
          </div>

          {/* Cardholder Details & Price */}
          <div className="relative z-10 space-y-3">
            <div>
              <div className={`text-[10px] font-mono tracking-widest uppercase opacity-70 ${theme.accentColor}`}>
                Card Title
              </div>
              <h3 className={`font-display font-extrabold text-lg leading-tight ${theme.textColor}`}>
                {title}
              </h3>
            </div>

            <div className="flex justify-between items-end pt-3 border-t border-current/20">
              <div>
                <div className={`text-[9px] font-mono tracking-widest uppercase opacity-70 ${theme.accentColor}`}>
                  {owned ? 'Issued Serial Number' : 'Serial Credential'}
                </div>
                {owned ? (
                  <div className={`font-mono text-xs tracking-wider font-bold ${theme.textColor}`}>
                    {theme.serialPrefix}-0{id}48
                  </div>
                ) : (
                  <div className={`font-mono text-xs tracking-wider font-bold opacity-60 ${theme.textColor} flex items-center gap-1`}>
                    <span>••••-••••</span>
                    <span className="text-[10px]">🔒</span>
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <div className={`text-[9px] font-mono tracking-widest uppercase opacity-70 ${theme.accentColor}`}>
                  Annual Pass
                </div>
                <div className={`text-2xl font-display font-extrabold tracking-tight ${theme.textColor}`}>
                  ${typeof price === 'number' ? price.toFixed(0) : price}
                </div>
              </div>
            </div>

            {owned ? (
              <div className="pt-1 flex items-center justify-between text-[10px] font-mono opacity-70">
                <span>{theme.editionTag}</span>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFlipped(true);
                  }}
                  className="underline hover:opacity-100 cursor-pointer font-bold"
                >
                  View Benefits ↷
                </button>
              </div>
            ) : (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onPurchase) onPurchase(card);
                  }}
                  disabled={remaining === 0}
                  className={`w-full py-2.5 px-3 rounded-xl font-extrabold text-xs uppercase tracking-widest shadow-md transition-all hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-1.5 ${
                    isObsidian 
                      ? 'bg-gold text-midnight hover:bg-yellow-400' 
                      : isGold 
                        ? 'bg-midnight text-gold hover:bg-black' 
                        : 'bg-slate-800 text-white hover:bg-black'
                  }`}
                >
                  <span>{remaining === 0 ? 'Tier Sold Out' : `Acquire Pass ($${typeof price === 'number' ? price.toFixed(0) : price})`}</span>
                </button>
                <div className="text-center text-[9px] font-mono opacity-60 mt-1 flex items-center justify-center gap-1">
                  <span>🔒 Exclusive details unlocked upon purchase</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* FACE 2: SIMPLE PRESENTATION & TURN-OVER SIDE (DEFAULT STORE) */}
        {/* Shows details, benefits, price, and Buy CTA                  */}
        {/* ============================================================ */}
        <div 
          className={`absolute w-full h-full backface-hidden rounded-2xl p-6 flex flex-col justify-between border-2 ${theme.borderTheme} bg-gradient-to-b from-zinc-950 via-midnight to-black text-white shadow-2xl rotate-y-180`}
          style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
        >
          {/* Top: Dan + Shay Cameo Header & Tier Badge */}
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-gold/50 flex-shrink-0">
                  <img 
                    src={image_url || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80'} 
                    alt="Dan + Shay" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-gold font-bold">
                    Official Tier Pass
                  </div>
                  <h4 className="font-display font-bold text-base text-white leading-tight">{title}</h4>
                </div>
              </div>
              <span className={`px-2 py-0.5 text-[9px] font-bold tracking-widest rounded uppercase ${theme.badge}`}>
                {rarity}
              </span>
            </div>

            {/* Price tag */}
            <div className="flex items-baseline justify-between mb-4 bg-white/5 p-3 rounded-xl border border-white/10">
              <div>
                <span className="text-2xl font-display font-extrabold text-gold">
                  ${typeof price === 'number' ? price.toFixed(0) : price}
                </span>
                <span className="text-xs text-cream/60 ml-1">/ year</span>
              </div>
              <span className="text-[10px] font-mono text-cream/70 uppercase">
                {remaining} passes left
              </span>
            </div>

            {/* Key Included Privileges */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-gold mb-2 flex items-center gap-1.5">
                <span>✦ Included VIP Privileges</span>
              </div>
              <ul className="space-y-2 mb-2">
                {theme.perksList.map((perk, i) => (
                  <li key={i} className="flex items-start text-xs text-cream/90 leading-snug">
                    <svg className="w-3.5 h-3.5 mr-2 text-gold flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Action Area */}
          <div className="pt-3 border-t border-white/10 mt-auto">
            {owned ? (
              <div className="space-y-2">
                {isPending ? (
                  <div className="w-full py-2.5 bg-amber-500/20 text-amber-300 border border-amber-500/50 rounded-xl font-bold text-center text-xs tracking-wider uppercase">
                    🔒 Pending Admin Verification
                  </div>
                ) : (
                  <div className="w-full py-2.5 bg-green-500/20 text-green-400 border border-green-500/50 rounded-xl font-bold text-center text-xs tracking-wider uppercase">
                    Pass Active in Your Vault ✓
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setIsFlipped(false)}
                  className="w-full py-1.5 text-center text-xs text-gold hover:underline font-mono cursor-pointer"
                >
                  View Your Metallic Card Face ↶
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button 
                  type="button"
                  onClick={() => onPurchase && onPurchase(card)}
                  disabled={remaining === 0}
                  className="w-full py-3 bg-gradient-to-r from-gold to-yellow-500 hover:from-yellow-400 hover:to-gold text-midnight rounded-xl font-extrabold text-xs uppercase tracking-widest shadow-lg shadow-gold/30 transition-all hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
                >
                  {remaining === 0 ? 'Tier Sold Out' : `Acquire Membership ($${typeof price === 'number' ? price.toFixed(0) : price})`}
                </button>
                <div className="flex items-center justify-between text-[10px] font-mono text-cream/50 pt-0.5 px-1">
                  <span>🔒 Card issued upon checkout</span>
                  <button 
                    type="button"
                    onClick={() => setIsFlipped(false)}
                    className="text-gold/80 hover:text-gold underline cursor-pointer"
                  >
                    Preview Metal Face ↶
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FanCard;
