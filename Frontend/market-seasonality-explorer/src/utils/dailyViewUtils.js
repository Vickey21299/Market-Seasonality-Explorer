import { format } from 'date-fns';

/**
 * Processes raw hourly data and calculates metrics for the DailyView component.
 * @param {Array<Array<any>>} intradayData - The raw hourly data from the API.
 * @returns {object|null} An object with data structured for charts and stats.
 */
export const processIntradayData = (intradayData) => {
  if (!intradayData || intradayData.length === 0) {
    return null;
  }

  // --- Chart Data Preparation ---
  const labels = intradayData.map(hourData => format(new Date(hourData[0]), 'ha')); // Format as "1AM", "2PM", etc.
  const closePrices = intradayData.map(hourData => parseFloat(hourData[4]));
  const volumeData = intradayData.map(hourData => parseFloat(hourData[5]));

  // --- Stats Calculation ---
  const dayHigh = Math.max(...intradayData.map(h => parseFloat(h[2])));
  const dayLow = Math.min(...intradayData.map(h => parseFloat(h[3])));
  const totalVolume = volumeData.reduce((sum, vol) => sum + vol, 0);
  const open = parseFloat(intradayData[0][1]);
  const close = parseFloat(intradayData[intradayData.length - 1][4]);
  const priceChange = close - open;
  const priceChangePercent = (priceChange / open) * 100;


  return {
    charts: {
      labels,
      closePrices,
      volumeData,
    },
    stats: {
      dayHigh,
      dayLow,
      totalVolume,
      priceChange,
      priceChangePercent,
    },
  };
};