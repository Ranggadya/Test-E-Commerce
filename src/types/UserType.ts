import { UserRole } from '@prisma/client';

export interface RegisterInput {
  email: string;
  password?: string | null;           // optional untuk login Google
  name?: string;               // optional jika nama tidak tersedia dari Google
  role?: UserRole;             // optional, default USER
  imageUrl?: string | null;    // untuk profile picture dari Google
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UserPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  imageUrl?: string | null;    // tambahkan jika ingin bisa dipakai di JWT
}
