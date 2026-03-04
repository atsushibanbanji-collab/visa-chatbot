import { NextRequest, NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY が設定されていません" },
      { status: 500 }
    );
  }

  try {
    const { messages } = await request.json();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        system: [
          {
            type: "text",
            text: SYSTEM_PROMPT,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const status = response.status;
      if (status === 429) {
        return NextResponse.json(
          { error: "APIのレート制限に達しました。しばらく待ってからお試しください。" },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: errorData.error?.message || "APIエラーが発生しました" },
        { status }
      );
    }

    const data = await response.json();
    const text = data.content
      ?.map((c: { type: string; text?: string }) =>
        c.type === "text" ? c.text : ""
      )
      .filter(Boolean)
      .join("\n");

    return NextResponse.json({ content: text || "" });
  } catch {
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
