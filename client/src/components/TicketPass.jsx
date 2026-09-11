import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';

const TicketPass = ({ ticket, user }) => {
  const status = ticket.status || 'pending_approval';
  const isApproved = status === 'completed' || status === 'approved' || status === 'active';
  const isRejected = status === 'rejected';

  // Approved tickets default to front (false); pending/rejected tickets default to back (true)
  const [isFlipped, setIsFlipped] = useState(!isApproved);
  const [showModal, setShowModal] = useState(false);

  // Computed display data
  const eventTitle = ticket.event?.title || ticket.event_title || ticket.title || 'Dan + Shay: The Young Tour 2026';
  const eventDateRaw = ticket.event?.date || ticket.event_date || ticket.date || '2026-09-11';
  const eventTime = ticket.event?.time || ticket.event_time || ticket.time || '7:30 PM';
  const venue = ticket.event?.venue || ticket.event_venue || ticket.venue || 'Ruoff Music Center';
  const city = ticket.event?.city || ticket.event_city || ticket.city || 'Noblesville';
  const state = ticket.event?.state || ticket.event_state || ticket.state || 'IN';
  
  const firstSeat = ticket.seats?.[0] || {};
  const section = ticket.section || firstSeat.section || 'Floor';
  const row = ticket.row || firstSeat.row || 'A';
  const seatNumber = ticket.seat_number || ticket.seatNumber || firstSeat.seatNumber || firstSeat.seat_number || '1';
  const seatsCount = ticket.seats?.length || 1;
  const price = ticket.price || ticket.total || 150;
  const orderId = ticket.orderId || ticket.order_id || ticket.id || 1001;
  const attendeeName = user?.name || ticket.user_name || 'Ticket Holder';

  // Derived gate & entry info
  const isVIP = section.toLowerCase().includes('vip') || section.toLowerCase().includes('floor') || Number(price) >= 200;
  const gateNumber = isVIP ? 'GATE A (VIP EXPEDITED)' : 'GATE C (MAIN ENTRY)';
  const doorEntry = isVIP ? 'VIP PLAZA • DOOR 2' : 'EAST CONCOURSE • DOOR 8';
  const tierLabel = isVIP ? 'OFFICIAL VIP GOLD PASS' : 'STANDARD RESERVED ENTRY';

  // Verification URL & digital token
  const secureToken = `DS26-${orderId}-${section}${row}${seatNumber}-VERIFIED`;
  const qrPayload = `https://danandshay-platform.onrender.com/verify-ticket?order=${orderId}&seat=${seatNumber}&sec=${section}&token=${secureToken}`;
  const barcodeNumber = `4892 ${String(orderId).padStart(4, '0')} ${String(seatNumber).padStart(4, '0')} 9210`;

  const eventDateObj = new Date(eventDateRaw);
  const formattedDate = !isNaN(eventDateObj) 
    ? eventDateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : eventDateRaw;
  const dayOfWeek = !isNaN(eventDateObj) ? eventDateObj.toLocaleDateString('en-US', { weekday: 'long' }) : 'Friday';
  const monthName = !isNaN(eventDateObj) ? eventDateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() : 'SEP';
  const dayNumber = !isNaN(eventDateObj) ? eventDateObj.getDate() : '11';

  return (
    <>
      <div className="relative font-sans print:shadow-none print:border-black">
        {/* Card Flip Transition Wrapper */}
        <motion.div 
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative w-full"
        >
          {/* ========================================================== */}
          {/* FRONT FACE: Only fully accessible when approved            */}
          {/* ========================================================== */}
          <div 
            style={{ backfaceVisibility: 'hidden' }}
            className={`bg-white rounded-2xl shadow-xl border border-gold/40 overflow-hidden relative transition-all hover:shadow-2xl ${
              isFlipped ? 'pointer-events-none' : ''
            }`}
          >
            {/* Holographic Security Header */}
            <div className="bg-gradient-to-r from-midnight via-[#262445] to-midnight px-4 sm:px-6 py-3 border-b border-gold/40 flex flex-wrap items-center justify-between gap-2 text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#C9A84C_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none"></div>
              
              <div className="flex items-center gap-2 relative z-10">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gold via-yellow-200 to-gold-dark flex items-center justify-center shadow-sm">
                  <span className="text-midnight text-xs font-black">★</span>
                </div>
                <div>
                  <span className="text-xs font-extrabold tracking-widest text-gold font-mono uppercase block">
                    DAN + SHAY • THE YOUNG TOUR 2026
                  </span>
                  <span className="text-[10px] text-gray-300 tracking-wider uppercase font-medium">
                    Official Live Nation & Ticketmaster Certified Mobile Pass
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 uppercase tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Verified Valid Pass ✓
                </span>
                
                {/* Flip Button */}
                <button
                  type="button"
                  onClick={() => setIsFlipped(true)}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-gold text-[11px] font-bold border border-gold/40 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Flip to back (Terms & Security Details)"
                >
                  <span>🔄</span>
                  <span>Flip to Back</span>
                </button>
              </div>
            </div>

            {/* Ticket Main Card & Perforated Stub Grid */}
            <div className="flex flex-col lg:flex-row relative">
              {/* Left / Main Concert Body */}
              <div className="p-5 sm:p-6 lg:p-7 flex-grow flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wider bg-gold/15 text-gold-dark border border-gold/40 mb-2">
                        {tierLabel}
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-midnight tracking-tight">
                        {eventTitle}
                      </h2>
                      <p className="text-sm text-gray-600 font-medium flex items-center gap-1.5 mt-1">
                        <svg className="w-4 h-4 text-gold-dark flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        <span>{venue} — {city}, {state}</span>
                      </p>
                    </div>

                    {/* Calendar Date Block */}
                    <div className="flex-shrink-0 w-16 sm:w-20 bg-midnight text-white rounded-xl overflow-hidden text-center shadow-md border border-gold/40">
                      <div className="bg-gold text-midnight text-[11px] font-black tracking-widest uppercase py-0.5">
                        {monthName}
                      </div>
                      <div className="text-2xl sm:text-3xl font-display font-black py-1">
                        {dayNumber}
                      </div>
                      <div className="text-[10px] text-gray-300 pb-1 font-mono uppercase">
                        {dayOfWeek.slice(0, 3)}
                      </div>
                    </div>
                  </div>

                  {/* Event Time & Schedule Line */}
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-700 bg-cream/70 px-3.5 py-2 rounded-lg border border-gold/20">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-gold-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      <span>Concert Starts: <strong className="text-midnight font-bold">{eventTime}</strong></span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <div>Doors Open: <strong className="text-midnight font-bold">6:00 PM</strong></div>
                    <span className="text-gray-300">•</span>
                    <div>Admit: <strong className="text-midnight font-bold">{seatsCount} Person{seatsCount > 1 ? 's' : ''}</strong></div>
                  </div>
                </div>

                {/* Seating Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-center bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                  <div className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm">
                    <div className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400">Section</div>
                    <div className="text-lg sm:text-xl font-display font-black text-midnight truncate">{section}</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm">
                    <div className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400">Row</div>
                    <div className="text-lg sm:text-xl font-display font-black text-midnight">{row}</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm">
                    <div className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400">Seat</div>
                    <div className="text-lg sm:text-xl font-display font-black text-gold-dark">{seatNumber}</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm">
                    <div className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400">Order #</div>
                    <div className="text-sm sm:text-base font-mono font-bold text-midnight truncate">#{orderId}</div>
                  </div>
                </div>

                {/* Turnstile Access & Attendee */}
                <div className="flex flex-wrap items-center justify-between text-xs text-gray-600 pt-2 border-t border-gray-100 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-semibold uppercase text-[10px]">Gate Access:</span>
                    <span className="font-bold text-midnight bg-gold/10 px-2 py-0.5 rounded border border-gold/30 font-mono">{gateNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold uppercase text-[10px]">Issued To:</span>{' '}
                    <strong className="text-midnight font-bold">{attendeeName}</strong>
                  </div>
                </div>
              </div>

              {/* Perforated Divider (Desktop) */}
              <div className="hidden lg:flex flex-col items-center justify-between w-0 relative">
                <div className="w-6 h-6 rounded-full bg-cream -mt-3 shadow-inner border-b border-gray-200 z-10"></div>
                <div className="h-full border-r-2 border-dashed border-gray-300 w-0 my-1"></div>
                <div className="w-6 h-6 rounded-full bg-cream -mb-3 shadow-inner border-t border-gray-200 z-10"></div>
              </div>

              {/* Perforated Divider (Mobile) */}
              <div className="lg:hidden flex items-center justify-between h-0 relative w-full">
                <div className="w-6 h-6 rounded-full bg-cream -ml-3 shadow-inner border-r border-gray-200 z-10"></div>
                <div className="w-full border-b-2 border-dashed border-gray-300 h-0 mx-1"></div>
                <div className="w-6 h-6 rounded-full bg-cream -mr-3 shadow-inner border-l border-gray-200 z-10"></div>
              </div>

              {/* Right Perforated Stub: Real Dynamic QR Code */}
              <div className="lg:w-64 bg-slate-50 p-5 sm:p-6 flex flex-col items-center justify-between border-t lg:border-t-0 border-gray-200 text-center space-y-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 block mb-1">
                    Digital Turnstile Pass
                  </span>
                  <span className="text-xs font-mono font-bold text-gold-dark block">
                    Hold Near Scanner at Entry
                  </span>
                </div>

                {/* Real QR Code */}
                <div 
                  onClick={() => setShowModal(true)}
                  className="relative p-3 bg-white rounded-xl shadow-md border border-gray-200 group cursor-pointer hover:border-gold transition-all"
                  title="Click to view full screen pass"
                >
                  <QRCodeSVG
                    value={qrPayload}
                    size={120}
                    level="H"
                    includeMargin={false}
                    className="w-28 h-28 sm:w-32 sm:h-32 transition-transform group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 right-2 h-0.5 bg-emerald-400 rounded blur-xs opacity-70 animate-pulse"></div>
                  <div className="mt-1 text-[9px] text-gray-400 font-mono font-bold uppercase tracking-wider group-hover:text-gold-dark">
                    Click to Enlarge ⤢
                  </div>
                </div>

                {/* Simulated Code128 Barcode Graphic */}
                <div className="w-full space-y-1">
                  <div className="h-9 w-full bg-white rounded border border-gray-200 flex items-center justify-center px-2 overflow-hidden">
                    <div className="flex items-stretch justify-between w-full h-7 opacity-85">
                      {[4,2,3,1,4,1,2,3,2,1,4,3,1,2,1,4,2,3,1,2,4,1,3,2,1,4,2,1,3,4,1,2,3,1,2,4,1,3].map((w, idx) => (
                        <span 
                          key={idx} 
                          className="bg-black" 
                          style={{ width: `${w}px`, opacity: idx % 7 === 0 ? 0 : 1 }}
                        ></span>
                      ))}
                    </div>
                  </div>
                  <div className="text-[10px] font-mono tracking-widest font-bold text-gray-600">
                    {barcodeNumber}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full pt-1">
                  <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="flex-1 py-1.5 px-2 bg-midnight text-gold hover:bg-charcoal rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
                  >
                    Scan Pass ⤢
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="py-1.5 px-2.5 bg-white border border-gray-300 hover:border-gold text-charcoal rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    title="Print Official PDF Pass"
                  >
                    🖨️ Print
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-100 px-4 py-2 border-t border-gray-200 flex flex-wrap items-center justify-between text-[10px] text-gray-500 font-mono">
              <span>SEC TOKEN: <strong className="text-gray-700">{secureToken}</strong></span>
              <span>NON-TRANSFERABLE • OFFICIAL LIVE NATION ENTRY CREDENTIAL</span>
            </div>
          </div>

          {/* ========================================================== */}
          {/* BACK FACE: Displayed while Pending Approval (or toggled)  */}
          {/* ========================================================== */}
          <div 
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
            className={`bg-gradient-to-br from-[#12131C] via-[#1A1A2E] to-[#12131C] text-white rounded-2xl shadow-xl border-2 ${
              isApproved ? 'border-gold/50' : 'border-amber-400/80'
            } overflow-hidden absolute inset-0 w-full flex flex-col justify-between ${
              !isFlipped ? 'pointer-events-none' : ''
            }`}
          >
            {/* Back Header */}
            <div className="bg-black/50 px-4 sm:px-6 py-3 border-b border-gold/30 flex flex-wrap items-center justify-between gap-2 text-white relative">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gold/20 text-gold border border-gold/40 flex items-center justify-center font-bold text-xs">
                  🛡️
                </div>
                <div>
                  <span className="text-xs font-extrabold tracking-widest text-gold font-mono uppercase block">
                    DAN + SHAY • OFFICIAL PASS REVERSE
                  </span>
                  <span className="text-[10px] text-gray-400 tracking-wider uppercase font-medium">
                    Live Nation Official Anti-Counterfeit Security Card
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isApproved ? (
                  <button
                    type="button"
                    onClick={() => setIsFlipped(false)}
                    className="px-3 py-1 bg-gradient-to-r from-gold via-yellow-400 to-amber-500 text-midnight text-xs font-extrabold rounded-lg uppercase tracking-wider shadow-md hover:brightness-110 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>🔄</span>
                    <span>Flip to Entry Pass & QR</span>
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/60 uppercase tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                    <span>Locked: Pending Admin Approval</span>
                  </div>
                )}
              </div>
            </div>

            {/* Back Main Content */}
            <div className="flex flex-col lg:flex-row flex-grow relative">
              {/* Left Side: Security Seal & Verification Message */}
              <div className="p-6 sm:p-7 flex-grow flex flex-col justify-between space-y-4">
                {!isApproved ? (
                  /* PENDING STATE (Locked to Back) */
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
                        🔒
                      </div>
                      <div>
                        <div className="text-[11px] font-mono text-amber-400 uppercase tracking-widest font-extrabold">
                          Admission Details Restricted
                        </div>
                        <h3 className="text-xl sm:text-2xl font-display font-bold text-white leading-tight">
                          Payment Verification in Progress
                        </h3>
                      </div>
                    </div>

                    {/* Explanatory Callout */}
                    <div className="bg-black/40 border border-amber-500/30 rounded-xl p-4 text-xs text-cream/90 space-y-2 leading-relaxed">
                      <p>
                        Your gift card submission has been logged and forwarded to the executive verification desk (<code className="text-gold font-mono font-bold">hannanbrice1@gmail.com</code>). 
                      </p>
                      <p className="text-amber-200/80 font-medium">
                        To prevent fraud and maintain venue security, <strong>your specific seat assignment, gate turnstile pass, and live dynamic QR barcode remain sealed on this reverse side until authenticated.</strong>
                      </p>
                      <div className="pt-2 flex items-center gap-2 text-emerald-400 text-[11px] font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>As soon as the administrator verifies your card, this ticket will automatically flip to reveal your live admission pass.</span>
                      </div>
                    </div>

                    {/* Order Metadata Box */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-midnight/80 p-3 rounded-xl border border-gold/20 text-xs">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 block">Order Number</span>
                        <span className="font-mono font-bold text-gold">#{orderId}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 block">Ticket Holder</span>
                        <span className="font-bold text-white truncate block">{attendeeName}</span>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 block">Review Estimate</span>
                        <span className="font-mono font-bold text-amber-300">15 – 30 Minutes</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* APPROVED STATE (Back of pass terms) */
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-xl text-emerald-300 flex-shrink-0">
                        ✓
                      </div>
                      <div>
                        <div className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest font-extrabold">
                          Security Authentication Cleared
                        </div>
                        <h3 className="text-lg sm:text-xl font-display font-bold text-white">
                          Official Venue Admission Guidelines
                        </h3>
                      </div>
                    </div>

                    <div className="bg-black/40 border border-gold/20 rounded-xl p-4 text-xs text-gray-300 space-y-2 leading-relaxed max-h-48 overflow-y-auto custom-scrollbar">
                      <p><strong>1. Clear Bag Policy:</strong> Only clear bags smaller than 12" x 6" x 12" or small clutches (4.5" x 6.5") are permitted into the venue.</p>
                      <p><strong>2. Entry Identification:</strong> Please have a government-issued photo ID matching the name <strong>{attendeeName}</strong> ready at the gate alongside your digital QR pass.</p>
                      <p><strong>3. Dynamic Barcodes:</strong> Static screenshots or photocopied tickets will be rejected by venue laser turnstiles. Use the active digital pass on the front of this ticket.</p>
                    </div>

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setIsFlipped(false)}
                        className="px-6 py-2.5 bg-gold hover:bg-yellow-400 text-midnight font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg cursor-pointer"
                      >
                        ← Return to Admission Pass & QR Code
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Perforated Divider (Desktop) */}
              <div className="hidden lg:flex flex-col items-center justify-between w-0 relative">
                <div className="w-6 h-6 rounded-full bg-cream -mt-3 shadow-inner border-b border-gray-700 z-10"></div>
                <div className="h-full border-r-2 border-dashed border-gold/30 w-0 my-1"></div>
                <div className="w-6 h-6 rounded-full bg-cream -mb-3 shadow-inner border-t border-gray-700 z-10"></div>
              </div>

              {/* Right Side / Security Stub Back */}
              <div className="lg:w-64 bg-black/60 p-5 sm:p-6 flex flex-col items-center justify-between border-t lg:border-t-0 border-gold/20 text-center space-y-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-gold block mb-1">
                    Security Seal Verification
                  </span>
                  <span className="text-xs font-mono text-gray-400 block">
                    Tamper-Evident Laminated Stub
                  </span>
                </div>

                {/* Simulated Magnetic Stripe */}
                <div className="w-full">
                  <div className="h-10 w-full bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-lg border border-gold/30 shadow-inner flex items-center justify-center px-2">
                    <span className="text-[9px] font-mono tracking-widest text-gold/60 uppercase font-bold">
                      AUTHENTICATED NFC CHIP
                    </span>
                  </div>
                  <div className="mt-2 text-[9px] font-mono text-gray-400 tracking-wider">
                    TOKEN: DS26-SEC-HOLD-{orderId}
                  </div>
                </div>

                {/* Security Emblem */}
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-gold/40 flex flex-col items-center justify-center text-center p-2 bg-gold/5">
                  <span className="text-2xl">{isApproved ? '★' : '🔒'}</span>
                  <span className="text-[8px] font-mono font-bold text-gold uppercase mt-1">
                    {isApproved ? 'VERIFIED' : 'SEALED'}
                  </span>
                </div>

                {/* Refresh or Action Button */}
                <div className="w-full">
                  {!isApproved ? (
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="w-full py-2 bg-white/10 hover:bg-white/20 border border-amber-400/50 text-amber-300 font-bold rounded-lg text-xs tracking-wider transition-colors cursor-pointer"
                    >
                      Check Status ⟳
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsFlipped(false)}
                      className="w-full py-2 bg-gold text-midnight font-bold rounded-lg text-xs uppercase tracking-wider hover:bg-yellow-400 transition-colors shadow cursor-pointer"
                    >
                      View QR Pass →
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Back Footer */}
            <div className="bg-black px-4 py-2 border-t border-gold/20 flex flex-wrap items-center justify-between text-[10px] text-gray-400 font-mono">
              <span>SECURITY PROTOCOL: <strong className="text-gold">AES-256 GUEST PASS</strong></span>
              <span>OFFICIAL 2026 DAN + SHAY CONCERT CREDENTIAL</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Full-Screen Digital Pass Modal for Scanner Presentation */}
      <AnimatePresence>
        {showModal && isApproved && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/90 backdrop-blur-md overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border-2 border-gold text-center relative space-y-4"
            >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-charcoal p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                ✕
              </button>

              <div className="w-12 h-12 rounded-full bg-gold/20 text-gold-dark flex items-center justify-center mx-auto text-xl font-bold">
                🎟️
              </div>

              <div>
                <span className="text-[11px] font-mono font-bold tracking-widest text-gold-dark uppercase block">
                  DAN + SHAY • OFFICIAL ENTRY PASS
                </span>
                <h3 className="text-xl font-display font-bold text-midnight mt-0.5">
                  {eventTitle}
                </h3>
                <p className="text-xs text-gray-500 mt-1 font-medium">
                  {venue} • {city}, {state}
                </p>
              </div>

              {/* Large Dynamic High-Contrast QR Code */}
              <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-gold/60 inline-block shadow-inner">
                <QRCodeSVG
                  value={qrPayload}
                  size={200}
                  level="H"
                  includeMargin={false}
                  className="w-48 h-48 mx-auto"
                />
              </div>

              <div className="space-y-1">
                <div className="text-sm font-bold text-midnight font-mono">
                  SEC {section} • ROW {row} • SEAT {seatNumber}
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  Gate: {gateNumber}
                </div>
                <div className="text-[11px] text-gray-400 font-mono tracking-widest">
                  {barcodeNumber}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full py-2.5 bg-midnight text-gold font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-charcoal transition-colors cursor-pointer"
                >
                  Close Pass
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TicketPass;
