
export interface Trade {
  id: string;
  date: string; // ISO 8601 format
  market: 'coin' | 'stock';
  symbol: string;
  position: 'buy' | 'sell';
  entryType: 'quantity' | 'amount';
  quantity: number;
  price: number;
  commission?: number;
  indicators?: string[];
  targetPrice?: number;
  stopLossPrice?: number;
  notes?: string;
  isComplete: boolean;
  exitPrice?: number;
  pnl?: number;
}

export interface Journal {
    id: string;
    date: string; // YYYY-MM-DD
    category: string;
    title: string;
    content: string;
    linkedSymbols?: string[];
    keywords?: string[];
    analysis?: {
        technical: string;
        mindset: string;
        quote: string;
    };
}

export interface CommunityMessage {
    id: string;
    channelId: string;
    userId: string;
    nickname: string;
    text: string;
    timestamp: string;
}

export interface UserProfile {
    id: string;
    nickname: string;
}
