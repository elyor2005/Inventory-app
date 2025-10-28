import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

interface CustomFieldDefinition {
  name: string;
  label: string;
  type: "string" | "text" | "integer" | "date" | "boolean";
  required: boolean;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Get inventory with custom fields
    const inventory = await prisma.inventory.findUnique({
      where: { id },
      select: {
        customFields: true,
      },
    });

    if (!inventory) {
      return Response.json({ error: "Inventory not found" }, { status: 404 });
    }

    // Get all items in the inventory
    const items = await prisma.item.findMany({
      where: { inventoryId: id },
      select: {
        stringValues: true,
        textValues: true,
        integerValues: true,
        dateValues: true,
        booleanValues: true,
      },
    });

    const totalItems = items.length;
    const customFields = (inventory.customFields as unknown as CustomFieldDefinition[]) || [];

    // Initialize statistics object
    const statistics: {
      totalItems: number;
      numericFields: Record<string, { avg: number; min: number; max: number; count: number }>;
      stringFields: Record<string, { values: Record<string, number>; totalCount: number }>;
      booleanFields: Record<string, { trueCount: number; falseCount: number; totalCount: number }>;
      dateFields: Record<string, { earliest: string; latest: string; count: number }>;
    } = {
      totalItems,
      numericFields: {},
      stringFields: {},
      booleanFields: {},
      dateFields: {},
    };

    // Process each custom field
    customFields.forEach((field: CustomFieldDefinition) => {
      const fieldName = field.name;
      const fieldType = field.type;

      if (fieldType === "integer") {
        // Calculate numeric statistics
        const values: number[] = [];
        items.forEach((item) => {
          const integerValues = item.integerValues as Record<string, number>;
          if (integerValues && integerValues[fieldName] !== undefined && integerValues[fieldName] !== null) {
            values.push(Number(integerValues[fieldName]));
          }
        });

        if (values.length > 0) {
          const sum = values.reduce((acc, val) => acc + val, 0);
          const avg = sum / values.length;
          const min = Math.min(...values);
          const max = Math.max(...values);

          statistics.numericFields[fieldName] = {
            avg: Math.round(avg * 100) / 100, // Round to 2 decimal places
            min,
            max,
            count: values.length,
          };
        }
      } else if (fieldType === "string" || fieldType === "text") {
        // Count string value frequencies
        const valueCounts: Record<string, number> = {};
        let totalCount = 0;

        items.forEach((item) => {
          const values = (fieldType === "string" ? item.stringValues : item.textValues) as Record<string, string>;
          if (values && values[fieldName]) {
            const value = values[fieldName].toString().trim();
            if (value) {
              valueCounts[value] = (valueCounts[value] || 0) + 1;
              totalCount++;
            }
          }
        });

        if (totalCount > 0) {
          statistics.stringFields[fieldName] = {
            values: valueCounts,
            totalCount,
          };
        }
      } else if (fieldType === "boolean") {
        // Count boolean distributions
        let trueCount = 0;
        let falseCount = 0;

        items.forEach((item) => {
          const booleanValues = item.booleanValues as Record<string, boolean>;
          if (booleanValues && booleanValues[fieldName] !== undefined) {
            if (booleanValues[fieldName]) {
              trueCount++;
            } else {
              falseCount++;
            }
          }
        });

        if (trueCount + falseCount > 0) {
          statistics.booleanFields[fieldName] = {
            trueCount,
            falseCount,
            totalCount: trueCount + falseCount,
          };
        }
      } else if (fieldType === "date") {
        // Find date range
        const dates: string[] = [];

        items.forEach((item) => {
          const dateValues = item.dateValues as Record<string, string>;
          if (dateValues && dateValues[fieldName]) {
            dates.push(dateValues[fieldName]);
          }
        });

        if (dates.length > 0) {
          dates.sort();
          statistics.dateFields[fieldName] = {
            earliest: dates[0],
            latest: dates[dates.length - 1],
            count: dates.length,
          };
        }
      }
    });

    return Response.json({ statistics });
  } catch (error) {
    console.error("Error calculating statistics:", error);
    return Response.json({ error: "Failed to calculate statistics" }, { status: 500 });
  }
}
