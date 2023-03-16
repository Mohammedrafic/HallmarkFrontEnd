import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';

import { Store } from '@ngxs/store';
import { filter, Observable, switchMap, takeUntil } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { AbstractPermission } from '@shared/helpers/permissions';
import { Permission } from '@core/interface';
import { REQUIRED_PERMISSIONS } from '@shared/constants';
import { DatePickerLimitations } from '@shared/components/icon-multi-date-picker/icon-multi-date-picker.interface';
import { ChipDeleteEventType, ChipItem } from '@shared/components/inline-chips';
import { TabsListConfig } from '@shared/components/tabs-list/tabs-list-config.model';
import { UserState } from 'src/app/store/user.state';
import { SetHeaderState, ShowFilterDialog } from '../../../../store/app.actions';
import { ScheduleGridAdapter } from '../../adapters';
import { ButtonRegionTooltip, ButtonSelectDataTooltip, TabListConfig } from '../../constants';
import { ActiveTabIndex } from '../../enums';
import * as ScheduleInt from '../../interface';
import { ScheduleApiService, ScheduleFiltersService } from '../../services';
import { ScheduledItem, ScheduleFilterStructure } from '../../interface';
import { OrganizationStructure } from '@shared/models/organization.model';
import { GetScheduleFilterByEmployees, HasNotDepartment, HasMultipleFilters } from '../../helpers';
import { ScheduleGridComponent } from './../../components/schedule-grid/schedule-grid.component';

