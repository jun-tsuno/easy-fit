import { Chart, useChart } from "@chakra-ui/charts";
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type StatsLinePoint = { label: string; value: number | null };

type Props = {
  data: StatsLinePoint[];
  /** 線の色（Chakra カラートークン） */
  color?: string;
  /** Y軸ラベルのフォーマッタ */
  formatTick?: (value: number) => string;
};

/**
 * 期間バケットごとの単一系列の推移を表示する折れ線グラフ。
 * value が null のバケットは点を打たず線でつなぐ。
 */
export function StatsLineChart({
  data,
  color = "brand.solid",
  formatTick,
}: Props) {
  const chart = useChart<StatsLinePoint>({
    data,
    series: [{ name: "value", color }],
  });

  return (
    <Chart.Root h="14rem" chart={chart}>
      <LineChart data={chart.data} margin={{ left: 0, right: 12, top: 8 }}>
        <CartesianGrid stroke={chart.color("border")} vertical={false} />
        <XAxis
          axisLine={false}
          tickLine={false}
          dataKey={chart.key("label")}
          stroke={chart.color("border")}
          tick={{ fontSize: 12, fill: chart.color("fg.muted") }}
          interval="preserveStartEnd"
          minTickGap={12}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          width={44}
          stroke={chart.color("border")}
          tick={{ fontSize: 12, fill: chart.color("fg.muted") }}
          domain={["dataMin - 1", "dataMax + 1"]}
          tickFormatter={
            formatTick
              ? (value) => formatTick(value as number)
              : chart.formatNumber({ maximumFractionDigits: 1 })
          }
        />
        <Tooltip
          animationDuration={100}
          cursor={{ stroke: chart.color("border") }}
          content={<Chart.Tooltip />}
        />
        {chart.series.map((item) => (
          <Line
            key={item.name}
            isAnimationActive={false}
            dataKey={chart.key(item.name)}
            stroke={chart.color(item.color)}
            strokeWidth={2}
            dot={{ r: 3, fill: chart.color(item.color), strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            connectNulls
          />
        ))}
      </LineChart>
    </Chart.Root>
  );
}
