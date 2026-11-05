"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFinance } from "@/context/finance-context";
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useFinance();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await signIn(email, password);
      if (res.error) {
        setError(res.error);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("An unexpected error occurred during authentication.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickSandboxAccess = async () => {
    setEmail("adviser@antigravity.finance");
    setPassword("MasterPass2026!");
    setIsSubmitting(true);
    await signIn("adviser@antigravity.finance", "MasterPass2026!");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8F7F2]">
      <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E7E6DF] rounded-lg shadow-sm p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded bg-[#174D3C] text-[#F8F7F2] font-semibold text-base flex items-center justify-center mx-auto mb-3 shadow-xs">
            AF
          </div>
          <h1 className="text-xl font-semibold text-[#171A18] tracking-tight">
            Antigravity Financial Suite
          </h1>
          <p className="text-xs text-[#777B76] mt-1">
            Enterprise personal wealth and cashflow management
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded bg-[#C65C54]/10 border border-[#C65C54]/20 text-xs font-medium text-[#C65C54]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-[#777B76] uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#777B76] absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-[#E7E6DF] rounded bg-[#FFFFFF] focus:outline-none focus:border-[#174D3C]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-medium text-[#777B76] uppercase tracking-wider">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-[#174D3C] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#777B76] absolute left-3 top-2.5" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-9 py-2 text-xs border border-[#E7E6DF] rounded bg-[#FFFFFF] focus:outline-none focus:border-[#174D3C]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-[#777B76] hover:text-[#171A18]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-[#174D3C] hover:bg-[#0E362A] text-[#F8F7F2] text-xs font-semibold rounded transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <span>{isSubmitting ? "Authenticating..." : "Sign In to Vault"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Sandbox quick test shortcut */}
        <div className="mt-5 pt-4 border-t border-[#E7E6DF] text-center">
          <button
            type="button"
            onClick={handleQuickSandboxAccess}
            className="w-full py-2 px-3 border border-[#DCE8DE] bg-[#DCE8DE]/30 text-[#174D3C] text-xs font-medium rounded hover:bg-[#DCE8DE]/50 transition-colors flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-[#174D3C]" />
            <span>Instant Sandbox Sign-In (Empty State)</span>
          </button>
        </div>

        <div className="mt-5 text-center text-xs text-[#777B76]">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#174D3C] font-semibold hover:underline">
            Register new vault
          </Link>
        </div>
      </div>
    </div>
  );
}
