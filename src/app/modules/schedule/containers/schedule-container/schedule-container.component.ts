import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';

import { Store } from '@ngxs/store';
import { filter, Observable, scheduled, switchMap, takeUntil } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { DateTimeHelper } from '@core/helpers';
import { MessageTypes } from '@shared/enums/message-types';
import { AbstractPermission } from '@shared/helpers/permissions';
import { Permission } from '@core/interface';
import { OrganizationStructure } from '@shared/models/organization.model';
import { DatePickerLimitations } from '@shared/components/icon-multi-date-picker/icon-multi-date-picker.interface';
import { ChipDeleteEventType, ChipItem } from '@shared/components/inline-chips';
import { SettingsViewService } from '@shared/services';
import { OrganizationalHierarchy, OrganizationSettingKeys } from '@shared/constants';
import { GetOrganizationStructure } from 'src/app/store/user.actions';
import { UserState } from 'src/app/store/user.state';
import { SetHeaderState, ShowFilterDialog, ShowToast } from '../../../../store/app.actions';
import { ScheduleGridAdapter } from '../../adapters';
import { FilterErrorMessage } from '../../constants';
import * as ScheduleInt from '../../interface';
import { CreateScheduleService, ScheduleApiService, ScheduleFiltersService } from '../../services';
import { ScheduledItem, ScheduleExport, SelectedCells, SideBarSettings } from '../../interface';
import { GetScheduleFilterByEmployees, HasNotMandatoryFilters, HasMultipleFilters, GetScheduledShift } from '../../helpers';
import { ResetPageFilters } from 'src/app/store/preserved-filters.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { DatesRangeType } from '@shared/enums';
import { GlobalWindow } from '@core/tokens';

