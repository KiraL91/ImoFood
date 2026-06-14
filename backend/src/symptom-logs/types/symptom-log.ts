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
  createdAt: string;
  updatedAt: string;
};
