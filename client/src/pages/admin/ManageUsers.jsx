import React, { useState, useEffect } from 'react';
import api from '../../api';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/admin/users');
        if (res.data) setUsers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto pt-24">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-midnight">Manage Users</h1>
        <p className="text-gray-500 mt-2">View registered users and their details.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><div className="animate-spin w-8 h-8 border-4 border-midnight border-t-transparent rounded-full"></div></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500">Name</th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500">Email</th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500">Role</th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500">Registered Date</th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500 text-right">Orders Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-bold text-midnight">{user.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-bold ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.created_at || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-midnight">
                      {user.orders_count || 0}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-500">No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
