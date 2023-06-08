import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Select, Store } from '@ngxs/store';
import { filter, Observable, switchMap, takeUntil, tap } from 'rxjs';
import { distinctUntilChanged, map, skip } from 'rxjs/operators';

import { SystemType } from '@shared/enums/system-type.enum';
import { AssignedSkillsByOrganization, Skill } from '@shared/models/skill.model';
import { SkillsService } from '@shared/services/skills.service';
import { Destroyable, isObjectsEqual } from '@core/helpers';
import { FieldType, FilterPageName } from '@core/enums';
import { ChipDeleteEvent } from '@shared/components/inline-chips';
import { DropdownOption } from '@core/interface';
import { FilteredItem } from '@shared/models/filter.model';
import {
  OrganizationDepartment,
  OrganizationLocation,
  OrganizationRegion,
  OrganizationStructure,
} from '@shared/models/organization.model';
import { OrganizationStructureService } from '@shared/services';
import { FilterService } from '@shared/services/filter.service';
import { ShowFilterDialog, ShowToast } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import {
  ChipsStructureState,
  FilterChipsStructure,
  ScheduleFilterFormGroupConfig,
  ScheduleFilterFormSourceKeys,
  ScheduleFiltersColumns,
} from '../../constants';
import { ScheduleFilterHelper } from '../../helpers';
import {
  ChipSettings,
  ChipsFilterStructure,
  ChipsInitialState,
  ScheduleFilters,
  ScheduleFiltersData,
  ScheduleFilterStructure,
} from '../../interface';
import { ScheduleApiService, ScheduleFiltersService } from '../../services';
import { ClearPageFilters, SaveFiltersByPageName } from 'src/app/store/preserved-filters.actions';
import { TimeMask } from '@client/order-management/components/irp-tabs/order-details/constants';
import { getHoursMinutesSeconds } from '@shared/utils/date-time.utils';
import { MessageTypes } from '@shared/enums/message-types';

