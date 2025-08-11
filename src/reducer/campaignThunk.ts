import { createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../lib/supabaseClient';

export const fetchCampaignEnumerations = createAsyncThunk(
  'campaign/fetchEnumerations',
  async (_, thunkAPI) => {
    const { data, error } = await supabase
      .from('campaignEnumerators')
      .select('*')

      console.log("data, error",data, error)
    if (error) {
      return thunkAPI.rejectWithValue(error.message);
    }

    return data;
  }
);
