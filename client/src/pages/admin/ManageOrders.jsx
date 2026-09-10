import React, { useState, useEffect } from 'react';
import api from '../../api';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending_approval');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedPhotoOrder, setSelectedPhotoOrder] = useState(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [processingId, setProcessingId] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  const getOrderImages = (order) => {
    if (!order) return [];
    if (order.gift_card_images) {
      try {
        const parsed = JSON.parse(order.gift_card_images);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.filter(Boolean);
      } catch (e) {
        console.error("Failed to parse gift_card_images", e);
      }
    }
    if (order.gift_card_image) return [order.gift_card_image];
    return [];
  };

  const handleOpenPhotoModal = (order) => {
    setSelectedPhotoOrder(order);
    setActivePhotoIndex(0);
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/admin/orders');
      if (res.data) setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleApprove = async (orderId) => {
    if (!window.confirm(`Approve Order #${orderId} and issue official tickets/passes to the customer?`)) return;
    setProcessingId(orderId);
    try {
      await api.post(`/admin/orders/${orderId}/approve`);
      setActionSuccess(`Order #${orderId} approved successfully! Confirmation email dispatched.`);
      setTimeout(() => setActionSuccess(''), 4000);
      if (selectedPhotoOrder?.id === orderId) setSelectedPhotoOrder(null);
      await fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve order');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (orderId) => {
    const reason = window.prompt(
      'Enter reason for rejection (this will be sent to the customer):',
      'Gift card photo is unreadable or card number could not be authenticated.'
    );
    if (reason === null) return;

    setProcessingId(orderId);
    try {
      await api.post(`/admin/orders/${orderId}/reject`, { reason });
      setActionSuccess(`Order #${orderId} rejected. Inventory restored.`);
      setTimeout(() => setActionSuccess(''), 4000);
      if (selectedPhotoOrder?.id === orderId) setSelectedPhotoOrder(null);
      await fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject order');
    } finally {
      setProcessingId(null);
    }
  };

  const pendingCount = orders.filter(o => o.status === 'pending_approval').length;

  const filteredOrders = orders.filter(order => {
    const matchStatus = statusFilter === 'all' ? true : order.status === statusFilter;
    const matchType = typeFilter === 'all' ? true : order.type === typeFilter;
    return matchStatus && matchType;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto pt-24 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 border border-gold/40 text-gold-dark text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <span>🛡️ Manual Payment Authentication</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-midnight">
            Order Approvals & Payments
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review customer gift card photos and manually authenticate orders before issuing tickets or VIP passes.
          </p>
        </div>

        {/* Notifications badge */}
        <div className="flex items-center gap-3">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-sm">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping"></span>
            <div>
              <div className="text-xs text-amber-800 font-bold uppercase tracking-wider">Awaiting Review</div>
              <div className="text-lg font-extrabold text-amber-900 leading-none">{pendingCount} Pending</div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-300 text-green-800 text-sm font-medium flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">✓</span>
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess('')} className="text-green-700 hover:text-green-900 font-bold text-sm">✕</button>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6 flex flex-wrap items-center justify-between gap-4">
        
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setStatusFilter('pending_approval')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              statusFilter === 'pending_approval' 
                ? 'bg-amber-500 text-midnight shadow-md shadow-amber-500/20 font-extrabold' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>Pending Approvals</span>
            {pendingCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                statusFilter === 'pending_approval' ? 'bg-midnight text-amber-300' : 'bg-amber-500 text-white'
              }`}>
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'all' 
                ? 'bg-midnight text-white shadow-md' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'completed' 
                ? 'bg-green-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Approved ({orders.filter(o => o.status === 'completed' || o.status === 'confirmed').length})
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'rejected' 
                ? 'bg-red-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Rejected ({orders.filter(o => o.status === 'rejected').length})
          </button>
        </div>

        {/* Type Filter Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-gray-500 uppercase tracking-wider">Type:</span>
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 px-3 py-1.5 rounded-xl font-medium focus:ring-2 focus:ring-gold outline-none bg-gray-50 text-charcoal"
          >
            <option value="all">All Types</option>
            <option value="ticket">Concert Tickets</option>
            <option value="meet_greet">VIP Meet & Greet</option>
            <option value="fan_card">VIP Fan Cards</option>
          </select>
        </div>
      </div>

      {/* Orders List Table */}
      {loading ? (
        <div className="flex justify-center p-16">
          <div className="animate-spin w-10 h-10 border-4 border-gold border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/80 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5 text-[11px] font-mono uppercase tracking-wider text-gray-500">Order ID</th>
                  <th className="px-6 py-3.5 text-[11px] font-mono uppercase tracking-wider text-gray-500">Customer</th>
                  <th className="px-6 py-3.5 text-[11px] font-mono uppercase tracking-wider text-gray-500">Item Details</th>
                  <th className="px-6 py-3.5 text-[11px] font-mono uppercase tracking-wider text-gray-500">Gift Card Proof</th>
                  <th className="px-6 py-3.5 text-[11px] font-mono uppercase tracking-wider text-gray-500">Amount</th>
                  <th className="px-6 py-3.5 text-[11px] font-mono uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-6 py-3.5 text-[11px] font-mono uppercase tracking-wider text-gray-500 text-right">Authentication Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map(order => {
                  const isPending = order.status === 'pending_approval';
                  const isApproved = order.status === 'completed' || order.status === 'confirmed';
                  const isRejected = order.status === 'rejected';

                  // Format item summary
                  let itemsText = 'Standard Pass';
                  if (order.items && order.items.length > 0) {
                    if (order.type === 'ticket') {
                      itemsText = order.items.map(s => `Sec ${s.section} R${s.row} S${s.seat_number}`).join(', ');
                    } else if (order.type === 'meet_greet') {
                      const locStr = (order.location_city || order.location_state) 
                        ? ` (${order.location_city || ''}, ${order.location_state || ''})` 
                        : '';
                      itemsText = `${order.items[0]?.title || 'VIP Meet & Greet'}${locStr}`;
                    } else if (order.type === 'fan_card') {
                      itemsText = `${order.items[0]?.title || 'Fan Card'} (${order.items[0]?.rarity || ''})`;
                    }
                  }

                  return (
                    <tr key={order.id} className={`hover:bg-gray-50/70 transition-colors ${isPending ? 'bg-amber-50/30' : ''}`}>
                      
                      {/* ID & Date */}
                      <td className="px-6 py-4 font-mono text-xs">
                        <div className="font-bold text-midnight">#{order.id}</div>
                        <div className="text-[10px] text-gray-400">
                          {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-midnight text-sm">{order.user_name || 'Customer'}</div>
                        <div className="text-xs text-gray-500 font-mono">{order.user_email}</div>
                      </td>

                      {/* Items */}
                      <td className="px-6 py-4">
                        <div className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider mb-1 bg-gray-100 text-gray-700">
                          {order.type === 'ticket' ? '🎟️ Tickets' : order.type === 'meet_greet' ? '✨ Meet & Greet' : '🎴 Fan Card'}
                        </div>
                        <div className="text-xs font-medium text-charcoal max-w-xs truncate" title={itemsText}>
                          {order.event_title ? `${order.event_title} — ` : ''}{itemsText}
                        </div>
                      </td>

                      {/* Gift Card Proof */}
                      <td className="px-6 py-4">
                        {(() => {
                          const orderImages = getOrderImages(order);
                          const hasImages = orderImages.length > 0;
                          return (
                            <div className="flex items-center gap-3">
                              {hasImages ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenPhotoModal(order)}
                                  className="w-14 h-10 rounded-lg overflow-hidden border-2 border-gold/60 shadow-sm relative group cursor-pointer flex-shrink-0 bg-black"
                                  title={`Click to inspect ${orderImages.length} gift card photo(s)`}
                                >
                                  <img 
                                    src={orderImages[0]} 
                                    alt="Gift Card Proof" 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                                    🔍
                                  </div>
                                </button>
                              ) : (
                                <div className="w-14 h-10 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center text-[10px] text-gray-400 font-mono">
                                  No Photo
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-midnight truncate">
                                  {order.gift_card_provider || 'Gift Card'}
                                </div>
                                <div className="text-[11px] font-mono font-bold text-gray-600 truncate max-w-[150px]" title={order.gift_card_code}>
                                  {order.gift_card_code || 'N/A'}
                                </div>
                                {hasImages && (
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenPhotoModal(order)}
                                      className="text-[10px] text-gold-dark hover:underline font-bold"
                                    >
                                      Inspect {orderImages.length > 1 ? `Photos (${orderImages.length})` : 'Photo'} ➔
                                    </button>
                                    {orderImages.length > 1 && (
                                      <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[9px] font-mono font-bold">
                                        {orderImages.length} Cards
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 font-mono font-extrabold text-sm text-midnight">
                        ${typeof order.total === 'number' ? order.total.toFixed(2) : order.total}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                            Awaiting Approval
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300">
                            ✓ Approved
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                            ✕ Rejected
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="px-6 py-4 text-right">
                        {isPending ? (
                          <div className="inline-flex items-center gap-2 justify-end">
                            <button
                              onClick={() => handleApprove(order.id)}
                              disabled={processingId === order.id}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-sm transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
                            >
                              {processingId === order.id ? 'Processing...' : '✓ Approve'}
                            </button>
                            <button
                              onClick={() => handleReject(order.id)}
                              disabled={processingId === order.id}
                              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                            >
                              ✕ Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 font-mono">
                            {order.reviewed_at ? `Reviewed ${new Date(order.reviewed_at).toLocaleDateString()}` : 'Archived'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-12 text-center text-gray-400">
                      <div className="text-4xl mb-2">📦</div>
                      <div className="text-sm font-medium">No orders matching current filter.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Gift Card Photo Inspection Modal */}
      {selectedPhotoOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/90 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gold/40 my-auto flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-midnight text-white flex items-center justify-between border-b border-gold/30">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔍</span>
                <div>
                  <h3 className="font-display font-bold text-lg text-white leading-tight">
                    Inspect Gift Card Photo Proof
                  </h3>
                  <p className="text-xs text-gold font-mono">
                    Order #{selectedPhotoOrder.id} • {selectedPhotoOrder.gift_card_provider}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPhotoOrder(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            {(() => {
              const orderImages = getOrderImages(selectedPhotoOrder);
              const currentPhoto = orderImages[activePhotoIndex] || orderImages[0] || selectedPhotoOrder.gift_card_image;

              return (
                <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar space-y-4 flex-1">
                  {/* Multi-card Image Navigation Tabs */}
                  {orderImages.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      <span className="text-xs font-bold text-gray-500 font-mono uppercase tracking-wider mr-1">
                        Uploaded Cards ({orderImages.length}):
                      </span>
                      {orderImages.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActivePhotoIndex(idx)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                            activePhotoIndex === idx
                              ? 'bg-amber-500 text-midnight shadow-sm font-extrabold ring-2 ring-amber-400'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <span>💳 Card #{idx + 1}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Photo Display */}
                  <div className="rounded-xl overflow-hidden border-2 border-gray-200 bg-black flex items-center justify-center min-h-[320px] max-h-[440px] relative">
                    {currentPhoto ? (
                      <img 
                        src={currentPhoto} 
                        alt={`Uploaded Card Proof #${activePhotoIndex + 1}`} 
                        className="max-h-[440px] w-auto object-contain"
                      />
                    ) : (
                      <div className="text-gray-400 text-sm">No photo uploaded for this order</div>
                    )}
                    {orderImages.length > 1 && (
                      <div className="absolute top-2 right-2 bg-midnight/85 backdrop-blur-md px-3 py-1 rounded-md text-xs font-mono text-gold border border-gold/40 shadow">
                        Card {activePhotoIndex + 1} of {orderImages.length}
                      </div>
                    )}
                  </div>

                  {/* Order & Card Information Comparison Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                    <div>
                      <div className="text-gray-500 font-mono uppercase text-[10px]">Customer</div>
                      <div className="font-bold text-midnight text-sm">{selectedPhotoOrder.user_name}</div>
                      <div className="text-[11px] text-gray-500 font-mono truncate">{selectedPhotoOrder.user_email}</div>
                    </div>

                    <div>
                      <div className="text-gray-500 font-mono uppercase text-[10px]">Gift Card Provider</div>
                      <div className="font-bold text-midnight">{selectedPhotoOrder.gift_card_provider}</div>
                      <div className="text-xs text-emerald-700 font-bold font-mono">Order Total: ${selectedPhotoOrder.total}</div>
                    </div>

                    <div className="sm:col-span-3 pt-2 border-t border-gray-200">
                      <div className="text-gray-500 font-mono uppercase text-[10px] mb-1 font-bold">
                        Submitted Card Code(s) & Denominations:
                      </div>
                      <div className="font-mono font-bold text-amber-900 bg-amber-50/90 p-3 rounded-lg border border-amber-200 whitespace-pre-wrap text-xs leading-relaxed">
                        {selectedPhotoOrder.gift_card_code || 'No code provided'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Modal Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() => setSelectedPhotoOrder(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-midnight cursor-pointer"
              >
                Close Preview
              </button>

              {selectedPhotoOrder.status === 'pending_approval' && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleReject(selectedPhotoOrder.id)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-red-100 hover:bg-red-200 text-red-800 transition-colors cursor-pointer"
                  >
                    ✕ Reject Payment
                  </button>
                  <button
                    onClick={() => handleApprove(selectedPhotoOrder.id)}
                    className="px-5 py-2 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all hover:scale-105 cursor-pointer"
                  >
                    ✓ Verify & Approve Payment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;

