import { Component, OnInit, ChangeDetectionStrategy, EventEmitter, Input, ContentChild, ViewChild, TemplateRef, Output } from '@angular/core';
import { Actions, Store, ofActionDispatched } from '@ngxs/store';
import { ChipDeleteEventType, ChipItem } from '@shared/components/inline-chips';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { FilteredItem } from '@shared/models/filter.model';
import { ChipDeletedEventArgs } from '@syncfusion/ej2-angular-buttons';
import { DeleteEventArgs } from '@syncfusion/ej2-angular-grids';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { skip, takeUntil } from 'rxjs';
import { ShowFilterDialog, ShowSchduleSortFilterDialog } from 'src/app/store/app.actions';
import { ScheduleSortingCategory, WorkCommitments } from '../../schedule-grid/schedule-sort.constants';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { SortOrder } from '@shared/enums/sort-order-dropdown.enum';
import { EmployeeSortCategory, GetEmployeeWorkCommitment, ScheduleFiltersData } from '../../../interface';
import { ScheduleFiltersService } from '../../../services';
import { DatesRangeType } from '@shared/enums';

@Component({
  selector: 'app-schedule-sort-filters',
  templateUrl: './schedule-sort-filters.component.html',
  styleUrls: ['./schedule-sort-filters.component.scss'],
})
export class ScheduleSortFiltersComponent extends DestroyableDirective implements OnInit {
  public description: string = "List of work commitment for listed employees.";
  public activeSchedulePeriod: string
  @ViewChild('filterDialog') filterDialog: DialogComponent;
  @ContentChild('groupedChips') public groupedChips: TemplateRef<HTMLElement>;
  @ContentChild('scheduleChips') public scheduleChips: TemplateRef<HTMLElement>;
  empWorkCommitments: string[] = []

  @Input() targetElement: HTMLElement | null = document.body;
  @Input() width: string = '532px';
  @Input() items: FilteredItem[] | null = [];
  @Input() count: number | undefined | null = 0;
  @Input() useGroupingFilters: boolean;
  @Input() chipsData: ChipItem[];


  @Output() clearAllFiltersClicked: EventEmitter<void> = new EventEmitter();
  @Output() applyFilterClicked: EventEmitter<void> = new EventEmitter();
  @Output() deleteFilter: EventEmitter<FilteredItem> = new EventEmitter();
  @Output() closeDialogClicked: EventEmitter<void> = new EventEmitter();
  @Output() filterChipDelted: EventEmitter<ChipDeleteEventType> = new EventEmitter();

  @Output() public updateScheduleFilter: EventEmitter<ScheduleFiltersData> = new EventEmitter<ScheduleFiltersData>();
  public schduleSortCategories: any[] = [];

  public workCommitments = WorkCommitments;
  public sortCategories: any[] = [];
  public sortChangeCategories: any[] = [];
  public isShowSorting = false;
  public isShowSortingChange = false;
  public isSortingClick = true;
  public constructor(private store: Store, private action$: Actions, private scheduleFiltersService: ScheduleFiltersService,) {
    super();
  }

  public ngOnInit(): void {
    this.sortListCategories();
    this.initDialogStateChangeListener();
  }

  public onClearAllFilterClick(): void {
    this.clearAllFiltersClicked.emit();
  }

  public onFilterClick(): void {
    let employeeSortCategory: EmployeeSortCategory = {
      sortCriterias: this.sortCategories,
      workCommitments: this.empWorkCommitments
    };

    let filters = this.scheduleFiltersService.getScheduleFiltersData();
    filters.filters.employeeSortCategory = employeeSortCategory;

    this.updateScheduleFilter.emit(
      filters
    );
    this.store.dispatch(new ShowSchduleSortFilterDialog(false));
  }
  public onBackToFilters(): void {
    this.sortCategories = [];
    this.empWorkCommitments = [];
    this.sortListCategories();
    let filters = this.scheduleFiltersService.getScheduleFiltersData();
    filters.filters.employeeSortCategory = null;
    this.updateScheduleFilter.emit(
      filters
    );
    this.store.dispatch(new ShowSchduleSortFilterDialog(false));
  }
  public onChipDelete(event: DeleteEventArgs): void {
    this.deleteFilter.emit(event.data as unknown as FilteredItem);
  }

  public onClose(): void {
    this.closeDialogClicked.emit();
  }

