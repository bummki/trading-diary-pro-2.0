import { useState, useEffect, useRef } from 'react';

export interface BinanceTicker {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  lastPrice: string;
  volume: string;
}

export const COIN_INFO: { [key: string]: { name: string; symbol: string } } = {
  'BTCUSDT': { name: 'Bitcoin', symbol: 'BTC' },
  'ETHUSDT': { name: 'Ethereum', symbol: 'ETH' },
  'XRPUSDT': { name: 'XRP', symbol: 'XRP' },
  'DOGEUSDT': { name: 'Dogecoin', symbol: 'DOGE' },
  'ADAUSDT': { name: 'Cardano', symbol: 'ADA' },
  'SOLUSDT': { name: 'Solana', symbol: 'SOL' },
  'DOTUSDT': { name: 'Polkadot', symbol: 'DOT' },
  'LINKUSDT': { name: 'Chainlink', symbol: 'LINK' },
};

const SYMBOLS = Object.keys(COIN_INFO);

export function useBinanceTicker() {
  const [tickers, setTickers] = useState<BinanceTicker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // useRef to avoid re-creating the function on every render
  const fetchDataRef = useRef<() => Promise<void>>();

  fetchDataRef.current = async () => {
    // To prevent race conditions on initial load, only set loading if not already loading
    if (!isLoading) setIsLoading(true);
    
    try {
      const symbolsParam = JSON.stringify(SYMBOLS);
      const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbolsParam)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Binance API Error: ${errorData.msg || response.statusText}`);
      }
      
      const data: BinanceTicker[] = await response.json();
      
      // Sort data to maintain a consistent order in the UI
      const sortedData = data.sort((a, b) => SYMBOLS.indexOf(a.symbol) - SYMBOLS.indexOf(b.symbol));
      
      setTickers(sortedData);
      setLastUpdated(new Date().toLocaleTimeString('ko-KR'));
      if (error) setError(null); // Clear previous error on success
    } catch (e: any) {
      console.error("Failed to fetch Binance ticker data:", e);
      setError('시세 로딩 실패. 잠시 후 다시 시도합니다.');
      // Keep stale data on error instead of clearing it
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = () => fetchDataRef.current && fetchDataRef.current();
    fetchData(); // Fetch immediately on mount
    const interval = setInterval(fetchData, 30000); // And every 30 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, []); // Empty dependency array ensures this runs only once on mount

  return { tickers, isLoading, error, lastUpdated };
}
