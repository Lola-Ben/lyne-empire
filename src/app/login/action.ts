"use server";


import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { getSafeReturnPath } from "@/lib/auth-redirect";


export async function authenticate(formData: FormData){

    try{
        const phone_number = formData.get("phone_number");
        const password = formData.get("password");
        const callbackUrl = getSafeReturnPath(formData.get("callback_url"));

        await signIn("credentials", {
            phone_number,
            password,
            redirectTo: callbackUrl,
        })


    }catch(error){
        if(error instanceof AuthError){
            switch(error.type){
                case "CredentialsSignin":
                    return "Invalid telephone number or password combination.";
                default:
                    return "Something went wrong. Please Try again.";
            }
        }

        throw error;
    }
}