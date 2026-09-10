import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-midnight text-cream py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="font-display text-2xl font-semibold mb-4 text-gold">Dan + Shay</h3>
            <p className="font-body text-sm text-cream/80 leading-relaxed">
              Experience the magic of Dan + Shay on The Young Tour 2026. Get your premium tickets, exclusive meet & greet passes, and collectible fan cards.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4 text-rose">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/events" className="font-body text-sm text-cream/80 hover:text-gold transition-colors">Events</Link>
              </li>
              <li>
                <Link to="/meet-and-greet" className="font-body text-sm text-cream/80 hover:text-gold transition-colors">Meet & Greet</Link>
              </li>
              <li>
                <Link to="/fan-cards" className="font-body text-sm text-cream/80 hover:text-gold transition-colors">Fan Cards</Link>
              </li>
              <li>
                <Link to="/my-tickets" className="font-body text-sm text-cream/80 hover:text-gold transition-colors">My Tickets</Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4 text-rose">Connect</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-cream/80 hover:text-gold transition-colors" title="Instagram">Instagram</a>
              <a href="#" className="text-cream/80 hover:text-gold transition-colors" title="Twitter">Twitter</a>
              <a href="#" className="text-cream/80 hover:text-gold transition-colors" title="YouTube">YouTube</a>
              <a href="#" className="text-cream/80 hover:text-gold transition-colors" title="TikTok">TikTok</a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gold/30 text-center">
          <p className="font-body text-sm text-gold">
            &copy; 2026 Dan + Shay. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
