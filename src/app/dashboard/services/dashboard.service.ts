import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { PanelModel } from '@syncfusion/ej2-angular-layouts';
import { Observable, of } from 'rxjs';
import { ChartAccumulationDataModel } from '../models/chart-accumulation-widget.model';
import { ChartLineDataModel } from '../models/chart-line-widget.model';

@Injectable()
export class DashboardService {
  constructor(private http: HttpClient) {}

  getDashboardsPanels(): Observable<PanelModel[]> {
    const dashboardData = localStorage.getItem('dashboard');
    if (dashboardData) {
      const panels = JSON.parse(dashboardData);
      return of(panels);
    }
    return of([
      { id: 'candidates_1', sizeX: 3, sizeY: 3, row: 0, col: 0, content: '<div class="content">1</div>' },
      { id: 'chart_line_1', sizeX: 3, sizeY: 1, row: 0, col: 3, content: '<div class="content">2</div>' },
      { id: 'chart_line_2', sizeX: 3, sizeY: 1, row: 0, col: 6, content: '<div class="content">3</div>' },
      { id: 'chart_line_3', sizeX: 3, sizeY: 1, row: 0, col: 9, content: '<div class="content">4</div>' },
      { id: 'invoces_1', sizeX: 3, sizeY: 3, row: 1, col: 3, content: '<div class="content">5</div>' },
      { id: 'layout_5', sizeX: 3, sizeY: 3, row: 1, col: 6, content: '<div class="content">6</div>' },
      { id: 'layout_6', sizeX: 3, sizeY: 6, row: 1, col: 9, content: '<div class="content">7</div>' },
      { id: 'layout_7', sizeX: 3, sizeY: 3, row: 4, col: 0, content: '<div class="content">8</div>' },
      { id: 'layout_8', sizeX: 3, sizeY: 3, row: 4, col: 3, content: '<div class="content">9</div>' },
      { id: 'layout_9', sizeX: 3, sizeY: 3, row: 4, col: 6, content: '<div class="content">10</div>' },
    ]);
  }

  addDashboardPanel(panel: PanelModel[]): Observable<PanelModel[]> {
    return of(panel);
  }

  saveDashboard(dashboard: PanelModel[]): Observable<boolean> {
    const panels = JSON.stringify(dashboard);
    localStorage.setItem('dashboard', panels);
    return of(true);
  }

  getAccumulationWidgets(): ChartAccumulationDataModel {
    return {
      candidates_1: {
        id: 'candidates_1',
        title: 'Candidates',
        candidates: 35,
        score: 14.53,
        progress: 4,
        chartData: [
          { x: 'Open', y: 45, text: '45%' },
          { x: 'In Progress', y: 15, text: '15%' },
          { x: 'Interviewed', y: 9, text: '9%' },
          { x: 'Scheduled Interviewers', y: 31, text: '31%' },
        ],
      },

      invoces_1: {
        id: 'invoces_1',
        title: 'invoces',
        score: 14.53,
        candidates: 15,
        progress: -4,
        chartData: [
          { x: 'Pending', y: 45, text: '45%' },
          { x: 'Submitted', y: 15, text: '15%' },
          { x: 'Approved', y: 9, text: '9%' },
          { x: 'Paid', y: 31, text: '31%' },
        ],
      },
    };
  }

  getChartLineWidgets(): ChartLineDataModel {
    return {
      chart_line_1: {
        id: 'chart_line_1',
        name: 'Pending Orders',
        progress: 1,
        value: 4.53,
        score: 0.45,
        chartData: [
          { x: 1, y: 30 },
          { x: 2, y: 28 },
          { x: 3, y: 35 },
          { x: 4, y: 28 },
          { x: 5, y: 33 },
          { x: 6, y: 32 },
          { x: 7, y: 30 },
        ],
      },

      chart_line_2: {
        id: 'chart_line_2',
        name: 'Bill Rate Fluctoation',
        progress: -1,
        value: 4.53,
        score: 0.45,
        chartData: [
          { x: 1, y: 30 },
          { x: 2, y: 28 },
          { x: 3, y: 35 },
          { x: 4, y: 28 },
          { x: 5, y: 40 },
          { x: 6, y: 32 },
          { x: 7, y: 35 },
        ],
      },

      chart_line_3: {
        id: 'chart_line_3',
        name: 'Orders Starting in the Future',
        progress: 1,
        value: 14.53,
        score: 129,
        chartData: [
          { x: 1, y: 38 },
          { x: 2, y: 40 },
          { x: 3, y: 39 },
          { x: 4, y: 42 },
          { x: 5, y: 45 },
          { x: 6, y: 43 },
          { x: 7, y: 48 },
        ],
      },
    };
  }
}
