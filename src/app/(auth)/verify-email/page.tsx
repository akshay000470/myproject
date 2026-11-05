import React from "react";
import Link from "next/link";
import { MailCheck, ArrowLeft } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8F7F2]">
      <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E7E6DF] rounded-lg shadow-sm p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-[#DCE8DE] text-[#174D3C] flex items-center justify-center mx-auto mb-4">
          <MailCheck className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-semibold text-[#171A18] tracking-tight">
          Verify Your Email
        </h1>
        <p className="text-xs text-[#777B76] mt-2 leading-relaxed">
          We have sent a verification confirmation to your email address. Please click the link inside to confirm your financial vault ownership.
        </p>
        <div className="mt-6 pt-4 border-t border-[#E7E6DF]">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#174D3C] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
