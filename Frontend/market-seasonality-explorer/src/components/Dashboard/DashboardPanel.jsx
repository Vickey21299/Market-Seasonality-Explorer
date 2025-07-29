// --- FILE: src/components/Dashboard/DashboardPanel.jsx ---

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { calculateDashboardMetrics } from '../../utils/dashboardUtils.js';
import {format } from 'date-fns';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  zoomPlugin
);

const panelStyles = {
  container: { backgroundColor: '#1e1e1e', color: 'white', padding: '1.5rem', borderRadius: '8px', height: '100%' },
  header: { marginBottom: '1rem', borderBottom: '1px solid #444', paddingBottom: '0.5rem' },
  metricGroup: { marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1rem' },
  metric: { display: 'flex', flexDirection: 'column', fontSize: '14px' },
  metricLabel: { color: '#a0a0a0', fontSize: '12px', marginBottom: '4px' },
  metricValue: { fontWeight: '600' },
  chartContainer: { marginBottom: '2rem' },
  dateInputGroup: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  dateInput: {
    padding: '8px',
    backgroundColor: '#333',
    color: 'white',
    border: '1px solid #555',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    '&:invalid': {
      borderColor: '#f44336'
    }
  },
  dateLabel: {
    fontSize: '12px',
    color: '#a0a0a0',
    marginBottom: '4px'
  },
  dateError: {
    color: '#f44336',
    fontSize: '12px',
    marginTop: '4px'
  },
  resetZoomButton: {
    padding: '4px 8px',
    backgroundColor: '#555',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    marginBottom: '8px',
    '&:hover': {
      backgroundColor: '#666'
    }
  }
};

const PerformanceDisplay = ({ value, dollarValue }) => {
  const isPositive = value >= 0;
  const color = isPositive ? '#4caf50' : '#f44336';
  const arrow = isPositive ? '▲' : '▼';
  return (
    <span style={{ color, fontWeight: '600' }}>
      {arrow} {value.toFixed(2)}% (${dollarValue.toFixed(2)})
    </span>
  );
};

const DateRangeSelector = ({ dateRange, handleDateChange, dateError }) => (
  <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
    <div style={panelStyles.dateInputGroup}>
      <div>
        <div style={panelStyles.dateLabel}>From</div>
        <input 
          type="date" 
          name="from"
          value={format(dateRange.from, 'yyyy-MM-dd')}
          max={format(dateRange.to, 'yyyy-MM-dd')}
          onChange={handleDateChange}
          style={panelStyles.dateInput}
          required
        />
      </div>
      <div>
        <div style={panelStyles.dateLabel}>To</div>
        <input 
          type="date"
          name="to"
          value={format(dateRange.to, 'yyyy-MM-dd')}
          min={format(dateRange.from, 'yyyy-MM-dd')}
          onChange={handleDateChange}
          style={panelStyles.dateInput}
          required
        />
      </div>
    </div>
    {dateError && <div style={panelStyles.dateError}>{dateError}</div>}
  </div>
);

export default function DashboardPanel({ dateRange, setDateRange, marketDataMap }) {
  const [dashboardData, setDashboardData] = useState(null);
  const priceChartRef = useRef(null);
  const volumeChartRef = useRef(null);
  const [dateError, setDateError] = useState('');

  useEffect(() => {
    // Re-calculate metrics when the dateRange prop changes
    if (dateRange?.from && dateRange?.to && marketDataMap.size > 0) {
      const data = calculateDashboardMetrics(dateRange.from, dateRange.to, marketDataMap);
      setDashboardData(data);
    }
  }, [dateRange, marketDataMap]);
   // Handler for the date input fields
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    const newDate = new Date(value + 'T00:00:00');
    
    // Validate date selection
    if (name === 'from') {
      if (newDate > dateRange.to) {
        setDateError('Start date cannot be after end date');
        return;
      }
    } else if (name === 'to') {
      if (newDate < dateRange.from) {
        setDateError('End date cannot be before start date');
        return;
      }
    }
    
    setDateError(''); // Clear any existing error
    setDateRange(prevRange => ({
      ...prevRange,
      [name]: newDate
    }));
  };

  
  const chartData = useMemo(() => {
    if (!dashboardData) return { price: { datasets: [] }, volume: { datasets: [] } };
    return {
      price: {
        labels: dashboardData.charts.labels,
        datasets: [
          { 
            label: 'Close Price', 
            data: dashboardData.charts.closePrices, 
            borderColor: '#64b5f6',
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointBackgroundColor: '#64b5f6',
            pointBorderColor: '#64b5f6',
            pointHoverBackgroundColor: '#64b5f6',
            pointHoverBorderColor: '#64b5f6',
            fill: false,
            tension: 0.1 
          },
          { 
            label: 'MA 20', 
            data: dashboardData.charts.ma20Data, 
            borderColor: '#fdd835',
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 0,
            fill: false
          },
          { 
            label: 'MA 50', 
            data: dashboardData.charts.ma50Data, 
            borderColor: '#ff9800',
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 0,
            fill: false
          }
        ]
      },
      volume: {
        labels: dashboardData.charts.labels,
        datasets: [{
          label: 'Volume',
          data: dashboardData.charts.volumeData,
          backgroundColor: '#555555',
          borderColor: '#666666',
          borderWidth: 1,
          hoverBackgroundColor: '#666666',
          hoverBorderColor: '#777777'
        }]
      },
    };
  }, [dashboardData]);

  if (!dashboardData) {
    return (
      <div style={panelStyles.container}>
        <div style={{ ...panelStyles.header, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <h2 style={{margin: 0}}>Dashboard</h2>
          <DateRangeSelector 
            dateRange={dateRange}
            handleDateChange={handleDateChange}
            dateError={dateError}
          />
        </div>
        <p>Select a date range to view summary.</p>
      </div>
    );
  }

  const { header, stats } = dashboardData;
  // CORRECTED: Removed `as const` from the chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#a0a0a0',
        }
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x',
        },
        limits: {
          x: {min: 'original', max: 'original'},
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: '#333333',
        },
        ticks: {
          color: '#a0a0a0'
        }
      },
      y: {
        grid: {
          color: '#333333',
        },
        ticks: {
          color: '#a0a0a0'
        }
      }
    }
  };
  const volumeChartOptions = {
    ...chartOptions,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      ...chartOptions.scales,
      x: {
        display: false
      },
      y: {
        grid: {
          color: '#333333',
        },
        ticks: {
          color: '#a0a0a0'
        }
      }
    }
  };

  const handleResetZoom = () => {
    if (priceChartRef.current) {
      priceChartRef.current.resetZoom();
    }
    if (volumeChartRef.current) {
      volumeChartRef.current.resetZoom();
    }
  };

  return (
    <div style={panelStyles.container}>
      <div style={{ ...panelStyles.header, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <h2 style={{margin: 0}}>Dashboard</h2>
        <DateRangeSelector 
          dateRange={dateRange}
          handleDateChange={handleDateChange}
          dateError={dateError}
        />
      </div>
      <h2 style={panelStyles.header}>{header}</h2>
      <div style={{display: 'flex', justifyContent: 'flex-end'}}>
        <button onClick={handleResetZoom} style={panelStyles.resetZoomButton}>
          Reset Zoom
        </button>
      </div>
      <div style={{...panelStyles.chartContainer, height: '250px'}}>
        <Line ref={priceChartRef} options={chartOptions} data={chartData.price} />
      </div>
      <div style={{...panelStyles.chartContainer, height: '100px'}}>
        <Bar ref={volumeChartRef} options={volumeChartOptions} data={chartData.volume} />
      </div>

      <div style={panelStyles.metricGroup}>
        <div style={panelStyles.metric}><span style={panelStyles.metricLabel}>Performance</span><PerformanceDisplay value={stats.priceChangePercent} dollarValue={stats.priceChangeDollar} /></div>
        <div style={panelStyles.metric}><span style={panelStyles.metricLabel}>Total Volume</span><span style={panelStyles.metricValue}>{(stats.totalVolume / 1e6).toFixed(2)}M</span></div>
        <div style={panelStyles.metric}><span style={panelStyles.metricLabel}>High / Low</span><span style={panelStyles.metricValue}>${stats.periodHigh.toFixed(2)} / ${stats.periodLow.toFixed(2)}</span></div>
        <div style={panelStyles.metric}><span style={panelStyles.metricLabel}>20D Std Dev</span><span style={panelStyles.metricValue}>{stats.stdDev?.toFixed(2) || 'N/A'}</span></div>
        <div style={panelStyles.metric}><span style={panelStyles.metricLabel}>Moving Averages</span><span style={panelStyles.metricValue}>20D: ${stats.ma20?.toFixed(2) || 'N/A'} | 50D: ${stats.ma50?.toFixed(2) || 'N/A'}</span></div>
        <div style={panelStyles.metric}><span style={panelStyles.metricLabel}>14D RSI</span><span style={panelStyles.metricValue}>{stats.rsi?.toFixed(2) || 'N/A'}</span></div>
      </div>
    </div>
  );
}