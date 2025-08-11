import React from 'react';
import './App.css';
import AppRoutes from './routes';
import { Provider } from 'react-redux';
import { persistor, store } from './store/store';
import { PersistGate } from 'redux-persist/integration/react';
import GlobalCampaignDataProvider from './components/GlobalCampaignDataProvider';

function App() {
  
  return (
    <div >
    <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      
    
      <AppRoutes />
      </PersistGate>
    </Provider>
    </div>
  );
}

export default App;
