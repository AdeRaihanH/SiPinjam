import { getData, postData } from './client';

export const authApi = {
  login: (nim, password) => postData('/auth/login', { nim, password }),
  me: () => getData('/auth/me'),
};
