
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Palette, Copy, Save, Trash2, Eye, Shuffle } from 'lucide-react';

const ColorPickerApp: React.FC = () => {
  const [currentColor, setCurrentColor] = useState({ r: 255, g: 100, b: 100 });
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const [colorHistory, setColorHistory] = useState<Array<{r: number, g: number, b: number}>>([]);
  const [savedPalettes, setSavedPalettes] = useState<Array<{name: string, colors: Array<{r: number, g: number, b: number}>}>>([]);
  const [selectedFormat, setSelectedFormat] = useState<'hex' | 'rgb' | 'hsl'>('hex');

  const teslaColors = {
    official: [
      { name: 'Tesla Red', r: 227, g: 25, b: 55 },
      { name: 'Tesla Blue', r: 27, g: 54, b: 94 },
      { name: 'Pearl White', r: 247, g: 247, b: 247 },
      { name: 'Solid Black', r: 0, g: 0, b: 0 },
      { name: 'Midnight Silver', r: 92, g: 94, b: 98 },
      { name: 'Deep Blue', r: 30, g: 58, b: 95 }
    ],
    dashboard: [
      { name: 'Night Mode', r: 0, g: 0, b: 0 },
      { name: 'Dark Gray', r: 28, g: 28, b: 30 },
      { name: 'Accent Blue', r: 0, g: 122, b: 255 },
      { name: 'Success Green', r: 52, g: 199, b: 89 },
      { name: 'Warning Orange', r: 255, g: 149, b: 0 },
      { name: 'Error Red', r: 255, g: 59, b: 48 }
    ]
  };

  // Color conversion functions
  const rgbToHex = (r: number, g: number, b: number) => {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const hslToRgb = (h: number, s: number, l: number) => {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };

  const updateColorFromHSL = useCallback(() => {
    const rgb = hslToRgb(hue, saturation, lightness);
    setCurrentColor(rgb);
  }, [hue, saturation, lightness]);

  useEffect(() => {
    updateColorFromHSL();
  }, [updateColorFromHSL]);

  const addToHistory = (color: {r: number, g: number, b: number}) => {
    setColorHistory(prev => {
      const filtered = prev.filter(c => !(c.r === color.r && c.g === color.g && c.b === color.b));
      return [color, ...filtered].slice(0, 20);
    });
  };

  const copyColorValue = () => {
    let value = '';
    switch (selectedFormat) {
      case 'hex':
        value = rgbToHex(currentColor.r, currentColor.g, currentColor.b);
        break;
      case 'rgb':
        value = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`;
        break;
      case 'hsl':
        const hsl = rgbToHsl(currentColor.r, currentColor.g, currentColor.b);
        value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
        break;
    }
    navigator.clipboard.writeText(value);
  };

  const generateRandomColor = () => {
    const newColor = {
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256)
    };
    setCurrentColor(newColor);
    const hsl = rgbToHsl(newColor.r, newColor.g, newColor.b);
    setHue(hsl.h);
    setSaturation(hsl.s);
    setLightness(hsl.l);
    addToHistory(newColor);
  };

  const generateHarmony = (type: 'complementary' | 'triadic' | 'analogous') => {
    const baseHsl = rgbToHsl(currentColor.r, currentColor.g, currentColor.b);
    let colors = [currentColor];

    switch (type) {
      case 'complementary':
        const compHue = (baseHsl.h + 180) % 360;
        colors.push(hslToRgb(compHue, baseHsl.s, baseHsl.l));
        break;
      case 'triadic':
        colors.push(hslToRgb((baseHsl.h + 120) % 360, baseHsl.s, baseHsl.l));
        colors.push(hslToRgb((baseHsl.h + 240) % 360, baseHsl.s, baseHsl.l));
        break;
      case 'analogous':
        colors.unshift(hslToRgb((baseHsl.h - 30 + 360) % 360, baseHsl.s, baseHsl.l));
        colors.push(hslToRgb((baseHsl.h + 30) % 360, baseHsl.s, baseHsl.l));
        break;
    }

    return colors;
  };

  return (
    <div className="h-full bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 text-white flex">
      {/* Main Color Picker */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6 flex items-center">
          <Palette className="mr-3" size={32} />
          Color Picker Pro
        </h1>

        {/* Current Color Display */}
        <div className="bg-white/10 rounded-3xl p-6 mb-6 backdrop-blur-sm border border-white/20">
          <div className="flex items-center gap-6 mb-6">
            <div 
              className="w-24 h-24 rounded-2xl border-4 border-white/30 shadow-lg"
              style={{ backgroundColor: `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})` }}
            />
            <div className="flex-1">
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setSelectedFormat('hex')}
                  className={`p-3 rounded-xl transition-colors ${selectedFormat === 'hex' ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'}`}
                >
                  <div className="text-sm opacity-70">HEX</div>
                  <div className="font-mono font-bold">
                    {rgbToHex(currentColor.r, currentColor.g, currentColor.b)}
                  </div>
                </button>
                <button
                  onClick={() => setSelectedFormat('rgb')}
                  className={`p-3 rounded-xl transition-colors ${selectedFormat === 'rgb' ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'}`}
                >
                  <div className="text-sm opacity-70">RGB</div>
                  <div className="font-mono font-bold text-sm">
                    {currentColor.r}, {currentColor.g}, {currentColor.b}
                  </div>
                </button>
                <button
                  onClick={() => setSelectedFormat('hsl')}
                  className={`p-3 rounded-xl transition-colors ${selectedFormat === 'hsl' ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'}`}
                >
                  <div className="text-sm opacity-70">HSL</div>
                  <div className="font-mono font-bold text-sm">
                    {rgbToHsl(currentColor.r, currentColor.g, currentColor.b).h}°, {rgbToHsl(currentColor.r, currentColor.g, currentColor.b).s}%, {rgbToHsl(currentColor.r, currentColor.g, currentColor.b).l}%
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={copyColorValue}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/30 rounded-xl hover:bg-blue-500/50 transition-colors"
            >
              <Copy size={16} />
              Copy
            </button>
            <button
              onClick={() => addToHistory(currentColor)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/30 rounded-xl hover:bg-green-500/50 transition-colors"
            >
              <Save size={16} />
              Save
            </button>
            <button
              onClick={generateRandomColor}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/30 rounded-xl hover:bg-purple-500/50 transition-colors"
            >
              <Shuffle size={16} />
              Random
            </button>
          </div>
        </div>

        {/* HSL Sliders */}
        <div className="bg-white/10 rounded-3xl p-6 mb-6 backdrop-blur-sm border border-white/20">
          <h3 className="text-xl font-semibold mb-4">Color Controls</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Hue: {hue}°</label>
              <input
                type="range"
                min="0"
                max="360"
                value={hue}
                onChange={(e) => setHue(parseInt(e.target.value))}
                className="w-full h-3 rounded-full appearance-none cursor-pointer"
                style={{
                  background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Saturation: {saturation}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={saturation}
                onChange={(e) => setSaturation(parseInt(e.target.value))}
                className="w-full h-3 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, hsl(${hue}, 0%, ${lightness}%), hsl(${hue}, 100%, ${lightness}%))`
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Lightness: {lightness}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={lightness}
                onChange={(e) => setLightness(parseInt(e.target.value))}
                className="w-full h-3 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, hsl(${hue}, ${saturation}%, 0%), hsl(${hue}, ${saturation}%, 50%), hsl(${hue}, ${saturation}%, 100%))`
                }}
              />
            </div>
          </div>
        </div>

        {/* Color Harmonies */}
        <div className="bg-white/10 rounded-3xl p-6 backdrop-blur-sm border border-white/20">
          <h3 className="text-xl font-semibold mb-4">Color Harmonies</h3>
          
          <div className="space-y-4">
            {['complementary', 'triadic', 'analogous'].map((harmonyType) => (
              <div key={harmonyType} className="flex items-center gap-4">
                <span className="w-24 text-sm font-medium capitalize">{harmonyType}</span>
                <div className="flex gap-2">
                  {generateHarmony(harmonyType as any).map((color, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentColor(color);
                        const hsl = rgbToHsl(color.r, color.g, color.b);
                        setHue(hsl.h);
                        setSaturation(hsl.s);
                        setLightness(hsl.l);
                      }}
                      className="w-12 h-12 rounded-lg border-2 border-white/30 hover:border-white/60 transition-colors"
                      style={{ backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 bg-black/30 border-l border-white/10 p-6 overflow-y-auto">
        {/* Tesla Color Palettes */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Tesla Colors</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-3 text-white/70">Official Colors</h4>
              <div className="grid grid-cols-3 gap-2">
                {teslaColors.official.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentColor(color);
                      const hsl = rgbToHsl(color.r, color.g, color.b);
                      setHue(hsl.h);
                      setSaturation(hsl.s);
                      setLightness(hsl.l);
                      addToHistory(color);
                    }}
                    className="w-full h-12 rounded-lg border-2 border-white/20 hover:border-white/50 transition-colors"
                    style={{ backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})` }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3 text-white/70">Dashboard Themes</h4>
              <div className="grid grid-cols-3 gap-2">
                {teslaColors.dashboard.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentColor(color);
                      const hsl = rgbToHsl(color.r, color.g, color.b);
                      setHue(hsl.h);
                      setSaturation(hsl.s);
                      setLightness(hsl.l);
                      addToHistory(color);
                    }}
                    className="w-full h-12 rounded-lg border-2 border-white/20 hover:border-white/50 transition-colors"
                    style={{ backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})` }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Color History */}
        {colorHistory.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Recent Colors</h3>
            <div className="grid grid-cols-4 gap-2">
              {colorHistory.slice(0, 16).map((color, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentColor(color);
                    const hsl = rgbToHsl(color.r, color.g, color.b);
                    setHue(hsl.h);
                    setSaturation(hsl.s);
                    setLightness(hsl.l);
                  }}
                  className="w-full h-12 rounded-lg border-2 border-white/20 hover:border-white/50 transition-colors"
                  style={{ backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorPickerApp;
