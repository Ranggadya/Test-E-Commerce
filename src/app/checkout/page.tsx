"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useCart } from "@/components/CartContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { cart, isLoading: cartLoading } = useCart();

  useEffect(() => {
    // Redirect to payment page if user is logged in
    if (!authLoading && !cartLoading) {
      if (!user) {
        router.replace("/login");
      } else if (!cart || cart.items.length === 0) {
        router.replace("/cart");
      } else {
        router.replace("/payment");
      }
    }
  }, [user, cart, authLoading, cartLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Memproses checkout...</h1>
        <p className="text-gray-600">Mohon tunggu sebentar</p>
      </div>
    </div>
  );
}
  