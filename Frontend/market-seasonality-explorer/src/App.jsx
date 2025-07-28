// --- FILE: src/App.jsx ---

import React, { useEffect, useState, useCallback } from 'react';
import { fetchKlineData } from './api/binance.js';
// Import both utility functions
import { transformDataForCalendar, createWeeklyDataMap } from './utils/dataTransformer.js';
import MarketCalendar from './components/Calendar/MarketCalendar.jsx';
import DashboardPanel from './components/Dashboard/DashboardPanel.jsx';
import { startOfMonth, endOfMonth , subDays } from 'date-fns';
import Split from 'react-split'; 
const appStyles = {
  fullScreen: {
    display: 'flex',
    flexDirection: 'column',
    minheight: '100vh',
    width: '100vw',
    backgroundColor: '#121212',
    color: 'white',
    fontFamily: 'sans-serif',
  },
  header: {
    textAlign: 'center',
    padding: '1rem',
    borderBottom: '1px solid #333',
  },
  headerControls: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.5rem 0'
  },
  select: {
    padding: '8px',
    backgroundColor: '#333',
    color: 'white',
    border: '1px solid #555',
    borderRadius: '4px',
    fontSize: '16px',
  },
  contentSplit: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
calendarSection: {
    padding: '1rem',
    overflowY: 'auto',
    width: '70%',
    height: '200%', // Ensure sections fill the split pane
  },
  dashboardSection: {
    padding: '1rem',
    overflowY: 'auto',
    width: '40%',
    height: '200%', // Ensure sections fill the split pane
  },
  error: {
    color: '#ff8a80',
    backgroundColor: '#2a2a2a',
    padding: '1rem',
    borderRadius: '8px',
    textAlign: 'center',
    margin: '2rem'
  },
  footer: {
    marginTop: 'auto',
    borderTop: '1px solid #333',
    padding: '1rem',
    textAlign: 'center',
    fontSize: '0.8rem',
    color: '#666',
    backgroundColor: '#1a1a1a',
  }
};

const Footer = () => (
  <footer style={appStyles.footer}>
    <p>© 2024 Market Seasonality Explorer by @vickey kumar</p>
    <p>DISCLAIMER: This tool is for educational purposes only. Not financial advice.</p>
    <p>Data provided by Binance API. Past performance does not guarantee future results.</p>
  </footer>
);

export default function App() {
  const [marketDataMap, setMarketDataMap] = useState(new Map());
  // NEW: State for weekly aggregated data
  const [weeklyDataMap, setWeeklyDataMap] = useState(new Map());
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [error, setError] = useState(null);
  const [view, setView] = useState('monthly'); 
  const [selectedDate, setSelectedDate] = useState(new Date()); 
  const [symbol, setSymbol] = useState(
    () => localStorage.getItem('selectedSymbol') || 'BTCUSDT'
  );

  const getMonthData = useCallback(async (date) => {
    try {
      setError(null);
      const interval = '1d';
      const monthStart = startOfMonth(date);
      const dataStartDate = subDays(monthStart, 60);
      const monthEnd = endOfMonth(date);
      
      const data = await fetchKlineData(symbol, interval, dataStartDate.getTime(), monthEnd.getTime());
      
      // 1. Create the daily data map
      const dailyMap = transformDataForCalendar(data);
      setMarketDataMap(dailyMap);

      // 2. Create the weekly data map from the daily one
      const weeklyMap = createWeeklyDataMap(dailyMap);
      setWeeklyDataMap(weeklyMap);
    } catch (err) {
      setError(err.message || "An unknown error occurred.");
    }
  }, [symbol]);

  const handleSymbolChange = (event) => {
    const newSymbol = event.target.value;
    setSymbol(newSymbol);
    localStorage.setItem('selectedSymbol', newSymbol);
  };

  useEffect(() => {
    getMonthData(currentDate);
  }, [currentDate, getMonthData]);

  if (error) {
    return <div style={appStyles.error}>Error: {error}</div>;
  }

  return (
    <div style={appStyles.fullScreen}>
      <header style={appStyles.header}>
        <h1>Market Seasonality Explorer</h1>
        <div style={appStyles.headerControls}>
          <label htmlFor="symbol-select">Crypto Asset:</label>
          <select 
            id="symbol-select"
            value={symbol} 
            onChange={handleSymbolChange}
            style={appStyles.select}
          >
            <option value="BTCUSDT">Bitcoin (BTC)</option>
            <option value="ETHUSDT">Ethereum (ETH)</option>
            <option value="SOLUSDT">Solana (SOL)</option>
            <option value="BNBUSDT">Binance Coin (BNB)</option>
            <option value="XRPUSDT">Ripple (XRP)</option>
          </select>
        </div>
      </header>

      <div style={appStyles.contentSplit}>
        <main style={appStyles.calendarSection}>
          <MarketCalendar
            marketDataMap={marketDataMap}
            weeklyDataMap={weeklyDataMap} // Pass the new map down
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            view={view}
            setView={setView}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        </main>
        <aside style={appStyles.dashboardSection}>
          <DashboardPanel 
            selectedDate={selectedDate}
            marketDataMap={marketDataMap}
            weeklyDataMap={weeklyDataMap} // Also pass to dashboard for later
            view={view}
          />
        </aside>
      </div>
      <Footer />
    </div>
  );
}