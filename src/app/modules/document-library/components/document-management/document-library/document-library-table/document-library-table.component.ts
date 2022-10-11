import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { GRID_CONFIG } from '@shared/constants';
import {
  GridReadyEvent,
  GridOptions
} from '@ag-grid-community/core';
import { AppState } from '../../../../../../store/app.state';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'app-document-library-table',
  templateUrl: './document-library-table.component.html',
  styleUrls: ['./document-library-table.component.scss']
})
export class DocumentLibraryTableComponent extends AbstractGridConfigurationComponent implements OnInit {

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
