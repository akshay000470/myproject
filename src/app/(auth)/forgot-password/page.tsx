"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetErr) {
        setError(resetErr.message);
        setIsSubmitting(false);
        return;
      }
    }

    setSubmitted(true);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8F7F2]">
      <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E7E6DF] rounded-lg shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded bg-[#174D3C] text-[#F8F7F2] font-semibold text-base flex items-center justify-center mx-auto mb-3 shadow-xs">
            AF
          </div>
          <h1 className="text-xl font-semibold text-[#171A18] tracking-tight">
            Account Recovery
          </h1>
          <p className="text-xs text-[#777B76] mt-1">
            Receive password reset instructions to your registered email
          </p>
        </div>

        {submitted ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#DCE8DE] text-[#174D3C] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-sm font-semibold text-[#171A18]">Recovery Email Dispatched</h2>
            <p className="text-xs text-[#777B76] leading-relaxed">
              If an account is associated with <strong>{email}</strong>, a secure reset link has been dispatched.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#174D3C] hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
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
                Registered Email Address
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-[#174D3C] hover:bg-[#0E362A] text-[#F8F7F2] text-xs font-semibold rounded transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <span>{isSubmitting ? "Sending..." : "Send Reset Link"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-xs text-[#777B76] hover:text-[#171A18]"
              >
                <ArrowLeft className="w-3 h-3" /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