@Component({
  selector: 'app-schedule-container',
  templateUrl: './schedule-container.component.html',
  styleUrls: ['./schedule-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleContainerComponent extends AbstractPermission implements OnInit {
  @ViewChild(ScheduleGridComponent) scheduleGrid: ScheduleGridComponent;

  tabsListConfig: TabsListConfig[] = TabListConfig;

  activeTabIndex: ActiveTabIndex = ActiveTabIndex.Scheduling;

  tabIndex = ActiveTabIndex;

  scheduleData: ScheduleInt.ScheduleModelPage | null;

  scheduledShift: ScheduledItem;

  appliedFiltersAmount = 0;

  totalCount = 0;

  scheduleFilters: ScheduleInt.ScheduleFilters = {};

  createScheduleDialogOpen = false;

  editScheduleDialogOpen = false;

  scheduleSelectedSlots: ScheduleInt.ScheduleSelectedSlots;

  datePickerLimitations: DatePickerLimitations;

  chipsData: ChipItem[];

  scheduleButtonTooltip: string;

  hasViewPermission = false;

  hasSchedulePermission = false;

  isEmployee = false;

  scheduleStructure: ScheduleFilterStructure = {
    regions: [],
    locations: [],
    departments: [],
  };

  private selectedCandidate: ScheduleInt.ScheduleCandidate | null;

  constructor(
    protected override store: Store,
    private cdr: ChangeDetectorRef,
    private scheduleApiService: ScheduleApiService,
    private filterService: ScheduleFiltersService,
    private scheduleFiltersService: ScheduleFiltersService,
  ) {
    super(store);

    store.dispatch(new SetHeaderState({ title: 'Schedule Management', iconName: 'file-text' }));
  }

  public override ngOnInit(): void {
    super.ngOnInit();
    this.watchForPermissions();
    this.setIsEmployee();
  }

  changeTab(tabIndex: ActiveTabIndex): void {
    this.activeTabIndex = tabIndex;
  }

  loadMoreData(pageNumber: number): void {
    this.scheduleFilters.pageNumber = pageNumber;

    this.initScheduleData(true);
  }

  changeFilters(filters: ScheduleInt.ScheduleFilters): void {
    //TODO: make filters as plain arrays number;
    this.scheduleFilters = {
      ...this.scheduleFilters,
      ...filters,
      pageNumber: 1,
      pageSize: 30,
    };

    this.updateScheduleGrid();
  }

  updateScheduleGrid(): void {
    this.detectWhatDataNeeds();
    this.setDateLimitation();
    this.selectCells({
      candidates: [],
      dates: [],
    });
  }

  selectCells(cells: ScheduleInt.ScheduleSelectedSlots): void {
    this.scheduleSelectedSlots = cells;
    this.setScheduleButtonTooltip();
  }

  scheduleCell(cells: ScheduleInt.ScheduleSelectedSlots): void {
    if (!this.hasSchedulePermission
      || HasMultipleFilters(this.scheduleFilters)
      || HasNotDepartment(this.scheduleFilters)
    ) {
      return;
    }

    this.selectCells(cells);
    this.openScheduleDialog();
  }

  openScheduleDialog(): void {
    this.setScheduleStructure();
  }

  closeScheduleDialog(): void {
    this.createScheduleDialogOpen = false;
  }

  editScheduledItem(scheduledItem: ScheduledItem): void {
    if (HasMultipleFilters(this.scheduleFilters) || HasNotDepartment(this.scheduleFilters)) {
      return;
    }

    this.scheduledShift = scheduledItem;
    this.openEditScheduleDialog();
  }

  closeEditScheduleDialog(): void {
    this.editScheduleDialogOpen = false;
    this.scheduleGrid?.clearSelectedCandidatesSlot();
  }

  showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  updateScheduleFilter(data: ScheduleInt.ScheduleFiltersData): void {
    this.chipsData = data.chipsData;
    this.changeFilters(data.filters);
    this.appliedFiltersAmount = data.filteredItems?.length;
    this.setScheduleButtonTooltip();
  }

  selectCandidate(selectedCandidate: ScheduleInt.ScheduleCandidate | null): void {
    this.selectedCandidate = selectedCandidate;
    if (!selectedCandidate) {
      this.scheduleFilters.firstLastNameOrId = '';
    }
    this.detectWhatDataNeeds();
  }

  deleteFilterItem(event: ChipDeleteEventType): void {
    this.filterService.deleteInlineChip(event);
  }

  private openEditScheduleDialog(): void {
    this.editScheduleDialogOpen = true;
  }

  private initScheduleData(isLoadMore = false): void {
    this.scheduleApiService.getScheduleEmployees(this.scheduleFilters)
    .pipe(
      take(1),
      switchMap((candidates: ScheduleInt.ScheduleCandidatesPage) =>
        this.getSchedulesByEmployeesIds(candidates)
      ),
      takeUntil(this.componentDestroy()),
    ).subscribe((scheduleData: ScheduleInt.ScheduleModelPage) => {
      if (isLoadMore) {
        this.scheduleData = {
          ...scheduleData,
          items: [...(this.scheduleData?.items || []), ...scheduleData.items],
        };
      } else {
        this.scheduleData = scheduleData;
      }

      this.totalCount = scheduleData.totalCount;
      this.cdr.detectChanges();
    });
  }

  private initSelectedCandidateScheduleData(): void {
    const candidatesPage = {
      items: [this.selectedCandidate],
      totalCount: 1,
    } as ScheduleInt.ScheduleCandidatesPage;

    this.getSchedulesByEmployeesIds(candidatesPage)
      .subscribe((scheduleData: ScheduleInt.ScheduleModelPage) => {
        this.scheduleData = scheduleData;
        this.totalCount = scheduleData.totalCount;

        this.cdr.detectChanges();
    });
  }

  private detectWhatDataNeeds(): void {
    if (!this.detectIsRequiredFiltersExist()) {
      this.scheduleData = null;

      return;
    }

    if (this.selectedCandidate) {
      this.initSelectedCandidateScheduleData();
    } else {
      this.initScheduleData();
    }
  }

  private getSchedulesByEmployeesIds(
    candidates: ScheduleInt.ScheduleCandidatesPage,
  ): Observable<ScheduleInt.ScheduleModelPage> {
    return this.scheduleApiService.getSchedulesByEmployeesIds(
      candidates.items.map(candidate => candidate.id),
      GetScheduleFilterByEmployees(this.scheduleFilters),
    ).pipe(
      take(1),
      map((candidateSchedules: ScheduleInt.CandidateSchedules[]): ScheduleInt.ScheduleModelPage =>
        ScheduleGridAdapter.combineCandidateData(candidates, candidateSchedules)
      ),
      takeUntil(this.componentDestroy()),
    );
  }

  private setDateLimitation(): void {
    if (this.scheduleFilters.startDate && this.scheduleFilters.endDate) {
      this.datePickerLimitations = {
        minDate: new Date(this.scheduleFilters.startDate),
        maxDate: new  Date(this.scheduleFilters.endDate),
      };
    }
  }

  private detectIsRequiredFiltersExist(): boolean {
    return !!this.selectedCandidate
      || !!this.scheduleFilters.firstLastNameOrId
      || !!this.scheduleFilters.regionIds?.length
      || !!this.scheduleFilters.locationIds?.length;
  }

  private setScheduleButtonTooltip(): void {
    if (!this.hasSchedulePermission) {
      this.scheduleButtonTooltip = REQUIRED_PERMISSIONS;

      return;
    }

    if (HasMultipleFilters(this.scheduleFilters) || HasNotDepartment(this.scheduleFilters)) {
      this.scheduleButtonTooltip = ButtonRegionTooltip;
    } else if (!this.scheduleSelectedSlots?.dates?.length) {
      this.scheduleButtonTooltip = ButtonSelectDataTooltip;
    } else {
      this.scheduleButtonTooltip = '';
    }
  }


  private setScheduleStructure(): void {
    if(!this.scheduleFilters.locationIds?.length && !this.scheduleFilters.regionIds?.length) {
      this.scheduleApiService.getEmployeesStructure(this.scheduleSelectedSlots.candidates[0].id).pipe(
        filter(Boolean),
        map((structure: OrganizationStructure) => {
          return this.scheduleFiltersService.createFilterStructure(structure.regions);
        }),
        takeUntil(this.componentDestroy()),
      ).subscribe((structure: ScheduleFilterStructure) => {
        this.scheduleStructure = { ...structure };
        this.createScheduleDialogOpen = true;
        this.cdr.markForCheck();
      });
    } else {
      this.createScheduleDialogOpen = true;
    }
  }

  private watchForPermissions(): void {
    this.getPermissionStream()
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((permissions: Permission) => {
        this.hasSchedulePermission = permissions[this.userPermissions.CanAddAvailability]
          || permissions[this.userPermissions.CanAddUnavailability]
          || permissions[this.userPermissions.CanAddShift];
        this.hasViewPermission = permissions[this.userPermissions.CanViewSchedule] || this.hasSchedulePermission;
        this.setScheduleButtonTooltip();
      });
  }

  private setIsEmployee(): void {
    this.isEmployee = this.store.selectSnapshot(UserState.user)?.isEmployee || false;
  }
}
