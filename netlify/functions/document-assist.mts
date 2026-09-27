import type { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";
import { documentAssistHandler } from "../../server/documentAssist.ts";

export default async function handler(request: Request): Promise<Response> {
  const input = request.body ? Readable.fromWeb(request.body as never) : Readable.from([]);
  const incoming = Object.assign(input, { method: request.method, url: "/api/document-assist" }) as IncomingMessage;
  let status = 500;
  let headers: Record<string, string> = {};
  let body = "";
  const outgoing = {
    writeHead(code: number, responseHeaders: Record<string, string>) {
      status = code;
      headers = responseHeaders;
      return this;
    },
    end(chunk?: string | Uint8Array) {
      body = typeof chunk === "string" ? chunk : chunk ? Buffer.from(chunk).toString("utf8") : "";
      return this;
    },
  } as ServerResponse;

  await documentAssistHandler({
    key: process.env.AI_API_KEY,
    baseUrl: process.env.AI_BASE_URL,
    model: process.env.AI_MODEL?.trim() || "gpt-5.6-luna",
    fixture: process.env.AI_DEMO_FIXTURE === "1",
  })(incoming, outgoing, () => {
    status = 404;
    body = JSON.stringify({ error: "not-found" });
  });

  return new Response(body, { status, headers });
}
