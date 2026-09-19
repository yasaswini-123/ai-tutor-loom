import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const grid = "oklch(0.92 0.01 262)";
const axis = { fontSize: 12, fill: "oklch(0.55 0.03 262)" };
const primary = "oklch(0.54 0.19 268)";
const secondary = "oklch(0.62 0.18 305)";
const tertiary = "oklch(0.62 0.15 152)";

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid oklch(0.92 0.01 262)",
  fontSize: 12,
  boxShadow: "0 8px 24px oklch(0.21 0.03 265 / 0.08)",
};

export function TrendLineChart({
  data,
  xKey,
  yKey,
  height = 240,
  color = primary,
}: {
  data: Record<string, unknown>[];
  xKey: string;
  yKey: string;
  height?: number;
  color?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id={`fill-${yKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 4" stroke={grid} vertical={false} />
        <XAxis dataKey={xKey} tick={axis} axisLine={false} tickLine={false} />
        <YAxis tick={axis} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area
          type="monotone"
          dataKey={yKey}
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#fill-${yKey})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MultiLineChart({
  data,
  xKey,
  series,
  height = 240,
}: {
  data: Record<string, unknown>[];
  xKey: string;
  series: { key: string; name: string; color?: string }[];
  height?: number;
}) {
  const palette = [primary, secondary, tertiary];
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="4 4" stroke={grid} vertical={false} />
        <XAxis dataKey={xKey} tick={axis} axisLine={false} tickLine={false} />
        <YAxis tick={axis} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {series.map((s, i) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color ?? palette[i % palette.length]}
            strokeWidth={2.5}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function GroupedBarChart({
  data,
  xKey,
  series,
  height = 240,
}: {
  data: Record<string, unknown>[];
  xKey: string;
  series: { key: string; name: string; color?: string }[];
  height?: number;
}) {
  const palette = [primary, secondary, tertiary];
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="4 4" stroke={grid} vertical={false} />
        <XAxis dataKey={xKey} tick={axis} axisLine={false} tickLine={false} />
        <YAxis tick={axis} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "oklch(0.96 0.01 262)" }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.name}
            fill={s.color ?? palette[i % palette.length]}
            radius={[6, 6, 0, 0]}
            maxBarSize={28}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function HorizontalBarChart({
  data,
  height = 300,
}: {
  data: { name: string; value: number }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 24, bottom: 0 }}>
        <CartesianGrid strokeDasharray="4 4" stroke={grid} horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tick={axis} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          tick={axis}
          width={130}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "oklch(0.96 0.01 262)" }} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={18}>
          {data.map((d) => (
            <Cell
              key={d.name}
              fill={d.value >= 75 ? tertiary : d.value >= 60 ? primary : "oklch(0.72 0.16 65)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
