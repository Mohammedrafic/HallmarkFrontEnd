import { Component, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  debounceTime,
  filter,
  map,
  Observable,
  Subject,
  switchMap,
  takeUntil,
  takeWhile,
  tap,
  fromEvent,
  Subscription,
  distinctUntilChanged,
} from 'rxjs';
import { FormGroup } from '@angular/forms';
import { AbstractGridConfigurationComponent }
  from '../../../abstract-grid-configuration/abstract-grid-configuration.component';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { CandidatesStatusText, CandidateStatus, EmployeeStatus, STATUS_COLOR_GROUP } from '@shared/enums/status';
import { Actions, ofActionDispatched, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { UserState } from '../../../../../store/user.state';
import { GetAllSkills, SaveCandidateSucceeded } from '@agency/store/candidate.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmService } from '@shared/services/confirm.service';
import { CredentialParams } from '@shared/models/candidate-credential.model';
import { FilterService } from '@shared/services/filter.service';
import { SetHeaderState, ShowExportDialog, ShowFilterDialog, ShowToast } from '../../../../../store/app.actions';
import { FilteredItem } from '@shared/models/filter.model';
import { SelectionSettingsModel } from '@syncfusion/ej2-grids/src/grid/base/grid-model';
import { ApplicantStatus } from '@shared/enums/applicant-status.enum';
import { CandidateListState } from '../../store/candidate-list.state';
import {
  CandidateList,
  CandidateListExport,
  CandidateListFilters,
  CandidateListFiltersColumn,
  CandidateListRequest,
  CandidateRow,
  IRPCandidate,
  IRPCandidateList
} from '../../types/candidate-list.model';
import { Candidate } from '@shared/models/candidate.model';
import {
  ChangeCandidateProfileStatus,
  DeleteIRPCandidate,
  ExportCandidateList,
  ExportIRPCandidateList,
  GetCandidatesByPage,
  GetIRPCandidatesByPage,
  GetRegionList
} from '../../store/candidate-list.actions';
import { ListOfSkills, MasterSkill } from '@shared/models/skill.model';
import { CandidateState } from '@agency/store/candidate.state';
import { ExportColumn, ExportOptions } from '@shared/models/export.model';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { DatePipe } from '@angular/common';
import { isNil } from 'lodash';
import { END_DATE_REQUIRED, ERROR_START_LESS_END_DATE, optionFields, regionFields } from '@shared/constants';
import { adaptToNameEntity } from '../../../../helpers/dropdown-options.helper';
import { filterColumns, IRPCandidates, IRPFilterColumns, VMSCandidates } from './candidate-list.constants';
import { Permission } from '@core/interface';
import { UserPermissions } from '@core/enums';
import { PreservedFiltersState } from 'src/app/store/preserved-filters.state';
import { MultiSelectComponent } from '@syncfusion/ej2-angular-dropdowns';
import { CandidateListService } from '../../services/candidate-list.service';
import { OrganizationDepartment, OrganizationLocation, OrganizationStructure } from '@shared/models/organization.model';
import { getIRPOrgItems } from '@core/helpers/org-structure.helper';
import { DepartmentHelper } from '@client/candidates/departments/helpers/department.helper';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { GetAssignedSkillsByOrganization } from '@organization-management/store/organization-management.actions';
import { SystemType } from '@shared/enums/system-type.enum';
import { DateTimeHelper } from '@core/helpers';
import { PreservedFiltersByPage } from '@core/interface/preserved-filters.interface';
import * as PreservedFilters from 'src/app/store/preserved-filters.actions';
import { FilterPageName } from '@core/enums/filter-page-name.enum';
import { MessageTypes } from '@shared/enums/message-types';
import { ScrollRestorationService } from '@core/services/scroll-restoration.service';
import { CandidateListScroll } from './candidate-list.enum';
import { OutsideZone } from '@core/decorators';

@Component({
  selector: 'app-candidate-list',
  templateUrl: './candidate-list.component.html',
  styleUrls: ['./candidate-list.component.scss'],
})
export class CandidateListComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @ViewChild('grid') grid: GridComponent;
  @ViewChild('regionMultiselect') public readonly regionMultiselect: MultiSelectComponent;

  @Select(CandidateListState.candidates)
  private _candidates$: Observable<CandidateList>;

  @Select(CandidateListState.IRPCandidates)
  private _IRPCandidates$: Observable<IRPCandidateList>;

  @Select(CandidateState.skills)
  private skills$: Observable<MasterSkill[]>;

  @Select(UserState.lastSelectedAgencyId)
  lastSelectedAgencyId$: Observable<number>;

  @Select(UserState.lastSelectedOrganizationId)
  lastSelectedOrgId$: Observable<number>;

  @Select(CandidateListState.listOfRegions)
  regions$: Observable<string[]>;

  @Select(UserState.organizationStructure)
  organizationStructure$: Observable<OrganizationStructure>;

  @Select(OrganizationManagementState.assignedSkillsByOrganization)
  assignedSkills$: Observable<ListOfSkills[]>;

  @Select(PreservedFiltersState.preservedFiltersByPageName)
  private readonly preservedFiltersByPageName$: Observable<PreservedFiltersByPage<CandidateListFilters>>;

  @Input() public credEndDate: string;
  @Input() public credStartDate: string;
  @Input() public credType: number;
  @Input() public filteredItems$: Subject<number>;
  @Input() public export$: Subject<ExportedFileType>;
  @Input() public search$: Subject<string>;
  @Input() public includeDeployedCandidates$: Subject<boolean>;
  @Input() public isAgency: boolean;
  @Input() public agencyActionsAllowed: boolean;
  @Input() public userPermission: Permission;
  @Input() public isIRP: boolean;
  @Input() public set tab(tabIndex: number) {
    if (!isNil(tabIndex)) {
      this.activeTab = tabIndex;
      this.dispatchNewPage();
    }
  }

  public filters: CandidateListFilters = {
    candidateName: null,
    profileStatuses: [],
    regionsNames: [],
    skillsIds: [],
    tab: 0,
    expiry : {
      endDate : undefined,
      startDate : undefined,
      type : [],
    },
    endDate : null,
    startDate : null,
    credType : []
  };
  public CandidateFilterFormGroup: FormGroup;
  public filterColumns: CandidateListFiltersColumn;
  public allLocations: OrganizationLocation[];
  public readonly statusEnum = CandidateStatus;
  public readonly employeeStatusEnum = EmployeeStatus;
  public readonly candidateStatus = CandidatesStatusText;
  public candidates$: Observable<CandidateList | IRPCandidateList>;
  public readonly userPermissions = UserPermissions;
  public columnsToExport: ExportColumn[] = [
    { text: 'Name', column: 'Name' },
    { text: 'Profile Status', column: 'ProfileStatus' },
    { text: 'Candidate Status', column: 'CandidateStatus' },
    { text: 'Skills', column: 'Skill' },
    { text: 'Current Assignment End Date', column: 'CurrentAssignmentEndDate' },
    { text: 'Region', column: 'Region' },
  ];
  public columnsToExportIrp: ExportColumn[] = [
    { text: 'Id', column: 'Id' },
    { text: 'Name', column: 'Name' },
    { text: 'Profile Status', column: 'Status' },
    { text: 'Primary Skill', column: 'PrimarySkill' },
    { text: 'Secondary Skill', column: 'SecondarySkill' },
    { text: 'Location', column: 'Location' },
    { text: 'Department', column: 'Department' },
    { text: 'Work Commitment', column: 'WorkCommitment' },
    { text: 'Hire Date', column: 'HireDate' },
  ];
  public exportUsers$ = new Subject<ExportedFileType>();
  public defaultFileName: string;
  public fileName: string;
  public selectionOptions: SelectionSettingsModel = {
    type: 'Single',
    mode: 'Row',
    checkboxMode: 'ResetOnRowClick',
    persistSelection: true,
  };
  public readonly optionFields = optionFields;
  public readonly regionFields = regionFields;

  private pageSubject = new Subject<number>();
  private includeDeployedCandidates = true;
  private unsubscribe$: Subject<void> = new Subject();
  private isAlive = true;
  private activeTab: number;
  private scrollSubscription: Subscription;

  constructor(
    private store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private actions$: Actions,
    private confirmService: ConfirmService,
    private filterService: FilterService,
    private datePipe: DatePipe,
    private candidateListService: CandidateListService,
    private scrollService: ScrollRestorationService,
    private readonly ngZone: NgZone,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initCandidateFilterForm();
    this.getRegions();
    this.dispatchInitialIcon();
    this.subscribeOnSaveState();
    this.subscribeOnPageSubject();
    this.subscribeOnActions();
    this.subscribeOnDeploydCandidates();
    this.subscribeOnSkills();
    this.subscribeOnExportAction();
    this.setFileName();
    this.filterColumns = !this.isIRP ? filterColumns : IRPFilterColumns;
    this.subscribeOnRegions();
    this.subscribeOnOrgStructure();
    this.subscribeOnLocationChange();
    this.syncFilterTagsWithControls();
  }

  ngOnDestroy(): void {
    this.isAlive = false;
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.store.dispatch(new PreservedFilters.ResetPageFilters());
  }

  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.CandidateFilterFormGroup, this.filterColumns);
    this.CandidateFilterFormGroup.markAsDirty();
  }

  public onFilterClearAll(): void {
    this.store.dispatch(new PreservedFilters.ClearPageFilters(this.getPageName()));
    this.clearFilters();
    this.dispatchNewPage();
  }

  public onFilterApply(): void {
    if(this.isIRP){
     
        if ((this.CandidateFilterFormGroup.get("startDate") != null && this.CandidateFilterFormGroup.get("endDate") != null) && new Date(this.CandidateFilterFormGroup.get("endDate")?.value) >= new Date(this.CandidateFilterFormGroup.get("startDate")?.value)) {
         
          if (this.CandidateFilterFormGroup.dirty) {
            this.filters = this.CandidateFilterFormGroup.getRawValue();
            this.filters.profileStatuses = this.filters.profileStatuses || [];
            this.filters.regionsNames = this.filters.regionsNames || [];
            this.filters.skillsIds = this.filters.skillsIds || [];
            this.filters.candidateName = this.filters.candidateName || null;
            this.filters.expiry = {
              type: this.filters.credType || [],
              startDate: this.filters.startDate ? DateTimeHelper.toUtcFormat(this.filters.startDate) : null,
              endDate: this.filters.endDate ? DateTimeHelper.toUtcFormat(this.filters.endDate) : null,
            };

            this.saveFiltersByPageName(this.filters);
            this.dispatchNewPage();
            this.store.dispatch(new ShowFilterDialog(false));
            this.CandidateFilterFormGroup.markAsPristine();
          } else {
            this.store.dispatch(new ShowFilterDialog(false));
          }
      //  }
          // else {
          //   this.store.dispatch(new ShowToast(MessageTypes.Error, ERROR_START_LESS_END_DATE));
          // }
        }
        else {
          this.store.dispatch(new ShowToast(MessageTypes.Error, END_DATE_REQUIRED));
    //    }
      } 
    } else {
      if (this.CandidateFilterFormGroup.dirty) {
        this.filters = this.CandidateFilterFormGroup.getRawValue();
        this.filters.profileStatuses = this.filters.profileStatuses || [];
        this.filters.regionsNames = this.filters.regionsNames || [];
        this.filters.skillsIds = this.filters.skillsIds || [];
        this.filters.candidateName = this.filters.candidateName || null;
        this.filters.hireDate = this.filters.hireDate ? DateTimeHelper.toUtcFormat(this.filters.hireDate) : null,
          this.filters.expiry = {
            type: this.filters.credType || [],
            startDate: this.filters.startDate ? DateTimeHelper.toUtcFormat(this.filters.startDate) : null,
            endDate: this.filters.endDate ? DateTimeHelper.toUtcFormat(this.filters.endDate) : null,
          };

        this.saveFiltersByPageName(this.filters);
        this.dispatchNewPage();
        this.store.dispatch(new ShowFilterDialog(false));
        this.CandidateFilterFormGroup.markAsPristine();
      } else {
        this.store.dispatch(new ShowFilterDialog(false));
      }
    }
  }

  public onFilterClose(): void {
    this.candidateListService.refreshFilters(this.isIRP, this.CandidateFilterFormGroup, this.filters);
  }

  public showCandidateStatus(status: number): boolean {
    return [ApplicantStatus.OnBoarded, ApplicantStatus.Accepted].includes(status);
  }

  public dataBound(): void {
    this.grid.hideScroll();
    this.contentLoadedHandler();
    this.createScrollSubscription();
    this.checkScroll();
  }

  public onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.pageSettings = { ...this.pageSettings, pageSize: this.pageSize };
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

  public getChipCssClass(status: string): string {
    const found = Object.entries(STATUS_COLOR_GROUP).find((item) => item[1].includes(status));
    return found ? found[0] : 'e-default';
  }

  public onEdit(data: CandidateRow | IRPCandidate): void {
    const credentialParams: CredentialParams = {
      isNavigatedFromOrganizationArea: false,
      candidateStatus: null,
      orderId: null,
    };
    this.router.navigate(
      ['./edit', (data as CandidateRow).candidateProfileId || (data as IRPCandidate).id],
      { relativeTo: this.route, state: credentialParams }
    );
  }

  public onRemove(id: number): void {
    this.confirmService
      .confirm('Are you sure you want to inactivate the Candidate?', {
        okButtonLabel: 'Inactivate',
        okButtonClass: 'delete-button',
        title: 'Inactivate the Candidate',
      })
      .pipe(
        filter((confirm) => !!confirm),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.inactivateCandidate(id);
      });
  }

  public closeExport(): void {
    this.setFileName();
    this.store.dispatch(new ShowExportDialog(false));
  }

  public export(event: ExportOptions): void {
    this.closeExport();
    this.defaultExport(event.fileType, event);
  }

  public override defaultExport(fileType: ExportedFileType, options?: ExportOptions): void {
    const columnMap = this.isIRP ? this.columnsToExportIrp : this.columnsToExport;
    const requestBody: CandidateListExport = {
      filterQuery: this.getFilterValues(),
      exportFileType: fileType,
      properties: options
        ? options.columns.map((val: ExportColumn) => val.column)
        : columnMap.map((val: ExportColumn) => val.column),
      filename: options?.fileName || this.defaultFileName,
    };
    let exportRequest;
    if (this.isIRP) {
      exportRequest = new ExportIRPCandidateList(requestBody);
    } else {
      exportRequest = new ExportCandidateList(requestBody);
    }

    this.store.dispatch(exportRequest);
    this.clearSelection(this.grid);
  }

  public dispatchNewPage(firstDispatch = false): void {

    const candidateListRequest: CandidateListRequest = {
      ...this.getFilterValues(),
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      orderBy: this.orderBy,
    };
    this.store.dispatch(
      this.isIRP
        ? new GetIRPCandidatesByPage(candidateListRequest)
        : new GetCandidatesByPage(candidateListRequest)
    );

    if (!firstDispatch) {
      this.onFilterClose();
    }
  }

  public regionTrackBy(index: number, region: string): string {
    return region;
  }

  private initCandidateFilterForm(): void {
    this.CandidateFilterFormGroup = !this.isIRP
      ? this.candidateListService.generateVMSCandidateFilterForm()
      : this.candidateListService.generateIRPCandidateFilterForm();
  }

  private updateCandidates(): void {
    if (this.isIRP) {
      this.candidates$ = this._IRPCandidates$.pipe(
        map((value: IRPCandidateList) => {
          return {
            ...value,
            items: this.addEmployeeSkillEllipsis(value?.items),
          };
        })
      );
    } else {
      this.candidates$ = this._candidates$.pipe(
        map((value: CandidateList) => {
          return {
            ...value,
            items: this.addSkillRegionEllipsis(value?.items),
          };
        })
      );
    }
  }

  private getFilterValues(): CandidateListRequest {
    const filter: CandidateListRequest = {
      profileStatuses: this.filters.profileStatuses!,
      skillsIds: this.filters.skillsIds!,
      regionsNames: this.filters.regionsNames!,
      tab: this.activeTab ?? 0,
      candidateName: this.filters.candidateName!,
      candidateId: this.filters.candidateId!,
      locationIds: this.filters.locationIds!,
      departmentIds: this.filters.departmentIds!,
      primarySkillIds: this.filters.primarySkillIds!,
      secondarySkillIds: this.filters.secondarySkillIds!,
      hireDate: this.filters.hireDate ? DateTimeHelper.toUtcFormat(this.filters.hireDate) : null,
      includeDeployedCandidates: this.includeDeployedCandidates,
      expiry : {
        type : this.filters.credType! ? this.filters.credType! : [],
        startDate : this.filters.startDate! ? DateTimeHelper.toUtcFormat(this.filters.startDate!) : null,
        endDate : this.filters.endDate! ? DateTimeHelper.toUtcFormat(this.filters.endDate!) : null,
      },
      orderBy: this.orderBy,
    };
    return filter;
  }

  private addSkillRegionEllipsis(candidates: CandidateRow[]): CandidateRow[] {
    return (
      candidates &&
      candidates.map((candidate: CandidateRow) => {
        if (candidate.candidateProfileSkills.length > 2) {
          // const [first, second] = candidate.candidateProfileSkills;
          // candidate = {
          //   ...candidate,
          //   candidateProfileSkills: [first, second, { skillDescription: '...' }],
          // };
        }
        if (candidate.candidateProfileRegions.length > 2) {
          const [first, second] = candidate.candidateProfileRegions;
          candidate = {
            ...candidate,
            candidateProfileRegions: [first, second, { regionDescription: '...' }],
          };
        }

        return candidate;
      })
    );
  }

  private addEmployeeSkillEllipsis(candidates: IRPCandidate[]): IRPCandidate[] {
    return (
      candidates &&
      candidates.map((candidate: IRPCandidate) => {
        if (candidate.employeeSkills?.length > 2) {
          // const [first, second] = candidate.employeeSkills;
          // candidate = {
          //   ...candidate,
          //   employeeSkills: [first, second, '...'],
          // };
        }

        return candidate;
      })
    );
  }

  private inactivateCandidate(id: number) {
    const ChangeCandidateStatusAction = this.isIRP
      ? new DeleteIRPCandidate(id)
      : new ChangeCandidateProfileStatus(id, CandidateStatus.Inactive);

    this.store
      .dispatch(ChangeCandidateStatusAction)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.dispatchNewPage();
      });
  }

  private clearFilters(): void {
    this.CandidateFilterFormGroup.reset();
    this.filteredItems = [];
    this.currentPage = 1;
    this.filters = {};
  }

  private dispatchInitialIcon(): void {
    this.store.dispatch(new SetHeaderState({ title: this.isIRP ? 'Employees' : 'Candidates', iconName: 'clock' }));
  }


  private IRPVMSGridHandler(): void {
    if (this.isIRP) {
      this.refreshGridColumns(IRPCandidates, this.grid);
    } else {
      this.refreshGridColumns(VMSCandidates, this.grid);
    }
  }

  private subscribeOnSaveState(): void {
    this.getLastSelectedBusinessUnitId().pipe(
      tap(() => {
        this.store.dispatch([
          new GetAllSkills(),
          new GetAssignedSkillsByOrganization({ params: { SystemType: SystemType.IRP } }),
        ]);
        this.getPreservedFiltersByPage();
      }),
      switchMap(() => this.preservedFiltersByPageName$),
      filter(({ dispatch }) => dispatch),
      tap((filters) => {

        if (!filters.isNotPreserved) {
          this.filters = { ...filters.state };
        }

        if(this.credStartDate != undefined){
          this.filters.startDate = DateTimeHelper.toUtcFormat(this.credStartDate);
        }
        if(this.credEndDate != undefined){
          this.filters.endDate = DateTimeHelper.toUtcFormat(this.credEndDate);
        }
        if(this.credType != null){
          this.filters.credType = [this.credType];
        }

        this.dispatchNewPage(true);
      }),

      switchMap(() => this.getStructure()),
      filter((structure) => !!structure),
      switchMap(() => this.skills$),
      filter((skills) => !!skills),
      takeUntil(this.unsubscribe$)
    )
      .subscribe(() => {
        !this.isAgency && this.IRPVMSGridHandler();
        this.updateCandidates();
        this.candidateListService.refreshFilters(this.isIRP, this.CandidateFilterFormGroup, this.filters);
      });
  }


  private subscribeOnPageSubject(): void {
    this.pageSubject.pipe(debounceTime(1), takeUntil(this.unsubscribe$)).subscribe((page) => {
      this.currentPage = page;
      this.dispatchNewPage();
    });
  }

  private subscribeOnActions(): void {
    this.actions$
      .pipe(ofActionSuccessful(SaveCandidateSucceeded), takeUntil(this.unsubscribe$))
      .subscribe((agency: { payload: Candidate }) => {
        this.dispatchNewPage();
      });

    this.actions$.pipe(
      ofActionDispatched(ShowFilterDialog),
      debounceTime(300),
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.regionMultiselect?.refresh();
    });
  }

  private subscribeOnDeploydCandidates(): void {
    this.includeDeployedCandidates$.pipe(takeUntil(this.unsubscribe$)).subscribe((isInclude: boolean) => {
      this.includeDeployedCandidates = isInclude;
      this.dispatchNewPage();
    });
  }

  private subscribeOnSkills(): void {
    this.skills$
      .pipe(
        filter(Boolean),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((skills) => {
        if (this.filterColumns?.skillsIds) {
          this.filterColumns.skillsIds.dataSource = skills;
        }
      });

    this.assignedSkills$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((skills) => {
        if (this.filterColumns?.primarySkillIds && this.filterColumns?.secondarySkillIds) {
          this.filterColumns.primarySkillIds.dataSource = skills;
          this.filterColumns.secondarySkillIds.dataSource = skills;
        }
      });
  }

  private subscribeOnRegions(): void {
    this.regions$
      .pipe(
        filter((region) => !!region),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((regions) => {
        if (this.filterColumns.regionsNames) {
          this.filterColumns.regionsNames.dataSource = adaptToNameEntity(regions);
        }
      });
  }

  private subscribeOnExportAction(): void {
    this.export$
      .pipe(
        takeWhile(() => this.isAlive),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((event: ExportedFileType) => {
        const type = this.isIRP ? 'Employees' : 'Candidates';
        this.defaultFileName = `${type} ${this.generateDateTime(this.datePipe)}`;
        this.defaultExport(event);
      });
  }

  private setFileName(): void {
    const type = this.isIRP ? 'Employees' : 'Candidates';
    this.fileName = `${type} ${this.generateDateTime(this.datePipe)}`;
  }

  private subscribeOnOrgStructure(): void {
    this.organizationStructure$
      .pipe(takeUntil(this.unsubscribe$), filter(Boolean))
      .subscribe((structure: OrganizationStructure) => {
        this.allLocations = [];
        structure.regions.forEach(region => {
          region.locations && this.allLocations.push(...getIRPOrgItems(region.locations));
        });
        if (this.filterColumns.locationIds) {
          this.filterColumns.locationIds.dataSource = this.allLocations;
        }
      });
  }

  private subscribeOnLocationChange(): void {
    this.CandidateFilterFormGroup.get('locationIds')?.valueChanges
      .pipe(filter(Boolean), takeUntil(this.unsubscribe$))
      .subscribe((val: number[]) => {
        if (this.filterColumns.departmentIds) {
          this.filterColumns.departmentIds.dataSource = [];
          if (val?.length) {
            const locationDataSource = this.filterColumns.locationIds?.dataSource as OrganizationLocation[];
            const selectedLocations: OrganizationLocation[] = DepartmentHelper.findSelectedItems(
              val,
              locationDataSource
            ) as OrganizationLocation[];
            const locationDepartments: OrganizationDepartment[] = selectedLocations.flatMap(
              (location) => location.departments
            );

            this.filterColumns.departmentIds.dataSource = getIRPOrgItems(locationDepartments);
          } else {
            this.CandidateFilterFormGroup.get('departmentIds')?.setValue([]);
          }
        }
      });
  }

  private getRegions(): void {

    this.getLastSelectedBusinessUnitId()
      .pipe(
        filter(Boolean),
        switchMap(() => this.store.dispatch(new GetRegionList())),
        takeUntil(this.unsubscribe$)
      ).subscribe();
  }

  private syncFilterTagsWithControls(): void {
    this.filterService
      .syncFilterTagsWithControls(this.CandidateFilterFormGroup, this.filterColumns)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((filteredItems) => {
        this.filteredItems = filteredItems;
        this.filteredItems$.next(this.filteredItems.length);
      });
  }

  private getPreservedFiltersByPage(): void {
    this.store.dispatch(new PreservedFilters.GetPreservedFiltersByPage(this.getPageName()));
  }

  private saveFiltersByPageName(filters: CandidateListFilters): void {
    this.store.dispatch(new PreservedFilters.SaveFiltersByPageName(this.getPageName(), filters));
  }

  private getPageName(): FilterPageName {
    if (this.isIRP) {
      return FilterPageName.CandidatesIRPOrganization;
    }
    if (this.isAgency) {
      return FilterPageName.CandidatesVMSAgency;
    } else {
      return FilterPageName.CandidatesVMSOrganization;
    }
  }

  private getLastSelectedBusinessUnitId(): Observable<number> {
    const businessUnitId$ = this.isAgency ? this.lastSelectedAgencyId$ : this.lastSelectedOrgId$;
    return businessUnitId$;
  }

  private getStructure(): Observable<OrganizationStructure> | Observable<string[]> {
    const structure$ = this.isAgency ? this.regions$ : this.organizationStructure$;
    return structure$;
  }

  @OutsideZone
  private checkScroll(): void {
    setTimeout(() => {
      this.checkScrollPosition();
    }, 500);
  }

  private createScrollSubscription(): void {
    if (!this.scrollSubscription) {
      const element = this.grid.element.querySelectorAll('.e-content')[0];

      this.scrollSubscription = fromEvent(element, 'scroll')
      .pipe(
        debounceTime(500),
        map(() => {
          return element.scrollTop;
        }),
        distinctUntilChanged(),
        takeUntil(this.unsubscribe$),
      )
      .subscribe((position) => {
        this.scrollService.setScrollPosition(CandidateListScroll.CandidateList, position);
      });
    }
  }

  public checkScrollPosition(): void {
    const scrollValue = this.scrollService.getScrollPosition(CandidateListScroll.CandidateList);

    if (scrollValue === undefined) {
      this.scrollService.createScrollPositionStorage(CandidateListScroll.CandidateList);
    } else {
      this.restoreScrollPosition(scrollValue);
    }
  }

  private restoreScrollPosition(position: number): void {
    this.grid.element.querySelectorAll('.e-content')[0].scrollTop = position;
  }
}
