import { NextRequest } from "next/server";
import { UsersController } from "@/layers/controllers/UsersController";
import { handleError } from "@/exceptions/handlerError";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    return await UsersController.getById(req, params);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    return await UsersController.update(req, params);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    return await UsersController.delete(req, params);
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
