export interface ChartAccumulation {
  id: string;
  title: string;
  chartData: DonutChartData[];
}

export interface DonutChartData {
  label: string;
  value: number;
  color?: string;
}
