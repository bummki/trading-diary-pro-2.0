
import React, { useState, useMemo } from 'react';
import { Trade, Journal } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TradeLog from './components/TradeLog';
import JournalPage from './components/JournalPage';
import AnalysisPage from './components/AnalysisPage';
import ChatPage from './components/ChatPage';
import AddTradeModal from './components/AddTradeModal';
import Footer from './components/Footer';
import { PlusIcon } from './components/icons/PlusIcon';

import { useBinanceTicker } from './hooks/useBinanceTicker';

type View = 'dashboard' | 'trades' | 'analysis' | 'journal' | 'chat';

const App: React.FC = () => {
  const [trades, setTrades] = useLocalStorage<Trade[]>('trades_v2', []);
  const [journals, setJournals] = useLocalStorage<Journal[]>('journals', []);

  const [activeView, setActiveView] = useState<View>('journal');

  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeToEdit, setTradeToEdit] = useState<Trade | undefined>(undefined);

  const { tickers, isLoading, error, lastUpdated } = useBinanceTicker();


  const sortedTrades = useMemo(() => {
    return [...trades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [trades]);

  const handleAddTradeClick = () => {
    setTradeToEdit(undefined);
    setIsTradeModalOpen(true);
  };

  const handleEditTrade = (trade: Trade) => {
    setTradeToEdit(trade);
    setIsTradeModalOpen(true);
  };

  const handleDeleteTrade = (id: string) => {
    if (window.confirm('이 거래 내역을 삭제하시겠습니까?')) {
      setTrades(trades.filter((t) => t.id !== id));
    }
  };

  const handleSaveTrade = (tradeData: Omit<Trade, 'id'>, id?: string) => {
    if (id) {
      setTrades(trades.map((t) => (t.id === id ? { ...t, ...tradeData, id } : t)));
    } else {
      const newTrade: Trade = {
        id: new Date().toISOString() + Math.random(),
        ...tradeData,
      };
      setTrades([...trades, newTrade]);
    }
    setIsTradeModalOpen(false);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard trades={sortedTrades} tickers={tickers} isLoading={isLoading} error={error} lastUpdated={lastUpdated} />;
      case 'trades':
        return <TradeLog trades={sortedTrades} onEdit={handleEditTrade} onDelete={handleDeleteTrade} onAddTrade={handleAddTradeClick} />;
      case 'journal':
        return <JournalPage journals={journals} setJournals={setJournals} />;
      case 'analysis':
        return <AnalysisPage />;
      case 'chat':
        return <ChatPage />;
      default:
        return <Dashboard trades={sortedTrades} tickers={tickers} isLoading={isLoading} error={error} lastUpdated={lastUpdated} />;
    }
  }

  return (
    <div className="min-h-screen bg-primary font-sans flex flex-col">
      <Header activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-grow p-4 md:p-8">
        {renderContent()}
      </main>
      <Footer />
      {(activeView === 'trades' || activeView === 'dashboard') &&
        <button
          onClick={handleAddTradeClick}
          className="fixed bottom-24 right-6 bg-highlight hover:bg-teal-500 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-highlight focus:ring-opacity-50"
          aria-label="새 거래 추가"
        >
          <PlusIcon />
        </button>
      }
      {isTradeModalOpen && (
        <AddTradeModal
          isOpen={isTradeModalOpen}
          onClose={() => setIsTradeModalOpen(false)}
          onSave={handleSaveTrade}
          tradeToEdit={tradeToEdit}
        />
      )}
    </div>
  );
};

export default App;
