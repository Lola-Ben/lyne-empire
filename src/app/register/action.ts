"use server";

import { signIn } from "@/lib/auth";
import { z } from "zod";

const registerFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name cannot exceed 50 characters." })
    .trim(),
  phone_number: z
    .string()
    .trim()
    .regex(/^(?:\+237)?6[5-9]\d{7}\$/, {
      message: "Please enter a valid Cameroonian phone number (MTN, Orange, or Nexttel).",
    }),
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address." })
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." })
    .max(100, { message: "Password is too long." }),
});

// Define state type for the useActionState hook wrapper
export type FormState = {
  success?: boolean;
  globalError?: string;
  errors?: {
    name?: string[];
    phone_number?: string[];
    email?: string[];
    password?: string[];
  };
};

export async function registerUser(prevState: FormState | null, formData: FormData): Promise<FormState> {
  const rawFields = {
    name: formData.get("name"),
    phone_number: formData.get("phone_number"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const validatedFields = registerFormSchema.safeParse(rawFields);

  // Return specific field errors if Zod checks fail
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, phone_number, email, password } = validatedFields.data;

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${appUrl}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone_number, email, password }),
    });

    const data = await response.json();

    if (!data.success) {
      return { globalError: data.error || "Failed to create account." };
    }

    await signIn("credentials", {
      phone_number,
      password,
      redirectTo: "/",
    });

    return { success: true };
  } catch (error: any) {
    return { globalError: "An unexpected network error occurred." };
  }
}
