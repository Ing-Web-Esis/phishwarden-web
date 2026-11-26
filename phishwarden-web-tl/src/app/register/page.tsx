"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function RegisterRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const plan = searchParams.get("plan");
    if (plan) {
      router.replace(`/registro?plan=${encodeURIComponent(plan)}`);
    } else {
      router.replace("/registro");
    }
  }, [router, searchParams]);

  return null;
}

export default function RegisterRedirectPage() {
  return (
    <Suspense fallback={null}>
      <RegisterRedirectContent />
    </Suspense>
  );
}
