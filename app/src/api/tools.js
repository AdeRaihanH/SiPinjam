import { getData, getList } from './client';

export const toolsApi = {
  list: (params) => getList('/tools', { params }),
  detail: (id) => getData(`/tools/${id}`),
  byKode: (kode) => getData(`/tools/kode/${encodeURIComponent(kode)}`),
};
