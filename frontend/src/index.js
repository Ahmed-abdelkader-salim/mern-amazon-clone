import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { HelmetProvider } from 'react-helmet-async';
import  store  from './app/store';

const root = ReactDOM.createRoot(document.getElementById('root'));
// const paypalOptions = {
//   "client-id": "AYfKIdLpNtFPR7uw-bdeNiIPZcxN49agv7ERSIzqgmOgyu0x6P8JiBtKorBF5zX_4ujIawzBuIK8h74e",
//   currency: "USD",
//   intent: "capture",
//  "disable-funding": "paylater",
// "enable-funding": "card", 
// };
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        <PayPalScriptProvider>
          <App />
        </PayPalScriptProvider>
      </HelmetProvider>
    </Provider>
  </React.StrictMode>
);


