import { getList, patchData } from './client';

export const notificationsApi = {
  list: (params) => getList('/notifications', { params }),
  markRead: (id) => patchData(`/notifications/${id}/read`),
  markAll: () => patchData('/notifications/read-all'),
};
