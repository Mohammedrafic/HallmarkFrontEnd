export interface ChartPointRenderEvent<T = string> {
  point: {
    x: T,
    y: number;
  };
  fill: string;
}
