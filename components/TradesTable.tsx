
import React, { useState, Fragment } from 'react';
import { Trade } from '../types';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface TradesTableProps {
  trades: Trade[];
  onEdit: (trade: Trade) => void;
  onDelete: (id: string) => void;
  onAnalyze: (id: string) => Promise<void>;
}

const TradesTable: React.FC<TradesTableProps> = ({ trades, onEdit, onDelete, onAnalyze }) => {
  const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  const handleRowClick = (id: string) => {
    setExpandedTradeId(expandedTradeId === id ? null : id);
  };

  const handleAnalyzeClick = async (e: React.MouseEvent, tradeId: string) => {
    e.stopPropagation();
    setAnalyzingId(tradeId);
    await onAnalyze(tradeId);
    setAnalyzingId(null);
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-accent">
        <thead className="bg-accent">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Date</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Pair</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Direction</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">P/L</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Setup</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-secondary divide-y divide-accent">
          {trades.map((trade) => (
            <Fragment key={trade.id}>
              <tr 
                className="hover:bg-accent transition-colors cursor-pointer"
                onClick={() => handleRowClick(trade.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{new Date(trade.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-text-primary">{trade.pair}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${trade.direction === 'long' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {trade.direction}
                  </span>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${trade.status === 'win' ? 'text-success' : trade.status === 'loss' ? 'text-danger' : 'text-text-secondary'}`}>
                  ${trade.pnl.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{trade.setup}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-4">
                      <button onClick={(e) => { e.stopPropagation(); onEdit(trade); }} className="text-highlight hover:text-teal-300" aria-label="Edit trade">
                          <PencilIcon />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); onDelete(trade.id); }} className="text-danger hover:text-red-400" aria-label="Delete trade">
                          <TrashIcon />
                      </button>
                  </div>
                </td>
              </tr>
              {expandedTradeId === trade.id && (
                <tr className="bg-primary">
                  <td colSpan={6} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-text-primary mb-2">Notes</h4>
                        <p className="text-text-secondary text-sm whitespace-pre-wrap">{trade.notes || 'No notes for this trade.'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-text-primary mb-2">Screenshot</h4>
                        {trade.image ? (
                          <img src={trade.image} alt={`Chart for ${trade.pair}`} className="rounded-lg max-w-full h-auto max-h-80 object-contain"/>
                        ) : (
                          <p className="text-text-secondary text-sm">No image attached.</p>
                        )}
                      </div>
                    </div>
                     <div className="mt-6 pt-6 border-t border-accent">
                        <h4 className="font-semibold text-text-primary mb-2 flex items-center">
                            <SparklesIcon />
                            <span className="ml-2">AI Analysis</span>
                        </h4>
                        {trade.analysis ? (
                            <div className="text-text-secondary text-sm whitespace-pre-wrap prose prose-invert max-w-none">{trade.analysis}</div>
                        ) : (
                            <button
                                onClick={(e) => handleAnalyzeClick(e, trade.id)}
                                disabled={analyzingId === trade.id}
                                className="inline-flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors bg-highlight/20 text-highlight hover:bg-highlight/30 disabled:bg-accent disabled:text-text-secondary disabled:cursor-not-allowed"
                            >
                                {analyzingId === trade.id ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Analyzing...</span>
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon />
                                        <span>Analyze with Gemini</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TradesTable;
