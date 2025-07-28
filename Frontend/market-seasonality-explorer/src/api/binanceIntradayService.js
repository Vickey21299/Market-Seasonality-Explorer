// --- FILE: src/api/binanceIntradayService.js ---

// We no longer need date-fns here
// import { startOfDay, endOfDay } from 'date-fns';

const API_BASE_URL = 'https://api.binance.com/api/v3/klines';

/**
 * Fetches 1-hour interval Kline/candlestick data for a single day in UTC.
 * @param {Date} date - The specific day for which to fetch intraday data.
 * @returns {Promise<Array<Array<any>>>} A promise that resolves to the hourly kline data.
 */
export const fetchIntradayData = async (date) => {
  // 1. Get the date part of the ISO string (e.g., "2025-07-28")
  const dateString = date.toISOString().slice(0, 10);
  const symbol = localStorage.getItem('selectedSymbol') || 'BTCUSDT';
  // 2. Create new Date objects at the start and end of that day in UTC
  const startTime = new Date(`${dateString}T00:00:00.000Z`).getTime();
  const endTime = new Date(`${dateString}T23:59:59.999Z`).getTime();

  const params = new URLSearchParams({
    symbol: symbol,
    interval: '1h',
    startTime: startTime.toString(),
    endTime: endTime.toString(),
  });

  const url = `${API_BASE_URL}?${params.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${response.status} - ${errorData.msg || 'An error occurred'}`);
    }

    const jsonData = await response.json();
    return jsonData;

  } catch (error) {
    console.error('Error fetching intraday data:', error);
    throw error;
  }
};

/**
 * DISCLAIMER AND ATTRIBUTION
 * --------------------------
 * This code is part of the Market Seasonality Explorer project.
 * Author: @vickey kumar
 * 
 * DISCLAIMER:
 * This software is for educational purposes only.
 * Not financial advice. Use at your own risk.
 * Past performance does not guarantee future results.
 * 
 * MARGIN TRADING NOTICE:
 * Cryptocurrency margin trading carries significant risk.
 * Only trade with funds you can afford to lose.
 * Always use proper risk management techniques.
 * 
 * Copyright (c) 2024. All rights reserved.
 */