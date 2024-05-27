import { pool } from "../../../../config/db";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
    try {
        const { id } = params;
        const body = await req.json();
        const { name } = body;

        const queryString = "UPDATE boardmasters SET name = ? WHERE id = ?";
        const values = [name, id];

        await pool.query(queryString, values);
        return NextResponse.json({ message: "Board updated successfully" });
    } catch (error) {
        console.error("Error in PUT /api/boards/[id]:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const { id } = params;

        // Check if there are associated mediums
        const mediums = await pool.query("SELECT * FROM mediummasters WHERE parentref = ?", [id]);

        if (mediums.length > 0) {
            // Delete associated mediums, standards, subjects, and chapters
            for (const medium of mediums) {
                const standards = await pool.query("SELECT * FROM standardmasters WHERE parentref = ?", [medium.id]);

                if (standards.length > 0) {
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
                }
                await pool.query("DELETE FROM mediummasters WHERE id = ?", [medium.id]);
            }

            await pool.query("DELETE FROM boardmasters WHERE id = ?", [id]);

            return NextResponse.json({ message: "Board and its associated data deleted successfully." });
        }

        else{
        await pool.query("DELETE FROM boardmasters WHERE id = ?", [id]);

        return NextResponse.json({ message: "Board deleted successfully." });
        }
    } catch (error) {
        console.error("Error in DELETE /api/boards/[id]:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
