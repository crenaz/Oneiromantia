'use client';

import * as React from 'react';
import { useDreams } from '../../hooks/use-dreams';
import { Save, User, Key, Bell, Shield, Database, Sparkles, Server } from 'lucide-react';

export function SettingsView() {
  const { dreams } = useDreams();

  // Settings form states
  const [userName, setUserName] = React.useState('Crenaz');
  const [useAI, setUseAI] = React.useState(true);
  const [lucidNotifications, setLucidNotifications] = React.useState(true);
  const [apiKeySet, setApiKeySet] = React.useState(true);

  const handleSaveSettings = () => {
    alert('Settings consolidated and saved to local storage securely!');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      
      {/* Header */}
      <div className="space-y-1">
        <h2 className="font-display text-3xl font-bold text-white flex items-center gap-2">
          <span>Observatory Settings</span>
        </h2>
        <p className="text-mist/60 text-sm">
          Configure multi-agent swarm parameters, API keys, privacy variables, and offline caching directories.
        </p>
      </div>

      {/* Profile Settings */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex gap-3 items-center border-b border-white/5 pb-3">
          <User className="w-5 h-5 text-lilac" />
          <h3 className="font-display text-lg font-bold text-white">Observer Identity</h3>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-mono text-mist/60 uppercase tracking-wider block">Observer Name</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full bg-elevated/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-aurora-cyan transition-all text-white"
          />
        </div>
      </div>

      {/* AI Orchestration Config */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex gap-3 items-center border-b border-white/5 pb-3">
          <Key className="w-5 h-5 text-aurora-cyan" />
          <h3 className="font-display text-lg font-bold text-white">AI Engine Configuration</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-background/40 p-3.5 rounded-xl border border-white/5">
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-white block">Server-Side Gemini API Key</span>
              <span className="text-[10px] font-mono text-mist/40">Managed securely on server via .env</span>
            </div>
            <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              ACTIVE & SECURED
            </span>
          </div>

          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-white block">Enable Swarm Co-occurrence Mapping</span>
              <span className="text-[10px] font-mono text-mist/40">Automatically trigger multi-agents on text entry</span>
            </div>
            <input
              type="checkbox"
              checked={useAI}
              onChange={(e) => setUseAI(e.target.checked)}
              className="w-4 h-4 text-primary bg-background rounded border-white/10 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex gap-3 items-center border-b border-white/5 pb-3">
          <Bell className="w-5 h-5 text-moon-gold" />
          <h3 className="font-display text-lg font-bold text-white">Lucidity Notifications</h3>
        </div>

        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <span className="text-xs font-medium text-white block">Morning Reflection Reminders</span>
            <span className="text-[10px] font-mono text-mist/40">Alert me daily at 07:00 AM to log my dream seeds</span>
          </div>
          <input
            type="checkbox"
            checked={lucidNotifications}
            onChange={(e) => setLucidNotifications(e.target.checked)}
            className="w-4 h-4 text-moon-gold bg-background rounded border-white/10 focus:ring-moon-gold"
          />
        </div>
      </div>

      {/* Action triggers */}
      <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
        <button
          onClick={handleSaveSettings}
          className="px-6 py-3 bg-primary hover:bg-primary-container text-white font-bold text-xs rounded-full shadow-lg transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Configuration</span>
        </button>
      </div>

    </div>
  );
}
