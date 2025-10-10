import { NextRequest } from 'next/server';
import { AuthService } from '@/layers/services/AuthService';
import { UnauthorizedError } from '@/exceptions/UnauthorizedError';
import { UserPayload } from '@/types/UserType';

const authService = new AuthService();

export async function getUserFromRequest(request: NextRequest): Promise<UserPayload> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided');
  }

  const token = authHeader.substring(7);
  return authService.verifyToken(token);
}

export async function requireAuth(request: NextRequest): Promise<UserPayload> {
  return getUserFromRequest(request);
}

export async function requireAdmin(request: NextRequest): Promise<UserPayload> {
  const user = await getUserFromRequest(request);
  
  if (user.role !== 'ADMIN') {
    throw new UnauthorizedError('Admin access required');
  }

  return user;
}