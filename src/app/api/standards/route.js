import { pool } from "../../../config/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const results = await pool.query(`
            SELECT standardmasters.id, standardmasters.name, standardmasters.parentref, mediummasters.name AS mediumName, boardmasters.id AS boardId, boardmasters.name AS boardName
            FROM standardmasters
            JOIN mediummasters ON standardmasters.parentref = mediummasters.id
            JOIN boardmasters ON mediummasters.parentref = boardmasters.id
        `);
        return NextResponse.json(results);
    } catch (error) {
        console.error("Error in GET /api/standards:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}


export async function POST(req) {
    try {
        const body = await req.json();
        const { name, parentref } = body;
        
        if (!name.trim() || !parentref.trim()) {
            throw new Error("Invalid input for standard.");
        }
        
        await pool.query("INSERT INTO standardmasters (name, parentref) VALUES (?, ?)", [name, parentref]);
        return NextResponse.json({ message: "Standard added successfully" });
    } catch (error) {
        console.error("Error in POST /api/standards:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
