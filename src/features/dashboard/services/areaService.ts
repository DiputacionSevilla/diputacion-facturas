"use server";

import fs from "fs";
import path from "path";

export interface Area {
    code: string;
    description: string;
    entityCode: string;
    entityName: string;
}

export async function getAreas(entityCode?: string): Promise<Area[]> {
    try {
        const filePath = path.join(process.cwd(), "src", "areas.csv");
        const fileContent = fs.readFileSync(filePath, "utf-8");

        const allAreas = fileContent
            .split("\n")
            .filter(line => line.trim() !== "")
            .map(line => {
                const [entCode, entName, areaCode, areaDescription] = line.split(";");
                return {
                    code: areaCode?.trim() || "",
                    description: areaDescription?.trim() || "",
                    entityCode: entCode?.trim() || "",
                    entityName: entName?.trim() || ""
                };
            });

        if (entityCode) {
            return allAreas.filter(a => a.entityCode === entityCode);
        }

        return allAreas;
    } catch (error) {
        console.error("Error reading areas.csv:", error);
        return [];
    }
}
