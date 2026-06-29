export type Division = "elite" | "strider";
export type Gender = "male" | "female" | "other";

export const DEFAULT_DIVISION: Division = "strider";

export function parseDivision(value: string | null | undefined): Division {
  return value === "elite" ? "elite" : "strider";
}

export function parseGender(value: string | null | undefined): Gender | null {
  if (value === "male" || value === "female" || value === "other") {
    return value;
  }
  return null;
}

export function isValidGender(value: string): value is Gender {
  return value === "male" || value === "female" || value === "other";
}

export function divisionParticipantLabel(division: Division, count: number): string {
  const noun = division === "elite" ? "Elite" : "Striders";
  return `#${count} ${noun}`;
}
