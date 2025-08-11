// import { combineReducers, configureStore } from '@reduxjs/toolkit';
// import authReducer from '../reducer/authSlice';
// import campaignReducer from '../reducer/campaignSlice'; // ✅ FIXED
// import { persistReducer, PersistState, persistStore } from 'redux-persist';
// import storageSession from 'redux-persist/lib/storage/session'; // sessionStorage adapter
// import { PersistPartial } from 'redux-persist/es/persistReducer';


// const persistConfig = {
//   key: 'root',
//   storage: storageSession,
//   whitelist: ['auth'],
// };

// const rootReducer = combineReducers({
//   auth: authReducer,
//   campaign: campaignReducer, // ✅ FIXED
// });

// const persistedReducer = persistReducer(persistConfig, rootReducer);

// export const store = configureStore({
//   reducer: persistedReducer,
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: false,
//     }),
// });

// export const persistor = persistStore(store);

// export type RootState = ReturnType<typeof rootReducer> & {
//   _persist: PersistState;
// };
// export type AppDispatch = typeof store.dispatch;


import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer, { AuthState } from '../reducer/authSlice';
import campaignReducer, { CampaignState } from '../reducer/campaignSlice';
import storageSession from 'redux-persist/lib/storage/session';
import { persistReducer, persistStore, PersistConfig } from 'redux-persist';
import { createFilter } from 'redux-persist-transform-filter';
import { UnknownAction } from 'redux';

// ✅ Transform to persist only campaignId from campaign slice
const campaignIdOnlyFilter = createFilter(
  'campaign', // slice name
  ['campaignId'] // keys to persist
);

// ✅ Combined reducer
const rootReducer = combineReducers({
  auth: authReducer,
  campaign: campaignReducer,
});

// ✅ Define root state type manually
export type RootState = ReturnType<typeof rootReducer>;

// ✅ Setup persist config with correct typing
const persistConfig: PersistConfig<RootState> = {
  key: 'root',
  storage: storageSession,
  whitelist: ['auth', 'campaign'],
  transforms: [campaignIdOnlyFilter],
};

// ✅ Apply persisted reducer with correct type casting
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

// ✅ Export dispatch type
export type AppDispatch = typeof store.dispatch;
