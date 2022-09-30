import {
  GridReadyEvent,
  GridOptions
} from '@ag-grid-community/core';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { GRID_CONFIG } from '@shared/constants';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { Select } from '@ngxs/store';
import { AppState } from '../../../../store/app.state';
import { Observable } from 'rxjs';

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

  @Select(AppState.isDarkTheme)
  isDarkTheme$: Observable<boolean>;

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
