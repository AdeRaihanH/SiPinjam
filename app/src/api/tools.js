import { deleteData, getData, getList, patchData, postData } from './client';

export const toolsApi = {
  list: (params) => getList('/tools', { params }),
  detail: (id) => getData(`/tools/${id}`),
  byKode: (kode) => getData(`/tools/kode/${encodeURIComponent(kode)}`),
  create: (payload) => postData('/tools', payload),
  update: (id, payload) => patchData(`/tools/${id}`, payload),
  remove: (id) => deleteData(`/tools/${id}`),
};
