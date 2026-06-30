"use client";

import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface RiskGaugeProps {
  score: number; // 0-100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

function getRiskColor(score: number) {
  if (score >= 75) return "#f43f5e"; // critical
  if (score >= 50) return "#f97316"; // high
  if (score >= 25) return "#f59e0b"; // medium
  return "#10b981"; // low
}

function getRiskLabel(score: number) {
  if (score >= 75) return "Critical";
  if (score >= 50) return "High";
  if (score >= 25) return "Moderate";
  return "Low";
}

const sizes = {
  sm: { height: 80, textSize: "text-lg", labelSize: "text-[9px]" },
  md: { height: 120, textSize: "text-2xl", labelSize: "text-[10px]" },
  lg: { height: 160, textSize: "text-3xl", labelSize: "text-xs" },
};

export function RiskGauge({ score, size = "md", showLabel = true, className }: RiskGaugeProps) {
  const color = getRiskColor(score);
  const label = getRiskLabel(score);
  const { height, textSize, labelSize } = sizes[size];

  // Two data entries: background (full 100) + actual score on top
  const data = [
    { name: "score", value: score, fill: color },
    { name: "bg", value: 100 - score, fill: "oklch(0.22 0.01 250)" },
  ];

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height={height}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="65%"
          outerRadius="85%"
          startAngle={225}
          endAngle={-45}
          data={data}
          barCategoryGap={0}
        >
          <RadialBar dataKey="value" cornerRadius={4} />
        </RadialBarChart>
      </ResponsiveContainer>
      {/* Center text overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-bold leading-none", textSize)} style={{ color }}>
          {score}
        </span>
        {showLabel && (
          <span className={cn("mt-0.5 font-medium uppercase tracking-wider text-muted-foreground", labelSize)}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
