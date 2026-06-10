import { TreatmentsPanel } from "@/features/treatments/treatments-panel";
import { mealLogs } from "@/lib/mock/meal-logs";
import { symptomLogs } from "@/lib/mock/symptom-logs";
import { treatmentLogs } from "@/lib/mock/treatment-logs";
import { treatments } from "@/lib/mock/treatments";

export default function TreatmentsPage() {
  return (
    <TreatmentsPanel
      mealLogs={mealLogs}
      symptomLogs={symptomLogs}
      treatmentLogs={treatmentLogs}
      treatments={treatments}
    />
  );
}
