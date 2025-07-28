// --- FILE: src/utils/dashboardUtils.js ---

import { format, eachDayOfInterval } from 'date-fns';

// --- Technical Indicator Helper Functions (No changes needed here) ---
const calculateMA = (data, period) => {
  if (data.length < period) return null;
  const sum = data.slice(-period).reduce((acc, val) => acc + val.close, 0);
  return sum / period;
};
const calculateStdDev = (data, period) => {
  if (data.length < period) return null;
  const slice = data.slice(-period).map(d => d.close);
  const mean = slice.reduce((acc, val) => acc + val, 0) / period;
  const variance = slice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / period;
  return Math.sqrt(variance);
};
const calculateRSI = (data, period = 14) => {
  if (data.length <= period) return null;
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = data[i].close - data[i - 1].close;
    diff >= 0 ? gains += diff : losses -= diff;
  }
  let avgGain = gains / period, avgLoss = losses / period;
  for (let i = period + 1; i < data.length; i++) {
    const diff = data[i].close - data[i - 1].close;
    if (diff >= 0) {
      avgGain = (avgGain * (period - 1) + diff) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) - diff) / period;
    }
  }
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
};

// --- Main Calculation Function ---
export const calculateDashboardMetrics = (startDate, endDate, fullMarketDataMap) => {
  if (!startDate || !endDate || !fullMarketDataMap || fullMarketDataMap.size === 0) return null;
  
  const periodData = eachDayOfInterval({ start: startDate, end: endDate })
    .map(date => fullMarketDataMap.get(format(date, 'yyyy-MM-dd')))
    .filter(Boolean);

  if (periodData.length === 0) return null;

  const allHistoricalData = Array.from(fullMarketDataMap.values()).sort((a, b) => a.openTime - b.openTime);
  const endIndex = allHistoricalData.findIndex(d => d.openTime === periodData[periodData.length - 1].openTime);
  const dataForIndicators = allHistoricalData.slice(0, endIndex + 1);

  // --- Chart Data Preparation ---
  const labels = periodData.map(d => format(new Date(d.openTime), 'MMM d'));
  const closePrices = periodData.map(d => d.close);
  const volumeData = periodData.map(d => d.volume);

  const ma20Data = periodData.map((_, index) => {
    const historicalSlice = allHistoricalData.slice(0, endIndex - periodData.length + index + 1);
    return calculateMA(historicalSlice, 20);
  });
  const ma50Data = periodData.map((_, index) => {
    const historicalSlice = allHistoricalData.slice(0, endIndex - periodData.length + index + 1);
    return calculateMA(historicalSlice, 50);
  });

  const periodOpen = periodData[0].open;
  const periodClose = periodData[periodData.length - 1].close;

  return {
    header: `Summary for ${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`,
    charts: {
      labels,
      closePrices,
      volumeData,
      ma20Data,
      ma50Data,
    },
    stats: {
      periodHigh: Math.max(...periodData.map(d => d.high)),
      periodLow: Math.min(...periodData.map(d => d.low)),
      totalVolume: periodData.reduce((sum, d) => sum + d.volume, 0),
      priceChangeDollar: periodClose - periodOpen,
      priceChangePercent: ((periodClose - periodOpen) / periodOpen) * 100,
      avgVolatility: periodData.map(d => ((d.high - d.low) / d.open) * 100).reduce((s, v) => s + v, 0) / periodData.length || 0,
      stdDev: calculateStdDev(dataForIndicators, 20),
      ma20: calculateMA(dataForIndicators, 20),
      ma50: calculateMA(dataForIndicators, 50),
      rsi: calculateRSI(dataForIndicators, 14),
    },
  };
};