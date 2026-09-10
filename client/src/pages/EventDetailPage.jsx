import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SeatMap from '../components/SeatMap';
import MeetGreetCard from '../components/MeetGreetCard';
import CheckoutForm from '../components/CheckoutForm';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [mgPackages, setMgPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutType, setCheckoutType] = useState('tickets'); // 'tickets' or 'meetgreet'
  const [selectedMgPkg, setSelectedMgPkg] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/events/${id}`);
      if (res.data) {
        setEvent(res.data.event);
        setSeats(res.data.seats || []);
        setMgPackages(res.data.meetGreetPackages || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSeatToggle = (seatId) => {
    setSelectedSeatIds(prev => 
      prev.includes(seatId) 
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    );
  };

  const selectedSeatsData = seats.filter(s => selectedSeatIds.includes(s.id));
  const ticketTotal = selectedSeatsData.reduce((sum, s) => sum + Number(s.price), 0);

  const handleBookTicket = () => {
    if (!user) return navigate('/login');
    setCheckoutType('tickets');
    setShowCheckout(true);
  };

  const handleBookMg = (pkg) => {
    if (!user) return navigate('/login');
    setSelectedMgPkg(pkg);
    setCheckoutType('meetgreet');
    setShowCheckout(true);
  };

  const handleCheckoutSubmit = async (paymentData) => {
    if (checkoutType === 'tickets') {
      await api.post('/tickets/purchase', { 
        eventId: id, 
        seatIds: selectedSeatIds,
        ...paymentData
      });
      setSelectedSeatIds([]);
      fetchData(); // refresh seats
    } else if (checkoutType === 'meetgreet' && selectedMgPkg) {
      await api.post('/meetgreet/book', { 
        packageId: selectedMgPkg.id,
        ...paymentData
      });
      setSelectedMgPkg(null);
      fetchData(); // refresh MG packages
    }
  };

  if (loading) return <div className="min-h-screen pt-24 flex items-center justify-center bg-cream"><div className="animate-spin w-12 h-12 border-4 border-gold border-t-transparent rounded-full"></div></div>;
  if (!event) return <div className="min-h-screen pt-24 text-center">Event not found</div>;

  return (
    <div className="bg-cream min-h-screen pb-20">
      {/* Banner */}
      <div 
        className="h-80 w-full relative bg-midnight flex items-end"
        style={{
          backgroundImage: `linear-gradient(to top, rgba(26,26,46,1), rgba(26,26,46,0.3)), url(${event.image_url || 'https://images.unsplash.com/photo-1540039155732-6761b54cbaca?w=1920'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 pb-10 w-full text-white">
          <div className="inline-block bg-gold text-midnight font-bold px-3 py-1 rounded mb-4 text-sm">
            {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-2">{event.title}</h1>
          <p className="text-xl opacity-90 flex items-center">
            <svg className="w-6 h-6 mr-2 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            {event.venue} — {event.city}, {event.state}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content - Seat Map */}
          <div className="lg:w-2/3">
            <h2 className="text-2xl font-display font-bold text-charcoal mb-6 border-b border-gold/30 pb-2">Select Your Seats</h2>
            <SeatMap 
              seats={seats} 
              selectedSeats={selectedSeatIds}
              onSeatToggle={handleSeatToggle}
            />
          </div>

          {/* Sidebar - Summary */}
          <div className="lg:w-1/3">
            <div className="sticky top-24 bg-white rounded-xl shadow-lg border border-blush overflow-hidden">
              <div className="bg-midnight text-white p-4">
                <h3 className="font-display font-bold text-lg">Order Summary</h3>
              </div>
              
              <div className="p-5">
                <div className="min-h-[150px] max-h-[300px] overflow-y-auto custom-scrollbar mb-4">
                  {selectedSeatsData.length === 0 ? (
                    <div className="text-gray-400 text-center py-10 text-sm">
                      No seats selected. Click on the map to select seats.
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {selectedSeatsData.map(seat => (
                        <li key={seat.id} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                          <div>
                            <span className="font-bold text-charcoal">{seat.section}</span>
                            <span className="text-gray-500 ml-2">Row {seat.row}, Seat {seat.seat_number}</span>
                          </div>
                          <span className="font-bold text-gold-dark">${seat.price}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="border-t border-gold/30 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-charcoal">Total</span>
                    <span className="text-2xl font-display font-bold text-midnight">${ticketTotal}</span>
                  </div>
                </div>

                <button 
                  onClick={handleBookTicket}
                  disabled={selectedSeatIds.length === 0}
                  className="w-full bg-gold hover:bg-gold-dark text-midnight font-bold py-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceed to Checkout
                </button>

                {/* Pricing Legend */}
                <div className="mt-8 bg-cream p-4 rounded-lg text-sm">
                  <h4 className="font-bold text-charcoal mb-2 uppercase tracking-wide text-xs">Pricing Tiers</h4>
                  <div className="space-y-1 text-gray-600">
                    <div className="flex justify-between"><span>VIP</span><span>$250</span></div>
                    <div className="flex justify-between"><span>Floor</span><span>$150</span></div>
                    <div className="flex justify-between"><span>Balcony</span><span>$75</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Meet & Greet Section */}
        {mgPackages.length > 0 && (
          <div className="mt-24">
            <h2 className="text-3xl font-display font-bold text-charcoal mb-2 text-center">Upgrade Your Experience</h2>
            <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">Add a VIP Meet & Greet package to make your night unforgettable.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {mgPackages.map(pkg => (
                <MeetGreetCard 
                  key={pkg.id}
                  pkg={{...pkg, event_title: event.title, event_date: event.date, venue: event.venue, city: event.city}}
                  onBook={handleBookMg}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {showCheckout && (
        <CheckoutForm 
          items={checkoutType === 'tickets' 
            ? selectedSeatsData.map(s => ({ name: `${s.section} - Row ${s.row}, Seat ${s.seat_number}`, price: s.price }))
            : [{ name: selectedMgPkg.title + ' Package', price: selectedMgPkg.price }]
          }
          total={checkoutType === 'tickets' ? ticketTotal : selectedMgPkg.price}
          onSubmit={handleCheckoutSubmit}
          onCancel={() => setShowCheckout(false)}
          type={checkoutType}
        />
      )}
    </div>
  );
};

export default EventDetailPage;
