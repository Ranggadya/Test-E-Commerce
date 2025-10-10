// src/app/api/auth/login/route.ts
import { NextRequest } from 'next/server';
import { AuthController } from '@/layers/controllers/AuthController';
import { handleError } from '@/exceptions/handlerError';

const authController = new AuthController();

export async function POST(request: NextRequest) {
  try {
    // Jangan baca request.json() di sini, biarkan controller yang menangani
    return await authController.login(request);
  } catch (error) {
    return handleError(error);
  }
}
