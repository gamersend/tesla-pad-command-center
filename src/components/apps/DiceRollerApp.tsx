
import React, { useState, useEffect } from 'react';
import { Dices, RotateCcw, Plus, Minus, Star, Clock } from 'lucide-react';

const DiceRollerApp: React.FC = () => {
  const [selectedDice, setSelectedDice] = useState<{[key: string]: number}>({
    d6: 2
  });
  const [lastRoll, setLastRoll] = useState<Array<{type: string, rolls: number[], sum: number}>>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [rollHistory, setRollHistory] = useState<Array<{timestamp: number, results: any[], total: number}>>([]);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const diceTypes = {
    d4: { sides: 4, color: 'from-red-400 to-red-600', symbol: '△' },
    d6: { sides: 6, color: 'from-blue-400 to-blue-600', symbol: '⚀' },
    d8: { sides: 8, color: 'from-green-400 to-green-600', symbol: '◊' },
    d10: { sides: 10, color: 'from-yellow-400 to-yellow-600', symbol: '⬟' },
    d12: { sides: 12, color: 'from-purple-400 to-purple-600', symbol: '⬢' },
    d20: { sides: 20, color: 'from-pink-400 to-pink-600', symbol: '⚂' }
  };

  const gamePresets = {
    yahtzee: {
      name: 'Yahtzee',
      dice: { d6: 5 },
      description: 'Roll 5 six-sided dice'
    },
    dnd_attack: {
      name: 'D&D Attack',
      dice: { d20: 1, d6: 1 },
      description: '1d20 + 1d6 damage'
    },
    coin_flip: {
      name: 'Coin Flip',
      dice: { d2: 1 },
      description: 'Heads or Tails'
    },
    fate_dice: {
      name: 'Fate Dice',
      dice: { d6: 4 },
      description: 'Roll 4d6 for ability scores'
    }
  };

  const decisionOptions = [
    'Yes, definitely!',
    'No, not today',
    'Maybe later',
    'Ask again',
    'Go for it!',
    'Wait a bit',
    'Perfect timing',
    'Not recommended'
  ];

  const rollDice = async () => {
    if (Object.values(selectedDice).every(count => count === 0)) return;

    setIsRolling(true);

    // Simulate rolling animation
    const animationDuration = 2000;
    const updateInterval = 100;
    const updates = animationDuration / updateInterval;

    for (let i = 0; i < updates; i++) {
      // Generate random intermediate results for animation
      const tempResults = Object.entries(selectedDice)
        .filter(([_, count]) => count > 0)
        .map(([type, count]) => {
          const diceInfo = diceTypes[type as keyof typeof diceTypes];
          const rolls = Array.from({ length: count }, () => 
            Math.floor(Math.random() * diceInfo.sides) + 1
          );
          return {
            type,
            rolls,
            sum: rolls.reduce((a, b) => a + b, 0)
          };
        });
      
      setLastRoll(tempResults);
      await new Promise(resolve => setTimeout(resolve, updateInterval));
    }

    // Final roll
    const finalResults = Object.entries(selectedDice)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => {
        const diceInfo = diceTypes[type as keyof typeof diceTypes];
        const rolls = Array.from({ length: count }, () => 
          Math.floor(Math.random() * diceInfo.sides) + 1
        );
        return {
          type,
          rolls,
          sum: rolls.reduce((a, b) => a + b, 0)
        };
      });

    setLastRoll(finalResults);

    // Add to history
    const totalSum = finalResults.reduce((total, result) => total + result.sum, 0);
    setRollHistory(prev => [
      { timestamp: Date.now(), results: finalResults, total: totalSum },
      ...prev.slice(0, 19)
    ]);

    setIsRolling(false);
  };

  const rollDecision = () => {
    const randomDecision = decisionOptions[Math.floor(Math.random() * decisionOptions.length)];
    setLastRoll([{
      type: 'decision',
      rolls: [randomDecision],
      sum: 0
    }]);
  };

  const updateDiceCount = (diceType: string, change: number) => {
    setSelectedDice(prev => ({
      ...prev,
      [diceType]: Math.max(0, Math.min(10, (prev[diceType] || 0) + change))
    }));
  };

  const loadPreset = (presetKey: string) => {
    const preset = gamePresets[presetKey as keyof typeof gamePresets];
    if (preset) {
      setSelectedDice(preset.dice);
      setSelectedPreset(presetKey);
    }
  };

  const clearDice = () => {
    setSelectedDice({});
    setSelectedPreset(null);
  };

  const getDiceIcon = (value: number, diceType: string) => {
    if (diceType === 'd6') {
      const icons = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
      return icons[value - 1] || value.toString();
    }
    return value.toString();
  };

  const totalDiceCount = Object.values(selectedDice).reduce((sum, count) => sum + count, 0);
  const totalSum = lastRoll.reduce((sum, result) => sum + result.sum, 0);

  return (
    <div className="h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-b-3xl">
        <h1 className="text-3xl font-bold mb-4 flex items-center">
          <Dices className="mr-3" size={32} />
          Dice Roller & Random
        </h1>

        {/* Game Presets */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Object.entries(gamePresets).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => loadPreset(key)}
              className={`flex-shrink-0 px-4 py-2 rounded-full transition-all ${
                selectedPreset === key
                  ? 'bg-white/40 shadow-lg'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              <div className="font-medium">{preset.name}</div>
              <div className="text-xs opacity-80">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {/* Dice Display */}
        <div className="bg-white/10 rounded-3xl p-8 mb-6 backdrop-blur-sm border border-white/20">
          <div className="text-center mb-6">
            <div className="text-6xl font-bold mb-2">
              {lastRoll.length > 0 && lastRoll[0].type !== 'decision' ? totalSum : '—'}
            </div>
            <div className="text-lg opacity-70">
              {totalDiceCount > 0 ? `Rolling ${totalDiceCount} dice` : 'Select dice to roll'}
            </div>
          </div>

          {/* Dice Results */}
          <div className="flex justify-center items-center flex-wrap gap-4 min-h-[120px]">
            {lastRoll.map((result, groupIndex) => (
              <div key={groupIndex} className="flex flex-col items-center gap-2">
                {result.type === 'decision' ? (
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-2xl text-center max-w-xs">
                    <div className="text-2xl mb-2">🎱</div>
                    <div className="font-semibold text-lg">{result.rolls[0]}</div>
                  </div>
                ) : (
                  <>
                    <div className="text-sm font-medium opacity-70 uppercase">
                      {result.type} ({result.sum})
                    </div>
                    <div className="flex gap-2">
                      {result.rolls.map((roll, rollIndex) => (
                        <div
                          key={rollIndex}
                          className={`w-16 h-16 rounded-xl bg-gradient-to-br ${
                            diceTypes[result.type as keyof typeof diceTypes]?.color || 'from-gray-400 to-gray-600'
                          } flex items-center justify-center text-2xl font-bold shadow-lg transform transition-transform ${
                            isRolling ? 'animate-spin' : 'hover:scale-105'
                          }`}
                        >
                          {getDiceIcon(roll, result.type)}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Dice Selector */}
        <div className="bg-white/10 rounded-3xl p-6 mb-6 backdrop-blur-sm border border-white/20">
          <h3 className="text-xl font-semibold mb-4">Select Dice</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {Object.entries(diceTypes).map(([type, info]) => (
              <div key={type} className="bg-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${info.color} flex items-center justify-center text-lg`}>
                      {info.symbol}
                    </div>
                    <span className="font-medium">{type.toUpperCase()}</span>
                  </div>
                  <span className="text-2xl font-bold">{selectedDice[type] || 0}</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => updateDiceCount(type, -1)}
                    disabled={!selectedDice[type]}
                    className="w-8 h-8 rounded-lg bg-red-500/30 hover:bg-red-500/50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <button
                    onClick={() => updateDiceCount(type, 1)}
                    disabled={selectedDice[type] >= 10}
                    className="w-8 h-8 rounded-lg bg-green-500/30 hover:bg-green-500/50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Roll Controls */}
          <div className="flex justify-center gap-4">
            <button
              onClick={rollDice}
              disabled={totalDiceCount === 0 || isRolling}
              className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all ${
                totalDiceCount > 0 && !isRolling
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 shadow-lg'
                  : 'bg-gray-500/30 cursor-not-allowed'
              }`}
            >
              {isRolling ? 'Rolling...' : 'Roll Dice'}
            </button>
            
            <button
              onClick={rollDecision}
              className="px-8 py-4 rounded-2xl font-semibold text-lg bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Magic Decision
            </button>
            
            <button
              onClick={clearDice}
              className="px-6 py-4 rounded-2xl bg-red-500/30 hover:bg-red-500/50 transition-colors flex items-center gap-2"
            >
              <RotateCcw size={20} />
              Clear
            </button>
          </div>
        </div>

        {/* Roll History */}
        {rollHistory.length > 0 && (
          <div className="bg-white/10 rounded-3xl p-6 backdrop-blur-sm border border-white/20">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Clock className="mr-2" size={20} />
              Roll History
            </h3>
            
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {rollHistory.slice(0, 10).map((roll, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/10 rounded-xl">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold">{roll.total}</span>
                    <div className="text-sm opacity-70">
                      {roll.results.map(r => `${r.rolls.length}${r.type}`).join(' + ')}
                    </div>
                  </div>
                  <span className="text-xs opacity-50">
                    {new Date(roll.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiceRollerApp;
