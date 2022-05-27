import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PanelModel } from '@syncfusion/ej2-angular-layouts';
import { Observable, of } from 'rxjs';

@Injectable()
export class DashboardService {
  constructor(private http: HttpClient) {}

  getDashboardsPanels(): Observable<PanelModel[]> {
    const dashboardData = localStorage.getItem('dashboard');
    if (dashboardData) {
      const panels = JSON.parse(dashboardData)
      return of(panels);
    }
    return of([
      { id: 'layout_0', sizeX: 1, sizeY: 1, row: 0, col: 0, content: '<div class="content">1</div>' },
      { id: 'layout_1', sizeX: 1, sizeY: 1, row: 0, col: 1, content: '<div class="content">2</div>' },
      { id: 'layout_2', sizeX: 1, sizeY: 1, row: 0, col: 2, content: '<div class="content">3</div>' },
      { id: 'layout_3', sizeX: 1, sizeY: 1, row: 0, col: 3, content: '<div class="content">4</div>' },
      { id: 'layout_4', sizeX: 1, sizeY: 1, row: 0, col: 4, content: '<div class="content">5</div>' },
      { id: 'layout_5', sizeX: 1, sizeY: 1, row: 1, col: 0, content: '<div class="content">6</div>' },
      { id: 'layout_6', sizeX: 1, sizeY: 1, row: 1, col: 1, content: '<div class="content">7</div>' },
    ]);
  }

  addDashboardPanel(panel: PanelModel[]): Observable<PanelModel[]> {
    return of(panel);
  }

  saveDashboard(dashboard: PanelModel[]): Observable<boolean> {
    const panels = JSON.stringify(dashboard)
    localStorage.setItem('dashboard', panels);
    return of(true);
  }
}
