//src\app\api\chapters\route.js
import { pool } from "../../../config/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const results = await pool.query(`
        SELECT chaptermasters.id AS chapterId, 
        chaptermasters.name AS chapterName, 
        chaptermasters.parentref AS subjectId, 
        subjectmasters.name AS subjectName, 
        standardmasters.name AS standardName,
        mediummasters.name AS mediumName, 
        boardmasters.name AS boardName FROM chaptermasters 
        JOIN subjectmasters ON chaptermasters.parentref = subjectmasters.id 
        JOIN standardmasters ON subjectmasters.parentref = standardmasters.id 
        JOIN mediummasters ON standardmasters.parentref = mediummasters.id 
        JOIN boardmasters ON mediummasters.parentref = boardmasters.id;
        `);
        return NextResponse.json(results);
    } catch (error) {
        console.error("Error in GET /api/chapters:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}


export async function POST(req) {
    try {
        const body = await req.json();
        const { name, parentref } = body;
        
        if (!name.trim() || !parentref.trim()) {
            throw new Error("Invalid input for chapter.");
        }
        
        await pool.query("INSERT INTO chaptermasters (name, parentref) VALUES (?, ?)", [name, parentref]);
        return NextResponse.json({ message: "Chapter added successfully" });
    } catch (error) {
        console.error("Error in POST /api/chapters:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
