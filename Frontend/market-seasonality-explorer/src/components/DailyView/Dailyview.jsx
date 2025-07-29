import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { fetchIntradayData } from '../../api/binanceIntradayService.js';
import { processIntradayData } from '../../utils/dailyViewUtils.js';
import { format, addDays, subDays } from 'date-fns';

// Register Chart.js components including zoom
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

const viewStyles = {
  container: { padding: '1rem' },
  header: { marginBottom: '1rem', borderBottom: '1px solid #444', paddingBottom: '0.5rem' },
  chartContainer: { marginBottom: '2rem', height: '250px' },
  statsContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' },
  statBox: { backgroundColor: '#2a2a2a', padding: '1rem', borderRadius: '8px' },
  statLabel: { color: '#a0a0a0', fontSize: '14px' },
  statValue: { fontSize: '20px', fontWeight: 'bold' },
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
  return <span style={{ color }}>{arrow} {value.toFixed(2)}% (${dollarValue.toFixed(2)})</span>;
};

export default function DailyView({ selectedDate , setSelectedDate }) {
  const [dailyData, setDailyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const priceChartRef = useRef(null);
  const volumeChartRef = useRef(null);

  // ADD navigation handlers
  const handlePrevDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  useEffect(() => {
    if (!selectedDate) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const rawData = await fetchIntradayData(selectedDate);
        const processedData = processIntradayData(rawData);
        setDailyData(processedData);
      } catch (err) {
        setError(err.message || 'Failed to fetch intraday data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedDate]);

  const chartData = useMemo(() => {
    if (!dailyData) return { price: { datasets: [] }, volume: { datasets: [] } };
    return {
      price: {
        labels: dailyData.charts.labels,
        datasets: [{ label: 'Price', data: dailyData.charts.closePrices, borderColor: '#64b5f6', tension: 0.1 }]
      },
      volume: {
        labels: dailyData.charts.labels,
        datasets: [{ label: 'Volume', data: dailyData.charts.volumeData, backgroundColor: '#757575' }]
      }
    };
  }, [dailyData]);

  const handleResetZoom = () => {
    if (priceChartRef.current) {
      priceChartRef.current.resetZoom();
    }
    if (volumeChartRef.current) {
      volumeChartRef.current.resetZoom();
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
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
      x: { ticks: { color: '#a0a0a0' }},
      y: { ticks: { color: '#a0a0a0' }}
    }
  };

  if (isLoading) return <div>Loading Intraday Data...</div>;
  if (error) return <div style={{ color: '#f44336' }}>Error: {error}</div>;
  //   If no data is available, loadData again load first then render message
    if (!dailyData || dailyData.charts.labels.length === 0) {
    return <div>No intraday data available for this day.</div>;
    }
//   if (!dailyData) return <div>No intraday data available for this day.</div>;
  
  return (
    <div style={viewStyles.container}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
        <button onClick={handlePrevDay}>&lt; Prev Day</button>
        <h2>{format(selectedDate, 'MMMM d, yyyy')}</h2>
        <button onClick={handleNextDay}>Next Day &gt;</button>
      </div>
      <div style={viewStyles.statsContainer}>
        <div style={viewStyles.statBox}>
          <div style={viewStyles.statLabel}>Day Performance</div>
          <div style={viewStyles.statValue}>
            <PerformanceDisplay value={dailyData.stats.priceChangePercent} dollarValue={dailyData.stats.priceChange} />
          </div>
        </div>
        <div style={viewStyles.statBox}>
          <div style={viewStyles.statLabel}>Day High / Low</div>
          <div style={viewStyles.statValue}>${dailyData.stats.dayHigh.toFixed(2)} / ${dailyData.stats.dayLow.toFixed(2)}</div>
        </div>
        <div style={viewStyles.statBox}>
          <div style={viewStyles.statLabel}>Total Volume</div>
          <div style={viewStyles.statValue}>{(dailyData.stats.totalVolume / 1e6).toFixed(2)}M</div>
        </div>
      </div>

      <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '8px'}}>
        <button onClick={handleResetZoom} style={viewStyles.resetZoomButton}>
          Reset Zoom
        </button>
      </div>

      <div style={{ ...viewStyles.chartContainer, marginTop: '2rem' }}>
        <Line ref={priceChartRef} options={chartOptions} data={chartData.price} />
      </div>
      <div style={viewStyles.chartContainer}>
        <Bar ref={volumeChartRef} options={chartOptions} data={chartData.volume} />
      </div>
    </div>
  );
}