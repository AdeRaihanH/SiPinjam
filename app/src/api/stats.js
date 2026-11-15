import { getData } from './client';

export const statsApi = {
  summary: () => getData('/stats/summary'),
};
