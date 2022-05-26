import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { Store } from "@ngxs/store";
import { DashboardLayoutComponent, PanelModel } from "@syncfusion/ej2-angular-layouts";
import { SetHeaderState } from "../store/app.actions";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.components.html',
  styleUrls: ['dashboard.components.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit {
  @ViewChild('dashboardLayout')
    public dashboard: DashboardLayoutComponent;

  constructor(private store: Store){ }

  cellSpacing = [10, 10];
  columns = 5;
  cellAspectRatio: number = 100/150;
  public panels: any = [
  { "sizeX": 1, "sizeY": 1, "row": 0, "col": 0, content:'<div class="content">1</div>' },
  { "sizeX": 1, "sizeY": 1, "row": 0, "col": 1, content:'<div class="content">2</div>' },
  { "sizeX": 1, "sizeY": 1, "row": 0, "col": 2, content:'<div class="content">3</div>' },
  { "sizeX": 1, "sizeY": 1, "row": 0, "col": 3, content:'<div class="content">4</div>' },
  { "sizeX": 1, "sizeY": 1, "row": 0, "col": 4, content:'<div class="content">5</div>' },
  { "sizeX": 1, "sizeY": 1, "row": 1, "col": 0, content:'<div class="content">6</div>' },
  { "sizeX": 1, "sizeY": 1, "row": 1, "col": 1, content:'<div class="content">7</div>' }
  ];

  ngOnInit(): void {
    this.store.dispatch(new SetHeaderState({ title: 'Dashboard', iconName: 'home' }));
  }

  addPanel(): void {
    const allPanels = this.dashboard.panels.length ;
    const panel: PanelModel = { 
      sizeX: 1,
      sizeY: 1,
      row: Math.floor(allPanels / this.columns),
      col: allPanels % this.columns,
      content:`<div class="content">${allPanels+1}</div>`
    }
    this.dashboard.addPanel(panel);
  }
}
