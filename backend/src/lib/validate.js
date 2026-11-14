const { ApiError } = require('./http');

function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      issues[0]?.message || 'Data yang dikirim tidak valid',
      issues,
    );
  }
  return result.data;
}

module.exports = { validate };