@Component({
  selector: 'app-schedule-filters',
  templateUrl: './schedule-filters.component.html',
  styleUrls: ['./schedule-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleFiltersComponent extends Destroyable implements OnInit {
  @Input() public selectedCandidateId: number | undefined;
  @Input() public count: number;

  @Output() public updateScheduleFilter: EventEmitter<ScheduleFiltersData> = new EventEmitter<ScheduleFiltersData>();

  @Select(UserState.organizationStructure)
  private readonly organizationStructure$: Observable<OrganizationStructure>;

  public filteredItems: FilteredItem[] = [];

  public readonly scheduleFilterFormGroup = this.scheduleFiltersService.createScheduleFilterForm();

  public readonly filterColumns = ScheduleFiltersColumns;

  public readonly optionFields = { text: 'text', value: 'value' };

  public readonly formConfig = ScheduleFilterFormGroupConfig;

  public readonly fieldTypes = FieldType;

  private filters: ScheduleFilters = {};
  public firstLoop:number = 1;
  private isPreservedFilters = false;
  public readonly timeMask = TimeMask;
  public getstartDate: any;
  public getendDate: any;

  private filterStructure: ScheduleFilterStructure = {
    regions: [],
    locations: [],
    departments: [],
  };

  private chipsSettings: ChipSettings = {
    editedChips: false,
    preservedChipsSkills: [],
  };

  private isHomeCostCenterFilters = false;

  constructor(
    private store: Store,
    private filterService: FilterService,
    private cdr: ChangeDetectorRef,
    private scheduleFiltersService: ScheduleFiltersService,
    private scheduleApiService: ScheduleApiService,
    private organizationStructureService: OrganizationStructureService,
    private skillsService: SkillsService,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.watchForOrganizationStructure();
    this.watchForEmployeeOrganizationStructure();
    this.watchForControls();
    this.observeInlineChipDeleteEvent();
    this.applyPreservedFilters();
    this.changeTimeFormat();
  }

  public deleteFilter(event: FilteredItem): void {
    this.filterService.removeValue(event, this.scheduleFilterFormGroup, this.filterColumns);
    event.column == "endTime" ? this.scheduleFilterFormGroup.get("endTime")?.patchValue("") : this.scheduleFilterFormGroup.get("startTime")?.patchValue("");
    this.setFilteredItems(event.column);
    this.cdr.markForCheck();
  }

  public clearAllFilters(clearPreservedFilters = true): void {
    this.scheduleFilterFormGroup.reset();
    this.filters = this.scheduleFilterFormGroup.getRawValue();
    this.filteredItems = [];
    this.endDateChipdata = "";
    this.startDateChipdata = "";
    this.updateScheduleFilter.emit({ filters: this.filters, filteredItems: this.filteredItems, chipsData: [] });

    if (clearPreservedFilters) {
      this.store.dispatch(new ClearPageFilters(FilterPageName.SchedullerOrganization));
    }
  }

  public applyFilter(): void {
    if (this.scheduleFilterFormGroup.valid) {
      this.setFilters();
      this.store.dispatch([
        new ShowFilterDialog(false),
        new SaveFiltersByPageName(FilterPageName.SchedullerOrganization, this.filters),
      ]);
    } else {
      this.scheduleFilterFormGroup.markAllAsTouched();
    }
  }

  public closeFilterDialog(): void {
    this.scheduleFilterFormGroup.markAsUntouched();
  }

  private watchForOrganizationStructure(): void {
    this.organizationStructure$
      .pipe(
        filter(Boolean),
        map((structure: OrganizationStructure) =>
          this.organizationStructureService.getOrgStructureForIrp(structure.regions)),
        map((regions: OrganizationRegion[]) =>
          this.scheduleFiltersService.createFilterStructure(regions)),
        takeUntil(this.componentDestroy()),
      )
      .subscribe((structure: ScheduleFilterStructure) => {
        this.isHomeCostCenterFilters = false;
        this.setFilterStructure(structure);
        this.cdr.markForCheck();
      });
  }

  private watchForEmployeeOrganizationStructure(): void {
    this.scheduleFiltersService.getEmployeeOrganizationStructureStream()
      .pipe(
        skip(1), // skip init value
        map((structure: OrganizationStructure) => this.scheduleFiltersService.createFilterStructure(structure.regions)),
        takeUntil(this.componentDestroy()),
      )
      .subscribe((structure: ScheduleFilterStructure) => {
        this.isHomeCostCenterFilters = true;
        this.setFilterStructure(structure);
        this.preSelectHomeCostCenterFilters();
        this.cdr.markForCheck();
      });
  }

  private watchForControls(): void {
    this.scheduleFilterFormGroup.get('regionIds')?.valueChanges
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((selectedRegionIds: number[]) => {
        this.scheduleFilterFormGroup.get('locationIds')?.patchValue([]);
        this.filterColumns.locationIds.dataSource = selectedRegionIds?.length
          ? this.scheduleFiltersService.getSelectedLocatinOptions(this.filterStructure, selectedRegionIds)
          : [];
        this.setFilteredItems();
      });

    this.scheduleFilterFormGroup.get('locationIds')?.valueChanges
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((selectedLocationIds: number[]) => {
        this.scheduleFilterFormGroup.get('departmentsIds')?.patchValue([]);
        this.filterColumns.departmentsIds.dataSource = selectedLocationIds?.length
          ? this.scheduleFiltersService.getSelectedDepartmentOptions(this.filterStructure, selectedLocationIds)
          : [];
        this.setFilteredItems();
      });

    this.scheduleFilterFormGroup.get('departmentsIds')?.valueChanges
      .pipe(
        tap((departmentsIds: number[]) => {
          if (!departmentsIds?.length) {
            this.resetSkillFilters();
            this.setFilteredItems();
          }
        }),
        filter((departmentsIds: number[]) => !!departmentsIds?.length),
        switchMap((departmentsIds: number[]) => {
          const params = { SystemType: SystemType.IRP, DepartmentIds: departmentsIds };

          if (this.isHomeCostCenterFilters) {
            return this.scheduleApiService.getSkillsByEmployees(departmentsIds, this.selectedCandidateId);
          }

          return this.skillsService.getAssignedSkillsByOrganization({ params });
        }),
        filter((skills: AssignedSkillsByOrganization[] | Skill[]) => !!skills.length),
        takeUntil(this.componentDestroy())
      ).subscribe((skills: AssignedSkillsByOrganization[] | Skill[]) => {
        if (skills.length) {
          const skillOption = this.isHomeCostCenterFilters
            ? ScheduleFilterHelper.adaptMasterSkillToOption(skills as Skill[])
            : ScheduleFilterHelper.adaptOrganizationSkillToOption(skills as AssignedSkillsByOrganization[]);
          this.filterColumns.skillIds.dataSource = skillOption;
          const skillIds = this.getSkillsIds(skillOption);
          const selectedFilterSkills = this.scheduleFiltersService.getSelectedSkillFilterColumns(
              this.filterColumns.skillIds.dataSource,
              this.chipsSettings.preservedChipsSkills
          );

          const preservedChipSkills = this.chipsSettings.preservedChipsSkills.length ? selectedFilterSkills : skillIds;
          this.chipsSettings.preservedChipsSkills = [];
          this.chipsSettings.editedChips = false;

          this.scheduleFilterFormGroup.get('skillIds')?.patchValue(preservedChipSkills);
        } else {
          this.resetSkillFilters();
        }

        if (this.isPreservedFilters) {
          this.setFilters();
          this.isPreservedFilters = false;
        } else {
          this.setFilters(this.isHomeCostCenterFilters);
        }
      });

    this.scheduleFilterFormGroup.get('skillIds')?.valueChanges
    .pipe(takeUntil(this.componentDestroy()))
    .subscribe(() => this.setFilteredItems());
    this.scheduleFilterFormGroup.get('isAvailablity')?.valueChanges
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe(() => this.setFilteredItems());
    this.scheduleFilterFormGroup.get('isUnavailablity')?.valueChanges
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe(() => this.setFilteredItems());
    this.scheduleFilterFormGroup.get('isOnlySchedulatedCandidate')?.valueChanges
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe(() => this.setFilteredItems());
    this.scheduleFilterFormGroup.get('isExcludeNotOrganized')?.valueChanges
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe(() => this.setFilteredItems());
    this.scheduleFilterFormGroup.get('ShowGeneralnotes')?.valueChanges
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe(() => this.setFilteredItems());
    this.scheduleFilterFormGroup.get('startTime')?.valueChanges
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe(() => {
        this.changeTimeFormat();
        this.setFilteredItems()
      });
    this.scheduleFilterFormGroup.get('endTime')?.valueChanges
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe(() => {
        this.changeTimeFormat();
        this.setFilteredItems()
      });
  }

  private observeInlineChipDeleteEvent(): void {
    this.scheduleFiltersService.getDeleteInlineChipStream()
    .pipe(
      takeUntil(this.componentDestroy()),
    )
    .subscribe((event) => {
      if (event === null) {
        this.clearAllFilters();
        return;
      }

      const itemToDelete = this.filteredItems.find((item) => item.column === event.field && item.text === event.value);
      const controlValue = this.scheduleFilterFormGroup.get(event.field)?.value;

      if (controlValue && itemToDelete) {
        const updatedStructure = this.updateFiltersStructure(event);
        const hasEmptyState = !updatedStructure.regionIds.length ||
          !updatedStructure.locationIds.length ||
          !updatedStructure.departmentsIds.length ||
          !updatedStructure.skillIds.length;

        this.scheduleFilterFormGroup?.patchValue(updatedStructure);
        this.chipsSettings.editedChips = true;

       if(hasEmptyState) {
          this.setFilters();
        }

      this.cdr.markForCheck();
      }
    });
  }

  private setFilters(skipDataUpdate = false): void {
    this.filters = this.scheduleFilterFormGroup.getRawValue();
    this.filteredItems = this.filterService.generateChips(this.scheduleFilterFormGroup, this.filterColumns);
    this.setUnfilteredItems(this.filteredItems);
    if(this.scheduleFilterFormGroup.get("startTime")?.value != ""){
      this.filteredItems.push(this.startDateChipdata)
    }
    if(this.scheduleFilterFormGroup.get("endTime")?.value != ""){
      this.filteredItems.push(this.endDateChipdata)
    }
    for(let i=0; i< this.filteredItems.length; i++){
        if(this.filteredItems[i].column == "isAvailablity"){
          this.filteredItems[i].text = "Availability";
        }
        if(this.filteredItems[i].column == "isOnlySchedulatedCandidate"){
          this.filteredItems[i].text = "Only Scheduled Candidate";
        }
        if(this.filteredItems[i].column == "isExcludeNotOrganized"){
          this.filteredItems[i].text = "Exclude Not Oriented";
        }
        if(this.filteredItems[i].column == "isUnavailablity"){
          this.filteredItems[i].text = "Unavailability";
        }
        if(this.filteredItems[i].column == "ShowGeneralnotes"){
          this.filteredItems[i].text = "General Notes";
        }
      
    }
    const chips = this.scheduleFiltersService
      .createChipsData(this.scheduleFilterFormGroup.getRawValue(), this.filterColumns);
    this.changeTimeFormat();
    if((this.filters.startTime != "") && (this.filters.startTime != undefined)){
      this.filters.startTime = this.startDateChip.split(" ")[0];
      if(this.filters.startTime.split(":")[0] <= 9){
        this.filters.startTime = "0"+ this.filters.startTime;
      }
    }
    if((this.filters.endTime != "") && (this.filters.endTime != undefined)){
      this.filters.endTime = this.endDateChip.split(" ")[0];
      if(this.filters.endTime.split(":")[0] <= 9){
        this.filters.endTime = "0"+ this.filters.endTime;
      }
    }
   if(this.scheduleFilterFormGroup.get("endTime")?.value > this.scheduleFilterFormGroup.get("startTime")?.value){
    this.updateScheduleFilter.emit({
      filters: this.filters,
      filteredItems: this.filteredItems,
      chipsData: chips,
      skipDataUpdate,
    });
   } else {
    this.store.dispatch(new ShowToast(MessageTypes.Error, "End Date should not be less than Start date"));
   }
    
  }

  private updateFiltersStructure(event: ChipDeleteEvent): ChipsFilterStructure {
    const { regionIds, locationIds, departmentsIds, skillIds } = this.scheduleFilterFormGroup.getRawValue();
    const initialState: ChipsInitialState = ChipsStructureState;
    const filterStructure: ChipsFilterStructure = FilterChipsStructure;

    if(event.field === ScheduleFilterFormSourceKeys.Regions) {
      const regionStructureState = this.scheduleFiltersService.getRegionChipsStructureState(
        this.filterStructure,
        initialState,
        regionIds,
        event.value
      );

      filterStructure.regionIds = regionStructureState.regionIds;
      initialState.regions = regionStructureState.regions;
    } else {
      initialState.regions = this.scheduleFiltersService.getRegionInitialChipsStructure(this.filterStructure.regions);
      filterStructure.regionIds = regionIds;
    }

    if(event.field === ScheduleFilterFormSourceKeys.Locations) {
      const locationStructureState = this.scheduleFiltersService.getLocationChipsStructureState(
        this.filterStructure,
        initialState,
        locationIds,
        event.value
      );

      initialState.locations = locationStructureState.locations;
      filterStructure.locationIds = locationStructureState.locationIds;
    } else {
      initialState.locations = this.scheduleFiltersService.getLocationInitialChipsStructure(initialState.regions);
      filterStructure.locationIds = filterStructure.regionIds.length ? locationIds : [];
    }

    if(event.field === ScheduleFilterFormSourceKeys.Departments) {
      const departmentStructureState = this.scheduleFiltersService.getDepartmentChipsStructureState(
        this.filterStructure,
        initialState,
        departmentsIds,
        event.value
      );

      initialState.departments = departmentStructureState.departments;
      filterStructure.departmentsIds = departmentStructureState.departmentIds;
    } else {
      initialState.departments = this.scheduleFiltersService.getDepartmentInitialChipsStructure(initialState.locations);
      const hasPreviousState = filterStructure.regionIds.length && filterStructure.locationIds.length;
      const filteredDepartment = this.scheduleFiltersService.getFilteredDepartmentsIds(
        initialState.departments,
        departmentsIds
      );

      filterStructure.departmentsIds = hasPreviousState ? filteredDepartment : [];
    }

    if(event.field === ScheduleFilterFormSourceKeys.Skills) {
      filterStructure.skillIds = this.scheduleFiltersService.getSkillsChipsStructure(
        this.filterColumns.skillIds.dataSource,
        skillIds,
        event.value
      );

    } else {
      const hasPreviousState = filterStructure.regionIds.length &&
        filterStructure.locationIds.length &&
        filterStructure.departmentsIds.length;
      filterStructure.skillIds =  hasPreviousState ? skillIds : [];
    }

    this.chipsSettings.preservedChipsSkills = [...filterStructure.skillIds];

   return filterStructure;
  }

  private resetSkillFilters(): void {
    this.filterColumns.skillIds.dataSource = [];
    this.scheduleFilterFormGroup.get('skillIds')?.setValue([]);
  }
  public startDateChip: any;
  public endDateforChip: any;
  public startDateChipdata: any;
  public endDateChipdata: any;
  public endDateChip : any;
  public dateevent: any;
  public startDateforChip: any;
  public endDateevent: any;
  changeTimeFormat(){
    this.filters = this.scheduleFilterFormGroup.getRawValue();
    if((this.filters?.startTime != undefined) && (this.filters?.startTime != null)){
      this.dateevent = new Date(this.filters.startTime);
      this.startDateforChip = this.dateevent.toLocaleTimeString('en-US')
      this.startDateChip = this.startDateforChip;
      this.startDateChipdata = {
        column : "startTime",
        value : this.startDateChip,
        text : this.startDateChip
      }
    }
    if((this.filters?.endTime != undefined) && (this.filters?.endTime != null)){
      this.endDateevent = new Date(this.filters.endTime);
      this.endDateforChip = this.endDateevent.toLocaleTimeString('en-US')
      this.endDateChip = this.endDateforChip;
      this.endDateChipdata = {
        column : "endTime",
        value : this.endDateChip,
        text : this.endDateChip
      }
    }
  }

  private setFilteredItems(columnname? : string): void {
    this.filteredItems = this.filterService.generateChips(this.scheduleFilterFormGroup, this.filterColumns);
    this.setUnfilteredItems(this.filteredItems);
    if((this.scheduleFilterFormGroup.get("startTime")?.value != "" ) && (this.scheduleFilterFormGroup.get("startTime")?.value != null )){
      this.filteredItems.push(this.startDateChipdata)
    } else {
      this.filteredItems = this.filteredItems.filter(f => f.column !== "startTime");
    }
    if((this.scheduleFilterFormGroup.get("endTime")?.value != "") && (this.scheduleFilterFormGroup.get("endTime")?.value != null)){
      this.filteredItems.push(this.endDateChipdata)
    } else {
      this.filteredItems = this.filteredItems.filter(f => f.column !== "endTime");
    }
    if(columnname == "startTime" || columnname == "endTime"){
      this.filteredItems = this.filteredItems.filter(f => f.column !== columnname);
    }

    for(let i=0; i< this.filteredItems.length; i++){
      if(this.filteredItems[i].value == true){
        if(this.filteredItems[i].column == "isAvailablity"){
          this.filteredItems[i].text = "Availability";
        }
        if(this.filteredItems[i].column == "isOnlySchedulatedCandidate"){
          this.filteredItems[i].text = "Only Scheduled Candidate";
        }
        if(this.filteredItems[i].column == "isExcludeNotOrganized"){
          this.filteredItems[i].text = "Exclude Not Oriented";
        }
        if(this.filteredItems[i].column == "isUnavailablity"){
          this.filteredItems[i].text = "Unavailability";
        }
        if(this.filteredItems[i].column == "ShowGeneralnotes"){
          this.filteredItems[i].text = "General Notes";
        }
      }
    }
    this.filteredItems = [...this.filteredItems];
  }

  private setUnfilteredItems(filteredItems : any) : void {
    filteredItems = filteredItems.filter((f: { value: boolean; })=>f.value !== false);
    this.filteredItems = [...filteredItems];
    this.cdr.markForCheck();
  }

  private setFilterStructure(structure: ScheduleFilterStructure): void {
    if (this.filteredItems.length) {
      this.clearAllFilters(false);
    }

    this.filterStructure = structure;
    this.filterColumns.regionIds.dataSource = ScheduleFilterHelper.adaptRegionToOption(this.filterStructure.regions);
  }

  private preSelectHomeCostCenterFilters(): void {
    const homeCostCenterDepartment = this.filterStructure.departments
      .find((department: OrganizationDepartment) => department.isHomeCostCenter);
    let regionId: number;
    let locationId: number;
    let departmentId: number;

    if (homeCostCenterDepartment) {
      departmentId = homeCostCenterDepartment.id;
      locationId = homeCostCenterDepartment.locationId as number;
      regionId = this.filterStructure.locations
        .find((location: OrganizationLocation) => location.id === locationId)?.regionId as number;

      this.filterColumns.locationIds.dataSource = this.scheduleFiltersService
        .getSelectedLocatinOptions(this.filterStructure, [regionId]);
      this.filterColumns.departmentsIds.dataSource = this.scheduleFiltersService
        .getSelectedDepartmentOptions(this.filterStructure, [locationId]);

    } else {
      regionId = this.filterStructure.regions[0].id as number;

      this.filterColumns.locationIds.dataSource = this.scheduleFiltersService
        .getSelectedLocatinOptions(this.filterStructure, [regionId]);
      locationId = this.filterColumns.locationIds.dataSource[0]?.value as number;

      this.filterColumns.departmentsIds.dataSource = this.scheduleFiltersService
        .getSelectedDepartmentOptions(this.filterStructure, [locationId]);
      departmentId = this.filterColumns.departmentsIds.dataSource[0]?.value as number;
    }

    this.scheduleFilterFormGroup?.get('regionIds')?.patchValue([regionId], { emitEvent: false, onlySelf: true });
    this.scheduleFilterFormGroup?.get('locationIds')?.patchValue([locationId], { emitEvent: false, onlySelf: true });
    this.scheduleFilterFormGroup?.get('departmentsIds')?.patchValue([departmentId]);
  }

  private applyPreservedFilters(): void {
    this.organizationStructure$.pipe(
      switchMap((structure) => this.scheduleFiltersService.getPreservedFiltersDataStream().pipe(
        filter(() => !!structure),
      )),
      distinctUntilChanged((prev, next) => isObjectsEqual(prev as Record<string, unknown>, next as Record<string, unknown>)),
      takeUntil(this.componentDestroy())
    )
      .subscribe((preservFilters) => {
        this.filters = preservFilters || {};
        this.isPreservedFilters = !!preservFilters;
        const { regionIds, locationIds, departmentsIds, isAvailablity, isExcludeNotOrganized, startTime, endTime, ShowGeneralnotes, isOnlySchedulatedCandidate, isUnavailablity } = this.filters;
        if(preservFilters != null){
          if(startTime != null){
            const [startH, startM, startS] = getHoursMinutesSeconds(startTime);
            this.getstartDate = new Date();
            this.getstartDate.setHours(startH, startM, startS);
          }
          if(endTime != null){
            const [endH, endM, endS] = getHoursMinutesSeconds(endTime);
            this.getendDate = new Date();
            this.getendDate.setHours(endH, endM, endS);
          }
          this.scheduleFilterFormGroup.patchValue({
            regionIds: regionIds ? [...regionIds] : [],
            locationIds: locationIds ? [...locationIds] : [],
            departmentsIds: departmentsIds ? [...departmentsIds] : [],
            isAvailablity : isAvailablity ? isAvailablity : false,
            isUnavailablity : isUnavailablity ? isUnavailablity : false,
            isExcludeNotOrganized : isExcludeNotOrganized ? isExcludeNotOrganized : false,
            ShowGeneralnotes : ShowGeneralnotes ? ShowGeneralnotes : false, 
            isOnlySchedulatedCandidate : isOnlySchedulatedCandidate ? isOnlySchedulatedCandidate : false,
            startTime : startTime ? this.getstartDate : "",
            endTime : endTime ? this.getendDate : ""
          });
        }
        

        if (!this.filters.skillIds?.length) {
          this.setFilters();
        }
      });
  }

  getSkillsIds(skillOption: DropdownOption[]): number[] {
    if(this.isPreservedFilters) {
      return this.filters.skillIds as number[];
    }

    if(this.chipsSettings.editedChips) {
      return [];
    }

    return [skillOption[0]?.value as number];
  }
}
