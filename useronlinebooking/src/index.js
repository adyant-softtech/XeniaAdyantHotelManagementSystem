// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom'; // This is correct
import Context from "./context/Context";
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter> {/* Only one BrowserRouter here */}
    <Context>
      <App />
    </Context>
  </BrowserRouter>
);
