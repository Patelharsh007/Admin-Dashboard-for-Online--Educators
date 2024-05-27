import { pool } from "../../../../config/db";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
    try {
        const { id } = params;
        const body = await req.json();
        const { name, parentref } = body;

        const queryString = "UPDATE subjectmasters SET name = ?, parentref = ? WHERE id = ?";
        const values = [name, parentref, id];

        await pool.query(queryString, values);
        return NextResponse.json({ message: "Subject updated successfully" });
    } catch (error) {
        console.error("Error in PUT /api/subjects/[id]:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}


export async function DELETE(req, { params }) {
    try {
        const { id } = params;

        // Check if there are associated chapters
        const chapters = await pool.query("SELECT * FROM chaptermasters WHERE parentref = ?", [id]);

        if (chapters.length > 0) {
            // Delete associated chapters
            for (const chapter of chapters) {
                await pool.query("DELETE FROM chaptermasters WHERE id = ?", [chapter.id]);
            }
            // Delete the subject
            await pool.query("DELETE FROM subjectmasters WHERE id = ?", [id]);

            // Send a response indicating successful deletion of subject and its chapters
            return NextResponse.json({ message: "Subject and its associated chapters deleted successfully" });
        }
        else{
            // Delete the subject
            await pool.query("DELETE FROM subjectmasters WHERE id = ?", [id]);

            // Send a response indicating successful deletion of subject and its chapters
            return NextResponse.json({ message: "Subject deleted successfully" });
        }
        // Delete the subject
        await pool.query("DELETE FROM subjectmasters WHERE id = ?", [id]);

        // Send a response indicating successful deletion of subject and its chapters
        return NextResponse.json({ message: "Subject and its associated chapters deleted successfully" });
    } catch (error) {
        console.error("Error in DELETE /api/subjects/[id]:", error);

        // Send a response with status code 500 and error message
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
