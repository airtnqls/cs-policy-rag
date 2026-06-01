import { NextResponse } from "next/server";
import { loadConsumerCases } from "@/lib/data/loadConsumerCases";
import { calculateConfidence } from "@/lib/rag/confidence";
import { classifyDispute } from "@/lib/rag/classifyDispute";
import { generateAnswer } from "@/lib/rag/generateAnswer";
import { retrieveCases } from "@/lib/rag/retrieveCases";
import { detectPII } from "@/lib/safety/detectPII";
import { detectPromptInjection } from "@/lib/safety/detectPromptInjection";
import type { ChatResponse } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as { query?: string };
  const originalQuery = body.query?.trim() ?? "";

  if (!originalQuery) {
    return NextResponse.json({ error: "질문을 입력해 주세요." }, { status: 400 });
  }

  const pii = detectPII(originalQuery);
  const injection = detectPromptInjection(originalQuery);
  const safety = {
    piiDetected: pii.detected,
    piiTypes: pii.types,
    maskedText: pii.maskedText,
    riskLevel: pii.riskLevel,
    injectionDetected: injection.detected,
    injectionReasons: injection.reasons,
    blocked: injection.detected,
  };

  if (injection.detected) {
    const blocked: ChatResponse = {
      originalQuery,
      maskedQuery: pii.maskedText,
      safety,
      answer: null,
      retrieved: [],
    };
    return NextResponse.json(blocked);
  }

  const { cases } = loadConsumerCases();
  const dispute = classifyDispute(pii.maskedText);
  const retrieved = retrieveCases(pii.maskedText, cases);
  const { confidence, groundingStatus } = calculateConfidence(pii.maskedText, retrieved, dispute);
  const answer = await generateAnswer({
    query: pii.maskedText,
    dispute,
    retrieved,
    confidence,
    groundingStatus,
  });

  const response: ChatResponse = {
    originalQuery,
    maskedQuery: pii.maskedText,
    safety,
    answer,
    retrieved,
  };

  return NextResponse.json(response);
}
