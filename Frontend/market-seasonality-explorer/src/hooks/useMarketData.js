import { useState, useEffect } from 'react';

export function useMarketData() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // TODO: Fetch market data
  }, []);

  return data;
}
