"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ArrowLeft,
  ArrowRight,
  Upload,
  Loader2,
  PenLine,
  Lock,
  Plus,
  Trash2,
  FileText,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { SignaturePad } from "@/components/ui/signature-pad";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  accessToken: string;
  orderData: string; // JSON string of initial wizard answers
  questionnaireResponses?: string | null; // JSON string of saved responses
  questionnaireProgress?: number;
  questionnaireCompleted?: boolean;
}

interface QuestionnaireWizardProps {
  order: Order;
  /** When provided, the questionnaire is embedded before payment: skip the
   * post-payment "Order Information" screen and hand control back to the parent. */
  onCompleted?: () => void;
}

interface UploadedFile {
  name: string;
  url: string;
  category: string;
  uploadedAt: string;
}

const SECTIONS = [
  { id: 1, label: "Homeowner Verification" },
  { id: 2, label: "Property Occupancy" },
  { id: 3, label: "Mortgage Information" },
  { id: 4, label: "Insurance Information" },
  { id: 5, label: "Roof Information" },
  { id: 6, label: "HVAC System" },
  { id: 7, label: "Plumbing" },
  { id: 8, label: "Electrical" },
  { id: 9, label: "Windows & Doors" },
  { id: 10, label: "Exterior" },
  { id: 11, label: "Interior Improvements" },
  { id: 12, label: "Safety & Security" },
  { id: 13, label: "Smart Home Features" },
  { id: 14, label: "Maintenance History" },
  { id: 15, label: "Property Disclosures" },
  { id: 16, label: "Document Upload Center" },
  { id: 17, label: "Final Certification" },
];

const slideVariants = {
  enter: (d: number) => ({ opacity: 0, x: d > 0 ? 30 : -30 }),
  center: { opacity: 1, x: 0 },
  exit: (d: number) => ({ opacity: 0, x: d > 0 ? -30 : 30 }),
};

