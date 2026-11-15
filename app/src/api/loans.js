import { getData, getList, postData } from './client';

export const loansApi = {
  list: (params) => getList('/loans', { params }),
  detail: (id) => getData(`/loans/${id}`),
  byKode: (kode) => getData(`/loans/kode/${encodeURIComponent(kode)}`),
  create: (payload) => postData('/loans', payload),
  returnLoan: (id) => postData(`/loans/${id}/return`),
};
