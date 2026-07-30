/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import fs from "fs";
import path from "path";
import { Beneficiario } from "../app/types";

export type SessionState =
  | { type: "IDLE"; history?: { role: "system" | "user" | "assistant"; content: string }[] }
  | { type: "REGISTERING"; step: number; draft: Partial<Beneficiario> }
  | { type: "ASK_WANT_DOCUMENTS"; draft: Partial<Beneficiario> }
  | { type: "REGISTERING_DOCUMENTS"; step: number; draft: Partial<Beneficiario>; docs: any[] }
  | { type: "EDITING"; targetId: string; lastField?: string }
  | { type: "CONFIRM_DELETE"; targetId: string }
  | { type: "WAITING_DOCUMENT_TYPE"; targetId: string }
  | { type: "WAITING_DOCUMENT_FILE"; targetId: string; docType: string }
  | { type: "REGISTERING_MAESTRO"; step: number; draft: { nombre?: string; dni?: string; celular?: string; especialidad?: string; tarifaVivienda?: string; beneficiarioAsignadoId?: string; beneficiarioAsignadoNombre?: string } }
  | { type: "REGISTERING_AVANCE"; targetId: string; stageIndex?: number }
  | { type: "WAITING_ETAPA_SELECT"; targetId: string }
  | { type: "WAITING_MAESTRO_SELECT"; targetId: string }
  | { type: "WAITING_BENEFICIARY_FOR_CHART" }
  | { type: "WAITING_BENEFICIARY_FOR_AVANCE" }
  | { type: "ASKING_WANT_NEW_AVANCE"; targetId: string };

const SESSIONS_PATH = path.join(process.cwd(), "data", "sessions.json");

function readSessionsFromDisk(): Record<string, SessionState> {
  try {
    if (!fs.existsSync(SESSIONS_PATH)) {
      return {};
    }
    const raw = fs.readFileSync(SESSIONS_PATH, "utf-8");
    return JSON.parse(raw) as Record<string, SessionState>;
  } catch (err) {
    return {};
  }
}

function writeSessionsToDisk(data: Record<string, SessionState>): void {
  try {
    const dir = path.dirname(SESSIONS_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SESSIONS_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing sessions.json", err);
  }
}

export function getSession(chatId: number | string): SessionState {
  const all = readSessionsFromDisk();
  return all[String(chatId)] || { type: "IDLE" };
}

export function setSession(chatId: number | string, state: SessionState): void {
  const all = readSessionsFromDisk();
  all[String(chatId)] = state;
  writeSessionsToDisk(all);
}

export function clearSession(chatId: number | string): void {
  const all = readSessionsFromDisk();
  delete all[String(chatId)];
  writeSessionsToDisk(all);
}
