import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials } from '../auth/authSlice';

const baseQuery = fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as { auth: { token: string | null } }).auth.token;
        const persistedToken = token || sessionStorage.getItem('access_token');
        if (persistedToken) {
            headers.set('authorization', `Bearer ${persistedToken}`);
        }
        return headers;
    },
});

const baseQueryWithReauth: typeof baseQuery = async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);

    // Check for token in headers (Refreshed token pattern)
    // Adjust header name 'x-access-token' or 'authorization' based on explicit backend behavior.
    // User mentioned "access token is on header". Usually 'x-access-token' or 'Authorization'.
    // We will check both commonly used headers for new tokens.
    const responseHeaders = result.meta?.response?.headers;
    if (responseHeaders) {
        const newToken = responseHeaders.get('x-access-token') || responseHeaders.get('authorization');

        if (newToken) {
            // Clean "Bearer " prefix if present in the header value
            const pureToken = newToken.replace('Bearer ', '');

            // Get current user from the store to preserve it during token refresh
            let userToDispatch = (api.getState() as { auth: { user: any } }).auth.user;

            // If userToDispatch is null (e.g., during initial login),
            // try to extract user data from the response body (result.data).
            if (!userToDispatch && result.data) {
                const data: any = result.data;

                // CRITICAL: If password change is required, do NOT auto-dispatch credentials.
                // This prevents the user from being "logged in" via sessionStorage/Redux state
                // before they have completed the forced password change.
                if (data.password_change_required === true || data.data?.password_change_required === true) {
                    return result;
                }

                userToDispatch = data.user || data.data?.user || data;
            }

            // Dispatch setCredentials with the new token and the determined user data.
            api.dispatch(setCredentials({
                token: pureToken,
                user: userToDispatch
            }));
        }
    }

    return result;
};

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['User', 'Party', 'Item', 'Vehicle', 'Driver', 'Document', 'Trip', 'Transaction'],
    endpoints: (builder) => ({
        // Auth
        login: builder.mutation({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
        }),
        changePassword: builder.mutation({
            query: (data) => ({
                url: '/users/change-password',
                method: 'POST',
                body: data,
            }),
        }),

        // Dashboard
        getDashboardOverview: builder.query({
            query: (period) => `/dashboard/overview?period=${period}`,
            transformResponse: (response: any) => response.data,
        }),
        getDashboardCharts: builder.query({
            query: (period) => `/dashboard/charts?period=${period}`,
            transformResponse: (response: any) => response.data,
        }),

        // Users
        getUsers: builder.query({
            query: () => '/users/',
            providesTags: ['User'],
        }),
        createUser: builder.mutation({
            query: (userData) => ({
                url: '/users/register',
                method: 'POST',
                body: userData,
            }),
            invalidatesTags: ['User'],
        }),
        getUser: builder.query({
            query: (userId) => `/users/${userId}`,
            providesTags: (_result, _error, arg) => [{ type: 'User', id: arg }],
        }),
        activateUser: builder.mutation({
            query: (userId) => ({
                url: `/users/activate/${userId}`,
                method: 'PATCH',
            }),
            invalidatesTags: (_result, _error, arg) => ['User', { type: 'User', id: arg }],
        }),
        deactivateUser: builder.mutation({
            query: (userId) => ({
                url: `/users/deactivate/${userId}`,
                method: 'PATCH',
            }),
            invalidatesTags: (_result, _error, arg) => ['User', { type: 'User', id: arg }],
        }),

        // Parties
        getParties: builder.query({
            query: (params) => ({
                url: '/parties/',
                params,
            }),
            providesTags: ['Party'],
        }),
        createParty: builder.mutation({
            query: (partyData) => ({
                url: '/parties/',
                method: 'POST',
                body: partyData,
            }),
            invalidatesTags: ['Party'],
        }),
        getParty: builder.query({
            query: (partyId) => `/parties/${partyId}`,
            providesTags: (_result, _error, arg) => [{ type: 'Party', id: arg }],
        }),
        updateParty: builder.mutation({
            query: ({ partyId, partyData }) => ({
                url: `/parties/${partyId}`,
                method: 'PATCH',
                body: partyData,
            }),
            invalidatesTags: (_result, _error, arg) => ['Party', { type: 'Party', id: arg.partyId }],
        }),

        // Inventory
        getItems: builder.query({
            query: (params) => ({
                url: '/inventory/items',
                params,
            }),
            providesTags: ['Item'],
        }),
        getItem: builder.query({
            query: (itemId) => `/inventory/items/${itemId}`,
            providesTags: (_result, _error, arg) => [{ type: 'Item', id: arg }],
        }),
        createItem: builder.mutation({
            query: (itemData) => ({
                url: '/inventory/items',
                method: 'POST',
                body: itemData,
            }),
            invalidatesTags: ['Item'],
        }),
        updateItem: builder.mutation({
            query: ({ itemId, itemData }) => ({
                url: `/inventory/items/${itemId}`,
                method: 'PATCH',
                body: itemData,
            }),
            invalidatesTags: (_result, _error, arg) => ['Item', { type: 'Item', id: arg.itemId }],
        }),
        setPriceOverride: builder.mutation({
            query: (overrideData) => ({
                url: '/inventory/pricing/override',
                method: 'POST',
                body: overrideData,
            }),
            invalidatesTags: ['Item'],
        }),
        calculatePrice: builder.query({
            query: (params) => ({
                url: '/inventory/pricing/calculate',
                params,
            }),
        }),

        // Fleet
        getVehicles: builder.query({
            query: (params) => ({
                url: '/fleet/vehicles',
                params,
            }),
            providesTags: ['Vehicle'],
        }),
        createVehicle: builder.mutation({
            query: (vehicleData) => ({
                url: '/fleet/vehicles',
                method: 'POST',
                body: vehicleData,
            }),
            invalidatesTags: ['Vehicle'],
        }),
        updateVehicle: builder.mutation({
            query: ({ vehicleId, vehicleData }) => ({
                url: `/fleet/vehicles/${vehicleId}`,
                method: 'PATCH',
                body: vehicleData,
            }),
            invalidatesTags: (_result, _error, arg) => ['Vehicle', { type: 'Vehicle', id: arg.vehicleId }],
        }),
        getDrivers: builder.query({
            query: (params) => ({
                url: '/fleet/drivers',
                params,
            }),
            providesTags: ['Driver'],
        }),
        createDriver: builder.mutation({
            query: (driverData) => ({
                url: '/fleet/drivers',
                method: 'POST',
                body: driverData,
            }),
            invalidatesTags: ['Driver'],
        }),
        updateDriver: builder.mutation({
            query: ({ driverId, driverData }) => ({
                url: `/fleet/drivers/${driverId}`,
                method: 'PATCH',
                body: driverData,
            }),
            invalidatesTags: (_result, _error, arg) => ['Driver', { type: 'Driver', id: arg.driverId }],
        }),

        // Documents
        getDocuments: builder.query({
            query: (params) => ({
                url: '/documents/',
                params,
            }),
            providesTags: ['Document'],
        }),
        getDocument: builder.query({
            query: (docId) => `/documents/${docId}`,
            providesTags: (_result, _error, id) => [{ type: 'Document' as const, id }],
        }),
        createDocument: builder.mutation({
            query: (documentData) => ({
                url: '/documents/',
                method: 'POST',
                body: documentData,
            }),
            invalidatesTags: ['Document'],
        }),
        updateDocument: builder.mutation({
            query: ({ docId, documentData }) => ({
                url: `/documents/${docId}`,
                method: 'PATCH',
                body: documentData,
            }),
            invalidatesTags: (_result, _error, arg) => ['Document', 'Transaction', 'Party', 'Item'],
        }),
        getDocumentsByParty: builder.query({
            query: (partyId) => `/documents/party/${partyId}`,
            providesTags: ['Document'],
        }),

        // Trips
        getTrips: builder.query({
            query: (params) => ({
                url: '/trips/',
                params,
            }),
            providesTags: ['Trip'],
        }),
        getTrip: builder.query({
            query: (tripId) => `/trips/${tripId}`,
            providesTags: (_result, _error, id) => [{ type: 'Trip' as const, id }],
        }),
        createTrip: builder.mutation({
            query: (tripData) => ({
                url: '/trips/',
                method: 'POST',
                body: tripData,
            }),
            invalidatesTags: ['Trip'],
        }),
        updateTrip: builder.mutation({
            query: ({ tripId, tripData }) => ({
                url: `/trips/${tripId}`,
                method: 'PATCH',
                body: tripData,
            }),
            invalidatesTags: (_result, _error, arg) => ['Trip', { type: 'Trip', id: arg.tripId }],
        }),
        addTripExpense: builder.mutation({
            query: ({ tripId, expenseData }) => ({
                url: `/trips/${tripId}/expenses`,
                method: 'POST',
                body: expenseData,
            }),
            invalidatesTags: ['Trip'],
        }),

        // Transactions
        getTransactions: builder.query({
            query: (params) => ({
                url: '/transactions/',
                params,
            }),
            providesTags: ['Transaction'],
        }),
        getTransactionsByParty: builder.query({
            query: (partyId) => `/transactions/party/${partyId}`,
            providesTags: ['Transaction'],
        }),
        createTransaction: builder.mutation({
            query: (transactionData) => ({
                url: '/transactions/',
                method: 'POST',
                body: transactionData,
            }),
            invalidatesTags: ['Transaction', 'Party'],
        }),
    }),
});

