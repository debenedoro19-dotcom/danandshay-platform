import React, { useState, useEffect } from 'react';
import api from '../../api';

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '', date: '', venue: '', city: '', state: '', 
    description: '', image_url: '', is_featured: false
  });

  const fetchEvents = async () => {
    try {
      const res = await api.get('/admin/events');
      if (res.data) setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openModal = (event = null) => {
    if (event) {
      setCurrentEvent(event);
      // Format date for input type="datetime-local" if needed, simplified here
      setFormData({
        ...event,
        date: event.date ? new Date(event.date).toISOString().split('T')[0] : ''
      });
    } else {
      setCurrentEvent(null);
      setFormData({ title: '', date: '', venue: '', city: '', state: '', description: '', image_url: '', is_featured: false });
    }
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentEvent) {
        await api.put(`/admin/events/${currentEvent.id}`, formData);
      } else {
        await api.post('/admin/events', formData);
      }
      setIsModalOpen(false);
      fetchEvents();
    } catch (err) {
      alert("Error saving event");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await api.delete(`/admin/events/${id}`);
        fetchEvents();
      } catch (err) {
        alert("Error deleting event");
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto pt-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-display font-bold text-midnight">Manage Events</h1>
        <button 
          onClick={() => openModal()}
          className="bg-gold hover:bg-gold-dark text-midnight font-bold py-2 px-4 rounded shadow transition-colors"
        >
          + Add Event
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><div className="animate-spin w-8 h-8 border-4 border-midnight border-t-transparent rounded-full"></div></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">Event</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">Date</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">Location</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">Featured</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map(event => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-midnight">{event.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(event.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{event.venue}, {event.city}</td>
                  <td className="px-6 py-4">
                    {event.is_featured ? <span className="bg-gold text-midnight text-xs px-2 py-1 rounded font-bold">Yes</span> : '-'}
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => openModal(event)} className="text-blue-600 hover:text-blue-800 text-sm font-bold">Edit</button>
                    <button onClick={() => handleDelete(event.id)} className="text-red-600 hover:text-red-800 text-sm font-bold">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50 sticky top-0">
              <h2 className="text-xl font-bold">{currentEvent ? 'Edit Event' : 'Add New Event'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-black font-bold text-xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="w-full border p-2 rounded focus:ring-2 focus:ring-gold outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                  <input type="date" name="date" value={formData.date} onChange={handleInputChange} required className="w-full border p-2 rounded focus:ring-2 focus:ring-gold outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Venue</label>
                  <input type="text" name="venue" value={formData.venue} onChange={handleInputChange} required className="w-full border p-2 rounded focus:ring-2 focus:ring-gold outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} required className="w-full border p-2 rounded focus:ring-2 focus:ring-gold outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleInputChange} required className="w-full border p-2 rounded focus:ring-2 focus:ring-gold outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Image URL</label>
                  <input type="text" name="image_url" value={formData.image_url} onChange={handleInputChange} className="w-full border p-2 rounded focus:ring-2 focus:ring-gold outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full border p-2 rounded focus:ring-2 focus:ring-gold outline-none"></textarea>
                </div>
                <div className="col-span-2 flex items-center">
                  <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleInputChange} id="is_featured" className="w-4 h-4 text-gold focus:ring-gold" />
                  <label htmlFor="is_featured" className="ml-2 text-sm font-bold text-gray-700">Featured Event</label>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded font-bold hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-midnight text-white rounded font-bold hover:bg-charcoal">Save Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEvents;
