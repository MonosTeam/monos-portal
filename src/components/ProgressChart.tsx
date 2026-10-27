"use client";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export function ProgressRing({ value }: { value: number }) {
  const data = [{ v: value }, { v: 100 - value }];
  return (
    <div className="relative h-40 w-40">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="v" innerRadius="72%" outerRadius="100%" startAngle={90} endAngle={-270} stroke="none" isAnimationActive={false}>
            <Cell fill="var(--brand)" />
            <Cell fill="var(--line)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div><div className="text-3xl font-semibold">{value}%</div><div className="text-xs text-muted">complete</div></div>
      </div>
    </div>
  );
}
