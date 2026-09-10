import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MeetGreetCard from '../components/MeetGreetCard';
import CheckoutForm from '../components/CheckoutForm';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const US_STATES = [
  { code: 'AL', name: 'Alabama', cities: ['Birmingham', 'Huntsville', 'Montgomery', 'Mobile', 'Tuscaloosa'] },
  { code: 'AK', name: 'Alaska', cities: ['Anchorage', 'Fairbanks', 'Juneau', 'Wasilla'] },
  { code: 'AZ', name: 'Arizona', cities: ['Phoenix', 'Scottsdale', 'Tucson', 'Mesa', 'Chandler', 'Tempe'] },
  { code: 'AR', name: 'Arkansas', cities: ['Little Rock', 'Fayetteville', 'Fort Smith', 'Springdale', 'Bentonville'] },
  { code: 'CA', name: 'California', cities: ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento', 'San Jose', 'Oakland', 'Anaheim'] },
  { code: 'CO', name: 'Colorado', cities: ['Denver', 'Colorado Springs', 'Boulder', 'Fort Collins', 'Aspen', 'Aurora'] },
  { code: 'CT', name: 'Connecticut', cities: ['Hartford', 'New Haven', 'Stamford', 'Bridgeport', 'Waterbury'] },
  { code: 'DE', name: 'Delaware', cities: ['Wilmington', 'Dover', 'Newark', 'Rehoboth Beach'] },
  { code: 'DC', name: 'District of Columbia', cities: ['Washington D.C.'] },
  { code: 'FL', name: 'Florida', cities: ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale', 'Tallahassee', 'St. Petersburg'] },
  { code: 'GA', name: 'Georgia', cities: ['Atlanta', 'Savannah', 'Augusta', 'Athens', 'Macon', 'Alpharetta'] },
  { code: 'HI', name: 'Hawaii', cities: ['Honolulu', 'Maui', 'Hilo', 'Kailua'] },
  { code: 'ID', name: 'Idaho', cities: ['Boise', 'Meridian', 'Idaho Falls', 'Nampa', 'Coeur d\'Alene'] },
  { code: 'IL', name: 'Illinois', cities: ['Chicago', 'Peoria', 'Rockford', 'Springfield', 'Naperville', 'Rosemont'] },
  { code: 'IN', name: 'Indiana', cities: ['Indianapolis', 'Noblesville', 'Fort Wayne', 'Bloomington', 'South Bend', 'Evansville'] },
  { code: 'IA', name: 'Iowa', cities: ['Des Moines', 'Cedar Rapids', 'Davenport', 'Iowa City'] },
  { code: 'KS', name: 'Kansas', cities: ['Wichita', 'Overland Park', 'Kansas City', 'Topeka', 'Olathe'] },
  { code: 'KY', name: 'Kentucky', cities: ['Louisville', 'Lexington', 'Bowling Green', 'Owensboro', 'Covington'] },
  { code: 'LA', name: 'Louisiana', cities: ['New Orleans', 'Baton Rouge', 'Shreveport', 'Lafayette', 'Metairie'] },
  { code: 'ME', name: 'Maine', cities: ['Portland', 'Bangor', 'Augusta', 'Lewiston'] },
  { code: 'MD', name: 'Maryland', cities: ['Baltimore', 'Annapolis', 'Bethesda', 'Silver Spring', 'Rockville'] },
  { code: 'MA', name: 'Massachusetts', cities: ['Boston', 'Cambridge', 'Worcester', 'Springfield', 'Lowell'] },
  { code: 'MI', name: 'Michigan', cities: ['Detroit', 'Grand Rapids', 'Ann Arbor', 'Lansing', 'Sterling Heights'] },
  { code: 'MN', name: 'Minnesota', cities: ['Minneapolis', 'Saint Paul', 'Rochester', 'Duluth', 'Bloomington'] },
  { code: 'MS', name: 'Mississippi', cities: ['Jackson', 'Gulfport', 'Biloxi', 'Southaven', 'Hattiesburg'] },
  { code: 'MO', name: 'Missouri', cities: ['Kansas City', 'St. Louis', 'Springfield', 'Columbia', 'Independence'] },
  { code: 'MT', name: 'Montana', cities: ['Billings', 'Missoula', 'Bozeman', 'Helena', 'Great Falls'] },
  { code: 'NE', name: 'Nebraska', cities: ['Omaha', 'Lincoln', 'Bellevue', 'Grand Island'] },
  { code: 'NV', name: 'Nevada', cities: ['Las Vegas', 'Reno', 'Henderson', 'Carson City', 'Sparks'] },
  { code: 'NH', name: 'New Hampshire', cities: ['Manchester', 'Nashua', 'Concord', 'Portsmouth'] },
  { code: 'NJ', name: 'New Jersey', cities: ['Newark', 'Jersey City', 'Atlantic City', 'Princeton', 'Trenton', 'Hoboken'] },
  { code: 'NM', name: 'New Mexico', cities: ['Albuquerque', 'Santa Fe', 'Las Cruces', 'Rio Rancho'] },
  { code: 'NY', name: 'New York', cities: ['New York City', 'Buffalo', 'Rochester', 'Albany', 'Syracuse', 'White Plains'] },
  { code: 'NC', name: 'North Carolina', cities: ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Asheville', 'Wilmington'] },
  { code: 'ND', name: 'North Dakota', cities: ['Fargo', 'Bismarck', 'Grand Forks', 'Minot'] },
  { code: 'OH', name: 'Ohio', cities: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton'] },
  { code: 'OK', name: 'Oklahoma', cities: ['Oklahoma City', 'Tulsa', 'Norman', 'Broken Arrow', 'Edmond'] },
  { code: 'OR', name: 'Oregon', cities: ['Portland', 'Eugene', 'Salem', 'Bend', 'Beaverton'] },
  { code: 'PA', name: 'Pennsylvania', cities: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Hershey', 'Erie', 'Scranton'] },
  { code: 'RI', name: 'Rhode Island', cities: ['Providence', 'Warwick', 'Cranston', 'Newport'] },
  { code: 'SC', name: 'South Carolina', cities: ['Charleston', 'Columbia', 'Greenville', 'Myrtle Beach', 'Spartanburg'] },
  { code: 'SD', name: 'South Dakota', cities: ['Sioux Falls', 'Rapid City', 'Aberdeen', 'Brookings'] },
  { code: 'TN', name: 'Tennessee', cities: ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville', 'Murfreesboro'] },
  { code: 'TX', name: 'Texas', cities: ['Austin', 'Houston', 'Dallas', 'Fort Worth', 'San Antonio', 'El Paso', 'Arlington'] },
  { code: 'UT', name: 'Utah', cities: ['Salt Lake City', 'Provo', 'West Valley City', 'Park City', 'Orem'] },
  { code: 'VT', name: 'Vermont', cities: ['Burlington', 'Montpelier', 'Rutland', 'South Burlington'] },
  { code: 'VA', name: 'Virginia', cities: ['Virginia Beach', 'Richmond', 'Norfolk', 'Alexandria', 'Arlington', 'Charlottesville'] },
  { code: 'WA', name: 'Washington', cities: ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Olympia'] },
  { code: 'WV', name: 'West Virginia', cities: ['Charleston', 'Huntington', 'Morgantown', 'Parkersburg'] },
  { code: 'WI', name: 'Wisconsin', cities: ['Milwaukee', 'Madison', 'Green Bay', 'Kenosha', 'Racine'] },
  { code: 'WY', name: 'Wyoming', cities: ['Cheyenne', 'Casper', 'Jackson Hole', 'Laramie'] },
];

const MeetGreetPage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Nationwide Location State
  const [selectedStateCode, setSelectedStateCode] = useState('TN');
  const [selectedCity, setSelectedCity] = useState('Nashville');
  const [customCity, setCustomCity] = useState('');
  const [isCustomCity, setIsCustomCity] = useState(false);

  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const currentState = US_STATES.find(s => s.code === selectedStateCode) || US_STATES[0];
  const effectiveCity = isCustomCity ? (customCity.trim() || 'Custom Venue') : selectedCity;

  useEffect(() => {
    const fetchPkgs = async () => {
      try {
        const res = await api.get('/meetgreet');
        if (res.data) setPackages(res.data);
      } catch (err) {
        console.error('Failed to load meet & greet packages:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPkgs();
  }, []);

  const handleStateChange = (newCode) => {
    setSelectedStateCode(newCode);
    const stateObj = US_STATES.find(s => s.code === newCode);
    if (stateObj && stateObj.cities.length > 0) {
      setSelectedCity(stateObj.cities[0]);
      setIsCustomCity(false);
      setCustomCity('');
    }
  };

  const handleCitySelectChange = (val) => {
    if (val === '__custom__') {
      setIsCustomCity(true);
    } else {
      setIsCustomCity(false);
      setSelectedCity(val);
    }
  };

  const handleBook = (pkg) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedPkg(pkg);
    setShowCheckout(true);
  };

  const handleCheckoutSubmit = async (paymentData) => {
    await api.post('/meetgreet/book', { 
      packageId: selectedPkg.id, 
      locationState: currentState.name,
      locationCity: effectiveCity,
      ...paymentData 
    });
    const res = await api.get('/meetgreet');
    if (res.data) setPackages(res.data);
    setSelectedPkg(null);
  };

  return (
    <div className="min-h-screen bg-cream pt-20 pb-20">
      {/* Dan + Shay Photo Banner */}
      <div className="relative bg-midnight text-white overflow-hidden py-16 mb-10 border-b border-gold/30">
        <div 
          className="absolute inset-0 opacity-30 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1920&q=80')` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-midnight via-midnight/90 to-midnight/60"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <span className="inline-block text-gold text-xs font-bold uppercase tracking-widest px-3.5 py-1 bg-gold/10 border border-gold/30 rounded-full mb-3 shadow-sm">
              Official VIP Experience • Available Nationwide
            </span>
            <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-white mb-4">
              Meet Dan + Shay In Person
            </h1>
            <p className="text-lg text-cream/80 font-light leading-relaxed">
              Step backstage for a private meet & greet, exclusive soundcheck rehearsal access, signed tour guitars, and unforgettable memories with Dan Smyers & Shay Mooney in your chosen US city.
            </p>
          </div>
          
          <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden border-2 border-gold/50 shadow-2xl flex-shrink-0 relative group">
            <img 
              src="https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80" 
              alt="Dan + Shay"
              className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-midnight/80 to-transparent flex items-end p-2.5">
              <span className="text-[11px] font-bold text-gold tracking-wider uppercase">Live On Tour</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Nationwide US Location Selector Box */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-lg border border-gold/40 mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl">📍</span>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-charcoal">
                  Select Your Meet & Greet Location
                </h2>
                <span className="bg-gold/15 text-gold-dark text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase border border-gold/30">
                  All 50 US States
                </span>
              </div>
              <p className="text-sm text-charcoal/70">
                Choose your preferred US State and City. Your VIP experience is guaranteed at a private venue or partner lounge in your chosen area.
              </p>
            </div>

            {/* Live Location Badge */}
            <div className="flex-shrink-0 bg-gradient-to-r from-amber-50 to-orange-50 border border-gold/40 rounded-xl px-4 py-3 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center text-lg">
                ✨
              </div>
              <div>
                <div className="text-[10px] uppercase font-mono tracking-wider text-charcoal/60 font-bold">Selected Destination</div>
                <div className="text-base font-extrabold text-midnight font-display">
                  {effectiveCity}, {currentState.name}
                </div>
              </div>
            </div>
          </div>

          {/* Form Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
            {/* State Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-2">
                1. Choose US State:
              </label>
              <select
                value={selectedStateCode}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full bg-cream/40 border border-gray-300 hover:border-gold focus:border-gold focus:ring-2 focus:ring-gold/20 rounded-xl px-4 py-3 text-sm font-semibold text-charcoal outline-none transition-all cursor-pointer"
              >
                {US_STATES.map(s => (
                  <option key={s.code} value={s.code}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            {/* City Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-2">
                2. Choose City in {currentState.name}:
              </label>
              <select
                value={isCustomCity ? '__custom__' : selectedCity}
                onChange={(e) => handleCitySelectChange(e.target.value)}
                className="w-full bg-cream/40 border border-gray-300 hover:border-gold focus:border-gold focus:ring-2 focus:ring-gold/20 rounded-xl px-4 py-3 text-sm font-semibold text-charcoal outline-none transition-all cursor-pointer"
              >
                {currentState.cities.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="__custom__">✏️ Other City / Custom Venue...</option>
              </select>
            </div>

            {/* Custom City Text Input (Conditional) */}
            <div className={isCustomCity ? 'block' : 'hidden lg:block'}>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-2">
                {isCustomCity ? '3. Enter Your Specific City/Venue:' : '3. Special Venue Preference (Optional):'}
              </label>
              <input
                type="text"
                placeholder={isCustomCity ? 'e.g., San Jose, CA or Local Arena' : 'Optional custom venue or lounge'}
                value={customCity}
                onChange={(e) => {
                  setCustomCity(e.target.value);
                  if (!isCustomCity && e.target.value.trim().length > 0) {
                    setIsCustomCity(true);
                  }
                }}
                className="w-full bg-cream/40 border border-gray-300 hover:border-gold focus:border-gold focus:ring-2 focus:ring-gold/20 rounded-xl px-4 py-3 text-sm text-charcoal outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* The 4 Exclusive VIP Categories */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display font-extrabold text-midnight">
              Choose From 4 Exclusive VIP Categories
            </h2>
            <p className="text-xs text-charcoal/60 mt-1">
              Select your package tier below to proceed to gift card payment.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-gold-dark bg-gold/10 px-3 py-1 rounded-full border border-gold/30">
            4 VIP Packages Available
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map(pkg => (
              <MeetGreetCard 
                key={pkg.id} 
                pkg={pkg} 
                selectedCity={effectiveCity}
                selectedState={currentState.name}
                onBook={handleBook} 
              />
            ))}
          </div>
        )}
      </div>

      {showCheckout && selectedPkg && (
        <CheckoutForm 
          items={[{ 
            name: `${selectedPkg.title} — ${effectiveCity}, ${currentState.name}`, 
            price: selectedPkg.price 
          }]}
          total={selectedPkg.price}
          onSubmit={handleCheckoutSubmit}
          onCancel={() => setShowCheckout(false)}
          type="meetgreet"
        />
      )}
    </div>
  );
};

export default MeetGreetPage;
