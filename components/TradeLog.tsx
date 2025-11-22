import React, { useMemo } from 'react';
import { Trade } from '../types';
import EmptyState from './EmptyState';
import { PlusIcon } from './icons/PlusIcon';

interface TradeLogProps {
  trades: Trade[];
  onEdit: (trade: Trade) => void;
  onDelete: (id: string) => void;
  onAddTrade: () => void;
}

const StatCard: React.FC<{ title: string; value: string;}> = ({ title, value }) => (
  <div className="bg-secondary p-4 rounded-lg text-center">
    <p className="text-sm text-text-secondary">{title}</p>
    <p className="text-xl font-bold text-text-primary mt-1">{value}</p>
  </div>
);

const TradeLog: React.FC<TradeLogProps> = ({ trades, onEdit, onDelete, onAddTrade }) => {
    const stats = useMemo(() => {
        const completed = trades.filter(t => t.isComplete && t.pnl !== undefined);
        const totalPnl = completed.reduce((sum, t) => sum + (t.pnl || 0), 0);
        const wins = completed.filter(t => (t.pnl || 0) > 0);
        const winRate = completed.length > 0 ? (wins.length / completed.length) * 100 : 0;
        const avgPnl = completed.length > 0 ? totalPnl / completed.length : 0;
        const maxProfit = Math.max(0, ...completed.map(t => t.pnl || 0));
        const maxLoss = Math.min(0, ...completed.map(t => t.pnl || 0));

        return { totalPnl, winRate, avgPnl, maxProfit, maxLoss, totalTrades: trades.length };
    }, [trades]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">거래 내역</h2>
        <button onClick={onAddTrade} className="flex items-center space-x-2 bg-highlight hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors">
            <PlusIcon />
            <span>새 거래 추가</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="누적 손익" value={`${stats.totalPnl.toLocaleString()} KRW`} />
        <StatCard title="승률" value={`${stats.winRate.toFixed(1)}%`} />
        <StatCard title="평균 손익" value={`${stats.avgPnl.toLocaleString()} KRW`} />
        <StatCard title="최대 수익" value={`${stats.maxProfit.toLocaleString()} KRW`} />
        <StatCard title="최대 손실" value={`${stats.maxLoss.toLocaleString()} KRW`} />
        <StatCard title="총 거래" value={stats.totalTrades.toString()} />
      </div>
      
      {trades.length === 0 ? (
        <EmptyState
            title="거래 내역이 없습니다"
            message="첫 번째 거래를 추가해보세요"
            buttonText="새 거래 추가"
            onButtonClick={onAddTrade}
        />
      ) : (
        <div className="bg-secondary rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-accent">
                    <thead className="bg-accent">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">날짜</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">심볼</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">구분</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">진입 가격</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">청산 가격</th>
                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">손익(PNL)</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">상태</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">관리</th>
                    </tr>
                    </thead>
                    <tbody className="bg-secondary divide-y divide-accent">
                        {trades.map(trade => (
                            <tr key={trade.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(trade.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">{trade.symbol}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${trade.position === 'buy' ? 'text-success' : 'text-danger'}`}>{trade.position === 'buy' ? '매수' : '매도'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{trade.price.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{trade.exitPrice?.toLocaleString() ?? '-'}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${!trade.isComplete ? 'text-text-secondary' : (trade.pnl || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                                    {trade.isComplete ? `${(trade.pnl || 0).toLocaleString()} KRW` : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${trade.isComplete ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {trade.isComplete ? '완료' : '진행중'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => onEdit(trade)} className="text-highlight hover:text-teal-300 mr-4">수정</button>
                                    <button onClick={() => onDelete(trade.id)} className="text-danger hover:text-red-400">삭제</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
};

export default TradeLog;
