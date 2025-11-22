
import React, { useState } from 'react';
import { Trade } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';

interface ImportTradesModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Fix: Removed 'status' from Omit type as it does not exist on Trade type.
  onSave: (trades: Omit<Trade, 'id' | 'pnl'>[]) => void;
}

// Fix: Removed 'status' from Omit type to align with Trade interface.
type ParsedTrade = Omit<Trade, 'id' | 'pnl'>;

const REQUIRED_HEADERS = ['date', 'pair', 'direction', 'entryPrice', 'exitPrice', 'size', 'setup'];
const PREVIEW_HEADERS = ['date', 'pair', 'direction', 'entryPrice', 'exitPrice', 'size', 'setup', 'notes', 'image'];


const ImportTradesModal: React.FC<ImportTradesModalProps> = ({ isOpen, onClose, onSave }) => {
  // Fix: Changed state to hold raw CSV data for preview table compatibility.
  const [parsedTrades, setParsedTrades] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);
    setParsedTrades([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target?.result as string;
      parseCSV(csvText);
    };
    reader.onerror = () => {
        setError("Failed to read the file.");
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string) => {
    try {
      const lines = text.trim().split(/\r?\n/);
      if (lines.length < 2) {
        setError('CSV file must have a header row and at least one data row.');
        return;
      }

      const header = lines[0].split(',').map(h => h.trim());
      const missingHeaders = REQUIRED_HEADERS.filter(rh => !header.includes(rh));

      if (missingHeaders.length > 0) {
        setError(`CSV is missing required headers: ${missingHeaders.join(', ')}.`);
        return;
      }
      
      const dataRows = lines.slice(1);
      // Fix: Map CSV rows to a raw object structure for preview purposes, instead of trying to conform to ParsedTrade here.
      const trades: any[] = dataRows.map((line, index) => {
        const values = line.split(',');
        const rawTradeObject: { [key: string]: string } = {};
        header.forEach((h, i) => {
            if (values[i] !== undefined) {
                rawTradeObject[h] = values[i].trim();
            }
        });

        const entryPrice = parseFloat(rawTradeObject.entryPrice);
        const exitPrice = parseFloat(rawTradeObject.exitPrice);
        const size = parseFloat(rawTradeObject.size);

        if (
            !rawTradeObject.date ||
            !rawTradeObject.pair ||
            !rawTradeObject.direction ||
            isNaN(entryPrice) ||
            // isNaN(exitPrice) || // This check is incorrect for open trades where exitPrice may be empty.
            isNaN(size) ||
            !rawTradeObject.setup
        ) {
            throw new Error(`Row ${index + 2}: Contains invalid or missing data. Please check all required fields.`);
        }

        if (rawTradeObject.direction !== 'long' && rawTradeObject.direction !== 'short') {
            throw new Error(`Row ${index + 2}: 'direction' must be 'long' or 'short'.`);
        }

        return {
            date: rawTradeObject.date,
            pair: rawTradeObject.pair,
            direction: rawTradeObject.direction as 'long' | 'short',
            entryPrice,
            exitPrice, // Will be NaN if empty, handled later
            size,
            setup: rawTradeObject.setup,
            notes: rawTradeObject.notes || '',
            image: rawTradeObject.image || '',
        };
      });

      setParsedTrades(trades);
    } catch (e: any) {
      setError(`Error parsing CSV: ${e.message}`);
      setParsedTrades([]);
    }
  };

  const handleSubmit = () => {
    if (parsedTrades.length > 0) {
      // Fix: Transform the raw parsed data into the correct `ParsedTrade` structure before saving.
      const finalTrades: ParsedTrade[] = parsedTrades.map((rawTrade) => {
          const isComplete = rawTrade.exitPrice && !isNaN(rawTrade.exitPrice);
          const notes = [
              rawTrade.setup ? `Setup: ${rawTrade.setup}` : null,
              rawTrade.notes,
              rawTrade.image ? `Image URL: ${rawTrade.image}` : null
          ].filter(Boolean).join('\n');

          return {
              date: new Date(rawTrade.date).toISOString(),
              market: 'coin',
              symbol: rawTrade.pair,
              position: rawTrade.direction === 'long' ? 'buy' : 'sell',
              entryType: 'quantity',
              quantity: rawTrade.size,
              price: rawTrade.entryPrice,
              isComplete,
              exitPrice: isComplete ? rawTrade.exitPrice : undefined,
              notes,
          };
      });
      onSave(finalTrades);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-secondary rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-accent flex justify-between items-center">
          <h2 className="text-2xl font-bold text-text-primary">Import Trades from CSV</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary"><XMarkIcon /></button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Instructions</h3>
            <p className="text-sm text-text-secondary">
              Upload a CSV file with the following headers: <code className="text-xs bg-primary p-1 rounded">date, pair, direction, entryPrice, exitPrice, size, setup</code>.
            </p>
             <p className="text-sm text-text-secondary mt-1">
              Optional headers are: <code className="text-xs bg-primary p-1 rounded">notes, image</code>.
            </p>
            <ul className="text-sm text-text-secondary list-disc list-inside mt-2">
                <li><code className="text-xs">date</code> should be in a format like YYYY-MM-DD.</li>
                <li><code className="text-xs">direction</code> must be 'long' or 'short'.</li>
                <li><code className="text-xs">entryPrice</code>, <code className="text-xs">exitPrice</code>, and <code className="text-xs">size</code> must be numbers.</li>
                <li>Fields should not contain commas.</li>
            </ul>
          </div>

          <div>
            <label htmlFor="csv-upload" className="block text-sm font-medium text-text-secondary mb-1">Upload CSV File</label>
            <input 
              id="csv-upload"
              type="file" 
              onChange={handleFileChange} 
              accept=".csv" 
              className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-highlight file:text-white hover:file:bg-teal-600"
            />
            {fileName && <p className="text-xs text-text-secondary mt-1">Selected file: {fileName}</p>}
          </div>
          
          {error && <div className="bg-danger/20 text-danger p-3 rounded-md text-sm">{error}</div>}

          {parsedTrades.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Trade Preview ({parsedTrades.length} trades)</h3>
              <div className="max-h-60 overflow-y-auto border border-accent rounded-md">
                <table className="min-w-full divide-y divide-accent">
                  <thead className="bg-accent sticky top-0">
                    <tr>
                      {PREVIEW_HEADERS.map(key => (
                        <th key={key} className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-secondary divide-y divide-accent">
                    {parsedTrades.map((trade, index) => (
                      <tr key={index}>
                        {PREVIEW_HEADERS.map(key => (
                           <td key={key} className="px-4 py-2 whitespace-nowrap text-sm truncate max-w-xs">
                             {key === 'image' ? ((trade as any)[key] ? 'Yes' : 'No') : ((trade as any)[key] || '')}
                           </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-accent flex justify-end">
            <button type="button" onClick={onClose} className="bg-accent hover:bg-gray-600 text-text-primary font-bold py-2 px-4 rounded-md mr-2 transition-colors">Cancel</button>
            <button 
              type="button" 
              onClick={handleSubmit} 
              disabled={parsedTrades.length === 0 || !!error}
              className="bg-highlight hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-accent disabled:text-text-secondary disabled:cursor-not-allowed"
            >
              Import {parsedTrades.length > 0 ? parsedTrades.length : ''} Trades
            </button>
        </div>
      </div>
    </div>
  );
};

export default ImportTradesModal;
