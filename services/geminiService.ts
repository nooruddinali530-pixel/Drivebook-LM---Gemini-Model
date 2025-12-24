
import { GoogleGenAI } from "@google/genai";
import { DriveFile, ChatMessage } from "../types";

const GEMINI_MODEL = 'gemini-3-pro-preview';

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async runPromptStream(
    currentPrompt: string,
    files: DriveFile[],
    history: ChatMessage[],
    onChunk: (chunk: string) => void
  ): Promise<void> {
    try {
      // Build context from selected files to inject into system instructions
      let fileContext = "You are a helpful assistant.";
      if (files.length > 0) {
        fileContext += "\n\nAvailable Document Context:\n" + 
          files.map(f => `[FILE: ${f.name}]\n${f.content || 'No content'}`).join('\n\n');
      }

      // Convert history to Gemini parts format
      const contents = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      // Add the current prompt as the latest user turn
      contents.push({
        role: 'user',
        parts: [{ text: currentPrompt }]
      });

      const stream = await this.ai.models.generateContentStream({
        model: GEMINI_MODEL,
        contents: contents,
        config: {
          systemInstruction: fileContext,
          temperature: 0.7,
        },
      });

      for await (const chunk of stream) {
        const text = chunk.text || "";
        onChunk(text);
      }
    } catch (error) {
      console.error("Gemini stream error:", error);
      onChunk(`\nError: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export const geminiService = new GeminiService();
