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
      const panels = JSON.parse(dashboardData);
      return of(panels);
    }
    return of([
      { id: 'candidate', sizeX: 3, sizeY: 4, row: 0, col: 0, content: '<div class="content">1</div>' },
      { id: 'invoice', sizeX: 3, sizeY: 1, row: 0, col: 3, content: '<div class="content">2</div>' },
      { id: 'simple', sizeX: 3, sizeY: 1, row: 0, col: 6, content: '<div class="content">3</div>' },
      { id: 'layout_3', sizeX: 3, sizeY: 1, row: 0, col: 9, content: '<div class="content">4</div>' },
      { id: 'layout_4', sizeX: 3, sizeY: 3, row: 1, col: 3, content: '<div class="content">5</div>' },
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
}
