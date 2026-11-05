"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { error: updateErr } = await supabase.auth.updateUser({ password });
      if (updateErr) {
        setError(updateErr.message);
        setIsSubmitting(false);
        return;
      }
    }

    setIsSuccess(true);
    setIsSubmitting(false);
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8F7F2]">
      <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E7E6DF] rounded-lg shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded bg-[#174D3C] text-[#F8F7F2] font-semibold text-base flex items-center justify-center mx-auto mb-3 shadow-xs">
            AF
          </div>
          <h1 className="text-xl font-semibold text-[#171A18] tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs text-[#777B76] mt-1">
            Choose a new secure password for your financial vault
          </p>
        </div>

        {isSuccess ? (
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#DCE8DE] text-[#174D3C] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-sm font-semibold text-[#171A18]">Password Updated</h2>
            <p className="text-xs text-[#777B76]">Redirecting you to the sign-in screen...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded bg-[#C65C54]/10 border border-[#C65C54]/20 text-xs font-medium text-[#C65C54]">
                {error}
              </div>
            )}
            <div>
              <label className="block text-[11px] font-medium text-[#777B76] uppercase tracking-wider mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#777B76] absolute left-3 top-2.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Minimum 6 characters"
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

            <div>
              <label className="block text-[11px] font-medium text-[#777B76] uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#777B76] absolute left-3 top-2.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Repeat your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#E7E6DF] rounded bg-[#FFFFFF] focus:outline-none focus:border-[#174D3C]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-[#174D3C] hover:bg-[#0E362A] text-[#F8F7F2] text-xs font-semibold rounded transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <span>{isSubmitting ? "Updating..." : "Update Password"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
