import { z } from "zod";

export const userRoleSchema = z.enum(["owner", "member", "readonly"]);

export const managedUserSchema = z.object({
  active: z.boolean(),
  createdAt: z.string(),
  displayName: z.string().optional(),
  email: z.string().optional(),
  id: z.string(),
  lastDisabledAt: z.string().optional(),
  lastDisabledByUserId: z.string().optional(),
  lastEnabledAt: z.string().optional(),
  lastEnabledByUserId: z.string().optional(),
  passwordResetAt: z.string().optional(),
  passwordResetByUserId: z.string().optional(),
  role: userRoleSchema,
  updatedAt: z.string(),
  username: z.string(),
});

export type ManagedUser = z.infer<typeof managedUserSchema>;
export type ManagedUserRole = z.infer<typeof userRoleSchema>;
