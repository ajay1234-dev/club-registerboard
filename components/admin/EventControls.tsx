"use client";

import { useState } from "react";
import { AlertTriangle, Power } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

interface EventControlsProps {
  registrationOpen: boolean;
  onUpdate: () => void;
}

export default function EventControls({ registrationOpen, onUpdate }: EventControlsProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const toggleRegistration = async () => {
    setIsToggling(true);
    try {
      await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationOpen: !registrationOpen }),
      });
      onUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setIsToggling(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetConfirmText !== "RESET ALL DATA") return;

    setIsResetting(true);
    setResetError(null);

    try {
      const res = await fetch("/api/admin/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: resetConfirmText }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setIsResetOpen(false);
      setResetConfirmText("");
      onUpdate();
    } catch (err: any) {
      setResetError(err.message || "Reset failed");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="glass-card p-5 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#f0f0ff] mb-1">Event Controls</h2>
        <p className="text-sm text-[#a1a1c7]">Manage global event state</p>
      </div>

      {/* Registration Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-[#1e1e3f]">
        <div>
          <p className="font-semibold text-[#f0f0ff]">Registration Status</p>
          <p className="text-sm text-[#6b7280]">
            Currently <span className={registrationOpen ? "text-green-400 font-bold" : "text-red-400 font-bold"}>{registrationOpen ? "OPEN" : "CLOSED"}</span>
          </p>
        </div>
        <Button
          variant={registrationOpen ? "danger" : "primary"}
          onClick={toggleRegistration}
          isLoading={isToggling}
        >
          <Power className="w-4 h-4" />
          {registrationOpen ? "Close Registration" : "Open Registration"}
        </Button>
      </div>

      {/* Dev Reset */}
      {process.env.NODE_ENV !== "production" && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/5 border border-red-500/20">
          <div>
            <p className="font-semibold text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Danger Zone
            </p>
            <p className="text-sm text-[#6b7280]">Delete all registrations and reset counts (Dev Only)</p>
          </div>
          <Button variant="danger" onClick={() => setIsResetOpen(true)}>
            Reset Event Data
          </Button>
        </div>
      )}

      {/* Reset Modal */}
      <Modal isOpen={isResetOpen} onClose={() => setIsResetOpen(false)} title="Reset Event Data">
        <form onSubmit={handleReset} className="space-y-4">
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-4">
            <strong>Warning:</strong> This will delete ALL registrations, device records, and email records. Club counts will be reset to 0. This cannot be undone.
          </div>
          
          {resetError && <p className="text-red-400 text-sm">{resetError}</p>}

          <Input
            label='Type "RESET ALL DATA" to confirm'
            value={resetConfirmText}
            onChange={(e) => setResetConfirmText(e.target.value)}
            disabled={isResetting}
            required
            autoComplete="off"
          />

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsResetOpen(false)} disabled={isResetting}>Cancel</Button>
            <Button type="submit" variant="danger" className="flex-1" disabled={resetConfirmText !== "RESET ALL DATA"} isLoading={isResetting}>Yes, Reset Everything</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
