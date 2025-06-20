
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin } from 'lucide-react';

const CalendarApp: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const events = [
    {
      id: 1,
      title: '🚗 Tesla Service Appointment',
      time: '9:00 AM',
      duration: '1 hour',
      location: 'Tesla Service Center',
      type: 'tesla',
      color: 'from-red-500 to-red-700'
    },
    {
      id: 2,
      title: '💼 Business Meeting',
      time: '2:00 PM',
      duration: '30 mins',
      location: 'Downtown Office',
      type: 'work',
      color: 'from-blue-500 to-blue-700'
    },
    {
      id: 3,
      title: '⚡ Supercharger Stop',
      time: '4:30 PM',
      duration: '20 mins',
      location: 'Highway Supercharger',
      type: 'tesla',
      color: 'from-yellow-500 to-orange-600'
    }
  ];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === new Date().getDate() && 
                     currentDate.getMonth() === new Date().getMonth() &&
                     currentDate.getFullYear() === new Date().getFullYear();
      const isSelected = day === selectedDate.getDate() &&
                        currentDate.getMonth() === selectedDate.getMonth() &&
                        currentDate.getFullYear() === selectedDate.getFullYear();

      days.push(
        <button
          key={day}
          onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
          className={`p-3 rounded-xl transition-all hover:scale-105 ${
            isToday ? 'bg-red-500 text-white font-bold' :
            isSelected ? 'bg-blue-500 text-white' :
            'bg-white/5 hover:bg-white/10 text-white'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  return (
    <div className="p-6 text-white h-full bg-gradient-to-br from-purple-900 via-blue-900/30 to-pink-900/30">
      <div className="grid grid-cols-3 gap-6 h-full">
        {/* Calendar Grid */}
        <div className="col-span-2">
          {/* Calendar Header */}
          <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl p-6 border border-white/10 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center">
                <span className="mr-2">📅</span>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => navigateMonth('next')}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-gray-400 font-semibold text-sm">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {renderCalendarDays()}
            </div>
          </div>

          {/* Tesla Integration */}
          <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl p-6 border border-red-400/30">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <span className="mr-2">🚗</span>
              Tesla Smart Calendar
              <span className="ml-2">⚡</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/30 rounded-xl p-4">
                <div className="text-cyan-400 font-semibold mb-2">🔥 Pre-conditioning</div>
                <div className="text-sm text-gray-300">
                  Auto pre-heat 15 mins before Tesla service appointment
                </div>
              </div>
              <div className="bg-black/30 rounded-xl p-4">
                <div className="text-green-400 font-semibold mb-2">⚡ Smart Charging</div>
                <div className="text-sm text-gray-300">
                  Schedule charging to complete before morning meetings
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Events Sidebar */}
        <div className="space-y-6">
          {/* Today's Events */}
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center">
                <span className="mr-2">📋</span>
                Today's Events
              </h3>
              <button className="w-8 h-8 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors">
                <Plus size={16} />
              </button>
            </div>

            <div className="space-y-3">
              {events.map(event => (
                <div
                  key={event.id}
                  className={`bg-gradient-to-r ${event.color} p-4 rounded-xl border border-white/20`}
                >
                  <div className="font-semibold text-white mb-1">
                    {event.title}
                  </div>
                  <div className="flex items-center text-sm text-gray-200 mb-2">
                    <Clock size={12} className="mr-1" />
                    {event.time} • {event.duration}
                  </div>
                  <div className="flex items-center text-sm text-gray-200">
                    <MapPin size={12} className="mr-1" />
                    {event.location}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-400/30">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <span className="mr-2">⚡</span>
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full p-3 bg-gradient-to-r from-red-500/30 to-red-600/30 rounded-xl border border-red-400/50 hover:border-red-400 transition-colors text-left">
                <div className="font-semibold">🔥 Pre-condition Tesla</div>
                <div className="text-xs text-gray-300">For next appointment</div>
              </button>
              <button className="w-full p-3 bg-gradient-to-r from-blue-500/30 to-blue-600/30 rounded-xl border border-blue-400/50 hover:border-blue-400 transition-colors text-left">
                <div className="font-semibold">🗺️ Plan Route</div>
                <div className="text-xs text-gray-300">To next location</div>
              </button>
              <button className="w-full p-3 bg-gradient-to-r from-yellow-500/30 to-yellow-600/30 rounded-xl border border-yellow-400/50 hover:border-yellow-400 transition-colors text-left">
                <div className="font-semibold">⚡ Schedule Charge</div>
                <div className="text-xs text-gray-300">Before departure</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarApp;
