import React, { useState } from 'react';

export default function UsersList({ users, onEditUser, onDeleteUser, adminEmails }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // Filter users based on search term and filter type
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
    if (filter === 'all') return matchesSearch;
    if (filter === 'admin') return matchesSearch && adminEmails.includes(user.email);
    if (filter === 'regular') return matchesSearch && !adminEmails.includes(user.email);
    return matchesSearch;
  });

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="users-list-container">
      <div className="users-list-header">
        <h2 className="users-list-title">Users Management</h2>
        <div className="users-list-controls">
          <input
            type="text"
            placeholder="Search users..."
            className="users-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="users-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Users</option>
            <option value="admin">Admins Only</option>
            <option value="regular">Regular Users</option>
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.email}>
                <td>{user.name || 'N/A'}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`user-status ${adminEmails.includes(user.email) ? 'admin' : 'regular'}`}>
                    {adminEmails.includes(user.email) ? 'Admin' : 'User'}
                  </span>
                </td>
                <td>{formatDate(user.joinDate)}</td>
                <td>
                  <div className="user-actions">
                    <button 
                      className="user-action-btn edit"
                      onClick={() => onEditUser(user)}
                    >
                      Edit
                    </button>
                    {!adminEmails.includes(user.email) && (
                      <button 
                        className="user-action-btn delete"
                        onClick={() => onDeleteUser(user)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
