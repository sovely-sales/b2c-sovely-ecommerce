import { useState } from 'react';
import { User, Mail, Lock, Bell, Shield, MapPin, Save } from 'lucide-react';
import './Settings.css';

export default function Settings() {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const [activeSection, setActiveSection] = useState('profile');
  const [notif, setNotif] = useState(true);

  return (
    <div className="settings-page container section">
      <div className="settings-header animate-fadeUp">
        <h1 className="page-title">Account Settings</h1>
        <p>Manage your profile, security, and preferences</p>
      </div>

      <div className="settings-container animate-fadeUp" style={{ animationDelay: '0.1s' }}>
        <aside className="settings-nav">
          <button className={activeSection === 'profile' ? 'active' : ''} onClick={() => setActiveSection('profile')}>
            <User size={18} /> Profile
          </button>
          <button className={activeSection === 'security' ? 'active' : ''} onClick={() => setActiveSection('security')}>
            <Shield size={18} /> Security
          </button>
          <button className={activeSection === 'notifications' ? 'active' : ''} onClick={() => setActiveSection('notifications')}>
            <Bell size={18} /> Notifications
          </button>
          <button className={activeSection === 'addresses' ? 'active' : ''} onClick={() => setActiveSection('addresses')}>
            <MapPin size={18} /> Saved Addresses
          </button>
        </aside>

        <main className="settings-content glass">
          {activeSection === 'profile' && (
            <div className="settings-section">
              <h3>Profile Information</h3>
              <div className="profile-upload">
                <div className="avatar-preview">{userData.name?.[0] || 'U'}</div>
                <button className="btn btn-outline btn-sm">Change Avatar</button>
              </div>
              <div className="settings-form">
                <div className="input-row">
                  <div className="input-group">
                    <label>Full Name</label>
                    <input type="text" defaultValue={userData.name} />
                  </div>
                  <div className="input-group">
                    <label>Email Address</label>
                    <input type="email" defaultValue={userData.email} disabled />
                  </div>
                </div>
                <div className="input-group">
                  <label>Bio</label>
                  <textarea placeholder="Tell us about yourself..."></textarea>
                </div>
                <button className="btn btn-primary"><Save size={16} /> Save Changes</button>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="settings-section">
              <h3>Security Settings</h3>
              <div className="settings-form">
                <div className="input-group">
                  <label>Current Password</label>
                  <input type="password" placeholder="••••••••" />
                </div>
                <div className="input-group">
                  <label>New Password</label>
                  <input type="password" placeholder="••••••••" />
                </div>
                <div className="input-group">
                  <label>Confirm New Password</label>
                  <input type="password" placeholder="••••••••" />
                </div>
                <button className="btn btn-primary"><Lock size={16} /> Update Password</button>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="settings-section">
              <h3>Preferences</h3>
              <div className="preference-list">
                <div className="preference-item">
                  <div className="pref-info">
                    <strong>Order Updates</strong>
                    <span>Receive emails about your order status and shipping</span>
                  </div>
                  <input type="checkbox" checked={notif} onChange={() => setNotif(!notif)} className="toggle" />
                </div>
                <div className="preference-item">
                  <div className="pref-info">
                    <strong>Promotional Emails</strong>
                    <span>Get notified about new deals and offers</span>
                  </div>
                  <input type="checkbox" className="toggle" />
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'addresses' && (
             <div className="settings-section">
                <h3>Saved Addresses</h3>
                <p className="text-muted">You can manage your saved addresses here or during checkout.</p>
                <div className="settings-empty">
                   <MapPin size={32} />
                   <p>Navigate to Checkout to add your first address!</p>
                </div>
             </div>
          )}
        </main>
      </div>
    </div>
  );
}
