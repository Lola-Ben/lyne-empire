import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import postgres from "postgres";
import z from "zod";



declare module "next-auth"{
    interface User {
        phone?: string;
    }
}

declare module "@auth/core/jwt"{
    interface JWT {
        id?: string;
        phone?: string;
    }
}

const sql = postgres(process.env.POSTGRES_URL!, {ssl: "require"})


export const {handlers, signIn, signOut, auth} = NextAuth({providers:[
    Credentials({
        name: "Credentials",
        credentials: {
            phone_number: {label: "Phone Number", type: "text", placeholder:"+237xxxxxxxxx"},
            password: {label: "Password", type: "text"}
        },
        async authorize(credentials) {
          const parsedCredentials =  z.object({
            phone_number: z.string(),
            password: z.string().min(6)
           }).safeParse(credentials)

           if(!parsedCredentials.success) return null;

           const {phone_number, password} = parsedCredentials.data;

           const [user] = await sql`SELECT * FROM users WHERE phone_number = ${phone_number}`;

           if (!user) return null;

           const passwordMatch = await bcrypt.compare(password, user.password);

           if(passwordMatch){
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone_number
                }
           }

           return null
        },
    })
],
callbacks:{
    async jwt({token, user}) {
        if(user){
            token.id = user.id;
            token.phone = user.phone;
        }
        return token
    },
    async session({session, token}){
    if(session.user){
        if(typeof token.id === "string") session.user.id = token.id;
        if(typeof token.phone === "string") session.user.phone = token.phone;
    }

    return session;
}
},
pages: {
    signIn: "/login"
},
secret: process.env.AUTH_SECRET
});