@Component({
  selector: 'app-schedule-container',
  templateUrl: './schedule-container.component.html',
  styleUrls: ['./schedule-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleContainerComponent extends AbstractPermission implements OnInit {

  scheduleData: ScheduleInt.ScheduleModelPage | null;

  scheduledShift: ScheduledItem | null;

  appliedFiltersAmount = 0;

  totalCount = 0;

  scheduleFilters: ScheduleInt.ScheduleFilters = {};

  scheduleSelectedSlots: ScheduleInt.ScheduleSelectedSlots;

  datePickerLimitations: DatePickerLimitations;

  chipsData: ChipItem[];

  hasViewPermission = false;

  hasSchedulePermission = false;

  isEmployee = false;

  scheduleOnlyWithAvailability = false;

  sideBarSettings: SideBarSettings = {
    isOpen: false,
    isEditMode: false,
  };
  showSingleEmp: boolean = false;

  selectedCandidate: ScheduleInt.ScheduleCandidate | null;
  routeData: any;
  availableEmp: ScheduleInt.ScheduleCandidate | null;
  candidateDetails: ScheduleInt.ScheduleCandidatesPage;
  dateRange: ScheduleInt.DateRangeOption[];
  activeTimePeriod = DatesRangeType.TwoWeeks;

  constructor(
    protected override store: Store,
    private cdr: ChangeDetectorRef,
    private scheduleApiService: ScheduleApiService,
    private filterService: ScheduleFiltersService,
    private scheduleFiltersService: ScheduleFiltersService,
    private createScheduleService: CreateScheduleService,
    private settingService: SettingsViewService,
    private router : Router,
    @Inject(GlobalWindow) protected readonly globalWindow : WindowProxy & typeof globalThis,
  ) {
    super(store);
    const routerState = this.router.getCurrentNavigation()?.extras?.state;
    if(routerState?.["EmpId"]){
      this.showSingleEmp = true;
      this.routeData = routerState?.["EmpId"];
    }
    store.dispatch(new SetHeaderState({ title: 'Schedule Management', iconName: 'calendar' }));
  }

  public override ngOnInit(): void {
    super.ngOnInit();
    this.watchForPermissions();
    this.setIsEmployee();
    this.watchForCloseSideBarAction();
  }

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.store.dispatch(new ResetPageFilters());
  }

  loadMoreData(pageNumber: number): void {
    this.scheduleFilters.pageNumber = pageNumber;

    this.initScheduleData(true);
  }

  changeFilters(filters: ScheduleInt.ScheduleFilters, skipDataUpdate = false): void {
    //TODO: make filters as plain arrays number;
    this.scheduleFilters = {
      ...this.scheduleFilters,
      ...filters,
      pageNumber: 1,
      pageSize: 30,
    };

    if (!skipDataUpdate) {
      this.updateScheduleGrid();
    }
  }

  updateScheduleGrid(resetCells = true): void {
    this.detectWhatDataNeeds();
    this.setDateLimitation();

    if (resetCells) {
      this.selectCells({ candidates: [], dates: [] });
    }
  }

 selectCells(cells: ScheduleInt.ScheduleSelectedSlots, closeBar= true): void {
   if (this.canNotSelectCells(cells)) {
     this.store.dispatch(new ShowToast(MessageTypes.Error, FilterErrorMessage));
     return;
   }

    this.scheduleSelectedSlots = cells;

   if(cells.dates.length && closeBar) {
     this.setSideBarSettings(true,false);
   } else if(!cells.dates.length && !closeBar) {
     this.setSideBarSettings(true,false);
   } else {
     this.setSideBarSettings(false,false);
   }

    this.cdr.markForCheck();
  }

  setSelectedCells(selectedCells: SelectedCells): void {
    const {cells, sideBarState} = selectedCells;
    this.selectCells(cells, sideBarState);
    this.scheduledShift = null;
  }

  editScheduledItem(scheduledItem: ScheduledItem): void {
    if ((HasMultipleFilters(this.scheduleFilters) || HasNotMandatoryFilters(this.scheduleFilters)) && !this.isEmployee) {
      this.store.dispatch(new ShowToast(MessageTypes.Error, FilterErrorMessage));
      return;
    }

    this.setSideBarSettings(true,true);
    this.scheduledShift = scheduledItem;

    this.cdr.markForCheck();
  }

  showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  updateScheduleFilter(data: ScheduleInt.ScheduleFiltersData): void {
    this.scheduleFiltersService.setScheduleFiltersData(data);
    this.changeFilters(data.filters, data.skipDataUpdate);
    this.appliedFiltersAmount = data.filteredItems?.length;
    this.checkIsScheduleAvailabilityTurn();

    if (!this.store.selectSnapshot(UserState.user)?.isEmployee) {
      this.chipsData = data.chipsData;
    }
  }

  selectCandidate(selectedCandidate: ScheduleInt.ScheduleCandidate | null): void {
    this.selectedCandidate = selectedCandidate;

    if (selectedCandidate) {
      this.getEmployeeOrganizationStructure(selectedCandidate.id);
    } else {
      this.store.dispatch(new GetOrganizationStructure());
      this.scheduleFilters.firstLastNameOrId = '';
      this.scheduleFilters.regionIds = [];
      this.scheduleFilters.locationIds = [];
    }

    this.detectWhatDataNeeds();
  }

  private availableCandidates(): void {
    this.setDateLimitation();
    if(this.routeData){
      const selectedCandidates = {
        ...this.routeData,
        id : this.routeData.employeeId
      }
      this.selectedCandidate = selectedCandidates;
      this.availableEmp = this.selectedCandidate;
      this.getEmployeeOrganizationStructure(this.routeData.employeeId);
      this.detectWhatDataNeeds();  
    }
  }
  datesRanges(date : ScheduleInt.DateRangeOption[]): void {
    this.dateRange = date;
  }

  deleteFilterItem(event: ChipDeleteEventType): void {
    this.filterService.deleteInlineChip(event);
  }

  private checkIsScheduleAvailabilityTurn(): void {
    if(this.scheduleFilters?.locationIds?.length) {
      this.settingService.getViewSettingKey(
        OrganizationSettingKeys.ScheduleOnlyWithAvailability,
        OrganizationalHierarchy.Location,
        this.scheduleFilters?.locationIds[0],
      ).pipe(
        filter(({ScheduleOnlyWithAvailability}) => !!ScheduleOnlyWithAvailability),
        take(1),
      ).subscribe(({ScheduleOnlyWithAvailability}) => {
        this.scheduleOnlyWithAvailability = JSON.parse(ScheduleOnlyWithAvailability);
        this.cdr.markForCheck();
      });
    }
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

      this.updateScheduledShift();
      this.totalCount = scheduleData.totalCount;
      this.availableCandidates();
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
        this.updateScheduledShift();
        this.cdr.detectChanges();
    });
  }

  private detectWhatDataNeeds(): void {
    if (this.selectedCandidate) {
      this.initSelectedCandidateScheduleData();
    } else {
      this.initScheduleData();
    }
    if (!this.detectIsRequiredFiltersExist()) {
      this.scheduleData = null;

      return;
    }
  }

  private watchForCloseSideBarAction(): void {
    this.createScheduleService.closeSideBarEvent.pipe(
      takeUntil(this.componentDestroy()),
    ).subscribe((value: boolean) => {
      if(value) {
        this.selectCells({
          candidates: [],
          dates: [],
        });
        this.setSideBarSettings(false,false);
      } else {
        this.setDateLimitation();
        this.detectWhatDataNeeds();
        this.selectCells({
          candidates: [],
          dates: [],
        }, false);
      }

      this.scheduledShift = null;
    });
  }

  private getSchedulesByEmployeesIds(
    candidates: ScheduleInt.ScheduleCandidatesPage,
  ): Observable<ScheduleInt.ScheduleModelPage> {
    this.candidateDetails = candidates;
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
        minDate: DateTimeHelper.setInitDateHours(new Date(this.scheduleFilters.startDate)),
        maxDate: DateTimeHelper.setInitDateHours(new  Date(this.scheduleFilters.endDate)),
      };
    }
  }

  private detectIsRequiredFiltersExist(): boolean {
    return !!this.selectedCandidate
      || !!this.scheduleFilters.firstLastNameOrId
      || !!this.scheduleFilters.regionIds?.length
      || !!this.scheduleFilters.locationIds?.length;
  }

  private watchForPermissions(): void {
    this.getPermissionStream()
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((permissions: Permission) => {
        this.hasSchedulePermission = permissions[this.userPermissions.CanAddAvailability]
          || permissions[this.userPermissions.CanAddUnavailability]
          || permissions[this.userPermissions.CanAddShift];
        this.hasViewPermission = permissions[this.userPermissions.CanViewSchedule] || this.hasSchedulePermission;
      });
  }

  private setIsEmployee(): void {
    this.isEmployee = this.store.selectSnapshot(UserState.user)?.isEmployee || false;
  }

  private updateScheduledShift(): void {
    if (this.scheduledShift && this.scheduleData) {
      this.scheduledShift = GetScheduledShift(
        this.scheduleData,
        this.scheduledShift?.candidate?.id,
        this.scheduledShift?.schedule?.date
      );
    }
  }

  private setSideBarSettings(isOpen: boolean, isEditMode: boolean): void {
    this.sideBarSettings = {
      isOpen,
      isEditMode,
    };
  }

  private getEmployeeOrganizationStructure(employeeId: number): void {
    this.scheduleApiService.getEmployeesStructure(employeeId)
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((employeeOrganizationStructure: OrganizationStructure) => {
        this.scheduleFiltersService.setEmployeeOrganizationStructure(employeeOrganizationStructure);
      });
  }

  private canNotSelectCells(cells: ScheduleInt.ScheduleSelectedSlots): boolean {
    const filterError = ((HasMultipleFilters(this.scheduleFilters) || HasNotMandatoryFilters(this.scheduleFilters))
      && !!cells.dates.length);

    return !this.isEmployee && !!filterError;
  }

  activePeriod(activePeriod: DatesRangeType) : void {
    this.activeTimePeriod = activePeriod;
  }

  public exportTable(){
    this.scheduleApiService.exportSchedule(
      this.candidateDetails.items.map(candidate => candidate.id),
      GetScheduleFilterByEmployees(this.scheduleFilters),
    ).pipe(
      takeUntil(this.componentDestroy()),
    ).subscribe((data) => {
      this.sortData(data);
      const state = { 
        data : data, 
        dateRange : this.dateRange, 
        scheduleFilters : this.chipsData, 
        activePeriod : this.activeTimePeriod, 
        startDate : this.scheduleFilters.startDate,
        endDate : this.scheduleFilters.endDate
      };
      this.globalWindow.localStorage.setItem('Schedule_Export',JSON.stringify(state));
      if(window.location.pathname.includes("ui")){
        window.open(window.location.origin + '/ui/schedule-export', '_blank');
      } else {
        window.open(window.location.origin + '/schedule-export', '_blank');
      }
    });
  }

  public sortData(data: ScheduleExport[]) {
    data.sort((Emp1: { lastName: string; } , Emp2: { lastName: string; } ) => {
        const nameA = Emp1.lastName.toLowerCase();
        const nameB = Emp2.lastName.toLowerCase();
      
        if (nameA < nameB) {
          return -1;
        } else if (nameA > nameB) {
          return 1;
        } else {
          return 0;
        }
      });
  }
}
