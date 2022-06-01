export interface ChartLineDataModel {
  [key: string]: ChartData
}

export class ChartData {
  id: string
  name: string
  progress: number
  value: number
  score: number
  chartData: ChartDaum[]
}

export class ChartDaum {
  x: number
  y: number
}