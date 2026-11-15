import { getData } from './client';

export const categoriesApi = {
  list: () => getData('/categories'),
};
