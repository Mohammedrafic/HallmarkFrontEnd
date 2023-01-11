import { takeUntil } from 'rxjs';

import { Component, ContentChild, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { Actions, ofActionDispatched } from '@ngxs/store';
import { ShowFilterDialog } from '../../../store/app.actions';
import { FilteredItem } from '@shared/models/filter.model';
import { DeleteEventArgs } from '@syncfusion/ej2-angular-buttons';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';

@Component({
  selector: 'app-filter-dialog',
  templateUrl: './filter-dialog.component.html',
  styleUrls: ['./filter-dialog.component.scss'],
})
export class FilterDialogComponent extends DestroyableDirective implements OnInit {
  @ViewChild('filterDialog') filterDialog: DialogComponent;
  @ContentChild('groupedChips') public groupedChips:TemplateRef<HTMLElement>;

  @Input() targetElement: HTMLElement | null = document.body;
  @Input() width: string = '532px';
  @Input() items: FilteredItem[] | null = [];
  @Input() count: number | undefined | null = 0;
  @Output() clearAllFiltersClicked: EventEmitter<void> = new EventEmitter();
  @Output() applyFilterClicked: EventEmitter<void> = new EventEmitter();
  @Output() deleteFilter: EventEmitter<FilteredItem> = new EventEmitter();
  @Output() closeDialogClicked: EventEmitter<void> = new EventEmitter();

  public constructor(private action$: Actions) {
    super();
  }

  public ngOnInit(): void {
    this.initDialogStateChangeListener();
  }

  public onClearAllFilterClick(): void {
    this.clearAllFiltersClicked.emit();
  }

  public onFilterClick(): void {
    this.applyFilterClicked.emit();
  }

  public onChipDelete(event: DeleteEventArgs): void {
    this.deleteFilter.emit(event.data as FilteredItem);
  }

  public onClose(): void {
    this.closeDialogClicked.emit();
  }

  private initDialogStateChangeListener(): void {
    this.action$
      .pipe(ofActionDispatched(ShowFilterDialog))
      .pipe(takeUntil(this.destroy$))
      .subscribe((payload: ShowFilterDialog) => {
        if (payload.isDialogShown) {
          this.filterDialog.show();
        } else {
          this.filterDialog.hide();
        }
      });
  }
}
