import { NextRequest } from 'next/server';
import { ProductController } from '@/layers/controllers/product.controller';
import { handleError } from '@/utils/error-handler';
import { requireAdmin } from '@/lib/auth';

const productController = new ProductController();

export async function GET(request: NextRequest) {
  try {
    return await productController.getAll(request);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    return await productController.create(request);
  } catch (error) {
    return handleError(error);
  }
}

