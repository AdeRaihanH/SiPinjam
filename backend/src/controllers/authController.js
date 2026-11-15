import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError, asyncHandler } from '../lib/errors.js';
import { sendData } from '../lib/response.js';
import { memberPublic } from '../lib/serializers.js';
import { loginSchema } from '../validators/authValidator.js';
import { validate } from '../validators/validate.js';

export function createAuthController({ members }) {
  return {
    login: asyncHandler(async (req, res) => {
      const { nim, password } = validate(loginSchema, req.body);
      const member = await members.findByNim(nim);
      const cocok = member ? await bcrypt.compare(password, member.password_hash) : false;

      if (!cocok) {
        throw new ApiError(401, 'UNAUTHORIZED', 'NIM atau kata sandi salah');
      }

      const token = jwt.sign(
        { sub: member.id, role: member.role },
        env.jwtSecret,
        { expiresIn: env.jwtExpiresIn },
      );

      return sendData(res, { token, member: memberPublic(member) });
    }),

    me: asyncHandler(async (req, res) => {
      const member = await members.findById(req.auth.id);
      if (!member) throw new ApiError(401, 'UNAUTHORIZED', 'Akun tidak ditemukan');
      return sendData(res, { member: memberPublic(member) });
    }),
  };
}
