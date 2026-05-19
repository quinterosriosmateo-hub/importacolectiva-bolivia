import { authController } from '@/controllers/authController';

export default async function handler(req, res) {
  return await authController.login(req, res);
}
