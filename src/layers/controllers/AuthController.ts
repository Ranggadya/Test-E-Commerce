import { NextRequest } from 'next/server';
import { AuthService } from '@/layers/services/AuthService';
import { registerSchema, loginSchema } from '@/layers/validators/AuthValidator';
import { successResponse, createdResponse } from '@/utils/api-response';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async register(request: NextRequest) {
    const rawBody = await request.json();

    const validated = registerSchema.parse(rawBody);
    const result = await this.authService.register(validated);

    return createdResponse(result);
  }

  async login(request: NextRequest) {
    const rawBody = await request.json();
    const validated = loginSchema.parse(rawBody);

    const result = await this.authService.login(validated);
    return successResponse(result);
  }
}
