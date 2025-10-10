import { ConflictError } from '@/exceptions/ConflictError';
import { UnauthorizedError } from '@/exceptions/UnauthorizedError';
import { UserRepository } from '@/layers/repositories/UserRepostory';
import { RegisterInput, LoginInput, UserPayload } from '@/types/UserType';
import { BcryptUtil } from '@/lib/BcryptUtil';
import { SignJWT, jwtVerify } from 'jose';
import { OAuth2Client } from 'google-auth-library';
import { UserRole } from '@prisma/client';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(data: RegisterInput) {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('User dengan email ini sudah terdaftar');
    }

    const hashedPassword = data.password
      ? await BcryptUtil.hashPassword(data.password)
      : undefined;

    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword,
      role: data.role || UserRole.USER,
    });

    const token = await this.generateToken({
      id: user.id,
      email: user.email,
      name: user.name || 'User',
      role: user.role,
      imageUrl: user.image || null,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name || 'User',
        role: user.role,
        imageUrl: user.image || null,
      },
      token,
    };
  }

  async login(data: LoginInput) {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user || !user.password) {
      throw new UnauthorizedError('Email atau password salah');
    }

    const isPasswordValid = await BcryptUtil.comparePassword(
      data.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new UnauthorizedError('Email atau password salah');
    }

    const token = await this.generateToken({
      id: user.id,
      email: user.email,
      name: user.name || 'User',
      role: user.role,
      imageUrl: user.image || null,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name || 'User',
        role: user.role,
        imageUrl: user.image || null,
      },
      token,
    };
  }

  async verifyToken(token: string): Promise<UserPayload> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      return payload as unknown as UserPayload;
    } catch (error) {
      throw new UnauthorizedError('Token tidak valid atau sudah kadaluarsa');
    }
  }

  private async generateToken(payload: UserPayload): Promise<string> {
    return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);
  }

  async loginWithGoogle(idToken: string) {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new UnauthorizedError('Token Google tidak valid');
    }

    let user = await this.userRepository.findByEmail(payload.email);

    if (!user) {
      user = await this.userRepository.create({
        name: payload.name || 'User Google',
        email: payload.email,
        password: undefined, 
        role: UserRole.USER,
        imageUrl: payload.picture || null,
      });
    }

    const token = await this.generateToken({
      id: user.id,
      email: user.email,
      name: user.name || 'User',
      role: user.role,
      imageUrl: user.image || null,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name || 'User',
        role: user.role,
        imageUrl: user.image || null,
      },
      token,
    };
  }
}
