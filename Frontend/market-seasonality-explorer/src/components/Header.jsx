// --- FILE: src/components/Header.jsx ---

import React from 'react';

const headerStyles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#2dcc32ff',
    color: 'white',
    borderBottom: '1px solid #333',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  loginCircle: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#64b5f6',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    marginRight: '1rem',
    fontSize: '1.5rem',
  },
  loginInitial: {
    color: 'white',
    fontSize: '1.2rem',
    fontWeight: 'bold',
  },
};

const Header = () => {
  return (
    <header style={headerStyles.header}>
      <div style={headerStyles.title}>
        Ticvic Quanttool
      </div>
      <div style={headerStyles.loginCircle}>
        <span style={headerStyles.loginInitial}>V</span>
      </div>
    </header>
  );
};

export default Header;