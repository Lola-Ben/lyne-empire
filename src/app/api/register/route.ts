import { NextResponse } from "next/server";
import postgres from "postgres";
import bcrypt from "bcrypt"
import z, { success } from "zod"


const sql = postgres(process.env.POSTGRES_URL!, {ssl: "require"});


const registerSchema = z.object({
    name: z.string().min(2, "Name must at least 2 characters long"),
    phone_number: z.string().regex(/^(?:\+237)?6[5-9]\d{7}\$/, {
    message: "Provide a valid Cameroonian mobile number (MTN, Orange, or Nexttel)"
  }),
  email: z.email().optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters long")
});


export async function POST(request: Request){
    try {
        const body = await request.json();

        const validation = registerSchema.safeParse(body);
        if(!validation.success){
            return NextResponse.json({success: false, error: validation.error.issues[0].message},{status: 400})
        }

        const {name, phone_number, email, password} = validation.data;

        const formattedPhone = phone_number.startsWith("+237") ? phone_number : `+237${phone_number}`;

        const [existingUser] = await sql`SELECT * FROM users WHERE phone_number = ${formattedPhone}`;

        if(existingUser){
            return NextResponse.json({success: false, error: "This number is already registered to an account."},{status: 409})
        } 


        const hashedPassword  = await bcrypt.hash(password, 10);
        const optionalEmail = email || null;
        
       const [newUser] = await sql`
        INSERT INTO users (name, phone_number, email, password) VALUES (${name}, ${formattedPhone}, ${optionalEmail}, ${hashedPassword})`

         // Future Enhancement Hook: Trigger a local SMS Gateway API delivery code here 
        // to dispatch a text confirmation notice ("Welcome to Lyns Hair Store!") to user.

        return NextResponse.json({success: true, message: "Account Created Successfully!", user: {id: newUser.id, name: newUser.name, phone: newUser.phone_number}},{status: 201})
    }catch(error){
        console.error("Registration Processing Failure", error);
        return NextResponse.json({success: false, error: "Server error occured during account creation"}, {status: 500})
    }
}