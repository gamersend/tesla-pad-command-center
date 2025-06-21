
import React, { useState } from 'react';
import { Copy, Download, Upload, FileText, Code, BarChart3 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface JSONValidationResult {
  valid: boolean;
  data: any;
  errors: Array<{ message: string; line?: number; column?: number }>;
}

class JSONToolsEngine {
  validateJSON(jsonString: string): JSONValidationResult {
    try {
      const parsed = JSON.parse(jsonString);
      return { 
        valid: true, 
        data: parsed, 
        errors: [] 
      };
    } catch (error: any) {
      return { 
        valid: false, 
        data: null, 
        errors: [{ 
          message: error.message
        }] 
      };
    }
  }

  formatJSON(jsonString: string, indent: number = 2): string {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, indent);
    } catch (error: any) {
      throw new Error(`Format failed: ${error.message}`);
    }
  }

  minifyJSON(jsonString: string): string {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed);
    } catch (error: any) {
      throw new Error(`Minify failed: ${error.message}`);
    }
  }

  convertToCSV(jsonData: any[]): string {
    if (!Array.isArray(jsonData)) {
      throw new Error('CSV conversion requires an array of objects');
    }

    if (jsonData.length === 0) {
      return '';
    }

    const keys = [...new Set(jsonData.flatMap(obj => Object.keys(obj)))];
    const csvLines = [keys.join(',')];

    jsonData.forEach(obj => {
      const row = keys.map(key => {
        const value = obj[key];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value);
      });
      csvLines.push(row.join(','));
    });

    return csvLines.join('\n');
  }
}

const JSONToolsApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('validator');
  const [inputJSON, setInputJSON] = useState('');
  const [outputJSON, setOutputJSON] = useState('');
  const [validation, setValidation] = useState<JSONValidationResult>({ valid: true, data: null, errors: [] });
  const [jsonEngine] = useState(new JSONToolsEngine());

  const tools = [
    { id: 'validator', name: 'Validator', icon: <FileText className="w-5 h-5" /> },
    { id: 'formatter', name: 'Formatter', icon: <Code className="w-5 h-5" /> },
    { id: 'converter', name: 'Converter', icon: <BarChart3 className="w-5 h-5" /> }
  ];

  const validateInput = (json: string) => {
    if (!json.trim()) {
      setValidation({ valid: true, data: null, errors: [] });
      return;
    }

    const result = jsonEngine.validateJSON(json);
    setValidation(result);
  };

  const handleInputChange = (value: string) => {
    setInputJSON(value);
    validateInput(value);
  };

  const formatJSON = () => {
    try {
      const formatted = jsonEngine.formatJSON(inputJSON, 2);
      setOutputJSON(formatted);
      toast({
        title: "JSON Formatted",
        description: "JSON has been formatted successfully"
      });
    } catch (error: any) {
      toast({
        title: "Format Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const minifyJSON = () => {
    try {
      const minified = jsonEngine.minifyJSON(inputJSON);
      setOutputJSON(minified);
      toast({
        title: "JSON Minified",
        description: "JSON has been minified successfully"
      });
    } catch (error: any) {
      toast({
        title: "Minify Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const convertToCSV = () => {
    try {
      const parsed = JSON.parse(inputJSON);
      const csv = jsonEngine.convertToCSV(parsed);
      setOutputJSON(csv);
      toast({
        title: "Converted to CSV",
        description: "JSON has been converted to CSV format"
      });
    } catch (error: any) {
      toast({
        title: "Conversion Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Content copied to clipboard"
    });
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadSampleData = () => {
    const sample = {
      "tesla_dashboard": {
        "version": "1.0.0",
        "user_preferences": {
          "theme": "dark",
          "language": "en",
          "notifications": true
        },
        "apps": [
          {
            "id": "weather",
            "name": "Weather",
            "position": { "x": 0, "y": 0 },
            "settings": {
              "location": "San Francisco",
              "unit": "fahrenheit"
            }
          },
          {
            "id": "music",
            "name": "Music",
            "position": { "x": 1, "y": 0 },
            "settings": {
              "provider": "spotify",
              "quality": "high"
            }
          }
        ]
      }
    };
    setInputJSON(JSON.stringify(sample, null, 2));
    validateInput(JSON.stringify(sample, null, 2));
  };

  return (
    <div className="json-tools-app">
      <div className="json-tools-sidebar">
        <div className="tool-selector">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">JSON Tools</h3>
          {tools.map(tool => (
            <button
              key={tool.id}
              className={`tool-button ${activeTab === tool.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tool.id)}
            >
              {tool.icon}
              <span className="ml-2">{tool.name}</span>
            </button>
          ))}
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={loadSampleData}
              className="w-full p-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
            >
              Load Sample Data
            </button>
          </div>
        </div>
      </div>

      <div className="json-main-area">
        <div className="json-toolbar">
          <div className="flex gap-2">
            <button onClick={formatJSON} className="toolbar-button">
              Format
            </button>
            <button onClick={minifyJSON} className="toolbar-button">
              Minify
            </button>
            {activeTab === 'converter' && (
              <button onClick={convertToCSV} className="toolbar-button">
                To CSV
              </button>
            )}
            <button 
              onClick={() => copyToClipboard(outputJSON || inputJSON)}
              className="toolbar-button"
            >
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </button>
            <button 
              onClick={() => downloadFile(outputJSON || inputJSON, 'data.json')}
              className="toolbar-button"
            >
              <Download className="w-4 h-4 mr-1" />
              Download
            </button>
          </div>
        </div>

        <div className="json-workspace">
          <div className="json-input-area">
            <div className="output-header">Input JSON</div>
            <textarea
              className="json-editor"
              value={inputJSON}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Paste your JSON here..."
            />
            <div className="validation-status">
              <div className={`status-indicator ${validation.valid ? 'status-valid' : 'status-invalid'}`}></div>
              <span>{validation.valid ? 'Valid JSON' : 'Invalid JSON'}</span>
              {validation.errors.length > 0 && (
                <div className="error-list">
                  {validation.errors.map((error, index) => (
                    <div key={index} className="error-item">
                      {error.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="json-output-area">
            <div className="output-header">Output</div>
            <div className="json-output">
              {outputJSON || 'Output will appear here...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JSONToolsApp;
