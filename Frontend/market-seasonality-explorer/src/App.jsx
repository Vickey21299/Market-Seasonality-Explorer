// --- FILE: src/App.jsx ---

import React, { useEffect, useState, useCallback } from 'react';
import { fetchKlineData } from './api/binance.js';
// Import both utility functions
import { transformDataForCalendar, createWeeklyDataMap } from './utils/dataTransformer.js';
import MarketCalendar from './components/Calendar/MarketCalendar.jsx';
import DashboardPanel from './components/Dashboard/DashboardPanel.jsx';
import Header from './components/Header.jsx';
import { startOfMonth, startOfDay, endOfMonth , subDays ,addDays } from 'date-fns';
import Split from 'react-split'; 
import Select from 'react-select'; // If you want to use a styled select component
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
const cryptoOptions = [
  { value: 'BTCUSDT', label: 'Bitcoin (BTC)', image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png' },
  { value: 'ETHUSDT', label: 'Ethereum (ETH)', image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png' },
  { value: 'SOLUSDT', label: 'Solana (SOL)', image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png' },
  { value: 'BNBUSDT', label: 'Binance Coin (BNB)', image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png' },
  { value: 'XRPUSDT', label: 'Ripple (XRP)', image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/52.png' },
];
// 3. Custom styles to make react-select match your dark theme
const customSelectStyles = {
  control: (styles) => ({ ...styles, backgroundColor: '#333', border: '1px solid #555' }),
  singleValue: (styles) => ({ ...styles, color: 'white' }),
  menu: (styles) => ({ ...styles, backgroundColor: '#333' }),
  option: (styles, { isFocused, isSelected }) => ({
    ...styles,
    backgroundColor: isSelected ? '#64b5f6' : isFocused ? '#555' : '#333',
    color: 'white',
    ':active': {
      backgroundColor: '#64b5f6',
    },
  }),
};
// 4. A custom function to format how each option looks
const formatOptionLabel = ({ label, image }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <img src={image} alt={label} style={{ width: 20, height: 20, marginRight: 10 }} />
    <span>{label}</span>
  </div>
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
   const [dateRange, setDateRange] = useState({
    from: startOfDay(subDays(new Date(), 7)),
    to: startOfDay(new Date()),
  });

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

 const handleSymbolChange = (selectedOption) => {
    const newSymbol = selectedOption.value;
    setSymbol(newSymbol);
    localStorage.setItem('selectedSymbol', newSymbol);
  };
  // ADD THIS NEW useEffect
  useEffect(() => {
    // This effect syncs the dashboard's date range when the calendar month changes.
    const newRangeStart = startOfDay(startOfMonth(currentDate));
    const newRangeEnd = addDays(newRangeStart, 6); // Set to the first 7 days of the new month
    
    setDateRange({ from: newRangeStart, to: newRangeEnd });
  }, [currentDate]); // This runs whenever the main calendar date changes

  useEffect(() => {
    getMonthData(currentDate);
  }, [currentDate, getMonthData]);

  if (error) {
    return <div style={appStyles.error}>Error: {error}</div>;
  }
 const selctedcrypto = cryptoOptions.find(option => option.value === symbol);
  return (
    <div style={appStyles.fullScreen}>
      <header style={appStyles.header}>
        <Header />
        <h1>Market Seasonality Explorer</h1>
        <div style={appStyles.headerControls}>
          <label htmlFor="symbol-select">Crypto Asset:</label>
          {/* 6. Replace the old <select> with the new <Select> component */}
          <Select
            id="symbol-select"
            value={cryptoOptions.find(option => option.value === symbol)}
            onChange={handleSymbolChange}
            options={cryptoOptions}
            styles={customSelectStyles}
            formatOptionLabel={formatOptionLabel}
            instanceId="symbol-select"
          />
        </div>
      </header>

      <div style={appStyles.contentSplit}>
        <main style={appStyles.calendarSection}>
          <MarketCalendar
            selectedCrypto={selctedcrypto} // Pass the selected crypto option
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
            dateRange={dateRange}
            setDateRange={setDateRange}
            marketDataMap={marketDataMap}
          />
        </aside>
      </div>
      <Footer />
    </div>
  );
}