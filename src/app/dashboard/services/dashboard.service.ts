import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PanelModel } from '@syncfusion/ej2-angular-layouts';
import { Observable, of } from 'rxjs';

@Injectable()
export class DashboardService {

  constructor(private http: HttpClient) { }

  getDashboardsPanels(): Observable<PanelModel[]> {
    return of([
      { "sizeX": 1, "sizeY": 1, "row": 0, "col": 0, content:'<div class="content">1</div>' },
      { "sizeX": 1, "sizeY": 1, "row": 0, "col": 1, content:'<div class="content">2</div>' },
      { "sizeX": 1, "sizeY": 1, "row": 0, "col": 2, content:'<div class="content">3</div>' },
      { "sizeX": 1, "sizeY": 1, "row": 0, "col": 3, content:'<div class="content">4</div>' },
      { "sizeX": 1, "sizeY": 1, "row": 0, "col": 4, content:'<div class="content">5</div>' },
      { "sizeX": 1, "sizeY": 1, "row": 1, "col": 0, content:'<div class="content">6</div>' },
      { "sizeX": 1, "sizeY": 1, "row": 1, "col": 1, content:'<div class="content">7</div>' }
      ])
  }

  addDashboardPanel(panel: PanelModel): Observable<PanelModel> {
    return of(panel);
  }
}
