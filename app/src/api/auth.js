import { getData, postData } from './client';

export const authApi = {
  login: (nim, password) => postData('/auth/login', { nim, password }),
  register: (nama, nim, password) => postData('/auth/register', { nama, nim, password }),
  me: () => getData('/auth/me'),
};