export default function QuestionnaireWizard({ order, onCompleted }: QuestionnaireWizardProps) {
  // Parse initial wizard data
  const initialWizardData = useMemo(() => {
    try {
      return JSON.parse(order.orderData) || {};
    } catch {
      return {};
    }
  }, [order.orderData]);

  // Load initial questionnaire responses
  const initialResponses = useMemo(() => {
    try {
      if (order.questionnaireResponses) {
        return JSON.parse(order.questionnaireResponses);
      }
    } catch (e) {
      console.error("Failed to parse questionnaire responses", e);
    }
    return {};
  }, [order.questionnaireResponses]);

  const [activeStep, setActiveStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(!!order.questionnaireCompleted);
  const [uploading, setUploading] = useState(false);

  // Form State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [form, setForm] = useState<Record<string, any>>(() => {
    const fullAddress = [
      initialWizardData.address,
      initialWizardData.address2,
      initialWizardData.city,
      initialWizardData.state,
      initialWizardData.zip,
    ]
      .filter(Boolean)
      .join(", ");

    return {
      // Prefilled default values
      fullName: order.customerName,
      email: order.customerEmail,
      phone: "",
      address: fullAddress,
      relationship: initialWizardData.ownershipType || "owner",
      ownershipYears: "",
      primaryResidence: "yes",
      signatureStep1: "",

      occupancyType: "owner_occupied",
      occupantsCount: "",
      activeLeases: "no",

      lenderName: "",
      mortgageYear: "",
      secondMortgage: "no",
      mortgageNotes: "",

      insuranceCarrier: "",
      insuranceClaims: "no",
      insuranceNotes: "",

      roofMaterial: "asphalt_shingle",
      roofAge: initialWizardData.yearBuilt
        ? (new Date().getFullYear() - Number(initialWizardData.yearBuilt)).toString()
        : "",
      roofLeaks: "no",
      roofReplacementPlanned: "no",

      hvacHeatingType: "",
      hvacCoolingType: "",
      hvacHeatingAge: "",
      hvacCoolingAge: "",
      hvacServiced: "no",
      hvacWorking: "yes",

      plumbingMaterial: "",
      sewerType: "public_sewer",
      waterHeaterType: "standard",
      waterHeaterAge: "",
      plumbingLeaks: "no",

      electricalPanel: "breakers",
      electricalAmps: "200_amp",
      electricalKnobTube: "no",
      electricalGfci: "yes",
      electricalIssues: "no",

      windowGlazing: "double_pane",
      brokenSeals: "no",
      exteriorDoorsGood: "yes",

      foundationType: "slab",
      sidingMaterial: "",
      foundationCracks: "no",
      exteriorGuttersFunctional: "yes",

      kitchenRemodeled: "no",
      bathroomsRemodeled: "no",
      flooringReplaced: "no",
      structuralRemodel: "no",
      remodelYear: "",

      smokeDetectorsFunctional: "yes",
      coDetectorsFunctional: "yes",
      securitySystemPresent: "no",
      sprinklerSystemPresent: "no",

      smartThermostat: "no",
      smartLock: "no",
      smartCamera: "no",
      smartLighting: "no",

      gutterCleanedRegularly: "yes",
      pestControlContract: "no",
      chimneyInspected: "no",
      sumpPumpInspected: "no",
      maintenanceNotes: "",

      historyWaterDamage: "no",
      historyMold: "no",
      historyFireDamage: "no",
      boundaryDisputes: "no",
      activeHoaDisputes: "no",
      environmentalHazards: "no",
      knownStructuralDefects: "no",

      uploadedFiles: [],
      certificationAccept: false,
      certificationSignature: "",
      certificationDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      // Merge with previously saved answers
      ...initialResponses,
    };
  });

  // Track completed sections
  const completedSections = useMemo(() => {
    const list: number[] = [];

    // Step 1 check
    if (form.fullName && form.email && form.phone && form.signatureStep1) list.push(1);
    // Step 2 check
    if (form.occupancyType && form.occupantsCount) list.push(2);
    // Step 3 check (Optional - completed if lenderName present or skipped)
    if (form.lenderName || form.mortgageNotes || initialResponses.mortgageSkipped) list.push(3);
    // Step 4 check (Optional - completed if carrier present or skipped)
    if (form.insuranceCarrier || form.insuranceNotes || initialResponses.insuranceSkipped)
      list.push(4);
    // Step 5 check
    if (form.roofMaterial && form.roofAge) list.push(5);
    // Step 6 check
    if (form.hvacHeatingType && form.hvacCoolingType) list.push(6);
    // Step 7 check
    if (form.plumbingMaterial && form.waterHeaterAge) list.push(7);
    // Step 8 check
    if (form.electricalPanel && form.electricalAmps) list.push(8);
    // Step 9 check
    if (form.windowGlazing) list.push(9);
    // Step 10 check
    if (form.foundationType && form.sidingMaterial) list.push(10);
    // Step 11 check
    if (form.kitchenRemodeled) list.push(11);
    // Step 12 check
    if (form.smokeDetectorsFunctional) list.push(12);
    // Step 13 check
    if (form.smartThermostat) list.push(13);
    // Step 14 check
    if (form.gutterCleanedRegularly) list.push(14);
    // Step 15 check
    if (form.historyWaterDamage) list.push(15);
    // Step 16 check (Document Upload - always valid to continue)
    list.push(16);
    // Step 17 check
    if (form.certificationAccept && form.certificationSignature) list.push(17);

    return Array.from(new Set(list));
  }, [form, initialResponses]);

  const percentage = Math.round((completedSections.length / SECTIONS.length) * 100);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateField = (k: string, v: any) => {
    setForm((prev) => ({ ...prev, [k]: v }));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const str = (v: any): string => (typeof v === "string" ? v : v == null ? "" : String(v));

  const handleSave = useCallback(
    async (silent = false) => {
      setSaving(true);
      try {
        const res = await fetch("/api/save-questionnaire", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: order.accessToken,
            responses: form,
            progress: completedSections.length,
            completed: completedSections.includes(17),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Save failed");
        if (!silent) toast.success("Progress saved successfully");
      } catch (err: unknown) {
        if (!silent)
          toast.error(err instanceof Error ? err.message : "Failed to save questionnaire");
      } finally {
        setSaving(false);
      }
    },
    [form, order.accessToken, completedSections],
  );

  const nextStep = async () => {
    if (activeStep === 17) {
      if (!form.certificationAccept || !form.certificationSignature) {
        toast.error("Please accept the certification terms and sign above.");
        return;
      }

      // Final Submission!
      setSaving(true);
      try {
        const res = await fetch("/api/save-questionnaire", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: order.accessToken,
            responses: form,
            progress: SECTIONS.length,
            completed: true,
          }),
        });
        if (!res.ok) throw new Error("Submission failed");
        window.scrollTo({ top: 0, behavior: "smooth" });
        toast.success("Questionnaire submitted successfully!");
        if (onCompleted) onCompleted();
        else setCompleted(true);
      } catch {
        toast.error("Submission failed. Please try again.");
      } finally {
        setSaving(false);
      }
      return;
    }

    // Auto-save progress
    await handleSave(true);

    setDirection(1);
    setActiveStep((s) => Math.min(SECTIONS.length, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevStep = () => {
    setDirection(-1);
    setActiveStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      toast.error("File is too large. Max size is 25 MB.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", str(form.uploadCategory) || "other");

    try {
      const res = await fetch("/api/upload-document", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      const newFileObj = {
        name: file.name,
        url: data.url,
        category: str(form.uploadCategory) || "other",
        uploadedAt: new Date().toLocaleString(),
      };

      const nextFiles = [...((form.uploadedFiles as UploadedFile[]) || []), newFileObj];
      updateField("uploadedFiles", nextFiles);
      toast.success(`${file.name} uploaded successfully!`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "File upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = (index: number) => {
    const nextFiles = [...((form.uploadedFiles as UploadedFile[]) || [])];
    nextFiles.splice(index, 1);
    updateField("uploadedFiles", nextFiles);
    toast.success("File removed.");
  };

  const handleStepClick = (stepId: number) => {
    if (stepId === activeStep) return;
    setDirection(stepId > activeStep ? 1 : -1);
    setActiveStep(stepId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (completed) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-8 text-center shadow-elegant md:p-14">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-500/10">
          <Check className="h-10 w-10 text-emerald-500" strokeWidth={1.5} />
        </div>
        <h1 className="mt-6 font-display text-3xl text-ink md:text-4xl text-balance">
          Questionnaire Completed!
        </h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Thank you for providing your property details and disclosures. Our analysts have received
          your verified information and are combining it with public records to prepare your report.
        </p>
        <div className="mt-6 border-t pt-6 text-left max-w-md mx-auto">
          <h4 className="font-display text-sm uppercase tracking-wider text-muted-foreground">
            Order Information
          </h4>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Order ID</dt>
              <dd className="font-mono text-ink font-semibold">{order.id}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Submitted by</dt>
              <dd className="text-ink">{order.customerName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Date</dt>
              <dd className="text-ink">{form.certificationDate}</dd>
            </div>
          </dl>
        </div>
        <div className="mt-8 flex justify-center gap-3">
          {onCompleted ? (
            <>
              <Button
                type="button"
                variant="primary"
                size="lg"
                className="rounded-xl"
                onClick={onCompleted}
              >
                Continue to payment
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="rounded-xl"
                onClick={() => setCompleted(false)}
              >
                Edit answers
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="primary" size="lg" className="rounded-xl">
                <a href={`/order/status/${order.accessToken}`}>View Order Details</a>
              </Button>
              <Button asChild variant="ghost" className="rounded-xl">
                <a href="/">Return Home</a>
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      {/* Left Sidebar - Progress Tracking */}
      <aside className="rounded-3xl border border-border bg-white p-5 shadow-sm lg:sticky lg:top-24 lg:self-start">
        <h2 className="font-display text-lg text-ink">Homeowner Questionnaire</h2>
        <p className="text-xs text-muted-foreground">Property Information Form</p>
        <p className="mt-2 font-mono text-[0.7rem] text-muted-foreground uppercase">
          Order: {order.id}
        </p>

        <div className="mt-5 border-t pt-5">
          <div className="flex items-center justify-between text-xs font-semibold text-ink">
            <span>{completedSections.length} of 17 completed</span>
            <span>{percentage}%</span>
          </div>
          <Progress value={percentage} className="mt-2 h-1.5 bg-secondary" />
        </div>

        <nav className="mt-6 max-h-[360px] overflow-y-auto pr-1 space-y-1">
          {SECTIONS.map((s) => {
            const isCompleted = completedSections.includes(s.id);
            const isActive = activeStep === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleStepClick(s.id)}
                className={cn(
                  "group flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-all cursor-pointer",
                  isActive
                    ? "bg-ink text-cream shadow-sm"
                    : isCompleted
                      ? "bg-brass/10 text-ink hover:bg-brass/15"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-ink",
                )}
              >
                <span
                  className={cn(
                    "grid h-5 w-5 shrink-0 place-items-center rounded-full text-[0.65rem] font-semibold transition-colors",
                    isActive
                      ? "bg-cream text-ink"
                      : isCompleted
                        ? "bg-brass text-ink"
                        : "bg-secondary text-muted-foreground group-hover:bg-white",
                  )}
                >
                  {isCompleted && !isActive ? <Check className="h-3 w-3" strokeWidth={3} /> : s.id}
                </span>
                <span className="truncate">{s.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Right Main Area - Question wizard */}
      <main className="min-w-0">
        <div className="flex items-center justify-between rounded-t-3xl border-t border-r border-l border-border bg-white px-6 py-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <span>Section {activeStep} of 17</span>
            <span>·</span>
            <span className="hidden text-brass sm:inline">Jump to any section anytime</span>
          </div>
          <Button
            type="button"
            variant="brass"
            size="sm"
            onClick={() => handleSave()}
            disabled={saving}
            className="rounded-xl"
          >
            {saving ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save className="mr-1.5 h-3.5 w-3.5" /> Save
              </>
            )}
          </Button>
        </div>

        <div className="rounded-b-3xl border border-border bg-white p-6 shadow-sm sm:p-8 md:p-10">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              {/* Step 1: Homeowner Verification */}
              {activeStep === 1 && (
                <section>
                  <h3 className="font-display text-2xl text-ink">Homeowner Verification</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Confirm your contact details and relationship to the property.
                  </p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <Field label="Full name">
                      <Input
                        value={form.fullName}
                        onChange={(e) => updateField("fullName", e.target.value)}
                        className="h-11 rounded-xl"
                      />
                    </Field>
                    <Field label="Email address">
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        className="h-11 rounded-xl"
                      />
                    </Field>
                    <Field label="Phone number">
                      <Input
                        type="tel"
                        placeholder="e.g. (555) 000-0000"
                        value={form.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        className="h-11 rounded-xl"
                      />
                    </Field>
                    <Field label="Property address">
                      <Input
                        value={form.address}
                        onChange={(e) => updateField("address", e.target.value)}
                        disabled
                        className="h-11 rounded-xl bg-secondary/30"
                      />
                    </Field>
                    <div className="sm:col-span-2">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Your relationship to the property
                      </Label>
                      <RadioGroup
                        value={form.relationship}
                        onValueChange={(v) => updateField("relationship", v)}
                        className="mt-3 grid gap-3 sm:grid-cols-3"
                      >
                        <RadioCardItem value="owner" title="Owner" desc="On property title" />
                        <RadioCardItem value="co_owner" title="Co-Owner" desc="Joint ownership" />
                        <RadioCardItem
                          value="representative"
                          title="Representative"
                          desc="Authorized agent"
                        />
                      </RadioGroup>
                    </div>
                    <Field label="Years of ownership (approx)">
                      <Input
                        type="number"
                        placeholder="e.g. 8"
                        value={form.ownershipYears}
                        onChange={(e) => updateField("ownershipYears", e.target.value)}
                        className="h-11 rounded-xl"
                      />
                    </Field>
                    <div className="sm:col-span-2 mt-4">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Is this property your primary residence?
                      </Label>
                      <RadioGroup
                        value={form.primaryResidence}
                        onValueChange={(v) => updateField("primaryResidence", v)}
                        className="mt-3 flex gap-4"
                      >
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer hover:bg-secondary/40">
                          <RadioGroupItem value="yes" /> Yes
                        </label>
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer hover:bg-secondary/40">
                          <RadioGroupItem value="no" /> No
                        </label>
                      </RadioGroup>
                    </div>
                    <div className="sm:col-span-2 border-t pt-6 mt-4">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Verification Signature
                      </Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Draw your signature below to authorize verification.
                      </p>
                      <SignaturePad
                        value={form.signatureStep1}
                        onChange={(v) => updateField("signatureStep1", v)}
                      />
                    </div>
                  </div>
                </section>
              )}

              {/* Step 2: Property Occupancy */}
              {activeStep === 2 && (
                <section>
                  <h3 className="font-display text-2xl text-ink">Property Occupancy</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Provide details on who resides at the property.
                  </p>
                  <div className="mt-6 space-y-6">
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Occupancy Status
                      </Label>
                      <RadioGroup
                        value={form.occupancyType}
                        onValueChange={(v) => updateField("occupancyType", v)}
                        className="mt-3 grid gap-3 sm:grid-cols-2"
                      >
                        <RadioCardItem
                          value="owner_occupied"
                          title="Owner Occupied"
                          desc="Primary homeowner"
                        />
                        <RadioCardItem
                          value="tenant_occupied"
                          title="Tenant Occupied"
                          desc="Rented to tenants"
                        />
                        <RadioCardItem value="vacant" title="Vacant" desc="Unoccupied" />
                        <RadioCardItem
                          value="seasonal"
                          title="Seasonal"
                          desc="Second home / Vacation"
                        />
                      </RadioGroup>
                    </div>
                    <Field label="Total number of occupants">
                      <Input
                        type="number"
                        placeholder="e.g. 4"
                        value={form.occupantsCount}
                        onChange={(e) => updateField("occupantsCount", e.target.value)}
                        className="h-11 rounded-xl max-w-xs"
                      />
                    </Field>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Are there active leases or rental agreements?
                      </Label>
                      <RadioGroup
                        value={form.activeLeases}
                        onValueChange={(v) => updateField("activeLeases", v)}
                        className="mt-3 flex gap-4"
                      >
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="yes" /> Yes
                        </label>
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="no" /> No
                        </label>
                      </RadioGroup>
                    </div>
                  </div>
                </section>
              )}

              {/* Step 3: Mortgage Information */}
              {activeStep === 3 && (
                <section>
                  <div className="flex items-baseline justify-between flex-wrap gap-2">
                    <h3 className="font-display text-2xl text-ink">Mortgage Information</h3>
                    <span className="text-xs text-muted-foreground">Optional Section</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add details about outstanding mortgages on the property.
                  </p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <Field label="Mortgage lender name">
                      <Input
                        placeholder="e.g. Wells Fargo"
                        value={form.lenderName}
                        onChange={(e) => updateField("lenderName", e.target.value)}
                        className="h-11 rounded-xl"
                      />
                    </Field>
                    <Field label="Year mortgage originated">
                      <Input
                        type="number"
                        placeholder="e.g. 2015"
                        value={form.mortgageYear}
                        onChange={(e) => updateField("mortgageYear", e.target.value)}
                        className="h-11 rounded-xl"
                      />
                    </Field>
                    <div className="sm:col-span-2">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Is there a second mortgage or HELOC?
                      </Label>
                      <RadioGroup
                        value={form.secondMortgage}
                        onValueChange={(v) => updateField("secondMortgage", v)}
                        className="mt-3 flex gap-4"
                      >
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="yes" /> Yes
                        </label>
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="no" /> No
                        </label>
                      </RadioGroup>
                    </div>
                    <Field label="Additional mortgage notes" className="sm:col-span-2">
                      <Textarea
                        placeholder="Any additional mortgage notes..."
                        value={form.mortgageNotes}
                        onChange={(e) => updateField("mortgageNotes", e.target.value)}
                        rows={3}
                        className="rounded-xl"
                      />
                    </Field>
                  </div>
                </section>
              )}

              {/* Step 4: Insurance Information */}
              {activeStep === 4 && (
                <section>
                  <div className="flex items-baseline justify-between flex-wrap gap-2">
                    <h3 className="font-display text-2xl text-ink">Insurance Information</h3>
                    <span className="text-xs text-muted-foreground">Optional Section</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Provide current homeowner insurance policy details.
                  </p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <Field label="Insurance carrier">
                      <Input
                        placeholder="e.g. State Farm"
                        value={form.insuranceCarrier}
                        onChange={(e) => updateField("insuranceCarrier", e.target.value)}
                        className="h-11 rounded-xl"
                      />
                    </Field>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Prior claims in last 5 years?
                      </Label>
                      <RadioGroup
                        value={form.insuranceClaims}
                        onValueChange={(v) => updateField("insuranceClaims", v)}
                        className="mt-3 flex gap-4"
                      >
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="yes" /> Yes
                        </label>
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="no" /> No
                        </label>
                      </RadioGroup>
                    </div>
                    <Field
                      label="Additional notes or coverage exclusions"
                      className="sm:col-span-2"
                    >
                      <Textarea
                        placeholder="Detail any claims or exclusions..."
                        value={form.insuranceNotes}
                        onChange={(e) => updateField("insuranceNotes", e.target.value)}
                        rows={3}
                        className="rounded-xl"
                      />
                    </Field>
                  </div>
                </section>
              )}

              {/* Step 5: Roof Information */}
              {activeStep === 5 && (
                <section>
                  <h3 className="font-display text-2xl text-ink">Roof Information</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Detail the material and age of your roof structure.
                  </p>
                  <div className="mt-6 space-y-6">
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Roof Material
                      </Label>
                      <RadioGroup
                        value={form.roofMaterial}
                        onValueChange={(v) => updateField("roofMaterial", v)}
                        className="mt-3 grid gap-3 sm:grid-cols-3"
                      >
                        <RadioCardItem value="asphalt_shingle" title="Asphalt Shingle" />
                        <RadioCardItem value="metal" title="Metal" />
                        <RadioCardItem value="tile" title="Tile" />
                        <RadioCardItem value="slate" title="Slate" />
                        <RadioCardItem value="other" title="Other" />
                      </RadioGroup>
                    </div>
                    <Field label="Roof age or installation year">
                      <Input
                        placeholder="e.g. 2016"
                        value={form.roofAge}
                        onChange={(e) => updateField("roofAge", e.target.value)}
                        className="h-11 rounded-xl max-w-xs"
                      />
                    </Field>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Are there any known leaks or active damage?
                      </Label>
                      <RadioGroup
                        value={form.roofLeaks}
                        onValueChange={(v) => updateField("roofLeaks", v)}
                        className="mt-3 flex gap-4"
                      >
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="yes" /> Yes
                        </label>
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="no" /> No
                        </label>
                      </RadioGroup>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Is a full roof replacement planned in the next 12 months?
                      </Label>
                      <RadioGroup
                        value={form.roofReplacementPlanned}
                        onValueChange={(v) => updateField("roofReplacementPlanned", v)}
                        className="mt-3 flex gap-4"
                      >
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="yes" /> Yes
                        </label>
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="no" /> No
                        </label>
                      </RadioGroup>
                    </div>
                  </div>
                </section>
              )}

              {/* Step 6: HVAC System */}
              {activeStep === 6 && (
                <section>
                  <h3 className="font-display text-2xl text-ink">HVAC System</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Describe your heating and air conditioning systems.
                  </p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <Field label="Heating system type">
                      <Input
                        placeholder="e.g. Gas Forced Air"
                        value={form.hvacHeatingType}
                        onChange={(e) => updateField("hvacHeatingType", e.target.value)}
                        className="h-11 rounded-xl"
                      />
                    </Field>
                    <Field label="Cooling system type">
                      <Input
                        placeholder="e.g. Central Air"
                        value={form.hvacCoolingType}
                        onChange={(e) => updateField("hvacCoolingType", e.target.value)}
                        className="h-11 rounded-xl"
                      />
                    </Field>
                    <Field label="Heating system age/year">
                      <Input
                        placeholder="e.g. 2010"
                        value={form.hvacHeatingAge}
                        onChange={(e) => updateField("hvacHeatingAge", e.target.value)}
                        className="h-11 rounded-xl"
                      />
                    </Field>
                    <Field label="Cooling system age/year">
                      <Input
                        placeholder="e.g. 2012"
                        value={form.hvacCoolingAge}
                        onChange={(e) => updateField("hvacCoolingAge", e.target.value)}
                        className="h-11 rounded-xl"
                      />
                    </Field>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Is system serviced annually?
                      </Label>
                      <RadioGroup
                        value={form.hvacServiced}
                        onValueChange={(v) => updateField("hvacServiced", v)}
                        className="mt-3 flex gap-4"
                      >
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="yes" /> Yes
                        </label>
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="no" /> No
                        </label>
                      </RadioGroup>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Is HVAC fully operational right now?
                      </Label>
                      <RadioGroup
                        value={form.hvacWorking}
                        onValueChange={(v) => updateField("hvacWorking", v)}
                        className="mt-3 flex gap-4"
                      >
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="yes" /> Yes
                        </label>
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="no" /> No
                        </label>
                      </RadioGroup>
                    </div>
                  </div>
                </section>
              )}

              {/* Step 7: Plumbing */}
              {activeStep === 7 && (
                <section>
                  <h3 className="font-display text-2xl text-ink">Plumbing</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Provide details on the water line materials and heater system.
                  </p>
                  <div className="mt-6 space-y-6">
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Main water line material
                      </Label>
                      <RadioGroup
                        value={form.plumbingMaterial}
                        onValueChange={(v) => updateField("plumbingMaterial", v)}
                        className="mt-3 grid gap-3 sm:grid-cols-3"
                      >
                        <RadioCardItem value="copper" title="Copper" />
                        <RadioCardItem value="pex" title="PEX" />
                        <RadioCardItem value="pvc" title="PVC" />
                        <RadioCardItem value="galvanized" title="Galvanized" />
                        <RadioCardItem value="unknown" title="Unknown" />
                      </RadioGroup>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Waste disposal sewer system
                      </Label>
                      <RadioGroup
                        value={form.sewerType}
                        onValueChange={(v) => updateField("sewerType", v)}
                        className="mt-3 flex gap-4"
                      >
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="public_sewer" /> Public Sewer
                        </label>
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="septic_system" /> Septic System
                        </label>
                      </RadioGroup>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Water heater type
                        </Label>
                        <RadioGroup
                          value={form.waterHeaterType}
                          onValueChange={(v) => updateField("waterHeaterType", v)}
                          className="mt-3 flex gap-4"
                        >
                          <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                            <RadioGroupItem value="standard" /> Standard Tank
                          </label>
                          <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                            <RadioGroupItem value="tankless" /> Tankless
                          </label>
                        </RadioGroup>
                      </div>
                      <Field label="Water heater installation year">
                        <Input
                          placeholder="e.g. 2018"
                          value={form.waterHeaterAge}
                          onChange={(e) => updateField("waterHeaterAge", e.target.value)}
                          className="h-11 rounded-xl max-w-xs"
                        />
                      </Field>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Any current active leaks, clogs, or sewer backups?
                      </Label>
                      <RadioGroup
                        value={form.plumbingLeaks}
                        onValueChange={(v) => updateField("plumbingLeaks", v)}
                        className="mt-3 flex gap-4"
                      >
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="yes" /> Yes
                        </label>
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="no" /> No
                        </label>
                      </RadioGroup>
                    </div>
                  </div>
                </section>
              )}

              {/* Step 8: Electrical */}
              {activeStep === 8 && (
                <section>
                  <h3 className="font-display text-2xl text-ink">Electrical</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Confirm your electrical panel type and capacity details.
                  </p>
                  <div className="mt-6 space-y-6">
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Panel Type
                      </Label>
                      <RadioGroup
                        value={form.electricalPanel}
                        onValueChange={(v) => updateField("electricalPanel", v)}
                        className="mt-3 flex gap-4"
                      >
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="breakers" /> Circuit Breakers
                        </label>
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="fuses" /> Fuses
                        </label>
                      </RadioGroup>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Service Amperage
                      </Label>
                      <RadioGroup
                        value={form.electricalAmps}
                        onValueChange={(v) => updateField("electricalAmps", v)}
                        className="mt-3 grid gap-3 sm:grid-cols-3"
                      >
                        <RadioCardItem value="100_amp" title="100 Amp" />
                        <RadioCardItem value="200_amp" title="200 Amp" />
                        <RadioCardItem value="other" title="Other / Unknown" />
                      </RadioGroup>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Any knob & tube or ungrounded aluminum wiring present?
                      </Label>
                      <RadioGroup
                        value={form.electricalKnobTube}
                        onValueChange={(v) => updateField("electricalKnobTube", v)}
                        className="mt-3 flex gap-4"
                      >
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="yes" /> Yes
                        </label>
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="no" /> No
                        </label>
                      </RadioGroup>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Are GFCI outlets installed in all wet areas (kitchen/bath)?
                      </Label>
                      <RadioGroup
                        value={form.electricalGfci}
                        onValueChange={(v) => updateField("electricalGfci", v)}
                        className="mt-3 flex gap-4"
                      >
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="yes" /> Yes
                        </label>
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="no" /> No
                        </label>
                      </RadioGroup>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Any known electrical issues (frequently tripped breakers, etc.)?
                      </Label>
                      <RadioGroup
                        value={form.electricalIssues}
                        onValueChange={(v) => updateField("electricalIssues", v)}
                        className="mt-3 flex gap-4"
                      >
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="yes" /> Yes
                        </label>
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="no" /> No
                        </label>
                      </RadioGroup>
                    </div>
                  </div>
                </section>
              )}

              {/* Step 9: Windows & Doors */}
              {activeStep === 9 && (
                <section>
                  <h3 className="font-display text-2xl text-ink">Windows & Doors</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Confirm window insulation and exterior seal integrity.
                  </p>
                  <div className="mt-6 space-y-6">
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Window Glazing
                      </Label>
                      <RadioGroup
                        value={form.windowGlazing}
                        onValueChange={(v) => updateField("windowGlazing", v)}
                        className="mt-3 grid gap-3 sm:grid-cols-3"
                      >
                        <RadioCardItem value="single_pane" title="Single Pane" />
                        <RadioCardItem value="double_pane" title="Double Pane" />
                        <RadioCardItem value="triple_pane" title="Triple Pane" />
                      </RadioGroup>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Are there any windows with broken thermal seals or severe drafts?
                      </Label>
                      <RadioGroup
                        value={form.brokenSeals}
                        onValueChange={(v) => updateField("brokenSeals", v)}
                        className="mt-3 flex gap-4"
                      >
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="yes" /> Yes
                        </label>
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="no" /> No
                        </label>
                      </RadioGroup>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Are all exterior entry doors weather-stripped and functional?
                      </Label>
                      <RadioGroup
                        value={form.exteriorDoorsGood}
                        onValueChange={(v) => updateField("exteriorDoorsGood", v)}
                        className="mt-3 flex gap-4"
                      >
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="yes" /> Yes
                        </label>
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="no" /> No
                        </label>
                      </RadioGroup>
                    </div>
                  </div>
                </section>
              )}

              {/* Step 10: Exterior */}
              {activeStep === 10 && (
                <section>
                  <h3 className="font-display text-2xl text-ink">Exterior</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Specify structural foundation types and exterior siding materials.
                  </p>
                  <div className="mt-6 space-y-6">
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Foundation Type
                      </Label>
                      <RadioGroup
                        value={form.foundationType}
                        onValueChange={(v) => updateField("foundationType", v)}
                        className="mt-3 grid gap-3 sm:grid-cols-3"
                      >
                        <RadioCardItem value="slab" title="Slab-on-Grade" />
                        <RadioCardItem value="crawlspace" title="Crawlspace" />
                        <RadioCardItem value="basement" title="Basement" />
                      </RadioGroup>
                    </div>
                    <Field label="Primary exterior siding material">
                      <Input
                        placeholder="e.g. Vinyl / Brick / HardiePlank"
                        value={form.sidingMaterial}
                        onChange={(e) => updateField("sidingMaterial", e.target.value)}
                        className="h-11 rounded-xl max-w-sm"
                      />
                    </Field>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Are there visible structural cracks or settling in exterior walls?
                      </Label>
                      <RadioGroup
                        value={form.foundationCracks}
                        onValueChange={(v) => updateField("foundationCracks", v)}
                        className="mt-3 flex gap-4"
                      >
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="yes" /> Yes
                        </label>
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="no" /> No
                        </label>
                      </RadioGroup>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Do all gutters and downspouts drain away from the foundation?
                      </Label>
                      <RadioGroup
                        value={form.exteriorGuttersFunctional}
                        onValueChange={(v) => updateField("exteriorGuttersFunctional", v)}
                        className="mt-3 flex gap-4"
                      >
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="yes" /> Yes
                        </label>
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="no" /> No
                        </label>
                      </RadioGroup>
                    </div>
                  </div>
                </section>
              )}

              {/* Step 11: Interior Improvements */}
              {activeStep === 11 && (
                <section>
                  <h3 className="font-display text-2xl text-ink">Interior Improvements</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Record updates to kitchens, baths, flooring, or home expansions.
                  </p>
                  <div className="mt-6 space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Kitchen remodeled in last 10 years?
                        </Label>
                        <RadioGroup
                          value={form.kitchenRemodeled}
                          onValueChange={(v) => updateField("kitchenRemodeled", v)}
                          className="mt-3 flex gap-4"
                        >
                          <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                            <RadioGroupItem value="yes" /> Yes
                          </label>
                          <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                            <RadioGroupItem value="no" /> No
                          </label>
                        </RadioGroup>
                      </div>
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Bathrooms remodeled in last 10 years?
                        </Label>
                        <RadioGroup
                          value={form.bathroomsRemodeled}
                          onValueChange={(v) => updateField("bathroomsRemodeled", v)}
                          className="mt-3 flex gap-4"
                        >
                          <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                            <RadioGroupItem value="yes" /> Yes
                          </label>
                          <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                            <RadioGroupItem value="no" /> No
                          </label>
                        </RadioGroup>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Was flooring fully replaced recently?
                      </Label>
                      <RadioGroup
                        value={form.flooringReplaced}
                        onValueChange={(v) => updateField("flooringReplaced", v)}
                        className="mt-3 flex gap-4"
                      >
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="yes" /> Yes
                        </label>
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="no" /> No
                        </label>
                      </RadioGroup>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Have structural changes or additions been made?
                      </Label>
                      <RadioGroup
                        value={form.structuralRemodel}
                        onValueChange={(v) => updateField("structuralRemodel", v)}
                        className="mt-3 flex gap-4"
                      >
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="yes" /> Yes
                        </label>
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="no" /> No
                        </label>
                      </RadioGroup>
                    </div>
                    <Field label="Year of major interior updates (if any)">
                      <Input
                        placeholder="e.g. 2023"
                        value={form.remodelYear}
                        onChange={(e) => updateField("remodelYear", e.target.value)}
                        className="h-11 rounded-xl max-w-xs"
                      />
                    </Field>
                  </div>
                </section>
              )}

              {/* Step 12: Safety & Security */}
              {activeStep === 12 && (
                <section>
                  <h3 className="font-display text-2xl text-ink">Safety & Security</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Confirm safety alarm installations and security protections.
                  </p>
                  <div className="mt-6 space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Smoke detectors operational?
                        </Label>
                        <RadioGroup
                          value={form.smokeDetectorsFunctional}
                          onValueChange={(v) => updateField("smokeDetectorsFunctional", v)}
                          className="mt-3 flex gap-4"
                        >
                          <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                            <RadioGroupItem value="yes" /> Yes
                          </label>
                          <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                            <RadioGroupItem value="no" /> No
                          </label>
                        </RadioGroup>
                      </div>
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Carbon monoxide detectors operational?
                        </Label>
                        <RadioGroup
                          value={form.coDetectorsFunctional}
                          onValueChange={(v) => updateField("coDetectorsFunctional", v)}
                          className="mt-3 flex gap-4"
                        >
                          <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                            <RadioGroupItem value="yes" /> Yes
                          </label>
                          <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                            <RadioGroupItem value="no" /> No
                          </label>
                        </RadioGroup>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Is a security/alarm system active?
                      </Label>
                      <RadioGroup
                        value={form.securitySystemPresent}
                        onValueChange={(v) => updateField("securitySystemPresent", v)}
                        className="mt-3 flex gap-4"
                      >
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="yes" /> Yes
                        </label>
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="no" /> No
                        </label>
                      </RadioGroup>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Is an interior fire sprinkler system present?
                      </Label>
                      <RadioGroup
                        value={form.sprinklerSystemPresent}
                        onValueChange={(v) => updateField("sprinklerSystemPresent", v)}
                        className="mt-3 flex gap-4"
                      >
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="yes" /> Yes
                        </label>
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="no" /> No
                        </label>
                      </RadioGroup>
                    </div>
                  </div>
                </section>
              )}

              {/* Step 13: Smart Home Features */}
              {activeStep === 13 && (
                <section>
                  <h3 className="font-display text-2xl text-ink">Smart Home Features</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Specify connected components or home automation elements.
                  </p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Smart Thermostat (e.g. Nest, Ecobee)
                      </Label>
                      <RadioGroup
                        value={form.smartThermostat}
                        onValueChange={(v) => updateField("smartThermostat", v)}
                        className="mt-3 flex gap-4"
                      >
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="yes" /> Yes
                        </label>
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="no" /> No
                        </label>
                      </RadioGroup>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Smart Locks
                      </Label>
                      <RadioGroup
                        value={form.smartLock}
                        onValueChange={(v) => updateField("smartLock", v)}
                        className="mt-3 flex gap-4"
                      >
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="yes" /> Yes
                        </label>
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="no" /> No
                        </label>
                      </RadioGroup>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Smart Cameras / Doorbell (e.g. Ring)
                      </Label>
                      <RadioGroup
                        value={form.smartCamera}
                        onValueChange={(v) => updateField("smartCamera", v)}
                        className="mt-3 flex gap-4"
                      >
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="yes" /> Yes
                        </label>
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="no" /> No
                        </label>
                      </RadioGroup>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Smart Lighting Controllers
                      </Label>
                      <RadioGroup
                        value={form.smartLighting}
                        onValueChange={(v) => updateField("smartLighting", v)}
                        className="mt-3 flex gap-4"
                      >
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="yes" /> Yes
                        </label>
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="no" /> No
                        </label>
                      </RadioGroup>
                    </div>
                  </div>
                </section>
              )}

              {/* Step 14: Maintenance History */}
              {activeStep === 14 && (
                <section>
                  <h3 className="font-display text-2xl text-ink">Maintenance History</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Check off ongoing service and cleaning protocols.
                  </p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Gutters cleaned regularly?
                      </Label>
                      <RadioGroup
                        value={form.gutterCleanedRegularly}
                        onValueChange={(v) => updateField("gutterCleanedRegularly", v)}
                        className="mt-3 flex gap-4"
                      >
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="yes" /> Yes
                        </label>
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="no" /> No
                        </label>
                      </RadioGroup>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Pest control contract?
                      </Label>
                      <RadioGroup
                        value={form.pestControlContract}
                        onValueChange={(v) => updateField("pestControlContract", v)}
                        className="mt-3 flex gap-4"
                      >
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="yes" /> Yes
                        </label>
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="no" /> No
                        </label>
                      </RadioGroup>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Chimney inspected/swept (if applicable)?
                      </Label>
                      <RadioGroup
                        value={form.chimneyInspected}
                        onValueChange={(v) => updateField("chimneyInspected", v)}
                        className="mt-3 flex gap-4"
                      >
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="yes" /> Yes
                        </label>
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="no" /> No
                        </label>
                      </RadioGroup>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Sump pump regularly tested (if applicable)?
                      </Label>
                      <RadioGroup
                        value={form.sumpPumpInspected}
                        onValueChange={(v) => updateField("sumpPumpInspected", v)}
                        className="mt-3 flex gap-4"
                      >
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="yes" /> Yes
                        </label>
                        <label className="flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer">
                          <RadioGroupItem value="no" /> No
                        </label>
                      </RadioGroup>
                    </div>
                    <Field label="Any other maintenance history details" className="sm:col-span-2">
                      <Textarea
                        placeholder="Detail additional maintenance history..."
                        value={form.maintenanceNotes}
                        onChange={(e) => updateField("maintenanceNotes", e.target.value)}
                        rows={3}
                        className="rounded-xl"
                      />
                    </Field>
                  </div>
                </section>
              )}

              {/* Step 15: Property Disclosures */}
              {activeStep === 15 && (
                <section>
                  <h3 className="font-display text-2xl text-ink">Property Disclosures</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Answer honestly — this information becomes part of your official report.
                  </p>
                  <div className="mt-6 space-y-4 max-w-2xl">
                    <DisclosureCheck
                      label="Any history of water damage, basement flooding, or plumbing back-ups?"
                      value={form.historyWaterDamage}
                      onChange={(v) => updateField("historyWaterDamage", v)}
                    />
                    <DisclosureCheck
                      label="Any history of toxic mold, structural wood rot, or dampness?"
                      value={form.historyMold}
                      onChange={(v) => updateField("historyMold", v)}
                    />
                    <DisclosureCheck
                      label="Any history of fire, lightning, tornado, or severe wind damage?"
                      value={form.historyFireDamage}
                      onChange={(v) => updateField("historyFireDamage", v)}
                    />
                    <DisclosureCheck
                      label="Any property line, boundary, easement, or encroachment conflicts?"
                      value={form.boundaryDisputes}
                      onChange={(v) => updateField("boundaryDisputes", v)}
                    />
                    <DisclosureCheck
                      label="Any active homeowner association (HOA) violations, disputes, or special assessments?"
                      value={form.activeHoaDisputes}
                      onChange={(v) => updateField("activeHoaDisputes", v)}
                    />
                    <DisclosureCheck
                      label="Any known environmental hazards (asbestos, radon gas, lead paint)?"
                      value={form.environmentalHazards}
                      onChange={(v) => updateField("environmentalHazards", v)}
                    />
                    <DisclosureCheck
                      label="Any known structural, foundational, or major mechanical system defects?"
                      value={form.knownStructuralDefects}
                      onChange={(v) => updateField("knownStructuralDefects", v)}
                    />
                  </div>
                </section>
              )}

              {/* Step 16: Document Upload Center */}
              {activeStep === 16 && (
                <section>
                  <h3 className="font-display text-2xl text-ink">Document Upload Center</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Upload certificates, permits, warranties, or blueprints (optional).
                  </p>

                  <div className="mt-6 grid gap-6 md:grid-cols-[240px_1fr]">
                    <div className="space-y-4">
                      <Field label="Document Category">
                        <select
                          value={form.uploadCategory || "other"}
                          onChange={(e) => updateField("uploadCategory", e.target.value)}
                          className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm"
                        >
                          <option value="roof">Roof Documents</option>
                          <option value="hvac">HVAC Service</option>
                          <option value="permits">Building Permits</option>
                          <option value="remodel">Remodeling Invoices</option>
                          <option value="disclosures">Signed Disclosures</option>
                          <option value="other">Other / General</option>
                        </select>
                      </Field>

                      <label className="flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-secondary/20 transition-all hover:bg-secondary/40">
                        {uploading ? (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-6 w-6 animate-spin text-brass" />
                            <span className="text-xs">Uploading file...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Upload className="h-6 w-6 text-brass" />
                            <span className="text-xs font-medium text-ink">Upload File</span>
                            <span className="text-[10px] text-center px-2">
                              Max 25 MB. PDF, JPG, PNG, DOCX, XLSX
                            </span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.heic"
                          onChange={handleFileUpload}
                          disabled={uploading}
                          className="sr-only"
                        />
                      </label>
                    </div>

                    <div className="rounded-2xl border border-border p-4">
                      <h4 className="font-display text-sm font-semibold text-ink">
                        Uploaded Files
                      </h4>
                      {!form.uploadedFiles || form.uploadedFiles.length === 0 ? (
                        <p className="mt-6 text-center text-xs text-muted-foreground">
                          No files uploaded yet.
                        </p>
                      ) : (
                        <ul className="mt-3 divide-y">
                          {(
                            form.uploadedFiles as {
                              name: string;
                              url: string;
                              category: string;
                              uploadedAt: string;
                            }[]
                          ).map((f, idx) => (
                            <li
                              key={idx}
                              className="flex items-center justify-between py-2 text-xs"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="h-4 w-4 shrink-0 text-brass" />
                                <div className="truncate">
                                  <a
                                    href={f.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-medium text-ink hover:underline"
                                  >
                                    {f.name}
                                  </a>
                                  <p className="text-[10px] text-muted-foreground capitalize">
                                    Category: {f.category} · {f.uploadedAt}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => deleteFile(idx)}
                                className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {/* Step 17: Final Certification */}
              {activeStep === 17 && (
                <section>
                  <h3 className="font-display text-2xl text-ink">Final Certification</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Certify that all answers provided are complete and accurate.
                  </p>

                  <div className="mt-6 space-y-6">
                    <div className="rounded-2xl border border-border bg-secondary/20 p-5 text-sm text-muted-foreground leading-relaxed">
                      By submitting this questionnaire, you make the following certifications under
                      penalty of providing false information:
                      <ul className="mt-3 list-disc pl-5 space-y-2">
                        <li>
                          I certify that the information provided is accurate to the best of my
                          knowledge.
                        </li>
                        <li>
                          I understand that Accurate Home Report begins report production
                          immediately.
                        </li>
                        <li>
                          I understand that all reports are custom-created and non-refundable.
                        </li>
                        <li>
                          I understand report delivery typically takes 48 hours to 3 business days.
                        </li>
                        <li>
                          I authorize Accurate Home Report to contact me by phone, email, or SMS if
                          additional information is required.
                        </li>
                      </ul>
                    </div>

                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-white p-4 transition-all hover:border-brass/40 hover:shadow-sm">
                      <input
                        type="checkbox"
                        checked={form.certificationAccept}
                        onChange={(e) => updateField("certificationAccept", e.target.checked)}
                        className="mt-0.5 h-4 w-4 accent-[oklch(0.76_0.12_80)]"
                      />
                      <span className="text-xs text-muted-foreground leading-relaxed">
                        I hereby accept and confirm the accuracy of all submitted details on this
                        date ({form.certificationDate}).
                      </span>
                    </label>

                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Digital Signature
                      </Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Draw your signature below to authorize the certification.
                      </p>
                      <SignaturePad
                        value={form.certificationSignature}
                        onChange={(v) => updateField("certificationSignature", v)}
                      />
                    </div>
                  </div>
                </section>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-12 flex items-center justify-between border-t pt-8">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={activeStep === 1}
              className="rounded-xl h-11 px-5"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
            </Button>

            <Button
              variant={activeStep === 17 ? "primary" : "primary"}
              onClick={nextStep}
              disabled={saving}
              className="rounded-xl h-11 px-6 shadow-sm min-w-[120px]"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : activeStep === 17 ? (
                "Submit Questionnaire"
              ) : (
                <>
                  Save & Continue <ArrowRight className="ml-1.5 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function RadioCardItem({ value, title, desc }: { value: string; title: string; desc?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-4 transition-all hover:bg-secondary/40 [&:has(:checked)]:border-brass [&:has(:checked)]:shadow-sm">
      <RadioGroupItem value={value} className="mt-0.5" />
      <div>
        <p className="font-semibold text-xs text-ink">{title}</p>
        {desc && <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>}
      </div>
    </label>
  );
}

function DisclosureCheck({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-secondary/15 p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-ink font-medium leading-relaxed max-w-md">{label}</p>
      <RadioGroup value={value} onValueChange={onChange} className="flex gap-3 shrink-0">
        <label className="flex items-center gap-1.5 border px-3 py-1.5 rounded-lg cursor-pointer text-xs bg-white">
          <RadioGroupItem value="yes" /> Yes
        </label>
        <label className="flex items-center gap-1.5 border px-3 py-1.5 rounded-lg cursor-pointer text-xs bg-white">
          <RadioGroupItem value="no" /> No
        </label>
      </RadioGroup>
    </div>
  );
}
