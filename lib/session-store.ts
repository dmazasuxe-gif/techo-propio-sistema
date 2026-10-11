export type CoreMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string | any;
  name?: string;
  tool_call_id?: string;
};

