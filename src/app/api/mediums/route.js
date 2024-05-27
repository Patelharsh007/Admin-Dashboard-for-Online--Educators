import { pool } from "../../../config/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const results = await pool.query(`
            SELECT mediummasters.id, mediummasters.name, mediummasters.parentref, boardmasters.name AS boardName
            FROM mediummasters
            JOIN boardmasters ON mediummasters.parentref = boardmasters.id
        `);
        return NextResponse.json(results);
    } catch (error) {
        console.error("Error in GET /api/mediums:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { name, parentref } = body;

        if (!name.trim() || !parentref.trim()) {
            throw new Error("Invalid input for medium.");
        }

        await pool.query("INSERT INTO mediummasters (name, parentref) VALUES (?, ?)", [name, parentref]);
        return NextResponse.json({ message: "Medium added successfully" });
    } catch (error) {
        console.error("Error in POST /api/mediums:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
