export type SymptomLog = {
  id: string;
  loggedAt: string;
  bloating: number;
  pain: number;
  gas: number;
  transit: number;
  energy: number;
  sleep: number;
  notes?: string;
  mealLogId?: string;
  mealLog?: {
    id: string;
    consumedAt: string;
    description: string;
  };
  createdAt: string;
  updatedAt: string;
};
