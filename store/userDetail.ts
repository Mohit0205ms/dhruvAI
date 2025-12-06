import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  placeOfBirth: string;
  timeOfBirth: string;
  gender: string;
  moonSign: string;
  lat: number;
  lon: number;
  profileCompleted: boolean;
}

const initialState: UserState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  placeOfBirth: "",
  timeOfBirth: "",
  gender: "",
  moonSign: "",
  lat: 0,
  lon: 0,
  profileCompleted: false,
}

export const userDetail = createSlice({
  name: 'userDetail',
  initialState,
  reducers: {
    setUserDetails: (state, action: PayloadAction<Partial<UserState>>) => {
      return { ...state, ...action.payload };
    },
    updateUserDetails: (state, action: PayloadAction<Partial<UserState>>) => {
      return { ...state, ...action.payload };
    },
    completeProfile: (state) => {
      state.profileCompleted = true;
    },
    resetUserDetails: () => initialState,
  }
})

// Action creators are generated for each case reducer function
export const { setUserDetails, updateUserDetails, completeProfile, resetUserDetails } = userDetail.actions;
export default userDetail.reducer;
