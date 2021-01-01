import React, { useEffect, useState, useRef } from 'react';
import NumberFormat from 'react-number-format';
import './App.css';

const subscribeMsg = {
    "event": "subscribe",
    "pair": [
      "BCH/USD"
    ],
    "subscription": {
      "name": "ticker"
    }
  };

function App() {
  const [data, setData] = useState({});
  const [rtdata, setRtData] = useState({});
  const ws = useRef(null);
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
  }, []);

  useEffect(() => {
    ws.current = new WebSocket("wss://ws.kraken.com/");
    ws.current.onopen = () => {
      console.log("ws opened");
      ws.current.send(JSON.stringify(subscribeMsg));
    }
    ws.current.onclose = () => console.log("ws closed");
    ws.current.onmessage = e => {
      const message = JSON.parse(e.data);
      console.log("e", message);
      if (message.event)
        return;
      if (message.length && message[2] && message[2] === 'ticker')
        setRtData(message[1]);
      return;
  };
    return () => {
        ws.current.close();
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header" style={{height:window.innerHeight}}>
        <img src='/bitcoin-cash-logos/rounded-version/bitcoin-cash-circle.png' className="App-logo" alt="logo" />
        {
          !data['bitcoin-cash'] && <h1>Loading ...</h1>
        }
        {
          data && data['bitcoin-cash'] && <div>
            <p className="price"><NumberFormat value={parseFloat(rtdata.b ? rtdata.b[0] : data['bitcoin-cash']['usd']).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /></p>
            <h2>Market Cap - <NumberFormat value={parseFloat(data['bitcoin-cash']['usd_market_cap']).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /></h2>
            <h2>24Hr Vol - <NumberFormat value={parseFloat(data['bitcoin-cash']['usd_24h_vol']).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /></h2>
            <h2>24Hr Change - <Colored value={data['bitcoin-cash']['usd_24h_change']}/></h2>
          </div>
        }
        <div className="donate">
          <a href="https://chart.googleapis.com/chart?chs=225x225&chld=L|2&cht=qr&chl=bitcoincash:qrelheuk6vlvq8ajg2ur3f4geh5tghqf5yxlarmkp8"><img alt="Donation Address QRCODE" width={130} src="https://chart.googleapis.com/chart?chs=225x225&chld=L|2&cht=qr&chl=bitcoincash:qrelheuk6vlvq8ajg2ur3f4geh5tghqf5yxlarmkp8"></img></a>
          <div className="items">
            <h2>Donate to ticker.cash</h2>
            <p>bitcoincash:qrelheuk6vlvq8ajg2ur3f4geh5tghqf5yxlarmkp8</p>
          </div>
        </div>
      </header>
    </div>
  );
}

function Colored(props) {
  let value = parseFloat(props.value.toFixed(2));
  let color = (value < 0 ) ? '#f4133c' : '#3cf413';
  return <div className='colored' style={{backgroundColor:color}}>{value}%</div>
}

export default App;
