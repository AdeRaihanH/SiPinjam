import { ApiError, asyncHandler } from '../lib/errors.js';
import { sendData, sendList } from '../lib/response.js';
import { serializeNotification } from '../lib/serializers.js';
import { notificationListSchema } from '../validators/notificationValidator.js';
import { uuidParamSchema } from '../validators/toolValidator.js';
import { validate } from '../validators/validate.js';

export function createNotificationController({ notifications }) {
  return {
    list: asyncHandler(async (req, res) => {
      const query = validate(notificationListSchema, req.query);
      const [result, unread] = await Promise.all([
        notifications.list(req.auth.id, query),
        notifications.unreadCount(req.auth.id),
      ]);

      return sendList(res, result.rows.map(serializeNotification), {
        total: result.count,
        belum_dibaca: unread,
        limit: query.limit,
        offset: query.offset,
      });
    }),

    markRead: asyncHandler(async (req, res) => {
      const { id } = validate(uuidParamSchema, req.params);
      const updated = await notifications.markRead(id, req.auth.id);
      if (!updated) throw new ApiError(404, 'NOT_FOUND', 'Notifikasi tidak ditemukan');
      return sendData(res, { id, dibaca: true });
    }),

    markAll: asyncHandler(async (req, res) => {
      const diubah = await notifications.markAll(req.auth.id);
      return sendData(res, { diubah });
    }),
  };
}
