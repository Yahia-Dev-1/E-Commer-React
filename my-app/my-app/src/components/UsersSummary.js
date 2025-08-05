import React from 'react';
import './UsersSummary.css';

export default function UsersSummary({ users, adminEmails }) {
  const totalUsers = users.length;
  const totalAdmins = users.filter(user => adminEmails.includes(user.email)).length;
  const totalRegularUsers = totalUsers - totalAdmins;

  return (
    <div className="users-summary-container">
      <h3 className="summary-title">User Statistics</h3>
      <div className="summary-grid">
        <div className="summary-card total">
          <div className="card-content">
            <span className="card-value">{totalUsers}</span>
            <span className="card-label">Total Users</span>
          </div>
          <div className="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
        </div>
        
        <div className="summary-card admins">
          <div className="card-content">
            <span className="card-value">{totalAdmins}</span>
            <span className="card-label">Admins</span>
          </div>
          <div className="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 7h-8v12h8V7zM4 7h8v12H4z"></path>
              <rect x="4" y="7" width="16" height="12"></rect>
              <circle cx="12" cy="11" r="1"></circle>
              <path d="M12 12v3"></path>
            </svg>
          </div>
        </div>

        <div className="summary-card users">
          <div className="card-content">
            <span className="card-value">{totalRegularUsers}</span>
            <span className="card-label">Regular Users</span>
          </div>
          <div className="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
