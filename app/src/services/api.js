import { create } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

function resolveBaseUrl() {
  const configured = process.env.EXPO_PUBLIC_API_URL || Constants.expoConfig?.extra?.apiUrl;
  if (configured && String(configured).trim()) {
    return String(configured).trim().replace(/\/+$/, '');
  }

  // Saat dikembangkan lewat Expo Go, alamat komputer Metro dipakai juga
  // untuk backend. Ini menghindari hardcode IP LAN yang sering berubah.
  const hostUri = Constants.expoConfig?.hostUri
    || Constants.expoGoConfig?.debuggerHost
    || Constants.manifest2?.extra?.expoGo?.debuggerHost;
  const host = hostUri ? String(hostUri).split(':')[0] : null;
  if (host) return `http://${host}:5000/api/v1`;

  if (Platform.OS === 'android') return 'http://10.0.2.2:5000/api/v1';
  return 'http://localhost:5000/api/v1';
}

export const API_BASE_URL = resolveBaseUrl();

const client = create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

let authToken = null;
let unauthorizedHandler = null;

export function setToken(token) {
  authToken = token || null;
}

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

client.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const payload = error.response?.data?.error;

    if (status === 401 && authToken && unauthorizedHandler) {
      unauthorizedHandler();
    }

    const message = payload?.message
      || (error.code === 'ECONNABORTED'
        ? 'Koneksi ke server terlalu lama. Coba lagi.'
        : 'Tidak dapat terhubung ke server SiPinjam. Periksa jaringan dan alamat API.');

    const apiError = new Error(message);
    apiError.code = payload?.code || (error.response ? 'SERVER_ERROR' : 'NETWORK_ERROR');
    apiError.status = status;
    apiError.details = payload?.details;
    return Promise.reject(apiError);
  },
);

async function unwrap(request) {
  const response = await request;
  return response.data?.data;
}

export const api = {
  get: (url, config) => unwrap(client.get(url, config)),
  post: (url, body, config) => unwrap(client.post(url, body, config)),
  patch: (url, body, config) => unwrap(client.patch(url, body, config)),
  async getList(url, config) {
    const response = await client.get(url, config);
    return {
      data: response.data?.data ?? [],
      meta: response.data?.meta ?? {},
    };
  },
  setToken,
  setUnauthorizedHandler,
};
