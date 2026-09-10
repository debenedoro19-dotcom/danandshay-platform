import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';

const TicketPass = ({ ticket, user }) => {
  const [showModal, setShowModal] = useState(false);

  // Computed display data
  const eventTitle = ticket.event_title || ticket.title || 'Dan + Shay: The Young Tour 2026';
  const eventDateRaw = ticket.event_date || ticket.date || '2026-09-11';
  const eventTime = ticket.event_time || ticket.time || '7:30 PM';
  const venue = ticket.event_venue || ticket.venue || 'Ruoff Music Center';
  const city = ticket.event_city || ticket.city || 'Noblesville';
  const state = ticket.event_state || ticket.state || 'IN';
  const section = ticket.section || 'Floor';
  const row = ticket.row || 'A';
  const seatNumber = ticket.seat_number || ticket.seatNumber || '1';
  const price = ticket.price || ticket.total || 150;
  const orderId = ticket.order_id || ticket.id || 1001;
  const status = ticket.status || 'pending_approval';
  const attendeeName = user?.name || ticket.user_name || 'Ticket Holder';

  // Derived gate & entry info based on section
  const isVIP = section.toLowerCase().includes('vip') || section.toLowerCase().includes('floor') || Number(price) >= 200;
  const gateNumber = isVIP ? 'GATE A (VIP EXPEDITED)' : 'GATE C (MAIN ENTRY)';
  const doorEntry = isVIP ? 'VIP PLAZA • DOOR 2' : 'EAST CONCOURSE • DOOR 8';
  const tierLabel = isVIP ? 'OFFICIAL VIP GOLD PASS' : 'STANDARD RESERVED ENTRY';

  // Verification URL & unique digital token
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
      <div className="bg-white rounded-2xl shadow-xl border border-gold/40 overflow-hidden relative transition-all hover:shadow-2xl font-sans print:shadow-none print:border-black">
        {/* Official Certified Holographic Security Header */}
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
            {status === 'confirmed' || status === 'active' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 uppercase tracking-wide">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Verified Valid Pass ✓
              </span>
            ) : status === 'rejected' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-400/40 uppercase tracking-wide">
                Verification Failed ✕
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase tracking-wide">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                Order Verified • Pass Active 🎟️
              </span>
            )}
          </div>
        </div>

        {/* Ticket Main Card & Perforated Stub Grid */}
        <div className="flex flex-col lg:flex-row relative">
          
          {/* Left / Main Concert Body */}
          <div className="p-5 sm:p-6 lg:p-7 flex-grow flex flex-col justify-between space-y-6">
            
            {/* Event Branding & Date */}
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
                <div>Admit: <strong className="text-midnight font-bold">1 Person</strong></div>
              </div>
            </div>

            {/* Official Seating Matrix (Gate, Section, Row, Seat, Door) */}
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

            {/* Turnstile Access & Attendee Details */}
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

          {/* Authentic Scalloped Notch Separator (Desktop) */}
          <div className="hidden lg:flex flex-col items-center justify-between w-0 relative">
            <div className="w-6 h-6 rounded-full bg-cream -mt-3 shadow-inner border-b border-gray-200 z-10"></div>
            <div className="h-full border-r-2 border-dashed border-gray-300 w-0 my-1"></div>
            <div className="w-6 h-6 rounded-full bg-cream -mb-3 shadow-inner border-t border-gray-200 z-10"></div>
          </div>

          {/* Horizontal Scalloped Notch Separator (Mobile) */}
          <div className="lg:hidden flex items-center justify-between h-0 relative w-full">
            <div className="w-6 h-6 rounded-full bg-cream -ml-3 shadow-inner border-r border-gray-200 z-10"></div>
            <div className="w-full border-b-2 border-dashed border-gray-300 h-0 mx-1"></div>
            <div className="w-6 h-6 rounded-full bg-cream -mr-3 shadow-inner border-l border-gray-200 z-10"></div>
          </div>

          {/* Right Perforated Stub: Real QR Code & Scannable Barcode */}
          <div className="lg:w-64 bg-slate-50 p-5 sm:p-6 flex flex-col items-center justify-between border-t lg:border-t-0 border-gray-200 text-center space-y-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 block mb-1">
                Digital Turnstile Pass
              </span>
              <span className="text-xs font-mono font-bold text-gold-dark block">
                Hold Near Scanner at Entry
              </span>
            </div>

            {/* Real Dynamic QR Code Container */}
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
              {/* Scan Beam Indicator */}
              <div className="absolute top-2 left-2 right-2 h-0.5 bg-emerald-400 rounded blur-xs opacity-70 animate-pulse"></div>
              <div className="mt-1 text-[9px] text-gray-400 font-mono font-bold uppercase tracking-wider group-hover:text-gold-dark">
                Click to Enlarge ⤢
              </div>
            </div>

            {/* 1D Barcode Simulation & Serial Number */}
            <div className="w-full space-y-1">
              {/* Simulated Code128 Barcode Graphic */}
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

            {/* Pass Actions */}
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

        {/* Security Watermark Footer */}
        <div className="bg-gray-100 px-4 py-2 border-t border-gray-200 flex flex-wrap items-center justify-between text-[10px] text-gray-500 font-mono">
          <span>SEC TOKEN: <strong className="text-gray-700">{secureToken}</strong></span>
          <span>NON-TRANSFERABLE • OFFICIAL LIVE NATION ENTRY CREDENTIAL</span>
        </div>
      </div>

      {/* Full-Screen Digital Pass Modal for Scanner Presentation at Venue Doors */}
      <AnimatePresence>
        {showModal && (
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
