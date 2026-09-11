import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';

const MeetGreetPass = ({ pkg, user }) => {
  const status = pkg.status || 'pending_approval';
  const isApproved = status === 'completed' || status === 'approved' || status === 'active';
  const isRejected = status === 'rejected';

  // Approved passes default to front (false); pending/rejected default to back (true)
  const [isFlipped, setIsFlipped] = useState(!isApproved);
  const [showModal, setShowModal] = useState(false);

  const title = pkg.title || pkg.package_title || 'VIP Meet & Greet Experience';
  const orderId = pkg.order_id || pkg.id || 2001;
  const city = pkg.location_city || pkg.event_city || 'Nashville';
  const state = pkg.location_state || pkg.event_state || 'TN';
  const venue = pkg.event_venue || pkg.venue || 'VIP Lounge & Soundcheck Stage';
  const price = pkg.price || pkg.total || 400;
  const perks = pkg.perks || 'Private Meet & Greet with Dan + Shay, Professional Photo, Signed Tour Laminate, Soundcheck Access';
  const attendeeName = user?.name || 'VIP Guest';

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://danandshaytour.online';
  const vipToken = `DS26-VIP-${orderId}-MG${pkg.meet_greet_id || 1}-CONFIRMED`;
  const qrPayload = `${baseUrl}/verify-vip?order=${orderId}&token=${vipToken}`;

  return (
    <>
      <div className="relative font-sans print:shadow-none print:border-black min-h-[520px]">
        {/* Card Flip Transition Wrapper */}
        <motion.div 
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative w-full h-full"
        >
          {/* ========================================================== */}
          {/* FRONT FACE: Displayed when approved                      */}
          {/* ========================================================== */}
          <div 
            style={{ backfaceVisibility: 'hidden' }}
            className={`bg-gradient-to-b from-slate-900 via-midnight to-black text-white rounded-2xl shadow-2xl border-2 border-gold/70 overflow-hidden relative transition-all flex flex-col justify-between ${
              isFlipped ? 'pointer-events-none' : ''
            }`}
          >
            {/* Lanyard Hole Simulation */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-3 bg-black rounded-full border border-gold/60 flex items-center justify-center z-10">
              <div className="w-8 h-1 bg-midnight rounded-full"></div>
            </div>

            {/* Top Metallic Banner */}
            <div className="pt-6 pb-4 px-6 text-center border-b border-gold/30 bg-gradient-to-r from-gold/10 via-gold/20 to-gold/10 relative">
              <span className="text-[10px] font-mono font-black tracking-widest text-gold uppercase block">
                OFFICIAL ARTIST VIP CREDENTIAL
              </span>
              <h3 className="text-2xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-gold to-amber-400 mt-1">
                {title}
              </h3>
              <p className="text-xs text-gray-300 mt-0.5 font-medium">
                Dan + Shay: The Young Tour 2026
              </p>

              {/* Flip Button */}
              <button
                type="button"
                onClick={() => setIsFlipped(true)}
                className="absolute top-3 right-3 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-gold text-[10px] font-bold border border-gold/40 flex items-center gap-1 cursor-pointer"
                title="Flip to back"
              >
                <span>🔄 Flip</span>
              </button>
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

              {/* Attendee Details & Status */}
              <div className="flex items-center justify-between text-xs border-y border-white/10 py-3">
                <div>
                  <span className="text-gray-400 text-[10px] uppercase block font-semibold">VIP Credential Issued To</span>
                  <strong className="text-white text-sm">{attendeeName}</strong>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 text-[10px] uppercase block font-semibold">Pass Status</span>
                  <span className="text-emerald-400 font-bold font-mono">CONFIRMED PASS ✓</span>
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
                  <div className="text-[10px] text-gray-400 font-mono">
                    Non-Transferable Official Laminate
                  </div>
                </div>

                <div 
                  onClick={() => setShowModal(true)}
                  className="p-2 bg-white rounded-xl shadow-lg border border-gold/50 cursor-pointer hover:scale-105 transition-transform"
                  title="Click to expand QR Pass"
                >
                  <QRCodeSVG 
                    value={qrPayload}
                    size={76}
                    level="H"
                    includeMargin={false}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Strip */}
            <div className="bg-black/80 px-6 py-3 border-t border-gold/30 flex items-center justify-between text-[10px] font-mono text-gray-400">
              <span>ORDER: <strong className="text-gold">#{orderId}</strong></span>
              <span>AUTHENTICATED ARTIST CREDENTIAL</span>
            </div>
          </div>

          {/* ========================================================== */}
          {/* BACK FACE: Displayed while Pending Approval               */}
          {/* ========================================================== */}
          <div 
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
            className={`bg-gradient-to-br from-black via-zinc-950 to-midnight text-white rounded-2xl shadow-2xl border-2 ${
              isApproved ? 'border-gold/50' : 'border-amber-400/80'
            } overflow-hidden absolute inset-0 w-full flex flex-col justify-between ${
              !isFlipped ? 'pointer-events-none' : ''
            }`}
          >
            {/* Lanyard Hole Simulation */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-3 bg-black rounded-full border border-gold/60 flex items-center justify-center z-10">
              <div className="w-8 h-1 bg-midnight rounded-full"></div>
            </div>

            {/* Top Banner */}
            <div className="pt-6 pb-3 px-6 text-center border-b border-gold/30 bg-black/60 relative">
              <span className="text-[10px] font-mono font-black tracking-widest text-gold uppercase block">
                VIP CREDENTIAL REVERSE
              </span>
              <h4 className="text-lg font-display font-bold text-white mt-0.5">
                {title}
              </h4>
              <p className="text-[11px] text-gray-400">
                Official Security & Verification Protocol
              </p>

              {isApproved && (
                <button
                  type="button"
                  onClick={() => setIsFlipped(false)}
                  className="absolute top-3 right-3 px-2 py-0.5 rounded bg-gold text-midnight text-[10px] font-bold shadow cursor-pointer"
                >
                  View Front
                </button>
              )}
            </div>

            {/* Back Main Content */}
            <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
              {!isApproved ? (
                /* Pending State */
                <div className="space-y-4 text-center my-auto">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border-2 border-amber-400 flex items-center justify-center text-3xl mx-auto shadow-inner">
                    🔒
                  </div>

                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/60 uppercase tracking-wide mb-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                      <span>VIP Pass Locked: Pending Approval</span>
                    </div>
                    <h3 className="text-xl font-display font-bold text-white">
                      Authentication in Progress
                    </h3>
                  </div>

                  <div className="bg-black/60 border border-amber-500/30 rounded-xl p-4 text-xs text-cream/90 text-left space-y-2 leading-relaxed">
                    <p>
                      Your VIP Meet & Greet order (<strong>#{orderId}</strong>) has been logged and sent to executive administration for gift card verification.
                    </p>
                    <p className="text-amber-200/80">
                      <strong>Check-in credentials, backstage itinerary, and entry QR codes remain sealed on this reverse side until authenticated.</strong>
                    </p>
                    <div className="pt-1 flex items-center gap-2 text-emerald-400 text-[11px] font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Once approved by admin, this credential will automatically flip over to reveal your check-in pass.</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="w-full py-2.5 bg-white/10 hover:bg-white/20 border border-amber-400/50 text-amber-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Refresh Verification Status ⟳
                  </button>
                </div>
              ) : (
                /* Approved State */
                <div className="space-y-4 my-auto">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-xl text-emerald-300 flex-shrink-0">
                      ✓
                    </div>
                    <div>
                      <div className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest font-extrabold">
                        Credential Verified
                      </div>
                      <h4 className="text-base font-display font-bold text-white">
                        VIP Backstage Protocol
                      </h4>
                    </div>
                  </div>

                  <div className="bg-black/50 border border-gold/20 rounded-xl p-4 text-xs text-gray-300 space-y-2 leading-relaxed">
                    <p><strong>• Arrival Check-In:</strong> Report to the VIP check-in table at the main entrance exactly at <strong>4:30 PM</strong>.</p>
                    <p><strong>• Photo Verification:</strong> Please bring a government photo ID matching <strong>{attendeeName}</strong>.</p>
                    <p><strong>• Laminate Collection:</strong> Physical metallic tour laminates and signed merch bundles will be handed to you upon turnstile scan.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsFlipped(false)}
                    className="w-full py-2.5 bg-gold text-midnight font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-yellow-400 transition-colors shadow cursor-pointer"
                  >
                    ← Flip to VIP Check-In Pass & QR
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Strip */}
            <div className="bg-black px-6 py-3 border-t border-gold/30 flex items-center justify-between text-[10px] font-mono text-gray-400">
              <span>STATUS: <strong className={isApproved ? "text-emerald-400" : "text-amber-400"}>{isApproved ? "VERIFIED" : "PENDING CLEARANCE"}</strong></span>
              <span>DAN + SHAY THE YOUNG TOUR 2026</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal for QR Enlargement */}
      <AnimatePresence>
        {showModal && isApproved && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-midnight border-2 border-gold rounded-2xl max-w-sm w-full p-6 text-center text-white space-y-4"
            >
              <h3 className="text-xl font-display font-bold text-gold">{title}</h3>
              <p className="text-xs text-gray-300">VIP Check-In Barcode</p>
              <div className="p-4 bg-white rounded-2xl inline-block">
                <QRCodeSVG value={qrPayload} size={200} level="H" />
              </div>
              <div className="text-xs font-mono text-gold-dark">{vipToken}</div>
              <button 
                onClick={() => setShowModal(false)}
                className="w-full py-2 bg-gold text-midnight font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MeetGreetPass;
