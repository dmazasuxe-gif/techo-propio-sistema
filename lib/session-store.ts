import fs from "fs";
import path from "path";
import { Beneficiario } from "../app/types";

import { supabase } from "./supabase";

export type CoreMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string | any;
  name?: string;
  tool_call_id?: string;
};

// Obtenemos el historial de Supabase
export async function getChatHistory(chatId: string | number): Promise<CoreMessage[]> {
  const { data, error } = await supabase
    .from("chat_history")
    .select("history")
    .eq("chat_id", String(chatId))
    .single();

  if (error || !data || !data.history) return [];
  return data.history as CoreMessage[];
}

// Guardamos el historial en Supabase
export async function saveChatHistory(chatId: string | number, history: CoreMessage[]): Promise<void> {
  const strChatId = String(chatId);
  const { error } = await supabase
    .from("chat_history")
    .upsert(
      { chat_id: strChatId, history, last_updated: new Date().toISOString() },
      { onConflict: "chat_id" }
    );
    
  if (error) {
    console.error("Error saving chat history to Supabase:", error);
  }
}

// Limpiar historial
export async function clearChatHistory(chatId: string | number): Promise<void> {
  await supabase.from("chat_history").delete().eq("chat_id", String(chatId));
}
