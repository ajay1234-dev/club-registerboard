"use client";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Image from "next/image";
import { AlertTriangle } from "lucide-react";
import type { RegistrationFormData, Club } from "@/types";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  formData: RegistrationFormData;
  selectedClub: Club | null;
  isSubmitting: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  formData,
  selectedClub,
  isSubmitting,
}: ConfirmationModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? undefined : onClose}
      title="Confirm Your Registration"
      showClose={!isSubmitting}
      size="md"
    >
      <div className="space-y-5">
        {/* Registration summary */}
        <div className="space-y-3">
          <SummaryRow label="Name" value={formData.name} />
          <SummaryRow label="Email" value={formData.email} />
          <SummaryRow label="Department" value={formData.department} />
          <SummaryRow label="Section" value={formData.section} />
        </div>

        {/* Selected club */}
        {selectedClub && (
          <div className="rounded-xl bg-white dark:bg-[#14142a] border border-violet-500/30 p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-white dark:bg-[#07070f] flex items-center justify-center">
              {selectedClub.logoUrl ? (
                <Image
                  src={selectedClub.logoUrl}
                  alt={selectedClub.name}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold gradient-text">
                  {selectedClub.name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <p className="text-xs text-[#6b7280] font-medium uppercase tracking-wider mb-1">
                Selected Club
              </p>
              <p className="text-gray-900 dark:text-[#f0f0ff] font-semibold text-lg">
                {selectedClub.name}
              </p>
            </div>
          </div>
        )}

        {/* Irreversible action warning */}
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-400">
              This action cannot be undone
            </p>
            <p className="text-xs text-amber-400/70 mt-1">
              Once submitted, you cannot change your club. One student, one club.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button
            variant="secondary"
            size="md"
            className="flex-1"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Go Back
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            onClick={onConfirm}
            isLoading={isSubmitting}
            id="confirm-registration-btn"
          >
            Confirm Registration
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-[#1e1e3f] last:border-none">
      <span className="text-sm text-[#6b7280]">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-[#f0f0ff]">{value}</span>
    </div>
  );
}
