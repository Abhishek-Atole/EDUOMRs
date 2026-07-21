import bcrypt from 'bcrypt';
import { env } from '../../config/env.js';
import { UserRepository } from './user.repository.js';
import { NotFoundError, BadRequestError, AuthenticationError } from '../../types/errors.js';

export class UserService {
  static async getProfile(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  static async updateProfile(userId, data) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    return UserRepository.update(userId, data);
  }

  static async changePassword(userId, currentPassword, newPassword) {
    const user = await UserRepository.findByIdWithPassword(userId);
    if (!user) throw new NotFoundError('User not found');

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) throw new AuthenticationError('Current password is incorrect');

    const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS);
    await UserRepository.update(userId, { passwordHash });
  }
}
