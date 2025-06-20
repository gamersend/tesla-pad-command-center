
import React, { useState } from 'react';
import { Plus, Search, Mic, Bold, Italic, List, Hash } from 'lucide-react';

const NotesApp: React.FC = () => {
  const [selectedNote, setSelectedNote] = useState<number | null>(1);
  const [noteContent, setNoteContent] = useState('');

  const notes = [
    {
      id: 1,
      title: 'Tesla Road Trip Planning',
      preview: 'Route from SF to LA with Supercharger stops...',
      content: `# Tesla Road Trip to Los Angeles

## Trip Details
- **Date**: December 25, 2024
- **Starting Charge**: 95%
- **Distance**: 382 miles
- **Estimated Duration**: 6 hours

## Supercharger Stops
1. **Gilroy Supercharger** (Mile 75)
   - 15 min charge (85% → 95%)
   - Coffee break at Starbucks

2. **Harris Ranch Supercharger** (Mile 200)
   - 25 min charge (45% → 80%)
   - Lunch at Harris Ranch Restaurant

3. **Tejon Ranch Supercharger** (Mile 320)
   - 20 min charge (30% → 70%)
   - Final stretch to LA

## Packing List
- [ ] Phone charger
- [ ] Sunglasses
- [ ] Snacks and water
- [ ] Tesla mobile connector (backup)

## Weather Check
Sunny, 75°F - perfect driving weather!`,
      tags: ['trip', 'tesla', 'travel'],
      created: '2024-06-20'
    },
    {
      id: 2,
      title: 'Meeting Notes - Q4 Review',
      preview: 'Key points from quarterly business review...',
      content: `# Q4 Business Review Meeting

**Date**: December 18, 2024
**Attendees**: Sarah, Mike, Alex, Lisa

## Key Discussion Points

### Performance Metrics
- Revenue increased 23% from Q3
- Customer satisfaction at 94%
- New user acquisition up 18%

### Action Items
- [ ] Sarah: Prepare budget proposal for Q1
- [ ] Mike: Update marketing strategy
- [ ] Alex: Technical infrastructure review
- [ ] Lisa: Team expansion planning

### Next Steps
Follow-up meeting scheduled for January 3rd to review progress on action items.`,
      tags: ['work', 'meeting', 'business'],
      created: '2024-06-18'
    },
    {
      id: 3,
      title: 'Tesla Service Checklist',
      preview: 'Annual service appointment preparations...',
      content: `# Tesla Annual Service Checklist

## Pre-Service Preparation
- [ ] Clean out personal items
- [ ] Charge to at least 50%
- [ ] Note any issues or concerns
- [ ] Backup dashcam footage if needed

## Items to Discuss
1. **Tire Rotation** - Due at 12,500 miles
2. **Cabin Air Filter** - Replace if needed
3. **Software Update** - Ensure latest version
4. **Door Handle Alignment** - Passenger side sticking
5. **Charging Port Cover** - Sometimes slow to close

## Service Center Info
- **Location**: Tesla Service Downtown
- **Address**: 123 Tech Drive
- **Phone**: (555) 123-TESLA
- **Service Advisor**: Jennifer

## Estimated Cost
- Inspection: Complimentary
- Tire rotation: $50
- Cabin filter: $25
- Total: ~$75`,
      tags: ['tesla', 'service', 'maintenance'],
      created: '2024-06-15'
    }
  ];

  const currentNote = notes.find(note => note.id === selectedNote);

  return (
    <div className="h-full bg-gradient-to-br from-orange-900 via-yellow-900/30 to-red-900/30 text-white flex">
      {/* Sidebar */}
      <div className="w-80 bg-black/30 border-r border-white/10 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold flex items-center">
              📝 Notes Pro
            </h1>
            <button className="w-10 h-10 bg-yellow-500 hover:bg-yellow-600 rounded-xl flex items-center justify-center transition-colors">
              <Plus size={20} className="text-white" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search notes..."
              className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-2 text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto">
          {notes.map(note => (
            <div
              key={note.id}
              onClick={() => setSelectedNote(note.id)}
              className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${
                selectedNote === note.id ? 'bg-white/10' : ''
              }`}
            >
              <h3 className="font-semibold mb-1 text-white">{note.title}</h3>
              <p className="text-sm text-gray-400 mb-2 line-clamp-2">{note.preview}</p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {note.tags.map(tag => (
                    <span key={tag} className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-gray-500">{note.created}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Voice Note Button */}
        <div className="p-4 border-t border-white/10">
          <button className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center">
            <Mic size={18} className="mr-2" />
            Voice Note
          </button>
          <p className="text-xs text-gray-400 text-center mt-2">Only while parked</p>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        {selectedNote && currentNote ? (
          <>
            {/* Editor Header */}
            <div className="p-6 border-b border-white/10">
              <input
                type="text"
                value={currentNote.title}
                className="text-2xl font-bold bg-transparent border-none outline-none text-white w-full"
                placeholder="Note title..."
              />
              <div className="flex items-center mt-4 space-x-2">
                {[
                  { icon: Bold, label: 'Bold' },
                  { icon: Italic, label: 'Italic' },
                  { icon: List, label: 'List' },
                  { icon: Hash, label: 'Heading' }
                ].map((tool, index) => (
                  <button
                    key={index}
                    className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                    title={tool.label}
                  >
                    <tool.icon size={16} />
                  </button>
                ))}
              </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 p-6">
              <div className="grid grid-cols-2 gap-6 h-full">
                {/* Markdown Editor */}
                <div className="flex flex-col">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Markdown Editor</h3>
                  <textarea
                    value={currentNote.content}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="flex-1 bg-black/30 border border-white/20 rounded-xl p-4 text-white resize-none font-mono text-sm"
                    placeholder="Start typing your note..."
                  />
                </div>

                {/* Live Preview */}
                <div className="flex flex-col">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Live Preview</h3>
                  <div className="flex-1 bg-white/5 border border-white/20 rounded-xl p-4 overflow-y-auto">
                    <div className="prose prose-invert max-w-none">
                      {currentNote.content.split('\n').map((line, index) => {
                        if (line.startsWith('# ')) {
                          return <h1 key={index} className="text-2xl font-bold text-white mb-4">{line.substring(2)}</h1>;
                        }
                        if (line.startsWith('## ')) {
                          return <h2 key={index} className="text-xl font-bold text-white mb-3">{line.substring(3)}</h2>;
                        }
                        if (line.startsWith('### ')) {
                          return <h3 key={index} className="text-lg font-bold text-white mb-2">{line.substring(4)}</h3>;
                        }
                        if (line.startsWith('- [ ]')) {
                          return (
                            <div key={index} className="flex items-center mb-1">
                              <input type="checkbox" className="mr-2" />
                              <span className="text-gray-300">{line.substring(5)}</span>
                            </div>
                          );
                        }
                        if (line.startsWith('- [x]')) {
                          return (
                            <div key={index} className="flex items-center mb-1">
                              <input type="checkbox" checked className="mr-2" />
                              <span className="text-gray-300 line-through">{line.substring(5)}</span>
                            </div>
                          );
                        }
                        if (line.startsWith('- ')) {
                          return <li key={index} className="text-gray-300 mb-1">{line.substring(2)}</li>;
                        }
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return <p key={index} className="font-bold text-white mb-2">{line.slice(2, -2)}</p>;
                        }
                        if (line.trim() === '') {
                          return <br key={index} />;
                        }
                        return <p key={index} className="text-gray-300 mb-2">{line}</p>;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-2xl font-bold mb-2">Select a Note</h2>
              <p className="text-gray-400">Choose a note from the sidebar to start editing</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesApp;
