import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getCachedToken, clearCachedToken } from "@/lib/safe-storage";

const baseURL = import.meta.env.VITE_BASE_URL;

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - attach bearer token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = getCachedToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 by clearing token and redirecting
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes("/auth/login") &&
      !error.config?.url?.includes("/auth/register")
    ) {
      clearCachedToken();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);