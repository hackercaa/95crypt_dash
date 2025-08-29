import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { BarChart3 } from 'lucide-react';

interface PriceChartProps {
  symbol: string;
  compact?: boolean;
}

interface ChartData {
  timestamp: number;
  price: number;
  volume: number;
}

export const PriceChart: React.FC<PriceChartProps> = ({ symbol, compact = false }) => {
  const [data, setData] = useState<ChartData[]>([]);
  const [period, setPeriod] = useState('24h');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3001/api/tokens/${symbol}/history?period=${period}`);
        const historyData = await response.json();
        setData(historyData);
      } catch (error) {
        console.error('Failed to fetch price history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [symbol, period]);

  const formatXAxis = (timestamp: number) => {
    if (period === '1h') return format(new Date(timestamp), 'HH:mm');
    if (period === '24h') return format(new Date(timestamp), 'HH:mm');
    return format(new Date(timestamp), 'MMM dd');
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm">
            {format(new Date(label), 'MMM dd, HH:mm')}
          </p>
          <p className="text-white font-medium">
            Price: ${payload[0].value.toFixed(4)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className={`${compact ? 'h-48' : 'h-96'} bg-gray-700/30 rounded-lg flex items-center justify-center`}>
        <BarChart3 className="w-8 h-8 text-gray-400 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="flex items-center space-x-2">
          {['1h', '24h', '7d'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
      
      <div className={`${compact ? 'h-48' : 'h-96'} w-full`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="timestamp"
              tickFormatter={formatXAxis}
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: '#3B82F6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};