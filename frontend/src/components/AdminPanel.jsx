import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Users, FileText, MessageSquare, Loader2 } from 'lucide-react';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const email = JSON.parse(localStorage.getItem('user'))?.email;
        const res = await api.post('/admin/users', { email });
        setUsers(res.data);
      } catch (err) {
        console.error('Failed to load users:', err);
      }
    };
    fetchUsers();
  }, []);

  const handleSelectUser = async (userEmail) => {
    setLoading(true);
    setSelectedUser(userEmail);
    try {
      const [feedbackRes, historyRes] = await Promise.all([
        api.get(`/admin/feedback/${userEmail}`),
        api.get(`/history/${userEmail}`)
      ]);
      setFeedbacks(feedbackRes.data.feedback || []);
      setHistory(historyRes.data);
    } catch (err) {
      console.error('Failed to load user data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-10">
      <h2 className="text-2xl font-bold text-indigo-700 mb-6 flex items-center">
        <Users className="w-6 h-6 mr-2" /> Admin Panel
      </h2>

      {/* User List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {users.map((user) => (
          <button
            key={user.email}
            onClick={() => handleSelectUser(user.email)}
            className={`p-4 rounded-md shadow-sm border hover:border-indigo-500 text-left w-full ${
              selectedUser === user.email ? 'bg-indigo-50' : 'bg-gray-50'
            }`}
          >
            <p className="font-medium text-gray-800">{user.email}</p>
            {user.is_admin && (
              <span className="text-xs text-indigo-600">(Admin)</span>
            )}
          </button>
        ))}
      </div>

      {/* Details Section */}
      {selectedUser && (
        <div className="space-y-6">
          {/* Feedback Logs */}
          <div>
            <h3 className="text-lg font-semibold text-purple-700 flex items-center mb-3">
              <MessageSquare className="w-5 h-5 mr-2" /> Feedback Logs
            </h3>
            <div className="bg-gray-50 rounded-md p-4 border max-h-52 overflow-y-auto text-sm">
              {loading ? (
                <p className="text-gray-500 flex items-center">
                  <Loader2 className="animate-spin mr-2" /> Loading feedback…
                </p>
              ) : feedbacks.length > 0 ? (
                feedbacks.map((f, i) => (
                  <p key={i} className="mb-2">📝 {f}</p>
                ))
              ) : (
                <p className="text-gray-500">No feedback found.</p>
              )}
            </div>
          </div>

          {/* Document History */}
          <div>
            <h3 className="text-lg font-semibold text-purple-700 flex items-center mb-3">
              <FileText className="w-5 h-5 mr-2" /> Document History
            </h3>
            <div className="overflow-x-auto text-sm">
              <table className="min-w-full table-auto border border-gray-300 rounded-md">
                <thead className="bg-indigo-100">
                  <tr>
                    <th className="px-3 py-2 border">Filename</th>
                    <th className="px-3 py-2 border">Language</th>
                    <th className="px-3 py-2 border">Confidence</th>
                    <th className="px-3 py-2 border">Words</th>
                    <th className="px-3 py-2 border">Pages</th>
                    <th className="px-3 py-2 border">Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : history.length > 0 ? (
                    history.map((h, i) => (
                      <tr key={i} className="bg-white border-t">
                        <td className="px-3 py-2 border text-gray-700">{h.filename}</td>
                        <td className="px-3 py-2 border">{h.language}</td>
                        <td className="px-3 py-2 border">{Math.round(h.confidence * 100)}%</td>
                        <td className="px-3 py-2 border">{h.word_count}</td>
                        <td className="px-3 py-2 border">{h.page_count}</td>
                        <td className="px-3 py-2 border text-gray-500">{h.upload_time}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-gray-500">
                        No history available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;