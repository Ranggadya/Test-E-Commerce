import { ZodError } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { NextResponse } from 'next/server';
import { AppError } from '@/exceptions/AppError';
import { ValidationError } from '@/exceptions/ValidationError';

export function handleError(error: unknown): NextResponse {
  console.error('Error occurred:', error);

  if (error instanceof ZodError) {
    const issues = error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: issues,
        },
      },
      { status: 400 }
    );
  }

  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'A record with this value already exists',
            code: 'UNIQUE_CONSTRAINT_VIOLATION',
            details: error.meta ?? null,
          },
        },
        { status: 409 }
      );
    }
    if (error.code === 'P2003') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Related record not found',
            code: 'FOREIGN_KEY_CONSTRAINT_VIOLATION',
          },
        },
        { status: 400 }
      );
    }
    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Record not found',
            code: 'NOT_FOUND',
          },
        },
        { status: 404 }
      );
    }
  }

  if (error instanceof AppError) {
    const details = error instanceof ValidationError;
    const code = 'code' in error ? (error.code as string) : 'APP_ERROR';
    const statusCode = 'statusCode' in error ? (error.statusCode as number) : 400;

    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          code,
          details,
        },
      },
      { status: statusCode }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
      },
    },
    { status: 500 }
  );
}
