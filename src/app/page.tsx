"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useInvoiceStore } from "@/features/dashboard/store/useInvoiceStore";

export default function Home() {
  const { userName } = useInvoiceStore();
  const router = useRouter();

  useEffect(() => {
    if (userName) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [userName, router]);

  return null;
}
