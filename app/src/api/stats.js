import { getData } from './client';

export const statsApi = {
  summary: () => getData('/stats/summary'),
  populer: (limit = 5) => getData('/stats/populer', { params: { limit } }),
};
