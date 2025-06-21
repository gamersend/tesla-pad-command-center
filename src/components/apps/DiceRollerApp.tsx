
import React, { useState } from 'react';
import { RefreshCw, History, Settings, Shuffle, Play } from 'lucide-react';

interface DiceResult {
  type: string;
  value: number;
  timestamp: number;
}

interface DiceConfig {
  type: string;
  count: number;
  sides: number;
}

const DiceRollerApp: React.FC = () => {
  const [currentRolls, setCurrentRolls] = useState<DiceResult[]>([]);
  const [selectedDice, setSelectedDice] = useState<DiceConfig>({ type: 'd6', count: 1, sides: 6 });
  const [isRolling, setIsRolling] = useState(false);
  const [rollHistory, setRollHistory] = useState<DiceResult[][]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const diceTypes = [
    { type: 'd4', sides: 4, name: 'D4' },
    { type: 'd6', sides: 6, name: 'D6' },
    { type: 'd8', sides: 8, name: 'D8' },
    { type: 'd10', sides: 10, name: 'D10' },
    { type: 'd12', sides: 12, name: 'D12' },
    { type: 'd20', sides: 20, name: 'D20' },
    { type: 'd100', sides: 100, name: 'D100' }
  ];

  const gamePresets = {
    yahtzee: {
      name: 'Yahtzee',
      dice: { type: 'd6', count: 5, sides: 6 },
      description: 'Roll 5 six-sided dice'
    },
    coin_flip: {
      name: 'Coin Flip',
      dice: { type: 'd2', count: 1, sides: 2 },
      description: 'Heads or Tails',
      labels: ['Heads', 'Tails']
    },
    decision_maker: {
      name: 'Decision Maker',
      dice: { type: 'd4', count: 1, sides: 4 },
      description: 'Magic decision maker',
      labels: ['Yes', 'No', 'Maybe', 'Ask Again']
    }
  };

  const rollDice = async () => {
    setIsRolling(true);
    
    // Simulate rolling animation
    const animationDuration = 1500;
    const animationSteps = 15;
    const stepDuration = animationDuration / animationSteps;
    
    for (let i = 0; i < animationSteps; i++) {
      const tempRolls: DiceResult[] = [];
      for (let j = 0; j < selectedDice.count; j++) {
        tempRolls.push({
          type: selectedDice.type,
          value: Math.floor(Math.random() * selectedDice.sides) + 1,
          timestamp: Date.now()
        });
      }
      setCurrentRolls(tempRolls);
      await new Promise(resolve => setTimeout(resolve, stepDuration));
    }
    
    // Final roll
    const finalRolls: DiceResult[] = [];
    for (let i = 0; i < selectedDice.count; i++) {
      finalRolls.push({
        type: selectedDice.type,
        value: Math.floor(Math.random() * selectedDice.sides) + 1,
        timestamp: Date.now()
      });
    }
    
    setCurrentRolls(finalRolls);
    setRollHistory(prev => [finalRolls, ...prev.slice(0, 9)]);
    setIsRolling(false);
  };

  const getDiceCount = () => {
    return Array.from({ length: 6 }, (_, i) => i + 1);
  };

  const selectPreset = (presetKey: string) => {
    const preset = gamePresets[presetKey];
    setSelectedDice(preset.dice);
    setSelectedPreset(presetKey);
  };

  const getDiceDisplay = (result: DiceResult, index: number) => {
    const preset = selectedPreset ? gamePresets[selectedPreset] : null;
    if (preset?.labels && preset.labels[result.value - 1]) {
      return preset.labels[result.value - 1];
    }
    return result.value.toString();
  };

  const total = currentRolls.reduce((sum, roll) => sum + roll.value, 0);

  return (
    <div className="h-full bg-gradient-to-br from-purple-600 to-blue-600 text-white overflow-hidden">
      {/* Header */}
      <div className="p-6 text-center border-b border-white/20">
        <h1 className="text-3xl font-bold mb-2">🎲 Dice Roller</h1>
        <p className="text-white/80">Roll the dice and let chance decide!</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Game Presets */}
        <div className="mb-6 w-full max-w-md">
          <label className="block text-sm font-medium mb-3">Game Presets</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setSelectedPreset(null);
                setSelectedDice({ type: 'd6', count: 1, sides: 6 });
              }}
              className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                selectedPreset === null
                  ? 'bg-white text-purple-600'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              Custom
            </button>
            {Object.entries(gamePresets).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => selectPreset(key)}
                className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                  selectedPreset === key
                    ? 'bg-white text-purple-600'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dice Display */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {currentRolls.map((roll, index) => (
              <div
                key={index}
                className={`w-20 h-20 bg-white rounded-xl flex items-center justify-center text-2xl font-bold text-purple-600 shadow-lg transition-transform duration-200 ${
                  isRolling ? 'animate-bounce' : 'hover:scale-105'
                }`}
              >
                {isRolling ? '?' : getDiceDisplay(roll, index)}
              </div>
            ))}
          </div>
          
          {currentRolls.length > 0 && !isRolling && (
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {selectedPreset === 'coin_flip' || selectedPreset === 'decision_maker' 
                  ? getDiceDisplay(currentRolls[0], 0)
                  : `Total: ${total}`
                }
              </div>
              <div className="text-white/70">
                {currentRolls.length}×{selectedDice.type.toUpperCase()}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        {!selectedPreset && (
          <div className="w-full max-w-md space-y-6">
            {/* Dice Type Selection */}
            <div>
              <label className="block text-sm font-medium mb-3">Dice Type</label>
              <div className="grid grid-cols-4 gap-2">
                {diceTypes.map((dice) => (
                  <button
                    key={dice.type}
                    onClick={() => setSelectedDice(prev => ({ ...prev, type: dice.type, sides: dice.sides }))}
                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                      selectedDice.type === dice.type
                        ? 'bg-white text-purple-600'
                        : 'bg-white/20 hover:bg-white/30'
                    }`}
                  >
                    {dice.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Dice Count */}
            <div>
              <label className="block text-sm font-medium mb-3">Number of Dice</label>
              <div className="grid grid-cols-6 gap-2">
                {getDiceCount().map((count) => (
                  <button
                    key={count}
                    onClick={() => setSelectedDice(prev => ({ ...prev, count }))}
                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                      selectedDice.count === count
                        ? 'bg-white text-purple-600'
                        : 'bg-white/20 hover:bg-white/30'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Roll Button */}
        <button
          onClick={rollDice}
          disabled={isRolling}
          className="w-full max-w-md bg-white text-purple-600 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mt-6"
        >
          <RefreshCw className={`w-5 h-5 ${isRolling ? 'animate-spin' : ''}`} />
          {isRolling ? 'Rolling...' : 'Roll Dice'}
        </button>
      </div>

      {/* History */}
      {rollHistory.length > 0 && (
        <div className="p-4 border-t border-white/20 bg-black/20">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4" />
            <span className="text-sm font-medium">Recent Rolls</span>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {rollHistory.slice(0, 5).map((rolls, index) => (
              <div key={index} className="flex-shrink-0 bg-white/10 rounded-lg p-2 text-xs">
                <div className="font-medium">
                  Total: {rolls.reduce((sum, roll) => sum + roll.value, 0)}
                </div>
                <div className="text-white/70">
                  [{rolls.map(roll => roll.value).join(', ')}]
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiceRollerApp;
