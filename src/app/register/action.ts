"use server";

import { signIn } from "@/lib/auth";
import { createUser, isUniqueConstraintError } from "@/lib/server/users";
import { AuthError } from "next-auth";
import { z } from "zod";
import { getSafeReturnPath } from "@/lib/auth-redirect";

const registerFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name cannot exceed 50 characters." })
    .trim(),
  phone_number: z
    .string()
    .trim()
    .regex(/^(?:\+237)?6[5-9]\d{7}$/, {
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
  const callbackUrl = getSafeReturnPath(formData.get("callback_url"));

  try {
    await createUser({
      name,
      phoneNumber: phone_number,
      email: email || null,
      password,
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { globalError: "This number is already registered to an account." };
    }

    console.error("Account registration failed.", error);
    return { globalError: "Unable to create your account right now. Please try again." };
  }

  try {
    await signIn("credentials", {
      phone_number,
      password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { globalError: "Your account was created, but automatic sign in failed. Please sign in." };
    }
    throw error;
  }

  return { success: true };
}
