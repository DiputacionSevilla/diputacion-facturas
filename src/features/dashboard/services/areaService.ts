"use server";

import fs from "fs";
import path from "path";

export interface Area {
    code: string;
    description: string;
}

export async function getAreas(): Promise<Area[]> {
    try {
        const filePath = path.join(process.cwd(), "src", "areas.csv");
        const fileContent = fs.readFileSync(filePath, "utf-8");

        return fileContent
            .split("\n")
            .filter(line => line.trim() !== "")
            .map(line => {
                const [code, description] = line.split(";");
                return { code: code.trim(), description: description.trim() };
            });
    } catch (error) {
        console.error("Error reading areas.csv:", error);
        return [];
    }
}