export const {
    useLoginMutation,
    useChangePasswordMutation,
    useGetDashboardOverviewQuery,
    useGetDashboardChartsQuery,
    useGetUsersQuery,
    useCreateUserMutation,
    useGetUserQuery,
    useActivateUserMutation,
    useDeactivateUserMutation,
    useGetPartiesQuery,
    useCreatePartyMutation,
    useGetPartyQuery,
    useUpdatePartyMutation,
    useGetItemsQuery,
    useGetItemQuery,
    useCreateItemMutation,
    useUpdateItemMutation,
    useSetPriceOverrideMutation,
    useCalculatePriceQuery,
    useGetVehiclesQuery,
    useCreateVehicleMutation,
    useUpdateVehicleMutation,
    useGetDriversQuery,
    useCreateDriverMutation,
    useUpdateDriverMutation,
    useGetDocumentsQuery,
    useGetDocumentQuery,
    useCreateDocumentMutation,
    useUpdateDocumentMutation,
    useGetDocumentsByPartyQuery,
    useGetTripsQuery,
    useGetTripQuery,
    useCreateTripMutation,
    useUpdateTripMutation,
    useAddTripExpenseMutation,
    useGetTransactionsQuery,
    useGetTransactionsByPartyQuery,
    useCreateTransactionMutation,
} = apiSlice;
