import {
  GridApi,
  GridReadyEvent,
  GridOptions
} from '@ag-grid-community/core';
import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { GRID_CONFIG } from '@shared/constants';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';

@Component({
  selector: 'app-special-project-table',
  templateUrl: './special-project-table.component.html',
  styleUrls: ['./special-project-table.component.scss']
})
export class SpecialProjectTableComponent extends AbstractGridConfigurationComponent implements OnInit {

  public readonly gridConfig: typeof GRID_CONFIG = GRID_CONFIG;
  @Input() gridOptions: GridOptions;

  @Output() onGridReadyEvent: EventEmitter<GridReadyEvent> = new EventEmitter<GridReadyEvent>();
  @Output() onGridPageSizeChanged = new EventEmitter<any>();

  constructor() { super(); }

  ngOnInit(): void {
  }

  onPageSizeChanged(event: any) {
    this.onGridPageSizeChanged.next(event);
  }
  onGridReady(params: GridReadyEvent) {
    this.onGridReadyEvent.next(params);
  }
}
