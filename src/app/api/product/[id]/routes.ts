import { NextRequest } from "next/server";
import { ProductController } from "@/layers/controllers/ProductController";
import { handleError } from "@/exceptions/handlerError";
import { requireAdmin } from "@/lib/auth";

const controller = new ProductController();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    const result = await controller.getById(params.id);
    return result;
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    await requireAdmin(req);
    const result = await controller.update(params.id, req);
    return result;
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    await requireAdmin(req);
    const result = await controller.delete(params.id);
    return result;
  } catch (error) {
    return handleError(error);
  }
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
