import { ProfileDetailsHoursChartSettings } from '../interface';

export const profileDetailsHoursChartSettings: ProfileDetailsHoursChartSettings = {
  yAxis: {
    visible: false,
  },
  xAxis: {
    valueType: 'Category',
    visible: false,
  },
  legend: {
    visible: false,
  },
  chartArea: {
    border: {
      width: 0,
    },
  },
  dataLabel: {
    visible: false,
    showZero: false,
  },
  tooltip: {
    enable: false
  },
  donutChart: {
    width: '180px',
    height: '180px',
  },
  barChart: {
    width: '180px',
    height: '50px',
  },
  background: 'transparent'
}
