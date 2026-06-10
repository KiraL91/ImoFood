import type {
  TreatmentCategory,
  TreatmentLogTiming,
  TreatmentStatus,
  TreatmentTarget,
} from "@/lib/types/treatment";

export const treatmentCategoryMeta: Record<
  TreatmentCategory,
  { label: string; className: string }
> = {
  antibiotic: {
    label: "Antibiotico",
    className: "border-sky-200 bg-sky-50 text-sky-800",
  },
  "anti-inflammatory": {
    label: "Antiinflamatorio",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  immunosuppressant: {
    label: "Inmunosupresor",
    className: "border-violet-200 bg-violet-50 text-violet-800",
  },
  biologic: {
    label: "Biologico",
    className: "border-indigo-200 bg-indigo-50 text-indigo-800",
  },
  corticosteroid: {
    label: "Corticoide",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  prokinetic: {
    label: "Prokinetico",
    className: "border-teal-200 bg-teal-50 text-teal-800",
  },
  "transit-regulator": {
    label: "Transito",
    className: "border-lime-200 bg-lime-50 text-lime-800",
  },
  antispasmodic: {
    label: "Antiespasmodico",
    className: "border-orange-200 bg-orange-50 text-orange-800",
  },
  supplement: {
    label: "Suplemento",
    className: "border-cyan-200 bg-cyan-50 text-cyan-800",
  },
  rescue: {
    label: "Rescate",
    className: "border-rose-200 bg-rose-50 text-rose-800",
  },
  other: {
    label: "Otro",
    className: "border-stone-200 bg-stone-50 text-stone-800",
  },
};

export const treatmentStatusMeta: Record<
  TreatmentStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Activo",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  paused: {
    label: "Pausado",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  completed: {
    label: "Finalizado",
    className: "border-stone-200 bg-stone-50 text-stone-800",
  },
};

export const treatmentTimingMeta: Record<TreatmentLogTiming, string> = {
  fasting: "En ayunas",
  "before-meal": "Antes de comer",
  "with-meal": "Con comida",
  "after-meal": "Despues de comer",
  night: "Noche",
  other: "Otro",
};

export const treatmentTargetLabels: Record<TreatmentTarget, string> = {
  IMO: "IMO",
  SIBO: "SIBO",
  EII: "EII",
  SII: "SII",
  bloating: "Hinchazon",
  pain: "Dolor",
  diarrhea: "Diarrea",
  constipation: "Estrenimiento",
  flare: "Brote",
  maintenance: "Mantenimiento",
};
