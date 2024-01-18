import { Component, OnInit,  EventEmitter, Input, ContentChild, ViewChild, TemplateRef, Output } from '@angular/core';
import { Actions, Store, ofActionDispatched } from '@ngxs/store';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import {  distinctUntilChanged, take, takeUntil } from 'rxjs';
import {  ShowSchduleSortFilterDialog } from 'src/app/store/app.actions';
import { ScheduleSortingCategory } from '../../schedule-grid/schedule-sort.constants';
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
  empWorkCommitments: string[] = []

  @Input() targetElement: HTMLElement | null = document.body;
  @Input() width: string = '532px';
  @Output() public updateScheduleFilter: EventEmitter<ScheduleFiltersData> = new EventEmitter<ScheduleFiltersData>();
  public schduleSortCategories: any[] = [];

  public sortCategories: any[] = [];
  public sortChangeCategories: any[] = [];
  public isShowSorting = false;
  public isShowSortingChange = false;
  public isSortingClick = true;
  private readonly ScheduleSortingCategories=ScheduleSortingCategory
  public constructor(private store: Store, private action$: Actions, private scheduleFiltersService: ScheduleFiltersService,) {
    super();
  }

  public ngOnInit(): void {
    this.sortListCategories();
    this.initDialogStateChangeListener();
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
 

  public onClose(): void {
    this.store.dispatch(new ShowSchduleSortFilterDialog(false));
  }

  private initDialogStateChangeListener(): void {
    this.action$
      .pipe(ofActionDispatched(ShowSchduleSortFilterDialog))
      .pipe(takeUntil(this.destroy$))
      .subscribe((payload: ShowSchduleSortFilterDialog) => {
        if (payload.isDialogShown) {
          this.scheduleFiltersService.getEmpWorkCommitmentsData().pipe(take(1),distinctUntilChanged(),takeUntil(this.destroy$),).subscribe((data: any) => {
            this.empWorkCommitments = data;
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
    this.sortCategories = event.container.data;
  }
  AddSortingCategory() {
    this.isShowSorting = !this.isShowSorting
    this.isShowSortingChange = false;
  }
  sortOrderChange(sort: any) {
    this.sortCategories.forEach((element, index) => {
      if (element.id === sort.id) {
        // Deep copy the object to avoid reference sharing
        const updatedElement = JSON.parse(JSON.stringify(element));
        // Update the properties of the copied object
        updatedElement.sortOrder = sort.sortOrder === SortOrder.ASCENDING ? SortOrder.DESCENDING : SortOrder.ASCENDING;
        updatedElement.tooltip = this.toolTipChangeValues(updatedElement);
        // Replace the old object with the updated copy
        this.sortCategories[index] = updatedElement;
      }
    });
  

  }
  toolTipChangeValues(sort: any): string {
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
    this.sortCategories.push(this.ScheduleSortingCategories.find(f=>f.id==event.items[0].id));
    this.isShowSorting = false
    this.isShowSortingChange = false;
    this.sortListCategories();
  }
  ChangeSortCategories(event: any) {
    this.isShowSortingChange = false;
    this.schduleSortCategories.push(this.sortChangeCategories[0]);
    this.sortCategories.push(this.ScheduleSortingCategories.find(f=>f.id==event.items[0].id));
    this.sortCategories = this.sortCategories.filter(f => !this.sortChangeCategories.map(m => m.id).includes(f.id));
    this.sortListCategories();
    this.sortChangeCategories = [];
  }
  onRemove(event: any) {
    this.sortCategories = this.sortCategories.filter(f => f.id !== event.id);
    this.schduleSortCategories.push(this.ScheduleSortingCategories.find(f=>f.id==event.id));
    this.schduleSortCategories = [...this.schduleSortCategories];
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
      return this.ScheduleSortingCategories
    } else {
      let notAvailableIDs = [7, 8];
      if (this.sortCategories.some(f => notAvailableIDs.includes(f.id))) {
        this.sortCategories = this.sortCategories.filter(f => !notAvailableIDs.includes(f.id));
        let filters = this.scheduleFiltersService.getScheduleFiltersData();
        let employeeSortCategory: EmployeeSortCategory = {
          sortCriterias: this.sortCategories,
          workCommitments: this.empWorkCommitments
        };
        filters.filters.employeeSortCategory = employeeSortCategory
        this.updateScheduleFilter.emit(
          filters
        );
        this.scheduleFiltersService.setScheduleFiltersData(filters);
      }
      return this.ScheduleSortingCategories.filter(f => !notAvailableIDs.includes(f.id))
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
    this.sortChangeCategories.push(this.ScheduleSortingCategories.find(f=>f.id==event.id))

  }
}
