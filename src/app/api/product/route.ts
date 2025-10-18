// src/app/api/product/route.ts
import { NextRequest } from "next/server";
import { ProductController } from "@/layers/controllers/ProductController";
import { handleError } from "@/exceptions/handlerError";
import { requireAdmin } from "@/lib/auth";

const controller = new ProductController();


export async function GET(req: NextRequest): Promise<Response> {
  try {
    return await controller.getAll(req);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    await requireAdmin(req); // pastikan hanya admin
    return await controller.create(req);
  } catch (error) {
    return handleError(error);
  }
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
