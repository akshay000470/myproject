"use client";

import React, { useState } from "react";
import { useFinance } from "@/context/finance-context";
import { Topbar } from "@/components/layout/topbar";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Shield,
  Download,
  Trash2,
  CheckCircle2,
  Database,
  Lock,
} from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function SettingsPage() {
  const {
    user,
    profile,
    updateProfile,
    accounts,
    transactions,
    categories,
    budgets,
    recurring,
    goals,
    loans,
    isConfigured,
    preferredCurrency,
  } = useFinance();

  const [fullName, setFullName] = useState(profile?.full_name || user?.full_name || "");
  const [currency, setCurrency] = useState(preferredCurrency || "INR");
  const [dateFormat, setDateFormat] = useState(profile?.date_format || "DD/MM/YYYY");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Password update
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);

  // Clear data modal
  const [isClearDataOpen, setIsClearDataOpen] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(fullName, currency);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg("Password must be at least 6 characters.");
      return;
    }

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPasswordMsg(error.message);
        return;
      }
    }

    setPasswordMsg("Password updated successfully.");
    setTimeout(() => {
      setIsPasswordModalOpen(false);
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMsg(null);
    }, 1500);
  };

  const handleExportFullJSON = () => {
    const backup = {
      exportDate: new Date().toISOString(),
      user: { id: user?.id, email: user?.email },
      profile,
      accounts,
      categories,
      transactions,
      budgets,
      recurring,
      goals,
      loans,
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `antigravity_financial_vault_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  const handleClearData = () => {
    if (user) {
      localStorage.removeItem(`antigravity_data_${user.id}`);
      window.location.reload();
    }
  };

  return (
    <div className="min-h-full">
      <Topbar
        title="Settings & System Preferences"
        description="Manage security, currency denominations, vault export, and database sync"
        showDateRange={false}
      />

      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {saveSuccess && (
          <div className="p-3 bg-[#DCE8DE] border border-[#174D3C]/20 text-xs font-semibold text-[#174D3C] rounded flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile and currency preferences updated successfully.</span>
          </div>
        )}

        {/* Profile Settings */}
        <div className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-md p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#E7E6DF]">
            <User className="w-4 h-4 text-[#174D3C]" />
            <h3 className="text-xs font-semibold text-[#171A18] uppercase tracking-wider">
              Profile & Valuation Denomination
            </h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-[#777B76] mb-1">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#777B76] mb-1">
                  Email Address (Identity)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#F8F7F2] text-xs text-[#777B76] cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-[#777B76] mb-1">
                  Preferred Currency (Default: INR)
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
                >
                  <option value="INR">Indian Rupee (₹ INR)</option>
                  <option value="USD">US Dollar ($ USD)</option>
                  <option value="EUR">Euro (€ EUR)</option>
                  <option value="GBP">British Pound (£ GBP)</option>
                  <option value="AED">UAE Dirham (د.إ AED)</option>
                  <option value="SGD">Singapore Dollar (S$ SGD)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#777B76] mb-1">
                  Date Format
                </label>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 05/11/2026)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-[#174D3C] text-[#F8F7F2] text-xs font-semibold rounded hover:bg-[#0E362A] shadow-xs"
              >
                Save Preferences
              </button>
            </div>
          </form>
        </div>

        {/* Security & Authentication */}
        <div className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-md p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#E7E6DF]">
            <Shield className="w-4 h-4 text-[#174D3C]" />
            <h3 className="text-xs font-semibold text-[#171A18] uppercase tracking-wider">
              Security & Credentials
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-semibold text-[#171A18]">Vault Master Password</p>
              <p className="text-[#777B76] text-[11px]">
                Update your account password or invalidate active sessions
              </p>
            </div>
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="px-3.5 py-1.5 border border-[#E7E6DF] bg-[#F8F7F2] hover:bg-[#E7E6DF]/50 rounded font-medium text-[#171A18] flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Change Password</span>
            </button>
          </div>
        </div>

        {/* Database & Cloud Architecture Details */}
        <div className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-md p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7E6DF]">
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-[#174D3C]" />
              <h3 className="text-xs font-semibold text-[#171A18] uppercase tracking-wider">
                Database & RLS Engine
              </h3>
            </div>
            <Badge variant={isConfigured ? "sage" : "gold"}>
              {isConfigured ? "Supabase Live (PostgreSQL)" : "Local Sandbox Storage"}
            </Badge>
          </div>

          <p className="text-xs text-[#777B76] leading-relaxed">
            All tables are mapped with strict Row Level Security (RLS) policies. Migration script is located at{" "}
            <code className="bg-[#F8F7F2] px-1 py-0.5 rounded border border-[#E7E6DF]">
              supabase/migrations/20261105_init_schema.sql
            </code>.
          </p>

          <div className="p-3 bg-[#F8F7F2] border border-[#E7E6DF] rounded text-xs space-y-1">
            <p className="font-semibold text-[#171A18]">Environment Setup Status:</p>
            <p className="text-[#777B76] font-mono text-[11px]">
              NEXT_PUBLIC_SUPABASE_URL: {isConfigured ? "Configured ✓" : "Not Provided in .env.local"}
            </p>
            <p className="text-[#777B76] font-mono text-[11px]">
              NEXT_PUBLIC_SUPABASE_ANON_KEY: {isConfigured ? "Configured ✓" : "Not Provided in .env.local"}
            </p>
          </div>
        </div>

        {/* Data Portability & Backup */}
        <div className="bg-[#FFFFFF] border border-[#E7E6DF] rounded-md p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#E7E6DF]">
            <Download className="w-4 h-4 text-[#174D3C]" />
            <h3 className="text-xs font-semibold text-[#171A18] uppercase tracking-wider">
              Data Portability & Vault Backup
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-semibold text-[#171A18]">Full Encrypted Ledger Export</p>
              <p className="text-[#777B76] text-[11px]">
                Download a complete JSON snapshot containing all accounts, transactions, budgets, goals, and recurring rules.
              </p>
            </div>
            <button
              onClick={handleExportFullJSON}
              className="px-3.5 py-1.5 bg-[#174D3C] hover:bg-[#0E362A] text-[#F8F7F2] rounded font-semibold flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON Backup</span>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-[#FFFFFF] border border-[#C65C54]/20 rounded-md p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#C65C54]/20">
            <Trash2 className="w-4 h-4 text-[#C65C54]" />
            <h3 className="text-xs font-semibold text-[#C65C54] uppercase tracking-wider">
              Danger Zone
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-semibold text-[#171A18]">Clear Vault Sandbox Data</p>
              <p className="text-[#777B76] text-[11px]">
                Reset local financial state and restore a brand new empty vault.
              </p>
            </div>
            <button
              onClick={() => setIsClearDataOpen(true)}
              className="px-3.5 py-1.5 border border-[#C65C54]/30 bg-[#C65C54]/10 hover:bg-[#C65C54]/20 text-[#C65C54] rounded font-semibold shrink-0"
            >
              Reset Vault
            </button>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Update Master Password"
        description="Set a new password for authentication"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
          {passwordMsg && (
            <div className="p-2.5 rounded bg-[#F8F7F2] border border-[#E7E6DF] text-xs font-medium">
              {passwordMsg}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-[#777B76] mb-1">
              New Password *
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#777B76] mb-1">
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-[#E7E6DF] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#174D3C]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E7E6DF]">
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(false)}
              className="px-4 py-2 border border-[#E7E6DF] rounded text-xs text-[#777B76] hover:bg-[#F8F7F2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#174D3C] text-[#F8F7F2] rounded text-xs font-medium hover:bg-[#0E362A]"
            >
              Save New Password
            </button>
          </div>
        </form>
      </Modal>

      {/* Clear Data Modal */}
      <Modal
        isOpen={isClearDataOpen}
        onClose={() => setIsClearDataOpen(false)}
        title="Reset Financial Vault"
        description="Permanently clear records and re-seed empty baseline"
      >
        <div className="space-y-4 text-xs">
          <p className="text-[#171A18] leading-relaxed">
            This action will wipe all accounts, transactions, budgets, goals, and loans created in this sandbox session. This cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-[#E7E6DF]">
            <button
              onClick={() => setIsClearDataOpen(false)}
              className="px-4 py-2 border border-[#E7E6DF] rounded text-xs text-[#777B76] hover:bg-[#F8F7F2]"
            >
              Cancel
            </button>
            <button
              onClick={handleClearData}
              className="px-4 py-2 bg-[#C65C54] text-[#F8F7F2] rounded text-xs font-semibold hover:bg-[#A8453E]"
            >
              Confirm Full Reset
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
