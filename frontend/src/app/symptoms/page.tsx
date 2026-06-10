import { SymptomsPanel } from "@/features/symptoms/symptoms-panel";
import { mealLogs } from "@/lib/mock/meal-logs";
import { symptomLogs } from "@/lib/mock/symptom-logs";

export default function SymptomsPage() {
  return <SymptomsPanel mealLogs={mealLogs} symptomLogs={symptomLogs} />;
}
