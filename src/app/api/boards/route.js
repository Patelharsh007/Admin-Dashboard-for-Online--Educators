// src/app/api/boards/route.js

import { pool } from "../../../config/db";
import { NextResponse } from "next/server";

// export async function GET() {
//     try {
//         const results = await pool.query("SELECT * FROM boardmasters");
//         return NextResponse.json(results);
//     } catch (error) {
//         console.error("Error in GET /api/boards:", error);
//         return NextResponse.json({ message: error.message }, { status: 500 });
//     }
// }

// src/app/api/boards/route.js

export async function GET() {
    try {
        const results = await pool.query("SELECT id, name FROM boardmasters");
        return NextResponse.json(results);
    } catch (error) {
        console.error("Error in GET /api/boards:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}


export async function POST(req) {
    try {
        const body = await req.json();
        console.log("POST /api/boards request body:", body);
        const { name } = body;
        
        const queryString = "INSERT INTO boardmasters (name) VALUES (?)";
        const values = [name];

        await pool.query(queryString, values);
        return NextResponse.json({ message: "Board added successfully" });
    } catch (error) {
        console.error("Error in POST /api/boards:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
