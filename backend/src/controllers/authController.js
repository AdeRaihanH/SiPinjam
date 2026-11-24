import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError, asyncHandler } from '../lib/errors.js';
import { sendData } from '../lib/response.js';
import { serializeMember } from '../lib/serializers.js';
import { loginSchema, registerSchema } from '../validators/authValidator.js';
import { validate } from '../validators/validate.js';

function buatToken(member) {
  return jwt.sign(
    { sub: member.id, role: member.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );
}

export function createAuthController({ members }) {
  return {
    register: asyncHandler(async (req, res) => {
      const { nama, nim, password } = validate(registerSchema, req.body);
      const existing = await members.findByNim(nim);
      if (existing) {
        throw new ApiError(409, 'CONFLICT', 'NIM sudah terdaftar');
      }

      const passwordHash = await bcrypt.hash(password, 10);
      let member;
      try {
        member = await members.create({ nama, nim, passwordHash });
      } catch (error) {
        if (error.code === '23505') {
          throw new ApiError(409, 'CONFLICT', 'NIM sudah terdaftar');
        }
        throw error;
      }

      return sendData(res, {
        token: buatToken(member),
        member: serializeMember(member),
      }, 201);
    }),

    login: asyncHandler(async (req, res) => {
      const { nim, password } = validate(loginSchema, req.body);
      const member = await members.findByNim(nim);
      const cocok = member ? await bcrypt.compare(password, member.password_hash) : false;

      if (!cocok) {
        throw new ApiError(401, 'UNAUTHORIZED', 'NIM atau kata sandi salah');
      }

      return sendData(res, { token: buatToken(member), member: serializeMember(member) });
    }),

    me: asyncHandler(async (req, res) => {
      const member = await members.findById(req.auth.id);
      if (!member) throw new ApiError(401, 'UNAUTHORIZED', 'Akun tidak ditemukan');
      return sendData(res, { member: serializeMember(member) });
    }),
  };
}
