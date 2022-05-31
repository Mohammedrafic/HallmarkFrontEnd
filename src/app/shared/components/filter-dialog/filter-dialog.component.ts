import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { Actions, ofActionDispatched } from '@ngxs/store';
import { ShowFilterDialog, ShowSideDialog } from '../../../store/app.actions';
import { FilteredItem } from '@shared/models/filter.model';

@Component({
  selector: 'app-filter-dialog',
  templateUrl: './filter-dialog.component.html',
  styleUrls: ['./filter-dialog.component.scss']
})
export class FilterDialogComponent implements OnInit {
  @ViewChild('filterDialog') filterDialog: DialogComponent;
  targetElement: HTMLElement = document.body;

  @Input() width: string = '532px';
  @Input() items: FilteredItem[] = [];
  @Input() count: number = 0;
  @Output() clearAllFiltersClicked = new EventEmitter();
  @Output() applyFilterClicked = new EventEmitter();
  @Output() closeDialogClicked = new EventEmitter();

  constructor(private action$: Actions) { }

  ngOnInit(): void {
    this.action$.pipe(ofActionDispatched(ShowFilterDialog)).subscribe(payload => {
      if (payload.isDialogShown) {
        this.filterDialog.show();
      } else {
        this.filterDialog.hide();
      }
    });
  }

  onClearAllFilterClick(): void {
    this.clearAllFiltersClicked.emit();
  }

  onFilterClick(): void {
    this.applyFilterClicked.emit();
  }
}
