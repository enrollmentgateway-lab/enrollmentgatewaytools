import Image from "next/image";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = { title: "Admin sign in — Gateway Merchandise" };

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-black px-6 py-16">
      <div className="w-full max-w-sm">
        <Image
          src="/brand/logo-horizontal-white.png"
          alt="Gateway Seminary"
          width={260}
          height={48}
          className="mx-auto h-9 w-auto"
          priority
        />
        <div className="mt-10 rounded-brand border border-brand-white/15 bg-brand-white p-8">
          <p className="font-subheading text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-brand-grayblue">
            Merchandise Admin
          </p>
          <h1 className="rule-rust mt-2 font-heading text-2xl text-brand-black">Sign in</h1>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
