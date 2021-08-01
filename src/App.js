import React, { useEffect, useState, useRef } from 'react';
import NumberFormat from 'react-number-format';
import { PayButton } from '@paybutton/react'
import './App.css';

const cryptoFamous = {
  bitcoin: 'BTC/USD',
  'bitcoin-cash':'BCH/USD',
  ethereum: 'ETH/USD',
  litecoin: 'LTC/USD' 
};

const subscribeMsg = {
    "event": "subscribe",
    "pair": [
      "BCH/USD",
      "BTC/USD",
      "ETH/USD",
      "LTC/USD",
    ],
    "subscription": {
      "name": "ticker"
    }
  };

  const to = 'bitcoincash:qrelheuk6vlvq8ajg2ur3f4geh5tghqf5yxlarmkp8'
  const amount = 2
  const currency = 'USD'
  const text = 'Donate'
  const hoverText = 'Donate $2 to Ticker'
  const theme = {
    palette: {
      primary: '#22c08f',
      secondary: '#FFFFFF',
      tertiary: '#333333'
    }
  }
  const onSuccess = ()=>{}

function App() {
  const [data, setData] = useState({});
  const [rtdata, setRtData] = useState({});
  const ws = useRef(null);
  useEffect( () => {
    let mounted = true;
    async function getData() {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin-cash,bitcoin,ethereum,litecoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true');
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
        setRtData( prevState => ({
          ...prevState, [message[3]]: message
        }));
      return;
  };
    return () => {
        ws.current.close();
    };
  }, []);

  return (
    <div className="App">
      <div className="top-bar">
      <h1 className='logo'>ticker.cash</h1>
      </div>
      <header className="App-header" style={{height:window.innerHeight}}>
        <div className="top-bar">
          {/* <div className="currency-selector">
            <span className="currency-label">BCH</span> <span class="arrow"></span>
          </div> */}
          {/* <img src='/bitcoin-cash-logos/rounded-version/bitcoin-cash-circle.png' className="App-logo" alt="logo" /> */}
      </div> 
        {
          !data['bitcoin-cash'] && <h1>Loading ...</h1>
        }
        {
         data && Object.keys(data).map( (item) => {
            const namePair = item === 'bitcoin' ? 'XBT/USD' : cryptoFamous[item];
            return  <CryptoRow staticData={data[item]} rtdata={rtdata} nameKey={item} namePair={namePair} key={item}/>;
          })
        }
        
        <PayButton
    to={to}
    amount={amount}
    currency={currency}
    text={text}
    hoverText={hoverText}
    theme={theme}
    onSuccess={onSuccess}
  />
      </header>
    </div>
  );
}

const CryptoRow = (props) => {
  const data = props.staticData || null;
  const rtdata = props.rtdata.hasOwnProperty(props.namePair) ? props.rtdata[props.namePair][1] : {};
  if (!data) 
    return null;
  return (<div className="content">
  <h1 className="price"><span classname="label-large">{props.namePair.split('/')[0]}</span> <NumberFormat value={parseFloat(rtdata.b ? rtdata.b[0] : data['usd']).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /></h1>
  <h2><span className="label">Market Cap</span><NumberFormat value={parseFloat(data['usd_market_cap']).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /></h2>
  <h2><span className="label">24Hr Vol</span><NumberFormat value={parseFloat(data['usd_24h_vol']).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /></h2>
  <h2><span className="label">24Hr Change</span><Colored value={data['usd_24h_change']}/></h2>
</div>)
}

function Colored(props) {
  let value = parseFloat(props.value.toFixed(2));
  let color = (value < 0 ) ? '#f4133c' : '#3cf413';
  return <div className='colored' style={{backgroundColor:color}}>{value}%</div>
}

export default App;
