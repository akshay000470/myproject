"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFinance } from "@/context/finance-context";
import { Eye, EyeOff, Lock, Mail, User, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useFinance();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signUp(email, password, fullName);
      if (res.error) {
        setError(res.error);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8F7F2]">
      <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E7E6DF] rounded-lg shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded bg-[#174D3C] text-[#F8F7F2] font-semibold text-base flex items-center justify-center mx-auto mb-3 shadow-xs">
            AF
          </div>
          <h1 className="text-xl font-semibold text-[#171A18] tracking-tight">
            Create Financial Vault
          </h1>
          <p className="text-xs text-[#777B76] mt-1">
            Zero dummy data. Starts clean with default taxonomy.
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
              Full Legal Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#777B76] absolute left-3 top-2.5" />
              <input
                type="text"
                required
                placeholder="e.g. Akshay Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-[#E7E6DF] rounded bg-[#FFFFFF] focus:outline-none focus:border-[#174D3C]"
              />
            </div>
          </div>

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
            <label className="block text-[11px] font-medium text-[#777B76] uppercase tracking-wider mb-1">
              Master Password
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
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#777B76] absolute left-3 top-2.5" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-[#E7E6DF] rounded bg-[#FFFFFF] focus:outline-none focus:border-[#174D3C]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-[#174D3C] hover:bg-[#0E362A] text-[#F8F7F2] text-xs font-semibold rounded transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 mt-2"
          >
            <span>{isSubmitting ? "Creating Vault..." : "Register Vault"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#777B76]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#174D3C] font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
