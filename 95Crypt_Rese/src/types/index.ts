import { Token } from './index';

export interface ExchangeData {
  symbol: string;
  totalExchanges: number;
  exchanges: string[];
  newExchanges24h: string[];
  removedExchanges24h: string[];
  exchangeChange24h: number;
  lastUpdated: number;
  previousUpdate?: number;
  dataSource: string;
  isFirstRun?: boolean;
  error?: string;
  scrapedAt?: number;
  scraperRunId?: string;
}

export interface Token {
  id: string;
  symbol: string;
  name: string;
  exchanges: string[];
  added: number;
  newExchanges?: string[];
  removedExchanges?: string[];
  exchangeData?: ExchangeData;
  exchangeHistory?: Array<{
    timestamp: number;
    totalExchanges: number;
    exchanges: string[];
    newExchanges: string[];
    removedExchanges: string[];
    scraperRunId?: string;
  }>;
  lastScrapedAt?: number;
  scraperStatus?: 'pending' | 'scraped' | 'error';
  allTimeHigh?: number;
  allTimeLow?: number;
  athLastUpdated?: number;
}

export interface PriceData {
  symbol: string;
  timestamp: number;
  averagePrice: number;
  change24h: number;
  allTimeHigh?: number;
  allTimeLow?: number;
  exchanges: {
    mexc?: {
      price: number;
      volume: number;
      change: number;
      high24h?: number;
      low24h?: number;
      volume24h?: number;
      openPrice?: number;
      priceChange?: number;
      count?: number;
      bidPrice?: number;
      askPrice?: number;
      status?: string;
      tradingEnabled?: boolean;
    };
    gateio?: {
      price: number;
      volume: number;
      change: number;
      high24h?: number;
      low24h?: number;
      volume24h?: number;
      openPrice?: number;
      priceChange?: number;
      count?: number;
      bidPrice?: number;
      askPrice?: number;
      status?: string;
      tradingEnabled?: boolean;
    };
  };
}

export interface DeletedToken {
  id: string;
  symbol: string;
  name: string;
  exchanges: string[];
  dateAdded: number;
  dateDeleted: number;
  deletionReason: string;
  deletedBy?: string;
}