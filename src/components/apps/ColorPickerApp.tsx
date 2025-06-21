
import React, { useState, useRef, useEffect } from 'react';
import { Palette, Copy, Save, Download, Shuffle } from 'lucide-react';

interface Color {
  r: number;
  g: number;
  b: number;
}

const ColorPickerApp: React.FC = () => {
  const [currentColor, setCurrentColor] = useState<Color>({ r: 255, g: 100, b: 100 });
  const [colorHistory, setColorHistory] = useState<Color[]>([]);
  const [selectedPalette, setSelectedPalette] = useState('tesla_official');
  const [savedColors, setSavedColors] = useState<Color[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const teslaColorPalettes = {
    tesla_official: {
      name: 'Tesla Official Colors',
      colors: [
        { name: 'Tesla Red', hex: '#E31937', r: 227, g: 25, b: 55 },
        { name: 'Tesla Blue', hex: '#1B365E', r: 27, g: 54, b: 94 },
        { name: 'Pearl White', hex: '#F7F7F7', r: 247, g: 247, b: 247 },
        { name: 'Solid Black', hex: '#000000', r: 0, g: 0, b: 0 },
        { name: 'Midnight Silver', hex: '#5C5E62', r: 92, g: 94, b: 98 }
      ]
    },
    dashboard_themes: {
      name: 'Dashboard Themes',
      colors: [
        { name: 'Night Mode', hex: '#000000', r: 0, g: 0, b: 0 },
        { name: 'Dark Gray', hex: '#1C1C1E', r: 28, g: 28, b: 30 },
        { name: 'Tesla Interior', hex: '#2C2C2E', r: 44, g: 44, b: 46 },
        { name: 'Accent Blue', hex: '#007AFF', r: 0, g: 122, b: 255 },
        { name: 'Success Green', hex: '#34C759', r: 52, g: 199, b: 89 }
      ]
    }
  };

  useEffect(() => {
    drawColorWheel();
  }, []);

  const drawColorWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    // Draw color wheel
    for (let angle = 0; angle < 360; angle += 1) {
      const startAngle = (angle - 1) * Math.PI / 180;
      const endAngle = angle * Math.PI / 180;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.lineWidth = 2;
      ctx.strokeStyle = `hsl(${angle}, 100%, 50%)`;
      ctx.stroke();
    }
  };

  const rgbToHex = (color: Color): string => {
    return `#${color.r.toString(16).padStart(2, '0')}${color.g.toString(16).padStart(2, '0')}${color.b.toString(16).padStart(2, '0')}`.toUpperCase();
  };

  const rgbToHsl = (color: Color): { h: number; s: number; l: number } => {
    const r = color.r / 255;
    const g = color.g / 255;
    const b = color.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

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

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Show toast notification here
  };

  const generateHarmony = (type: string): Color[] => {
    const hsl = rgbToHsl(currentColor);
    const harmonies: Color[] = [];

    switch (type) {
      case 'complementary':
        harmonies.push(currentColor);
        harmonies.push(hslToRgb({ h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l }));
        break;
      case 'triadic':
        harmonies.push(currentColor);
        harmonies.push(hslToRgb({ h: (hsl.h + 120) % 360, s: hsl.s, l: hsl.l }));
        harmonies.push(hslToRgb({ h: (hsl.h + 240) % 360, s: hsl.s, l: hsl.l }));
        break;
      case 'analogous':
        harmonies.push(hslToRgb({ h: (hsl.h - 30 + 360) % 360, s: hsl.s, l: hsl.l }));
        harmonies.push(currentColor);
        harmonies.push(hslToRgb({ h: (hsl.h + 30) % 360, s: hsl.s, l: hsl.l }));
        break;
    }

    return harmonies;
  };

  const hslToRgb = (hsl: { h: number; s: number; l: number }): Color => {
    const h = hsl.h / 360;
    const s = hsl.s / 100;
    const l = hsl.l / 100;

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

  const saveColor = () => {
    if (!savedColors.find(c => c.r === currentColor.r && c.g === currentColor.g && c.b === currentColor.b)) {
      setSavedColors(prev => [...prev, currentColor]);
    }
  };

  const hsl = rgbToHsl(currentColor);

  return (
    <div className="h-full bg-gradient-to-br from-pink-500 to-purple-600 text-white overflow-hidden">
      {/* Header */}
      <div className="p-6 text-center border-b border-white/20">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center">
          <Palette className="mr-3" size={32} />
          Color Picker Pro
        </h1>
        <p className="text-white/80">Professional color selection for Tesla</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Color Picker */}
        <div className="flex-1 p-6 flex flex-col items-center">
          {/* Color Wheel */}
          <div className="relative mb-6">
            <canvas
              ref={canvasRef}
              width={250}
              height={250}
              className="rounded-full cursor-crosshair"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left - 125;
                const y = e.clientY - rect.top - 125;
                const angle = Math.atan2(y, x) * 180 / Math.PI + 180;
                const distance = Math.sqrt(x * x + y * y);
                
                if (distance <= 125) {
                  const newColor = hslToRgb({ h: angle, s: 100, l: 50 });
                  setCurrentColor(newColor);
                  setColorHistory(prev => [newColor, ...prev.slice(0, 9)]);
                }
              }}
            />
          </div>

          {/* Current Color Display */}
          <div 
            className="w-32 h-32 rounded-2xl border-4 border-white/30 shadow-lg mb-6"
            style={{ backgroundColor: `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})` }}
          />

          {/* Color Values */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-md">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-xs font-medium mb-1">HEX</div>
              <div 
                className="font-mono text-sm cursor-pointer hover:bg-white/10 p-1 rounded"
                onClick={() => copyToClipboard(rgbToHex(currentColor))}
              >
                {rgbToHex(currentColor)}
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-xs font-medium mb-1">RGB</div>
              <div 
                className="font-mono text-sm cursor-pointer hover:bg-white/10 p-1 rounded"
                onClick={() => copyToClipboard(`rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`)}
              >
                {currentColor.r}, {currentColor.g}, {currentColor.b}
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-xs font-medium mb-1">HSL</div>
              <div 
                className="font-mono text-sm cursor-pointer hover:bg-white/10 p-1 rounded"
                onClick={() => copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)}
              >
                {hsl.h}, {hsl.s}%, {hsl.l}%
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={saveColor}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              <Save size={16} />
              Save
            </button>
            <button
              onClick={() => copyToClipboard(rgbToHex(currentColor))}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              <Copy size={16} />
              Copy
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-black/20 p-4 overflow-y-auto">
          {/* Tesla Palettes */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Tesla Palettes</h3>
            <select
              value={selectedPalette}
              onChange={(e) => setSelectedPalette(e.target.value)}
              className="w-full p-2 bg-white/10 rounded-lg text-white border border-white/20"
            >
              {Object.entries(teslaColorPalettes).map(([key, palette]) => (
                <option key={key} value={key} className="bg-gray-800">
                  {palette.name}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {teslaColorPalettes[selectedPalette].colors.map((color, index) => (
                <button
                  key={index}
                  className="w-full h-12 rounded-lg border-2 border-white/20 hover:border-white/40 transition-colors"
                  style={{ backgroundColor: color.hex }}
                  onClick={() => {
                    setCurrentColor({ r: color.r, g: color.g, b: color.b });
                    setColorHistory(prev => [{ r: color.r, g: color.g, b: color.b }, ...prev.slice(0, 9)]);
                  }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Color Harmonies */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Color Harmonies</h3>
            <div className="space-y-3">
              {['complementary', 'triadic', 'analogous'].map((type) => (
                <div key={type}>
                  <div className="text-sm font-medium mb-2 capitalize">{type}</div>
                  <div className="flex gap-1">
                    {generateHarmony(type).map((color, index) => (
                      <button
                        key={index}
                        className="w-8 h-8 rounded border border-white/20"
                        style={{ backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})` }}
                        onClick={() => setCurrentColor(color)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Colors */}
          {savedColors.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Saved Colors</h3>
              <div className="grid grid-cols-4 gap-2">
                {savedColors.map((color, index) => (
                  <button
                    key={index}
                    className="w-12 h-12 rounded-lg border-2 border-white/20 hover:border-white/40 transition-colors"
                    style={{ backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})` }}
                    onClick={() => setCurrentColor(color)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recent Colors */}
          {colorHistory.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Recent Colors</h3>
              <div className="grid grid-cols-4 gap-2">
                {colorHistory.map((color, index) => (
                  <button
                    key={index}
                    className="w-12 h-12 rounded-lg border-2 border-white/20 hover:border-white/40 transition-colors"
                    style={{ backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})` }}
                    onClick={() => setCurrentColor(color)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ColorPickerApp;
