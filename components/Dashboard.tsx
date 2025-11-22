
import React, { useMemo } from 'react';
import { Trade } from '../types';
import EmptyState from './EmptyState';
import { BinanceTicker, COIN_INFO } from '../hooks/useBinanceTicker';

interface DashboardProps {
  trades: Trade[];
  tickers: BinanceTicker[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const StatCard: React.FC<{ title: string; value: string; description: string }> = ({ title, value, description }) => (
  <div className="bg-secondary p-4 rounded-lg">
    <p className="text-sm text-text-secondary">{title}</p>
    <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
    <p className="text-xs text-text-secondary mt-1">{description}</p>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ trades, tickers, isLoading, error, lastUpdated }) => {
  const stats = useMemo(() => {
    const completedTrades = trades.filter(t => t.isComplete && t.pnl !== undefined);
    const totalPnl = completedTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
    const wins = completedTrades.filter(t => (t.pnl || 0) > 0).length;
    const winRate = completedTrades.length > 0 ? (wins / completedTrades.length) * 100 : 0;
    
    return {
      totalTrades: trades.length,
      completedTrades: completedTrades.length,
      totalPnl,
      winRate,
    };
  }, [trades]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        <StatCard title="총 거래" value={stats.totalTrades.toString()} description={`${stats.completedTrades} 완료된 거래`} />
        <StatCard title="누적 손익" value={`${stats.totalPnl >= 0 ? '+' : ''}${stats.totalPnl.toLocaleString()} KRW`} description={`승률: ${stats.winRate.toFixed(1)}%`} />
      </div>

      <div className="bg-secondary rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-text-primary">인기 코인 가격</h3>
            <span className={`w-3 h-3 rounded-full ${error ? 'bg-danger' : 'bg-success animate-pulse'}`} title={error ? `오류: ${error}` : '연결됨'}></span>
          </div>
            <span className="text-xs text-text-secondary">updated: {lastUpdated || '...'}</span>
        </div>
        
        {isLoading && tickers.length === 0 ? (
            <div className="text-center py-10 text-text-secondary">실시간 시세 로딩중...</div>
        ) : error ? (
            <div className="text-center py-10 text-danger">{error}</div>
        ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {tickers.map(coin => {
                    const info = COIN_INFO[coin.symbol];
                    if (!info) return null;
                    const change = parseFloat(coin.priceChangePercent);
                    const price = parseFloat(coin.lastPrice);
                    return (
                        <div key={coin.symbol} className="bg-primary p-3 rounded-md">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-sm text-text-primary">{info.symbol}</span>
                                <span className={`text-xs font-semibold ${change < 0 ? 'text-danger' : 'text-success'}`}>{change.toFixed(2)}%</span>
                            </div>
                            <p className="text-xs text-text-secondary truncate">{info.name}</p>
                            <p className="text-lg font-semibold text-text-primary mt-2">${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: price < 1 ? 4 : 2 })}</p>
                        </div>
                    )
                })}
            </div>
        )}
      </div>
       <div className="bg-secondary rounded-lg p-4">
            <h3 className="font-semibold text-text-primary mb-2">최근 거래</h3>
            <p className="text-sm text-text-secondary mb-4">최근 거래 내역을 확인하세요</p>
            {trades.length > 0 ? (
                 <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="text-left text-xs text-text-secondary">
                            <tr>
                                <th className="p-2">날짜</th>
                                <th className="p-2">심볼</th>
                                <th className="p-2">구분</th>
                                <th className="p-2">진입가격</th>
                                <th className="p-2">손익</th>
                            </tr>
                        </thead>
                        <tbody>
                        {trades.slice(0, 5).map(trade => (
                            <tr key={trade.id} className="border-t border-accent text-sm">
                                <td className="p-2">{new Date(trade.date).toLocaleDateString()}</td>
                                <td className="p-2 font-semibold">{trade.symbol}</td>
                                <td className={`p-2 font-semibold ${trade.position === 'buy' ? 'text-success' : 'text-danger'}`}>{trade.position === 'buy' ? '매수' : '매도'}</td>
                                <td className="p-2">{trade.price.toLocaleString()}</td>
                                <td className={`p-2 font-semibold ${!trade.isComplete ? 'text-text-secondary' : (trade.pnl || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                                    {trade.isComplete ? `${(trade.pnl || 0).toLocaleString()} KRW` : '진행중'}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                 </div>
            ) : (
                <EmptyState
                    title="아직 거래 기록이 없습니다"
                    message="거래 내역 탭에서 첫 번째 거래를 추가해보세요"
                />
            )}
       </div>
    </div>
  );
};

export default Dashboard;
