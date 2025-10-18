// src/layers/controllers/AuthController.ts
import { NextRequest } from 'next/server';
import { AuthService } from '@/layers/services/AuthService';
import { registerSchema, loginSchema } from '@/layers/validators/AuthValidator';
import { successResponse, createdResponse } from '@/utils/api-response';
import { handleError } from '@/exceptions/handlerError';
import { ValidationError } from '@/exceptions/ValidationError';

export class AuthController {
  private readonly authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }
  async register(request: NextRequest): Promise<Response> {
    try {
      const rawBody = await request.json();

      const validated = registerSchema.safeParse(rawBody);
      if (!validated.success) {
        throw new ValidationError('Data registrasi tidak valid');
      }

      const result = await this.authService.register(validated.data);
      return createdResponse(result);
    } catch (error) {
      return handleError(error);
    }
  }

  async login(request: NextRequest): Promise<Response> {
    try {
      const rawBody = await request.json();

      const validated = loginSchema.safeParse(rawBody);
      if (!validated.success) {
        throw new ValidationError('Data login tidak valid');
      }

      const result = await this.authService.login(validated.data);
      return successResponse(result);
    } catch (error) {
      return handleError(error);
    }
  }
}
