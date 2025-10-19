import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 🔹 Update product
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await req.json();

    const slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        slug,
        price: Number(body.price),
        stock: Number(body.stock ?? 0),
        category: body.category,
        description: body.description ?? null,
        imageUrl: body.imageUrl ?? null,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("❌ Gagal update produk:", error);
    return NextResponse.json(
      { success: false, message: "Gagal update produk" },
      { status: 500 }
    );
  }
}

// 🔹 Delete product
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Produk dihapus" });
  } catch (error) {
    console.error("❌ Gagal hapus produk:", error);
    return NextResponse.json(
      { success: false, message: "Gagal hapus produk" },
      { status: 500 }
    );
  }
}
