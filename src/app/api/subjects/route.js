//src/app/api/subjects/route.js

import { pool } from "../../../config/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const results = await pool.query(`
        SELECT subjectmasters.id, 
        subjectmasters.name, 
        subjectmasters.parentref, 
        standardmasters.name AS standardName, 
        mediummasters.name AS mediumName, 
        boardmasters.name AS boardName 
        FROM subjectmasters 
        JOIN standardmasters ON subjectmasters.parentref = standardmasters.id 
        JOIN mediummasters ON standardmasters.parentref = mediummasters.id 
        JOIN boardmasters ON mediummasters.parentref = boardmasters.id;
        `);
        return NextResponse.json(results);
    } catch (error) {
        console.error("Error in GET /api/subjects:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}


export async function POST(req) {
    try {
        const body = await req.json();
        const { name, parentref } = body;

        if (!name.trim() || !parentref.trim()) {
            throw new Error("Invalid input for subject.");
        }

        await pool.query("INSERT INTO subjectmasters (name, parentref) VALUES (?, ?)", [name, parentref]);
        return NextResponse.json({ message: "Subject added successfully" });
    } catch (error) {
        console.error("Error in POST /api/subjects:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
