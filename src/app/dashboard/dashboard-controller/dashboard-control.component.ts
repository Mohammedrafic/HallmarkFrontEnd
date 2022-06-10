import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { ShowSideDialog } from 'src/app/store/app.actions';
import { WidgetService } from '../services/widget.service';

@Component({
  selector: 'app-dashboard-control',
  templateUrl: './dashboard-control.component.html',
  styleUrls: ['./dashboard-control.component.scss'],
})
export class DashboardControlComponent implements OnInit {
  widgets = [
    { id: 1, name: 'In Progress Orders', description: 'Amount of all opened orders in Organization' },
    { id: 2, name: 'Fixed Orders', description: 'Amount of all in progress orders in Organization' },
    { id: 3, name: 'Open vs Closed Orders', description: 'Amount of all fixed orders in Organization' },
    { id: 4, name: 'Candidates', description: 'Comparison of open orders to closed orders in Organization' },
    { id: 5, name: 'Job Orders', description: 'Amount of candidates by different statuses' },
  ];

  public availableWidgets$: Observable<any>;

  constructor(private widgetService: WidgetService, private store: Store) {}

  ngOnInit(): void {
    this.availableWidgets$ = of(this.widgets);
    this.widgetService.getWidgetList().subscribe(data=> console.log(data));
  }

  valueChange(event: any) {
    console.log(event);
  }

  addNew() {
    this.store.dispatch(new ShowSideDialog(true));
  }

  closeDialog() {
    this.store.dispatch(new ShowSideDialog(false));
  }
  

  
}
