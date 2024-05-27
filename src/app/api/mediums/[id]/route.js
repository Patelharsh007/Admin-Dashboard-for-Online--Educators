import { pool } from "../../../../config/db";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
    try {
        const { id } = params;
        const body = await req.json();
        const { name, parentref } = body;

        const queryString = "UPDATE mediummasters SET name = ?, parentref = ? WHERE id = ?";
        const values = [name, parentref, id];

        await pool.query(queryString, values);
        return NextResponse.json({ message: "Medium updated successfully" });
    } catch (error) {
        console.error("Error in PUT /api/mediums/[id]:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function GET(req, { params }) {
    try {
        const { id } = params;

        const results=await pool.query("SELECT * from mediummasters WHERE parentref = ?",[id]);
        return NextResponse.json(results);
    } catch (error) {
        console.error("Error in GET /api/mediums/[id]:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const { id } = params;

        // Check if there are associated standards
        const standards = await pool.query("SELECT * FROM standardmasters WHERE parentref = ?", [id]);

        if (standards.length > 0) {
            // Delete associated standards and their subjects and chapters
            for (const standard of standards) {
                const subjects = await pool.query("SELECT * FROM subjectmasters WHERE parentref = ?", [standard.id]);

                if (subjects.length > 0) {
                    for (const subject of subjects) {
                        const chapters = await pool.query("SELECT * FROM chaptermasters WHERE parentref = ?", [subject.id]);

                        if (chapters.length > 0) {
                            for (const chapter of chapters) {
                                await pool.query("DELETE FROM chaptermasters WHERE id = ?", [chapter.id]);
                            }
                        }
                        await pool.query("DELETE FROM subjectmasters WHERE id = ?", [subject.id]);
                    }
                }
                await pool.query("DELETE FROM standardmasters WHERE id = ?", [standard.id]);
            }
            await pool.query("DELETE FROM mediummasters WHERE id = ?", [id]);

        return NextResponse.json({ message: "Medium and its associated data deleted successfully." })
        }
        else{
        // Delete the medium
        await pool.query("DELETE FROM mediummasters WHERE id = ?", [id]);

        return NextResponse.json({ message: "Medium deleted successfully." });
    }
    } catch (error) {
        console.error("Error in DELETE /api/mediums/[id]:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
