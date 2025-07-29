// --- FILE: src/components/Calendar/MarketCalendar.jsx ---

import React, { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  getWeeksInMonth,
  isToday
} from 'date-fns';
import DailyView from '../DailyView/Dailyview.jsx';


const Tooltip = ({ data }) => {
  if (!data) return null;
  return (
    <div style={calendarStyles.tooltip}>
      <p><strong>Open:</strong> ${data.open.toFixed(2)}</p>
      <p><strong>High:</strong> ${data.high.toFixed(2)}</p>
      <p><strong>Low:</strong> ${data.low.toFixed(2)}</p>
      <p><strong>Close:</strong> ${data.close.toFixed(2)}</p>
      {/* IMPROVED: Formatted volume for better readability */}
      <p><strong>Vol:</strong> {(data.volume / 1e6).toFixed(2)}M</p>
    </div>
  );
};

const calendarStyles = {
  container: {
    padding: '1rem',
    backgroundColor: '#1e1e1e',
    color: 'white',
    borderRadius: '8px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '1rem',
  },
  button: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: 'white',
    fontSize: '14px',
    backgroundColor: '#555',
  },
  activeButton: {
    backgroundColor: '#64b5f6',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '8px',
  },
    monthCell: {
    position: 'relative',
    border: '1px solid #444',
    borderRadius: '4px',
    padding: '8px',
    minHeight: '50px',
    // transparent background for heatmap effect
    backgroundColor: 'rgba(42, 42, 42, 1)',
    cursor: 'pointer',
    overflow: 'hidden',
    transition: 'transform 0.2s ease-in-out',
    // REMOVED: The '&:hover' pseudo-selector doesn't work in inline styles.
    // The onMouseEnter/onMouseLeave handles the hover effect for the tooltip.
  },
  tooltip: {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(42, 42, 42, 1)',
    color: 'white',
    padding: '8px',
    borderRadius: '4px',
    zIndex: '10',
    fontSize: '12px',
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  todayCell: {
    borderColor: '#64b5f6',
    borderWidth: '2px',
  },
  weekSummaryCell: {
    border: '1px solid #444',
    borderRadius: '4px',
    padding: '1rem',
    backgroundColor: '#2a2a2a',
  },
  dayNumber: {
    fontWeight: 'bold',
    fontSize: '14px',
  },
  dayData: {
    fontSize: '12px',
    marginTop: '8px',
    color: '#a0a0a0',
  },
  weekDayHeader: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: '4px',
  },
  selectedCell: {
    border: '2px solid #64b5f6',
    backgroundColor: '#333',
  },
  dailyViewContainer: {
    padding: '16px',
    border: '1px solid #444',
    borderRadius: '4px',
    backgroundColor: '#2a2a2a',
  },
};

const getVolatilityColor = (volatility) => {
  if (volatility > 5) return 'rgba(244, 67, 54, 0.4)';   // High volatility (Red)
  if (volatility > 2.5) return 'rgba(255, 152, 0, 0.4)'; // Medium volatility (Orange)
  if (volatility > 0) return 'rgba(76, 175, 80, 0.4)';   // Low volatility (Green)
  return 'rgba(42, 42, 42, 1)'; // Default background
};

