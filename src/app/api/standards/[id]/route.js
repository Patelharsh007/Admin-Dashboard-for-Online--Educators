import { pool } from "../../../../config/db";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    try {
        const { id } = params;
        const results=await pool.query("SELECT * from standardmasters WHERE parentref = ?",[id]);
        return NextResponse.json(results);
    } catch (error) {
        console.error("Error in GET /api/standards/[id]:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const { id } = params;
        const body = await req.json();
        const { name, parentref } = body;

        const queryString = "UPDATE standardmasters SET name = ?, parentref = ? WHERE id = ?";
        const values = [name, parentref, id];

        await pool.query(queryString, values);
        return NextResponse.json({ message: "Standard updated successfully" });
    } catch (error) {
        console.error("Error in PUT /api/standards/[id]:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const { id } = params;

        // Check if there are associated subjects
        const subjects = await pool.query("SELECT * FROM subjectmasters WHERE parentref = ?", [id]);

        if (subjects.length > 0) {
            // Delete associated subjects and their chapters
            for (const subject of subjects) {
                const chapters = await pool.query("SELECT * FROM chaptermasters WHERE parentref = ?", [subject.id]);

                if (chapters.length > 0) {
                    for (const chapter of chapters) {
                        await pool.query("DELETE FROM chaptermasters WHERE id = ?", [chapter.id]);
                    }
                }
                await pool.query("DELETE FROM subjectmasters WHERE id = ?", [subject.id]);
            }

            await pool.query("DELETE FROM standardmasters WHERE id = ?", [id]);

            return NextResponse.json({ message: "Standard and its associated subjects (and their chapters) deleted successfully." });
        }
        else{
        // Delete the standard
        await pool.query("DELETE FROM standardmasters WHERE id = ?", [id]);

        return NextResponse.json({ message: "Standard Deleted successfully." });}
    } catch (error) {
        console.error("Error in DELETE /api/standards/[id]:", error);

        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
