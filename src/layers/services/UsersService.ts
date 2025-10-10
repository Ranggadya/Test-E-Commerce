import { prisma } from '@/lib/db';
import bcrypt from '@/lib/BcryptUtil';

export class UsersService {
    static async addUser(name: string, email: string, password: string) {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new Error('Email sudah terdaftar');
        }

        const hashedPassword = await bcrypt.hashPassword(password);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        return user;
    }

    static async getUserById(id: string) {
        return prisma.user.findUnique({ where: { id } });
    }

    static async getUserByEmail(email: string) {
        return prisma.user.findUnique({ where: { email } });
    }

    static async getAllUsers() {
        return prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
    }

    static async updateUser(id: string,) {

    }
}