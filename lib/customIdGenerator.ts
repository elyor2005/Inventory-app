import { CustomIdFormat, IdElement } from "@/components/CustomIdBuilder";

/**
 * Generates a custom ID based on the inventory's ID format configuration
 * @param format The custom ID format configuration
 * @param creationDate The date when the item is being created
 * @returns The generated custom ID string
 */
export function generateCustomId(format: CustomIdFormat, creationDate: Date = new Date()): string {
  if (!format.enabled || !format.elements || format.elements.length === 0) {
    return "";
  }

  const parts = format.elements.map((element) => {
    return generateElementValue(element, format.sequenceCounter || 1, creationDate);
  });

  return parts.join(format.separator || "");
}

/**
 * Generates the value for a single ID element
 */
function generateElementValue(element: IdElement, sequenceValue: number, creationDate: Date): string {
  switch (element.type) {
    case "text":
      return element.value || "";

    case "sequence":
      return sequenceValue.toString().padStart(element.padding || 1, "0");

    case "random6":
      return generateRandomDigits(6);

    case "random9":
      return generateRandomDigits(9);

    case "random20bit":
      // 20-bit number: 0 to 1048575 (0xFFFFF in hex)
      const random20 = Math.floor(Math.random() * 1048576);
      return random20.toString(16).toUpperCase().padStart(5, "0");

    case "random32bit":
      // 32-bit number: 0 to 4294967295 (0xFFFFFFFF in hex)
      const random32 = Math.floor(Math.random() * 4294967296);
      return random32.toString(16).toUpperCase().padStart(8, "0");

    case "guid":
      // Generate a short GUID (first segment only for brevity)
      const fullGuid = generateGuid();
      return fullGuid.split("-").slice(0, 2).join("-");

    case "datetime":
      return formatDateTime(creationDate, element.format || "YYYY-MM-DD");

    default:
      return "";
  }
}

/**
 * Generates random digits as a string
 */
function generateRandomDigits(length: number): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
}

/**
 * Generates a GUID/UUID
 */
function generateGuid(): string {
  // Simple GUID generation (not cryptographically secure, but sufficient for IDs)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Formats a date according to the specified format string
 */
function formatDateTime(date: Date, format: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return format
    .replace("YYYY", String(year))
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds);
}

/**
 * Checks if a custom ID format has a sequence element
 * If it does, the counter needs to be incremented after each use
 */
export function hasSequenceElement(format: CustomIdFormat): boolean {
  if (!format.enabled || !format.elements) {
    return false;
  }
  return format.elements.some((el) => el.type === "sequence");
}

/**
 * Validates a custom ID format
 */
export function validateCustomIdFormat(format: CustomIdFormat): { valid: boolean; error?: string } {
  if (!format.enabled) {
    return { valid: true };
  }

  if (!format.elements || format.elements.length === 0) {
    return { valid: false, error: "At least one ID element is required when custom ID is enabled" };
  }

  if (format.elements.length > 10) {
    return { valid: false, error: "Maximum 10 ID elements allowed" };
  }

  // Check for text elements without values
  const emptyTextElements = format.elements.filter((el) => el.type === "text" && (!el.value || el.value.trim() === ""));
  if (emptyTextElements.length > 0) {
    return { valid: false, error: "Text elements cannot be empty" };
  }

  return { valid: true };
}
