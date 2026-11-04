import { NextResponse } from "next/server";
import { z } from "zod";
import { createUser, isUniqueConstraintError } from "@/lib/server/users";

const registerSchema = z.object({
    name: z.string().trim().min(2, "Name must at least 2 characters long").max(50),
    phone_number: z.string().trim().regex(/^(?:\+237)?6[5-9]\d{7}$/, {
    message: "Provide a valid Cameroonian mobile number (MTN, Orange, or Nexttel)"
  }),
  email: z.email().optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters long").max(100)
});


export async function POST(request: Request){
    let body: unknown;
    try {
        body = await request.json();
    }catch{
        return NextResponse.json({success: false, error: "Request body must be valid JSON."}, {status: 400});
    }

    const validation = registerSchema.safeParse(body);
    if(!validation.success){
        return NextResponse.json({success: false, error: validation.error.issues[0].message},{status: 400});
    }

    const {name, phone_number, email, password} = validation.data;
    try {
        const newUser = await createUser({
            name,
            phoneNumber: phone_number,
            email: email || null,
            password,
        });

        return NextResponse.json({
            success: true,
            message: "Account Created Successfully!",
            user: {id: newUser.id, name: newUser.name, phone: newUser.phone_number},
        }, {status: 201});
    }catch(error){
        if (isUniqueConstraintError(error)) {
            return NextResponse.json({success: false, error: "This number is already registered to an account."},{status: 409});
        }

        console.error("Registration Processing Failure", error);
        return NextResponse.json({success: false, error: "Server error occurred during account creation"}, {status: 500});
    }
}