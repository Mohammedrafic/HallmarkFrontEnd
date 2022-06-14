export interface ChartLineDataModel {
  [key: string]: ChartData
}

export class ChartData {
  id: string
  name: string
  progress: number
  value: number
  score: number
  chartData: Chart[]
}

export class Chart {
  x: number
  y: number
}