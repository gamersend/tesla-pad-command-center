
import React, { useState } from 'react';
import { Mail, Search, Inbox, Star, Archive, Trash2, Edit } from 'lucide-react';

const MailApp: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState('gmail');
  const [selectedEmail, setSelectedEmail] = useState<number | null>(null);

  const providers = [
    { id: 'gmail', name: 'Gmail', color: 'from-red-500 to-red-700' },
    { id: 'outlook', name: 'Outlook', color: 'from-blue-500 to-blue-700' },
    { id: 'yahoo', name: 'Yahoo', color: 'from-purple-500 to-purple-700' },
    { id: 'proton', name: 'ProtonMail', color: 'from-purple-600 to-indigo-700' }
  ];

  const emails = [
    {
      id: 1,
      from: 'Tesla Service',
      subject: 'Your Service Appointment Reminder',
      preview: 'Your Tesla service appointment is scheduled for tomorrow at 2:00 PM...',
      time: '10:30 AM',
      unread: true,
      important: true
    },
    {
      id: 2,
      from: 'Supercharger Network',
      subject: 'New Supercharger Location Near You',
      preview: 'A new Supercharger station has opened in your area...',
      time: '9:15 AM',
      unread: true,
      important: false
    },
    {
      id: 3,
      from: 'Tesla Energy',
      subject: 'Your Monthly Energy Report',
      preview: 'See how much you saved with solar this month...',
      time: 'Yesterday',
      unread: false,
      important: false
    },
    {
      id: 4,
      from: 'Work Calendar',
      subject: 'Meeting Update: Project Review',
      preview: 'The meeting location has been changed to Conference Room B...',
      time: 'Yesterday',
      unread: false,
      important: false
    }
  ];

  return (
    <div className="h-full bg-gradient-to-br from-blue-900 via-indigo-900/30 to-purple-900/30 text-white flex">
      {/* Sidebar */}
      <div className="w-80 bg-black/30 border-r border-white/10 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold flex items-center mb-4">
            <Mail className="mr-2" size={24} />
            Mail Client
          </h1>
          
          {/* Provider Selector */}
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white"
          >
            {providers.map(provider => (
              <option key={provider.id} value={provider.id} className="bg-gray-800">
                {provider.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search emails..."
              className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-2 text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <div className="space-y-2">
            {[
              { icon: Inbox, label: 'Inbox', count: 12 },
              { icon: Star, label: 'Starred', count: 3 },
              { icon: Archive, label: 'Archive', count: 0 },
              { icon: Trash2, label: 'Trash', count: 5 }
            ].map((item, index) => (
              <button
                key={index}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center">
                  <item.icon size={18} className="mr-3" />
                  <span>{item.label}</span>
                </div>
                {item.count > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Compose Button */}
        <div className="p-4 border-t border-white/10">
          <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center">
            <Edit size={18} className="mr-2" />
            Compose
          </button>
        </div>
      </div>

      {/* Email List */}
      <div className="w-96 bg-black/20 border-r border-white/10">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-xl font-semibold">Inbox</h2>
          <p className="text-gray-400 text-sm">{emails.filter(e => e.unread).length} unread messages</p>
        </div>
        
        <div className="overflow-y-auto">
          {emails.map(email => (
            <div
              key={email.id}
              onClick={() => setSelectedEmail(email.id)}
              className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${
                selectedEmail === email.id ? 'bg-white/10' : ''
              } ${email.unread ? 'bg-blue-500/10' : ''}`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`font-medium ${email.unread ? 'text-white' : 'text-gray-300'}`}>
                  {email.from}
                </span>
                <span className="text-xs text-gray-400">{email.time}</span>
              </div>
              <h3 className={`text-sm mb-1 ${email.unread ? 'font-semibold' : ''}`}>
                {email.subject}
              </h3>
              <p className="text-xs text-gray-400 line-clamp-2">
                {email.preview}
              </p>
              {email.important && (
                <div className="mt-2">
                  <Star size={12} className="text-yellow-400 fill-current" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Email Content */}
      <div className="flex-1 bg-white/5">
        {selectedEmail ? (
          <div className="h-full flex flex-col">
            {(() => {
              const email = emails.find(e => e.id === selectedEmail);
              return email ? (
                <>
                  <div className="p-6 border-b border-white/10">
                    <h1 className="text-2xl font-bold mb-2">{email.subject}</h1>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>From: {email.from}</span>
                      <span>{email.time}</span>
                    </div>
                  </div>
                  <div className="flex-1 p-6 overflow-y-auto">
                    <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-6 border border-white/10">
                      <p className="text-gray-200 leading-relaxed">
                        {email.subject.includes('Tesla Service') && 
                          `Dear Tesla Owner,

This is a friendly reminder that your Tesla service appointment is scheduled for tomorrow, December 21st at 2:00 PM.

Service Details:
• Service Center: Tesla Service Center Downtown
• Estimated Duration: 1-2 hours
• Services: Annual inspection, software update, tire rotation

Please ensure your vehicle has at least 20% charge when you arrive. Our team will handle the rest!

If you need to reschedule, please contact us at least 24 hours in advance.

Best regards,
Tesla Service Team`}
                        
                        {email.subject.includes('Supercharger') && 
                          `Hello Tesla Driver,

Great news! A new Supercharger station has opened near your location and is now available for use.

Location Details:
• Address: 123 Main Street, Downtown
• Number of Stalls: 12 V3 Superchargers
• Maximum Power: 250kW
• Amenities: Coffee shop, restrooms, Wi-Fi

This location offers convenient charging while you shop or grab a bite to eat. The station is operational 24/7.

Happy charging!
The Supercharger Team`}
                        
                        {email.subject.includes('Energy Report') && 
                          `Your Monthly Tesla Energy Report

This month, your solar panels generated 1,247 kWh of clean energy, saving you $156 on your electricity bill.

Key Stats:
• Solar Generation: 1,247 kWh
• Home Consumption: 987 kWh  
• Grid Export: 260 kWh
• Carbon Offset: 1,122 lbs CO₂

Keep up the great work contributing to a sustainable future!

Tesla Energy Team`}
                        
                        {email.subject.includes('Meeting') && 
                          `Meeting Update Notification

The upcoming Project Review meeting has been moved to Conference Room B due to AV equipment availability.

Updated Details:
• Date: Tomorrow, 3:00 PM
• Location: Conference Room B (Building 2, Floor 3)
• Duration: 1 hour
• Attendees: Project team members

Please confirm your attendance by replying to this message.

Thanks,
Project Management`}
                      </p>
                    </div>
                  </div>
                </>
              ) : null;
            })()}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Mail size={64} className="mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-bold mb-2">Select an Email</h2>
              <p className="text-gray-400">Choose an email from the list to read it</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MailApp;
