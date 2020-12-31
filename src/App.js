import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [data, setData] = useState(null);
  useEffect( () => {
    let mounted = true;
    async function getData() {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin-cash&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true');
      if (response.ok) {
        let data = await response.json();
        setData(data);
      }
      return null;
    }
    if (mounted)
      getData();
    return () => mounted = false;
  }, {})
  return (
    <div className="App">
      <header className="App-header">
        <img src='/bitcoin-cash-logos/rounded-version/bitcoin-cash-circle.png' className="App-logo" alt="logo" />
        {
          data && data['bitcoin-cash'] && <div>
            <h2>BCH - ${data['bitcoin-cash']['usd']}</h2>
            <h2>Market Cap - ${data['bitcoin-cash']['usd_market_cap']}</h2>
            <h2>24Hr Vol - ${data['bitcoin-cash']['usd_24h_vol']}</h2>
            <h2>24Hr Change - {data['bitcoin-cash']['usd_24h_change']}</h2>
            <button onClick={() => { window.location.reload(); }}>Refresh</button>
          </div>
        }
      </header>
    </div>
  );
}

export default App;
