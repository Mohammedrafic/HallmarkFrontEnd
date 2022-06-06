export interface ChartAccumulationDataModel {
  [key: string]: ChartAccumulation
}

export interface ChartAccumulation {
  id: string
  title: string
  candidates: number
  score: number
  progress: number
  chartData: DonutChartData[]
}

export interface DonutChartData {
  x: string
  y: number
  text: string
}