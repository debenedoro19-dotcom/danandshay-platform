import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalUsers: 0, ticketsSold: 0, recentOrders: [] });
  const [loading, setLoading] = useState(true);
  const [testEmail, setTestEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);

  useEffect(() => {
    if (user?.email) {
      setTestEmail(user.email);
    }
  }, [user]);

  const handleSendTestEmails = async (e) => {
    if (e) e.preventDefault();
    const recipient = testEmail || user?.email || 'hannanbrice1@gmail.com';
    setSendingEmail(true);
    setEmailStatus(null);
    try {
      const res = await api.post('/admin/send-test-email', { email: recipient });
      setEmailStatus({ type: 'success', message: res.data.message || `Sample previews dispatched to ${recipient}!` });
    } catch (err) {
      setEmailStatus({ type: 'error', message: err.response?.data?.message || err.message || 'Failed to dispatch test emails' });
    } finally {
      setSendingEmail(false);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        if (res.data) setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch admin stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Pending Approvals', value: (stats.pendingApprovals || 0).toLocaleString(), icon: '⏳', color: 'bg-amber-100 text-amber-800 border-2 border-amber-300' },
    { title: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: '💰', color: 'bg-green-100 text-green-800' },
    { title: 'Total Orders', value: stats.totalOrders.toLocaleString(), icon: '📦', color: 'bg-blue-100 text-blue-800' },
    { title: 'Tickets Sold', value: stats.ticketsSold.toLocaleString(), icon: '🎫', color: 'bg-gold/20 text-gold-dark' }
  ];

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin w-12 h-12 border-4 border-midnight border-t-transparent rounded-full"></div></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto pt-24">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-midnight">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name || 'Admin'}!</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl mr-4 ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <div className="text-gray-500 text-sm font-bold uppercase">{stat.title}</div>
              <div className="text-2xl font-bold text-midnight">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4 text-charcoal">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/admin/events" className="bg-midnight hover:bg-charcoal text-white text-center py-4 rounded-lg font-bold transition-colors shadow-md">
            Manage Events
          </Link>
          <Link to="/admin/orders" className="bg-midnight hover:bg-charcoal text-white text-center py-4 rounded-lg font-bold transition-colors shadow-md">
            Manage Orders
          </Link>
          <Link to="/admin/fan-cards" className="bg-midnight hover:bg-charcoal text-white text-center py-4 rounded-lg font-bold transition-colors shadow-md">
            Manage Fan Cards
          </Link>
          <Link to="/admin/users" className="bg-midnight hover:bg-charcoal text-white text-center py-4 rounded-lg font-bold transition-colors shadow-md">
            Manage Users
          </Link>
        </div>
      </div>

      {/* Live Email System & Template Previewer */}
      <div className="mb-10 bg-gradient-to-r from-midnight via-charcoal to-midnight text-white p-6 rounded-2xl shadow-lg border border-gold/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✉️</span>
              <h2 className="text-xl font-display font-bold text-gold">Live Email Templates Suite</h2>
            </div>
            <p className="text-sm text-gray-300 mt-1 max-w-2xl">
              Dispatch live sample previews of all 7 luxury email templates (Registration Welcome, Turnstile Ticket Passes, VIP Meet & Greet Credentials, 3D Fan Cards, Order Receipts, and Admin Alerts) directly to your inbox.
            </p>
          </div>

          <form onSubmit={handleSendTestEmails} className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
            <input
              type="email"
              required
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="admin@danandshaytour.online"
              className="px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold text-sm w-full sm:w-72"
            />
            <button
              type="submit"
              disabled={sendingEmail}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gold hover:bg-gold-dark text-midnight font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap ${
                sendingEmail ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {sendingEmail ? (
                <>
                  <div className="w-4 h-4 border-2 border-midnight border-t-transparent rounded-full animate-spin"></div>
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Send All 7 Previews</span>
                </>
              )}
            </button>
          </form>
        </div>

        {emailStatus && (
          <div className={`mt-4 p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
            emailStatus.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/40' : 'bg-red-500/20 text-red-300 border border-red-500/40'
          }`}>
            <span>{emailStatus.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{emailStatus.message}</span>
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-charcoal">Recent Orders</h2>
          <Link to="/admin/orders" className="text-gold-dark hover:underline text-sm font-bold">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-gray-500 text-sm border-b">
                <th className="px-6 py-3 font-medium">Order ID</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">#{order.id}</td>
                    <td className="px-6 py-4">{order.user_name || order.user_email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-bold ${
                        order.type === 'ticket' ? 'bg-blue-100 text-blue-800' :
                        order.type === 'meetgreet' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {order.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-midnight">${typeof order.total === 'number' ? order.total.toFixed(2) : order.total}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-bold ${
                        order.status === 'confirmed' || order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No recent orders found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
