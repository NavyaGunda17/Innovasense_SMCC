import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';


export interface AuthState {
  organization: string | null;
  password: string | null;
  userName: string | null;
  isAuthenticated: boolean;
  re_password: string | null;
  companyId:string | null;
  companyName:string | null;
}


const persisted = localStorage.getItem('auth');
const initialState: AuthState =
  persisted
    ? JSON.parse(persisted)
    : { organization: null, password: null, isAuthenticated: false };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{ userName: string; password: string,companyId:string,companyName:string }>
    ) => {
      state.userName = action.payload.userName;
      state.password = action.payload.password;
      state.companyId = action.payload.companyId;
      state.companyName = action.payload.companyName;
      state.isAuthenticated = true
    },

    signup: (
      state,
      action: PayloadAction<{
        organization: string;
        userName: string;
        password: string;
        re_password: string;
      }>
    ) => {
      const { organization, userName, password, re_password } = action.payload;

      if (password !== re_password) {
        throw new Error("Passwords do not match");
      }
    },

    logout: (state) => {
      state.organization = null;
      state.password = null;
      state.userName = null;
      state.companyId = null;
      state.companyName = null;
      state.isAuthenticated = false;
      localStorage.removeItem('auth');
    },
  },
});

export const { login, logout , signup} = authSlice.actions;
export default authSlice.reducer;