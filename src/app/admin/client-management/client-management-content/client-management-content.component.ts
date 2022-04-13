import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { GridComponent, SortService } from '@syncfusion/ej2-angular-grids';
import { SetHeaderState } from 'src/app/store/app.actions';

@Component({
  selector: 'app-client-management-content',
  templateUrl: './client-management-content.component.html',
  styleUrls: ['./client-management-content.component.scss'],
  providers: [SortService]
})
export class ClientManagementContentComponent implements OnInit, AfterViewInit {

  public data: object[] = [
    {
      name: 'Organization name 1',
      status: 'active',
      city: 'City name',
      contact: 'Johns Dou',
      phone: '0992252247'
    },
    {
      name: 'Organization name 2',
      status: 'active',
      city: '1 City name',
      contact: 'Jhone Dou',
      phone: '0992252247'
    },
    {
      name: 'Organization name 3',
      status: 'active',
      city: 'R City name',
      contact: 'Jhone Dou',
      phone: '0993352247'
    }
  ];

  @ViewChild('grid')
  public grid: GridComponent;

  public initialSort = {
    columns: [
      { field: 'name', direction: 'Ascending' }
    ]
  };

  public resizeSettings = { mode: 'Auto' };

  readonly ROW_HEIGHT = 64;

  constructor(private store: Store) {
    store.dispatch(new SetHeaderState({title: 'Client Management'}));
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.grid.rowHeight = this.ROW_HEIGHT;
  }
}
