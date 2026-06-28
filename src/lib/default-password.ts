export const DEFAULT_PARTICIPANT_PASSWORD = "changeme";

export function isDefaultParticipantPassword(password: string): boolean {
  return password === DEFAULT_PARTICIPANT_PASSWORD;
}
