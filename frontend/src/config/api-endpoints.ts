export const API_ENDPOINTS = {
    AUTH:{
        LOGIN: '/api/auth/login',
        PROFILE: '/api/auth/profile',
    },
    DISPLAY: {
        LATEST: '/api/display/latest',
    },
    VEHICLE:{
        ENTRY: '/api/vehicles/entry',
        EXIT: '/api/vehicles/exit',
        LIST: '/api/vehicles',
        SINGLE: (id: string) => `/api/vehicles/${id}`,
    },
}