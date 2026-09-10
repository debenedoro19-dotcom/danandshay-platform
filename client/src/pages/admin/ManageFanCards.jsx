import React, { useState, useEffect } from 'react';
import api from '../../api';

const ManageFanCards = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCard, setCurrentCard] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', image_url: '', rarity: 'Common', price: 0, total_supply: 100, remaining: 100
  });

  const fetchCards = async () => {
    try {
      const res = await api.get('/admin/fancards');
      if (res.data) setCards(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const openModal = (card = null) => {
    if (card) {
      setCurrentCard(card);
      setFormData({ ...card });
    } else {
      setCurrentCard(null);
      setFormData({ title: '', description: '', image_url: '', rarity: 'Common', price: 10, total_supply: 100, remaining: 100 });
    }
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentCard) {
        await api.put(`/admin/fancards/${currentCard.id}`, formData);
      } else {
        await api.post('/admin/fancards', formData);
      }
      setIsModalOpen(false);
      fetchCards();
    } catch (err) {
      alert("Error saving card");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await api.delete(`/admin/fancards/${id}`);
        fetchCards();
      } catch (err) {
        alert("Error deleting card");
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto pt-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-display font-bold text-midnight">Manage Fan Cards</h1>
        <button 
          onClick={() => openModal()}
          className="bg-gold hover:bg-gold-dark text-midnight font-bold py-2 px-4 rounded shadow transition-colors"
        >
          + Add Card
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><div className="animate-spin w-8 h-8 border-4 border-midnight border-t-transparent rounded-full"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map(card => (
            <div key={card.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col">
              <div className="h-40 overflow-hidden relative">
                <img src={card.image_url || 'https://via.placeholder.com/300'} alt={card.title} className="w-full h-full object-cover" />
                <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded ${
                  card.rarity === 'Legendary' ? 'bg-gold text-midnight' : 
                  card.rarity === 'Rare' ? 'bg-blue-500 text-white' : 'bg-gray-300'
                }`}>
                  {card.rarity}
                </span>
              </div>
              <div className="p-4 flex-grow flex flex-col">
                <h3 className="font-bold text-lg mb-1">{card.title}</h3>
                <div className="text-xl font-bold text-gold-dark mb-2">${card.price}</div>
                <div className="text-sm text-gray-500 mb-4 flex-grow">
                  Supply: {card.remaining} / {card.total_supply}
                </div>
                <div className="flex gap-2 mt-auto">
                  <button onClick={() => openModal(card)} className="flex-1 bg-gray-100 hover:bg-gray-200 py-1 rounded text-sm font-bold">Edit</button>
                  <button onClick={() => handleDelete(card.id)} className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 py-1 rounded text-sm font-bold">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h2 className="text-xl font-bold">{currentCard ? 'Edit Card' : 'Add New Card'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-black font-bold text-xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="w-full border p-2 rounded focus:ring-2 focus:ring-gold outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="2" className="w-full border p-2 rounded focus:ring-2 focus:ring-gold outline-none"></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Image URL</label>
                <input type="text" name="image_url" value={formData.image_url} onChange={handleInputChange} className="w-full border p-2 rounded focus:ring-2 focus:ring-gold outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Rarity</label>
                  <select name="rarity" value={formData.rarity} onChange={handleInputChange} className="w-full border p-2 rounded focus:ring-2 focus:ring-gold outline-none">
                    <option value="Common">Common</option>
                    <option value="Rare">Rare</option>
                    <option value="Legendary">Legendary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Price ($)</label>
                  <input type="number" name="price" value={formData.price} onChange={handleInputChange} required min="0" step="0.01" className="w-full border p-2 rounded focus:ring-2 focus:ring-gold outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Total Supply</label>
                  <input type="number" name="total_supply" value={formData.total_supply} onChange={handleInputChange} required min="1" className="w-full border p-2 rounded focus:ring-2 focus:ring-gold outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Remaining</label>
                  <input type="number" name="remaining" value={formData.remaining} onChange={handleInputChange} required min="0" className="w-full border p-2 rounded focus:ring-2 focus:ring-gold outline-none" />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded font-bold hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-midnight text-white rounded font-bold hover:bg-charcoal">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFanCards;
