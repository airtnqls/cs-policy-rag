"use client";

import { useState } from "react";
import type { ConsumerCase } from "@/lib/types";

export function DatasetTable({ cases }: { cases: ConsumerCase[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [dispute, setDispute] = useState("all");

  const categories = Array.from(new Set(cases.map((item) => item.category))).sort();
  const disputes = Array.from(new Set(cases.map((item) => item.disputeType))).sort();
  const normalized = query.toLowerCase();
  const filtered = cases.filter((item) => {
    const matchesQuery = [item.question, item.answer, item.item, item.keywords.join(" ")]
      .join(" ")
      .toLowerCase()
      .includes(normalized);
    return matchesQuery && (category === "all" || item.category === category) && (dispute === "all" || item.disputeType === dispute);
  });

  return (
    <section className="card overflow-hidden">
      <div className="grid gap-3 border-b border-hairline p-4 md:grid-cols-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="rounded-lg border border-[#d6d3d1] bg-white px-4 py-3 text-sm outline-none focus:border-ink"
          placeholder="질문, 답변, 품목 검색"
        />
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-lg border border-[#d6d3d1] bg-white px-4 py-3 text-sm">
          <option value="all">전체 분쟁 분류</option>
          {categories.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select value={dispute} onChange={(event) => setDispute(event.target.value)} className="rounded-lg border border-[#d6d3d1] bg-white px-4 py-3 text-sm">
          <option value="all">전체 분쟁 유형</option>
          {disputes.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[960px] w-full text-left text-sm">
          <thead className="bg-canvas-soft text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">분쟁 분류</th>
              <th className="px-4 py-3">품목</th>
              <th className="px-4 py-3">질문 미리보기</th>
              <th className="px-4 py-3">답변 미리보기</th>
              <th className="px-4 py-3">출처</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-t border-hairline align-top">
                <td className="px-4 py-4 font-mono text-xs text-muted">{item.id}</td>
                <td className="px-4 py-4">{item.category}</td>
                <td className="px-4 py-4">{item.item}</td>
                <td className="px-4 py-4 text-body">{item.question}</td>
                <td className="px-4 py-4 text-muted">{item.answer.slice(0, 120)}...</td>
                <td className="px-4 py-4 text-muted">{item.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 ? <p className="p-8 text-center text-body">검색 조건에 맞는 상담 사례가 없습니다.</p> : null}
    </section>
  );
}
