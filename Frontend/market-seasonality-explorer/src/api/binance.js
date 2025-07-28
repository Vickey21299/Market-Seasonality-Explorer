// Binance API service placeholder
// export function fetchBinanceData() {
//   // TODO: Implement API call
// }
import axios from 'axios';
// Function to fetch Kline data from Binance API
// This function fetches Kline (candlestick) data for a given symbol and interval
// It returns an array of objects containing the open, high, low, close prices and volume.
// Parameters:
export const fetchKlineData = async (symbol, interval, startTime, endTime) => {
  const baseUrl = 'https://api.binance.com/api/v3/klines';
  const url = `${baseUrl}?symbol=${symbol}&interval=${interval}&startTime=${startTime}&endTime=${endTime}&limit=1000`;

  try {
    const response = await axios.get(url);
    
    // Binance API returns an array of arrays. We need to format it into an array of objects for easier use.
    const formattedData = response.data.map(kline => ({
      openTime: kline[0],
      open: parseFloat(kline[1]),
      high: parseFloat(kline[2]),
      low: parseFloat(kline[3]),
      close: parseFloat(kline[4]),
      volume: parseFloat(kline[5]),
      closeTime: kline[6],
    }));

    console.log(`Successfully fetched ${formattedData.length} data points for ${symbol}.`);
    return formattedData;

  } catch (error) {
    console.error('Error fetching data from Binance API:', error);
    // In a real app, you'd want more robust error handling, maybe show a toast notification.
    return []; // Return an empty array on error
  }
};