  private initDialogStateChangeListener(): void {
    this.action$
      .pipe(ofActionDispatched(ShowSchduleSortFilterDialog))
      .pipe(takeUntil(this.destroy$))
      .subscribe((payload: ShowSchduleSortFilterDialog) => {
        if (payload.isDialogShown) {
          this.scheduleFiltersService.getEmpWorkCommitmentsData().pipe(takeUntil(this.destroy$),).subscribe((data: any) => {
            this.empWorkCommitments = data;
            console.log(data)
            this.sortListCategories()
          });
          this.filterDialog.show();
        } else {
          this.filterDialog.hide();
        }
      });
  }


  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
    console.log("Data", this.workCommitments)
    console.log("Drag&Drop", event.container.data)
    this.sortCategories = event.container.data;
  }
  AddSortingCategory() {
    this.isShowSorting = !this.isShowSorting
    this.isShowSortingChange = false;
  }
  sortClick(sort: any) {

    this.sortCategories.forEach(element => {
      if (element.id == sort.id) {
        element.sortOrder = sort.sortOrder == SortOrder.ASCENDING ? SortOrder.DESCENDING : SortOrder.ASCENDING
        element.tooltip = this.toolTipValues(element)
      }
    });

  }
  toolTipValues(sort: any): string {
    if (sort.sortOrder == SortOrder.ASCENDING && (sort.columnName == 'FirstName' || sort.columnName == 'LastName')) {
      return 'A - Z'
    }
    else if (sort.sortOrder == SortOrder.DESCENDING && (sort.columnName == 'FirstName' || sort.columnName == 'LastName')) {
      return 'Z - A'
    }
    else if (sort.sortOrder == SortOrder.DESCENDING && (sort.columnName == 'ScheduleHrs' || sort.columnName == 'AvailabilityHrs' || sort.columnName == 'UnAvailabilityHrs')) {
      return SortOrder.DESCENDING
    }
    else if (sort.sortOrder == SortOrder.ASCENDING && (sort.columnName == 'ScheduleHrs' || sort.columnName == 'AvailabilityHrs' || sort.columnName == 'UnAvailabilityHrs')) {
      return SortOrder.ASCENDING
    } else {
      return sort.sortOrder == SortOrder.ASCENDING ? sort.tooltip.replace("bottom", 'top') : sort.tooltip.replace("top", 'bottom')
    }
  }
  HideSortCategories(event: any) {
    console.log(event)
    this.sortCategories.push(event.items[0]);
    this.isShowSorting = false
    this.isShowSortingChange = false;
    this.sortListCategories();
  }
  ChangeSortCategories(event: any) {
    this.isShowSortingChange = false;
    this.schduleSortCategories.push(this.sortChangeCategories[0]);
    this.sortCategories.push(event.items[0]);
    this.sortCategories = this.sortCategories.filter(f => !this.sortChangeCategories.map(m => m.id).includes(f.id));
    this.sortListCategories();
    this.sortChangeCategories = [];
  }
  onRemove(event: any) {
    this.sortCategories = this.sortCategories.filter(f => f.id !== event.id);
   this.schduleSortCategories.push(event);
   this.schduleSortCategories=[...this.schduleSortCategories]
  }

  sortListCategories() {
    //Add Sorting Categories set the values
    if (this.schduleSortCategories?.length > 0) {
     
      this.schduleSortCategories = this.activeTimePeriodBasedSortCategories().filter(f => !this.sortCategories.map(m => m.id).includes(f.id));

    } else {
      this.schduleSortCategories = this.activeTimePeriodBasedSortCategories();
    }
  }

  activeTimePeriodBasedSortCategories() {
    this.activeSchedulePeriod = this.scheduleFiltersService.getActiveScheduleTimePeriod();
    if (this.activeSchedulePeriod == DatesRangeType.Day) {
      return ScheduleSortingCategory
    } else {
      let notAvailableIDs = [7, 8]
      return ScheduleSortingCategory.filter(f => !notAvailableIDs.includes(f.id))
    }
  }

  dragDropWorkCommitments(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
    console.log("Data", this.workCommitments)
    console.log("Drag&Drop", event.container.data)
    this.empWorkCommitments = event.container.data
    this.scheduleFiltersService.setEmpWorkCommitmentsData(event.container.data);
  }


  sortDynamic(event: any) {
    this.isShowSorting = false
    this.isShowSortingChange = !this.isShowSortingChange;
    this.sortCategories.forEach(element => {
      element.class = "inactive"
      if (event.id == element.id) {
        element.class = "active"
      }

    });
    this.sortChangeCategories.push(event)

  }



}
