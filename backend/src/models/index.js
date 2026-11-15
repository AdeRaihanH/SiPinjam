import { createCategoryModel } from './categoryModel.js';
import { createLoanModel } from './loanModel.js';
import { createMemberModel } from './memberModel.js';
import { createNotificationModel } from './notificationModel.js';
import { createStatsModel } from './statsModel.js';
import { createToolModel } from './toolModel.js';

export function createModels(db) {
  return {
    members: createMemberModel(db),
    categories: createCategoryModel(db),
    tools: createToolModel(db),
    loans: createLoanModel(db),
    notifications: createNotificationModel(db),
    stats: createStatsModel(db),
  };
}
