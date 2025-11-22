import React, { useState, useEffect, useCallback } from 'react';
import { Trade } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';

interface AddTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tradeData: Omit<Trade, 'id'>, id?: string) => void;
  tradeToEdit?: Trade;
}

type TradeFormData = Omit<Trade, 'id'>;

const INDICATORS = ['MA', 'RSI', 'MACD', 'Bollinger', 'Volume', '기타 지표'];

const AddTradeModal: React.FC<AddTradeModalProps> = ({ isOpen, onClose, onSave, tradeToEdit }) => {
  const getInitialState = useCallback((): TradeFormData => ({
    date: tradeToEdit?.date || new Date().toISOString().slice(0, 16),
    market: tradeToEdit?.market || 'coin',
    symbol: tradeToEdit?.symbol || '',
    position: tradeToEdit?.position || 'buy',
    entryType: tradeToEdit?.entryType || 'quantity',
    quantity: tradeToEdit?.quantity || 0,
    price: tradeToEdit?.price || 0,
    commission: tradeToEdit?.commission || 0,
    indicators: tradeToEdit?.indicators || [],
    targetPrice: tradeToEdit?.targetPrice || 0,
    stopLossPrice: tradeToEdit?.stopLossPrice || 0,
    notes: tradeToEdit?.notes || '',
    isComplete: tradeToEdit?.isComplete || false,
    exitPrice: tradeToEdit?.exitPrice || 0,
    pnl: tradeToEdit?.pnl || 0,
  }), [tradeToEdit]);

  const [formData, setFormData] = useState<TradeFormData>(getInitialState);

  useEffect(() => {
    setFormData(getInitialState());
  }, [tradeToEdit, isOpen, getInitialState]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({...prev, [name]: checked }));
    } else {
        setFormData(prev => ({...prev, [name]: value}));
    }
  };

  const handleIndicatorChange = (indicator: string) => {
    setFormData(prev => {
        const newIndicators = prev.indicators?.includes(indicator)
            ? prev.indicators.filter(i => i !== indicator)
            : [...(prev.indicators || []), indicator];
        return { ...prev, indicators: newIndicators };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let pnl;
    if (formData.isComplete && formData.exitPrice) {
      const entryValue = formData.price * formData.quantity;
      const exitValue = formData.exitPrice * formData.quantity;
      if (formData.position === 'buy') {
        pnl = exitValue - entryValue;
      } else {
        pnl = entryValue - exitValue;
      }
      pnl -= (formData.commission || 0);
    }

    onSave({
        ...formData,
        quantity: parseFloat(formData.quantity as any),
        price: parseFloat(formData.price as any),
        commission: parseFloat(formData.commission as any),
        targetPrice: parseFloat(formData.targetPrice as any),
        stopLossPrice: parseFloat(formData.stopLossPrice as any),
        exitPrice: formData.isComplete ? parseFloat(formData.exitPrice as any) : undefined,
        pnl: formData.isComplete ? pnl : undefined
    }, tradeToEdit?.id);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-secondary rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-accent flex justify-between items-center sticky top-0 bg-secondary z-10">
          <h2 className="text-2xl font-bold text-text-primary">{tradeToEdit ? '거래 수정' : '거래 추가 v2'}</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary"><XMarkIcon /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">날짜/시간</label>
                    <input type="datetime-local" name="date" value={formData.date} onChange={handleChange} className="w-full bg-primary text-text-primary p-2 rounded-md border border-accent" required/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">시장</label>
                    <select name="market" value={formData.market} onChange={handleChange} className="w-full bg-primary text-text-primary p-2 rounded-md border border-accent">
                        <option value="coin">코인</option>
                        <option value="stock">주식</option>
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">심볼</label>
                    <input type="text" name="symbol" placeholder="BTC, AAPL, 005930" value={formData.symbol} onChange={handleChange} className="w-full bg-primary text-text-primary p-2 rounded-md border border-accent" required/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">매매구분</label>
                    <select name="position" value={formData.position} onChange={handleChange} className="w-full bg-primary text-text-primary p-2 rounded-md border border-accent">
                        <option value="buy">매수</option>
                        <option value="sell">매도</option>
                    </select>
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">수량</label>
                    <input type="number" step="any" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full bg-primary text-text-primary p-2 rounded-md border border-accent" required/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">진입 가격</label>
                    <input type="number" step="any" name="price" value={formData.price} onChange={handleChange} className="w-full bg-primary text-text-primary p-2 rounded-md border border-accent" required/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">수수료 (선택)</label>
                    <input type="number" step="any" name="commission" value={formData.commission} onChange={handleChange} className="w-full bg-primary text-text-primary p-2 rounded-md border border-accent"/>
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">매매지표</label>
                <div className="flex flex-wrap gap-2">
                    {INDICATORS.map(indicator => (
                        <button type="button" key={indicator} onClick={() => handleIndicatorChange(indicator)} className={`px-3 py-1 text-sm rounded-full ${formData.indicators?.includes(indicator) ? 'bg-highlight text-white' : 'bg-primary text-text-secondary'}`}>
                            {indicator}
                        </button>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">목표가</label>
                    <input type="number" step="any" name="targetPrice" value={formData.targetPrice} onChange={handleChange} className="w-full bg-primary text-text-primary p-2 rounded-md border border-accent"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">손절가</label>
                    <input type="number" step="any" name="stopLossPrice" value={formData.stopLossPrice} onChange={handleChange} className="w-full bg-primary text-text-primary p-2 rounded-md border border-accent"/>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">메모 (전략·근거)</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} placeholder="거래 전략이나 근거를 입력하세요" className="w-full bg-primary text-text-primary p-2 rounded-md border border-accent"></textarea>
            </div>
            <div className="flex items-center space-x-2">
                 <input type="checkbox" id="isComplete" name="isComplete" checked={formData.isComplete} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-highlight focus:ring-highlight" />
                 <label htmlFor="isComplete" className="text-sm text-text-secondary">완결 거래</label>
            </div>
            {formData.isComplete && (
                 <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">청산 가격</label>
                    <input type="number" step="any" name="exitPrice" value={formData.exitPrice} onChange={handleChange} className="w-full bg-primary text-text-primary p-2 rounded-md border border-accent" required/>
                </div>
            )}
            <div className="flex justify-end pt-4">
                <button type="button" onClick={onClose} className="bg-accent hover:bg-gray-600 text-text-primary font-bold py-2 px-4 rounded-md mr-2 transition-colors">취소</button>
                <button type="submit" className="bg-highlight hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors">저장</button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AddTradeModal;
