import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { create } from 'axios';
import { Platform } from 'react-native';

export const TOKEN_KEY = 'sipinjam.token';

function detectedBase() {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.hostname) {
    return `http://${window.location.hostname}:5000/api/v1`;
  }

  const hostUri = Constants.expoConfig?.hostUri || Constants.expoGoConfig?.debuggerHost || '';
  const host = hostUri.split(':')[0];
  if (host) return `http://${host}:5000/api/v1`;

  return Platform.OS === 'android'
    ? 'http://10.0.2.2:5000/api/v1'
    : 'http://localhost:5000/api/v1';
}

const isDev = typeof __DEV__ === 'undefined' ? false : __DEV__;
const configured = isDev ? '' : (process.env.EXPO_PUBLIC_API_URL || '').trim();
export const API_BASE_URL = (configured || detectedBase()).replace(/\/+$/, '');

const client = create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const payload = error.response?.data?.error;
    const isLogin = String(error.config?.url || '').includes('/auth/login');

    if (status === 401 && !isLogin) {
      await AsyncStorage.removeItem(TOKEN_KEY).catch(() => {});
      unauthorizedHandler?.();
    }

    const message = payload?.message
      || (error.code === 'ECONNABORTED'
        ? 'Koneksi ke server terlalu lama. Coba lagi.'
        : `Tidak dapat terhubung ke server (${API_BASE_URL}). Periksa jaringan dan EXPO_PUBLIC_API_URL.`);

    const apiError = new Error(message);
    apiError.code = payload?.code || (error.response ? 'SERVER_ERROR' : 'NETWORK_ERROR');
    apiError.fields = payload?.fields || [];
    apiError.status = status;
    return Promise.reject(apiError);
  },
);

export async function getData(url, config) {
  const response = await client.get(url, config);
  return response.data?.data;
}

export async function getList(url, config) {
  const response = await client.get(url, config);
  return {
    data: response.data?.data ?? [],
    meta: response.data?.meta ?? {},
  };
}

export async function postData(url, body = {}, config) {
  const response = await client.post(url, body, config);
  return response.data?.data;
}

export async function patchData(url, body = {}, config) {
  const response = await client.patch(url, body, config);
  return response.data?.data;
}

export default client;
