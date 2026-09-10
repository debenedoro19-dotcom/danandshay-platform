import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';

const MeetGreetPass = ({ pkg, user }) => {
  const [showModal, setShowModal] = useState(false);

  const title = pkg.title || pkg.package_title || 'VIP Meet & Greet Experience';
  const orderId = pkg.order_id || pkg.id || 2001;
  const status = pkg.status || 'pending_approval';
  const city = pkg.location_city || pkg.event_city || 'Nashville';
  const state = pkg.location_state || pkg.event_state || 'TN';
  const venue = pkg.event_venue || pkg.venue || 'VIP Lounge & Soundcheck Stage';
  const price = pkg.price || pkg.total || 400;
  const perks = pkg.perks || 'Private Meet & Greet with Dan + Shay, Professional Photo, Signed Tour Laminate, Soundcheck Access';
  const attendeeName = user?.name || 'VIP Guest';

  const vipToken = `DS26-VIP-${orderId}-MG${pkg.meet_greet_id || 1}-CONFIRMED`;
  const qrPayload = `https://danandshay-platform.onrender.com/verify-vip?order=${orderId}&token=${vipToken}`;

  return (
    <>
      <div className="bg-gradient-to-b from-slate-900 via-midnight to-black text-white rounded-2xl shadow-2xl border-2 border-gold/70 overflow-hidden relative font-sans hover:shadow-gold/20 transition-all flex flex-col justify-between">
        
        {/* Lanyard Hole Simulation */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-3 bg-black rounded-full border border-gold/60 flex items-center justify-center">
          <div className="w-8 h-1 bg-midnight rounded-full"></div>
        </div>

        {/* Top Metallic Banner */}
        <div className="pt-6 pb-4 px-6 text-center border-b border-gold/30 bg-gradient-to-r from-gold/10 via-gold/20 to-gold/10">
          <span className="text-[10px] font-mono font-black tracking-widest text-gold uppercase block">
            OFFICIAL ARTIST VIP CREDENTIAL
          </span>
          <h3 className="text-2xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-gold to-amber-400 mt-1">
            {title}
          </h3>
          <p className="text-xs text-gray-300 mt-0.5 font-medium">
            Dan + Shay: The Young Tour 2026
          </p>
        </div>

        {/* Pass Body */}
        <div className="p-6 space-y-5">
          
          {/* Location & Schedule Badge */}
          <div className="bg-white/5 border border-gold/30 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[10px] text-gold font-bold uppercase tracking-wider block">VIP Venue & Location</span>
              <strong className="text-white text-sm block">{city}, {state}</strong>
              <span className="text-gray-400 text-[11px]">{venue}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Arrival Time</span>
              <strong className="text-gold font-mono font-bold block">4:30 PM SHARP</strong>
              <span className="text-[10px] text-emerald-400 font-bold">2 Hours Pre-Doors</span>
            </div>
          </div>

          {/* Attendee Details & Verification Status */}
          <div className="flex items-center justify-between text-xs border-y border-white/10 py-3">
            <div>
              <span className="text-gray-400 text-[10px] uppercase block font-semibold">VIP Credential Issued To</span>
              <strong className="text-white text-sm">{attendeeName}</strong>
            </div>
            <div className="text-right">
              <span className="text-gray-400 text-[10px] uppercase block font-semibold">Pass Status</span>
              {status === 'confirmed' || status === 'active' ? (
                <span className="text-emerald-400 font-bold font-mono">CONFIRMED PASS ✓</span>
              ) : status === 'rejected' ? (
                <span className="text-red-400 font-bold font-mono">FAILED ✕</span>
              ) : (
                <span className="text-amber-400 font-bold font-mono">VERIFIED • ACTIVE ⚡</span>
              )}
            </div>
          </div>

          {/* Perks Summary Checklist */}
          <div>
            <span className="text-[11px] font-extrabold text-gold uppercase tracking-wider block mb-2">
              VIP Privileges Included:
            </span>
            <div className="bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-gray-300 space-y-1.5 leading-relaxed">
              {perks.split(',').map((p, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-gold font-bold">★</span>
                  <span>{p.trim()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scannable VIP QR Code Area */}
          <div className="flex items-center justify-between gap-4 bg-white/5 border border-gold/30 rounded-xl p-3.5">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
                VIP SCAN AT CHECK-IN
              </span>
              <div className="text-xs font-mono font-bold text-gold">
                PASS TOKEN #{orderId}
              </div>
              <p className="text-[10px] text-gray-400">
                Present at VIP Check-in Table with valid Photo ID matching purchaser.
              </p>
            </div>

            <div 
              onClick={() => setShowModal(true)}
              className="p-2 bg-white rounded-lg cursor-pointer hover:scale-105 transition-transform flex-shrink-0"
              title="Click to expand QR Code"
            >
              <QRCodeSVG
                value={qrPayload}
                size={80}
                level="H"
                includeMargin={false}
                className="w-16 h-16 sm:w-20 sm:h-20"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-black/60 px-6 py-3 border-t border-gold/30 flex items-center justify-between text-xs">
          <span className="font-mono text-[10px] text-gray-400">{vipToken}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="px-3 py-1 bg-gold text-midnight hover:bg-yellow-400 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Expand ⤢
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
              title="Print VIP Laminate"
            >
              🖨️
            </button>
          </div>
        </div>
      </div>

      {/* Full-Screen VIP Pass Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/90 backdrop-blur-md overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-midnight rounded-2xl max-w-sm w-full p-6 shadow-2xl border-2 border-gold text-center relative space-y-4 text-white"
            >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 cursor-pointer"
              >
                ✕
              </button>

              <div className="w-12 h-12 rounded-full bg-gold/20 text-gold flex items-center justify-center mx-auto text-xl font-bold">
                ✨
              </div>

              <div>
                <span className="text-[11px] font-mono font-bold tracking-widest text-gold uppercase block">
                  DAN + SHAY • VIP BACKSTAGE CREDENTIAL
                </span>
                <h3 className="text-xl font-display font-bold text-white mt-0.5">
                  {title}
                </h3>
                <p className="text-xs text-gray-300 mt-1 font-medium">
                  {city}, {state} • {venue}
                </p>
              </div>

              {/* Large QR Code */}
              <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-gold/60 inline-block">
                <QRCodeSVG
                  value={qrPayload}
                  size={200}
                  level="H"
                  includeMargin={false}
                  className="w-48 h-48 mx-auto"
                />
              </div>

              <div className="space-y-1 text-xs">
                <div className="font-bold text-gold font-mono text-sm">
                  ATTENDEE: {attendeeName}
                </div>
                <div className="text-gray-300 font-mono">
                  CHECK-IN: 4:30 PM SHARP
                </div>
                <div className="text-[10px] text-gray-400 font-mono tracking-wider">
                  {vipToken}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full py-2.5 bg-gold text-midnight font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-yellow-400 transition-colors cursor-pointer"
                >
                  Close Credential
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MeetGreetPass;
