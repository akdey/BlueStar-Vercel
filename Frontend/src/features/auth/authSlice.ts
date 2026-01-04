import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface User {
    username: string;
    role: string;
    full_name?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
}

// Initialize state from sessionStorage to persist login across page reloads (tab only)
const storedToken = sessionStorage.getItem('access_token');
const storedUser = sessionStorage.getItem('user_data');

const initialState: AuthState = {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken || null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state,
            { payload: { user, token } }: PayloadAction<{ user: User; token: string }>
        ) => {
            state.user = user;
            state.token = token;
            sessionStorage.setItem('access_token', token);
            sessionStorage.setItem('user_data', JSON.stringify(user));
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            sessionStorage.removeItem('access_token');
            sessionStorage.removeItem('user_data');
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;
