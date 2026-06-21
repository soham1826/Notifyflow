import { z } from "zod";

export const SignupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long").max(100),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type SignupInput = z.infer<typeof SignupSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;

export interface AuthResponse {
  message: string;
  token: string;
  tenant: {
    id: string;
    name: string;
    email: string;
    apiKey: string;
    createdAt: string;
  };
}

export interface ApiKeyResponse {
  apiKey: string;
}
