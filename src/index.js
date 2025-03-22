import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, Bounce } from 'react-toastify';
import AuthContextProvider from './context/authContext';


const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>

    
  <ToastContainer 
    position='top-right'
    autoClose={5000}
    hideProgressBar={false}
    newestOnTop={false}
    closeOnClick
    rtl={false}
    theme='dark'
    transition={Bounce}
    stacked
  />
  <AuthContextProvider>
    <App />
  </AuthContextProvider>
  </React.StrictMode>
);
