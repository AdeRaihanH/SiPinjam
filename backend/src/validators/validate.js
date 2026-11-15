import { ApiError } from '../lib/errors.js';

export function validate(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success) {
    const fields = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    throw new ApiError(
      422,
      'VALIDATION_ERROR',
      fields[0]?.message || 'Data yang dikirim tidak valid',
      fields,
    );
  }
  return result.data;
}
