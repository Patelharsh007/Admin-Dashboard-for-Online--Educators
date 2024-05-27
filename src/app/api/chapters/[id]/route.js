import { pool } from "../../../../config/db";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
    try {
        const { id } = params;
        const body = await req.json();
        const { name, parentref } = body;
        
        // Check if parentref is a string before calling trim()
        const parentRefToUse = typeof parentref === 'string' ? parentref.trim() : parentref;

        if (!name.trim() || !parentRefToUse) {
            throw new Error("Invalid input for chapter.");
        }
        
        await pool.query("UPDATE chaptermasters SET name = ?, parentref = ? WHERE id = ?", [name, parentRefToUse, id]);
        return NextResponse.json({ message: "Chapter updated successfully" });
    } catch (error) {
        console.error("Error in PUT /api/chapters/[id]:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const { id } = params;
        await pool.query("DELETE FROM chaptermasters WHERE id = ?", [id]);
        return NextResponse.json({ message: "Chapter deleted successfully" });
    } catch (error) {
        console.error("Error in DELETE /api/chapters/[id]:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
