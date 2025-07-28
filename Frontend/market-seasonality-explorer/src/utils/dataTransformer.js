// --- FILE: src/utils/dataUtils.js (or dataTransformer.js) ---

import { format, startOfWeek, endOfWeek } from 'date-fns';

/**
 * Transforms raw Kline data into a Map, adding calculated metrics.
 */
export const transformDataForCalendar = (klineData) => {
  const dataMap = new Map();
  if (!Array.isArray(klineData)) return dataMap;

  klineData.forEach(dayData => {
    // Assuming dayData is an object like { openTime, open, high, low, close, volume }
    const { openTime, open, high, low, close, volume } = dayData;

    // --- ADD THESE CALCULATIONS ---
    const priceChangePercent = ((close - open) / open) * 100;
    const volatility = ((high - low) / open) * 100;

    const dateKey = format(new Date(openTime), 'yyyy-MM-dd');
    
    // Store a new object with the calculated metrics
    dataMap.set(dateKey, {
      openTime,
      open,
      high,
      low,
      close,
      volume,
      priceChangePercent, // Now available for the calendar
      volatility,         // Now available for the calendar
    });
  });
  return dataMap;
};

/**
 * Creates a Map of aggregated weekly data.
 * (This function is correct and requires no changes)
 */
export const createWeeklyDataMap = (dailyDataMap) => {
  const weeklyMap = new Map();

  for (const dayData of dailyDataMap.values()) {
    const dayDate = new Date(dayData.openTime);
    if (isNaN(dayDate.getTime())) continue;

    const weekStartDate = startOfWeek(dayDate);
    const weekKey = format(weekStartDate, 'yyyy-MM-dd');

    if (!weeklyMap.has(weekKey)) {
      weeklyMap.set(weekKey, {
        startDate: weekStartDate,
        endDate: endOfWeek(weekStartDate),
        high: 0,
        low: Infinity,
        volume: 0,
        dataPoints: [],
      });
    }

    const weekSummary = weeklyMap.get(weekKey);
    weekSummary.high = Math.max(weekSummary.high, dayData.high);
    weekSummary.low = Math.min(weekSummary.low, dayData.low);
    weekSummary.volume += dayData.volume;
    weekSummary.dataPoints.push(dayData);
  }

  for (const weekSummary of weeklyMap.values()) {
    if (weekSummary.dataPoints.length > 0) {
      weekSummary.dataPoints.sort((a, b) => a.openTime - b.openTime);
      
      const open = weekSummary.dataPoints[0].open;
      const close = weekSummary.dataPoints[weekSummary.dataPoints.length - 1].close;
      
      weekSummary.open = open;
      weekSummary.close = close;
      weekSummary.performance = ((close - open) / open) * 100;
      
      delete weekSummary.dataPoints;
    }
  }

  return weeklyMap;
};