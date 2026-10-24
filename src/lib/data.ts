import postgres from "postgres"


const sql = postgres(process.env.POSTGRES_URL!,{ssl: "require"})


export async function fetchCategories(){
    try{

        const data = await sql`
        SELECT * FROM categories`
        return data

    }catch(error){
        console.error("Error While fetching category data: ", error)
        throw new Error("Failed to fetch category data")
    }
}