export default function MarketCalendar({
  selectedCrypto,
  marketDataMap,
  weeklyDataMap, // Receive the new weekly data map
  currentDate,
  setCurrentDate,
  view,
  setView,
  selectedDate,
  setSelectedDate
}) {
  const [hoveredDateKey, setHoveredDateKey] = useState(null);
  
  // --- DYNAMIC NAVIGATION & HEADER ---
  // (No changes to handlePrev, handleNext, or renderHeader)
  const handlePrev = () => {
    if (view === 'monthly') setCurrentDate(subMonths(currentDate, 1));
    else if (view === 'daily') setCurrentDate(subDays(currentDate, 1));
    // For weekly view, we now navigate by month
    else setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNext = () => {
    if (view === 'monthly') setCurrentDate(addMonths(currentDate, 1));
    else if (view === 'daily') setCurrentDate(addDays(currentDate, 1));
    // For weekly view, we now navigate by month
    else setCurrentDate(addMonths(currentDate, 1));
  };

const renderHeader = () => {
    // Logic to format the month and year from the currentDate prop
    const title = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
    }).format(currentDate);

    return (
      <div style={calendarStyles.header}>
        {/* Previous month button */}
        <button onClick={handlePrev}>&lt; Prev</button>

        <div style={{ textAlign: 'center' }}>
          {/* Display the month and year */}
          <h2>{title}</h2>

          {/* Display the selected crypto image and name */}
          {/* This block will only render if selectedCrypto is not null or undefined */}
          {selectedCrypto && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '-10px' }}>
              <img 
                src={selectedCrypto.image} 
                alt={`${selectedCrypto.label} logo`} 
                style={{ width: '24px', height: '24px' }} 
              />
              <span style={{ fontWeight: '500' }}>{selectedCrypto.label}</span>
            </div>
          )}
        </div>

        {/* Next month button */}
        <button onClick={handleNext}>Next &gt;</button>
      </div>
    );
  };
  
  // --- MONTHLY VIEW ---
  // (No changes to renderMonthlyView)
 const renderMonthlyView = () => {
    const monthStart = startOfMonth(currentDate);
    const days = eachDayOfInterval({ 
      start: startOfWeek(monthStart), 
      end: endOfWeek(endOfMonth(monthStart)) 
    });
    
    return (
      <>
        <div style={calendarStyles.grid}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => 
            <div key={day} style={calendarStyles.weekDayHeader}>{day}</div>
          )}
        </div>
        <div style={calendarStyles.grid}>
          {days.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dataForDay = marketDataMap.get(dateKey);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentDay = isToday(day);

            const heatmapColor = dataForDay ? getVolatilityColor(dataForDay.volatility) : undefined;
            const performanceArrow = dataForDay ? (dataForDay.priceChangePercent > 0 ? '▲' : '▼') : '';
            const performanceColor = dataForDay ? (dataForDay.priceChangePercent > 0 ? '#4caf50' : '#f44336') : 'inherit';

            return (
              <div
                key={dateKey}
                onClick={() => {
                  // Create a new Date object in UTC from the clicked day
                  const utcDate = new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate()));

                  // Use this new UTC date
                  setSelectedDate(utcDate);
                  setView('daily');
                  }}
                onMouseEnter={() => setHoveredDateKey(dateKey)}
                onMouseLeave={() => setHoveredDateKey(null)}
                style={{
                  ...calendarStyles.monthCell,
                  backgroundColor: heatmapColor,
                  opacity: isCurrentMonth ? 1 : 0.4,
                  ...(isSelected && calendarStyles.selectedCell),
                  ...(isCurrentDay && calendarStyles.todayCell)
                }}
              >
                <div style={calendarStyles.dayNumber}>{format(day, 'd')}</div>
                {dataForDay && (
                  <div style={calendarStyles.dayData}>
                    <div style={{ color: performanceColor, fontSize: '14px', fontWeight: 'bold' }}>
                      {performanceArrow} {dataForDay.priceChangePercent.toFixed(2)}%
                    </div>
                    <p>Vol: {(dataForDay.volume / 1e6).toFixed(1)}M</p>
                  </div>
                )}
                {hoveredDateKey === dateKey && <Tooltip data={dataForDay} />}
              </div>
            );
          })}
        </div>
      </>
    );
  };


  /**
   * REFACTORED: Renders a grid of aggregated weeks for the current month.
   */
  const renderWeeklyView = () => {
    const monthStart = startOfMonth(currentDate);
    const weeksInMonth = getWeeksInMonth(currentDate, { weekStartsOn: 0 });
    const firstWeekStart = startOfWeek(monthStart, { weekStartsOn: 0 });

    const weeks = Array.from({ length: weeksInMonth }, (_, i) => addWeeks(firstWeekStart, i));

    return (
      <div style={{ ...calendarStyles.grid, gridTemplateColumns: '1fr', gap: '1rem' }}>
        {weeks.map(weekStart => {
          const weekKey = format(weekStart, 'yyyy-MM-dd');
          const weekData = weeklyDataMap.get(weekKey);
          const perfStyle = weekData ? { color: weekData.performance >= 0 ? '#4caf50' : '#f44336' } : {};
          
          return (
            <div 
              key={weekKey} 
              style={calendarStyles.weekSummaryCell}
              onClick={() => {
                setSelectedDate(weekStart);
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={calendarStyles.dayNumber}>
                  Week of {format(weekStart, 'MMM d')}
                </span>
                {weekData && (
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', ...perfStyle }}>
                    {weekData.performance >= 0 ? '▲' : '▼'} {Math.abs(weekData.performance).toFixed(2)}%
                  </span>
                )}
              </div>
              {weekData ? (
                <div style={{ ...calendarStyles.dayData, display: 'flex', justifyContent: 'space-around', marginTop: '1rem' }}>
                  <span><strong>H:</strong> ${weekData.high.toFixed(2)}</span>
                  <span><strong>L:</strong> ${weekData.low.toFixed(2)}</span>
                  <span><strong>Vol:</strong> {(weekData.volume / 1e6).toFixed(1)}M</span>
                  {weekData.avgVolatility !== undefined && (
                    <span><strong>Vol%:</strong> {weekData.avgVolatility.toFixed(2)}%</span>
                  )}
                </div>
              ) : (
                <p style={{ textAlign: 'center', marginTop: '1rem' }}>No trading data for this week</p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderDailyView = () => (
    <div style={calendarStyles.dailyViewContainer}>
      <h2>Daily View</h2>
        <DailyView
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate} // Add this line to pass the function down
    />
    </div>
  );

  return (
    <div style={calendarStyles.container}>
      {/* View Switcher */}
      <div style={calendarStyles.buttonGroup}>
        <button onClick={() => setView('daily')} style={{ ...calendarStyles.button, ...(view === 'daily' && calendarStyles.activeButton) }}>Daily</button>
        <button onClick={() => setView('weekly')} style={{ ...calendarStyles.button, ...(view === 'weekly' && calendarStyles.activeButton) }}>Weekly</button>
        <button onClick={() => setView('monthly')} style={{ ...calendarStyles.button, ...(view === 'monthly' && calendarStyles.activeButton) }}>Monthly</button>
      </div>

      {renderHeader()}

      {view === 'monthly' && renderMonthlyView()}
      {view === 'weekly' && renderWeeklyView()}
      {view === 'daily' && renderDailyView()}
    </div>
  );
}