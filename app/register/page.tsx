"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, query, orderBy, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { getOrCreateDeviceId } from "@/lib/utils/device";
import { registrationSchema } from "@/lib/validation/schemas";
import StepIndicator from "@/components/registration/StepIndicator";
import ClubCard from "@/components/registration/ClubCard";
import ConfirmationModal from "@/components/registration/ConfirmationModal";
import SuccessScreen from "@/components/registration/SuccessScreen";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Club, RegistrationFormData, DepartmentConfig, SectionConfig } from "@/types";

const STEPS = ["Details", "Choose Club", "Confirm"];

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data state
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: "",
    email: "",
    phone: "",
    department: "",
    section: "",
    clubId: "",
    deviceId: "",
  });

  // Data from Firestore
  const [clubs, setClubs] = useState<Club[]>([]);
  const [departments, setDepartments] = useState<DepartmentConfig[]>([]);
  const [sections, setSections] = useState<SectionConfig[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Setup on mount
  useEffect(() => {
    // 1. Get device ID
    setFormData((prev) => ({ ...prev, deviceId: getOrCreateDeviceId() }));

    // 2. Fetch active clubs and settings
    async function loadData() {
      try {
        const [clubsSnap, settingsSnap] = await Promise.all([
          getDocs(query(collection(db, "clubs"), orderBy("displayOrder", "asc"))),
          getDoc(doc(db, "settings", "event")),
        ]);

        const activeClubs = clubsSnap.docs
          .map((d) => ({ id: d.id, ...d.data() } as Club))
          .filter((c) => c.active);

        setClubs(activeClubs);

        if (settingsSnap.exists()) {
          const settings = settingsSnap.data();
          if (settings.registrationOpen === false) {
            setError("Registration is currently closed.");
          }
          const depts = (settings.departments || []).filter((d: any) => d.active).sort((a: any, b: any) => a.displayOrder - b.displayOrder);
          const secs = (settings.sections || []).filter((s: any) => s.active).sort((a: any, b: any) => a.displayOrder - b.displayOrder);
          setDepartments(depts);
          setSections(secs);
        }
      } catch (err) {
        console.error("Failed to load registration data:", err);
        setError("Failed to connect to the server. Please check your connection and refresh.");
      } finally {
        setIsLoadingData(false);
      }
    }
    loadData();
  }, []);

  // Handlers
  const handleNext = () => {
    setError(null);
    if (currentStep === 1) {
      // Validate step 1 fields
      const partialData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        section: formData.section,
        clubId: "dummy", // bypass club check for now
        deviceId: formData.deviceId,
      };
      const result = registrationSchema.safeParse(partialData);
      if (!result.success) {
        // Just show first error
        const firstError = result.error.errors[0];
        setError(firstError.message);
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!formData.clubId) {
        setError("Please select a club to continue.");
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Registration failed");
      }

      // Store success data to show on screen
      setIsSuccess(true);
      // We don't need to redirect, we render the success screen component
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rendering
  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-[#a1a1c7]">
          <span className="w-8 h-8 border-4 border-[#1e1e3f] border-t-violet-500 rounded-full animate-spin" />
          <p>Loading registration form...</p>
        </div>
      </div>
    );
  }

  // If we succeeded, show success screen
  if (isSuccess) {
    const selectedClub = clubs.find((c) => c.id === formData.clubId);
    return (
      <SuccessScreen
        clubName={selectedClub?.name || "Your Club"}
        clubLogoUrl={selectedClub?.logoUrl || ""}
        studentName={formData.name}
      />
    );
  }

  return (
    <main className="min-h-screen flex flex-col pt-8 pb-20 px-4 sm:px-6">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-[-1] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-[#07070f] to-[#07070f]" />

      <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col">
        {/* Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <img src="/msiic-logo.jpg" alt="Msiic Logo" className="h-14 w-auto object-contain bg-white rounded-lg p-1.5 mb-3 shadow-lg shadow-black/50" />
          <h1 className="text-2xl font-bold text-[#f0f0ff] mb-2">Club Registration</h1>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
            <span aria-hidden>⚠</span>
            <p>{error}</p>
          </div>
        )}

        {/* Registration Closed Hard Block */}
        {error === "Registration is currently closed." ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <Button variant="secondary" onClick={() => router.push("/")}>
              Return Home
            </Button>
          </div>
        ) : (
          <>
            <StepIndicator currentStep={currentStep} steps={STEPS} />

            {/* Step 1: Details */}
            {currentStep === 1 && (
              <div className="glass-card p-6 space-y-5 flex-1">
                <h2 className="text-lg font-semibold text-[#f0f0ff] mb-2">Student Details</h2>
                <Input
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  type="email"
                  label="Email Address"
                  hint="Please use your college email if possible."
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <Input
                  type="tel"
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  required
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    options={departments.map((d) => ({ value: d.name, label: d.name }))}
                    required
                  />
                  <Select
                    label="Section"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    options={sections.map((s) => ({ value: s.name, label: s.name }))}
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 2: Choose Club */}
            {currentStep === 2 && (
              <div className="flex-1 flex flex-col">
                <h2 className="text-lg font-semibold text-[#f0f0ff] mb-4">Choose Your Club</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {clubs.map((club) => (
                    <ClubCard
                      key={club.id}
                      club={club}
                      isSelected={formData.clubId === club.id}
                      onSelect={(id) => {
                        setFormData({ ...formData, clubId: id });
                        setError(null);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Step 3 (Confirm) logic is handled by the Modal */}
            <ConfirmationModal
              isOpen={currentStep === 3}
              onClose={handleBack}
              onConfirm={handleSubmit}
              formData={formData}
              selectedClub={clubs.find((c) => c.id === formData.clubId) || null}
              isSubmitting={isSubmitting}
            />

            {/* Footer Navigation (only for steps 1 & 2) */}
            {currentStep < 3 && (
              <div className="mt-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                <Button
                  variant="ghost"
                  onClick={currentStep === 1 ? () => router.push("/") : handleBack}
                  className="w-full sm:w-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {currentStep === 1 ? "Cancel" : "Back"}
                </Button>

                <Button
                  variant="primary"
                  onClick={handleNext}
                  className="w-full sm:w-auto px-8"
                >
                  {currentStep === 2 ? "Review" : "Continue"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
