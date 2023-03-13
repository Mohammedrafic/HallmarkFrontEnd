import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { debounceTime, filter, map, merge, Observable, Subject, switchMap, takeUntil, takeWhile } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { AbstractGridConfigurationComponent } from '../../../abstract-grid-configuration/abstract-grid-configuration.component';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { CandidatesStatusText, CandidateStatus, EmployeeStatus, STATUS_COLOR_GROUP } from '@shared/enums/status';
import { Actions, ofActionDispatched, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { UserState } from '../../../../../store/user.state';
import { GetAllSkills, SaveCandidateSucceeded } from '@agency/store/candidate.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmService } from '@shared/services/confirm.service';
import { CredentialParams } from '@shared/models/candidate-credential.model';
import { FilterService } from '@shared/services/filter.service';
import { SetHeaderState, ShowExportDialog, ShowFilterDialog } from '../../../../../store/app.actions';
import { FilteredItem } from '@shared/models/filter.model';
import { SelectionSettingsModel } from '@syncfusion/ej2-grids/src/grid/base/grid-model';
import { ApplicantStatus } from '@shared/enums/applicant-status.enum';
import { CandidateListState } from '../../store/candidate-list.state';
import {
  CandidateList,
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
import { optionFields, regionFields } from '@shared/constants';
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

  @Input() filteredItems$: Subject<number>;
  @Input() export$: Subject<ExportedFileType>;
  @Input() search$: Subject<string>;
  @Input() includeDeployedCandidates$: Subject<boolean>;
  @Input() isAgency: boolean;
  @Input() agencyActionsAllowed: boolean;
  @Input() userPermission: Permission;
  @Input() isIRP: boolean;
  @Input() set tab(tabIndex: number) {
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

  constructor(
    private store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private actions$: Actions,
    private confirmService: ConfirmService,
    private filterService: FilterService,
    private datePipe: DatePipe,
    private candidateListService: CandidateListService,
  ) {
    super();
  }

  ngOnInit(): void {
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
    this.CandidateFilterFormGroup = !this.isIRP ? this.candidateListService.generateVMSCandidateFilterForm() : this.candidateListService.generateIRPCandidateFilterForm();
    this.subscribeOnOrgStructure();
    this.subscribeOnLocationChange();
  }

  ngOnDestroy(): void {
    this.isAlive = false;
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.CandidateFilterFormGroup, this.filterColumns);
  }

  public onFilterClearAll(): void {
    this.clearFilters();
    this.dispatchNewPage();
  }

  public onFilterApply(): void {
    this.filters = this.CandidateFilterFormGroup.getRawValue();
    this.filters.profileStatuses = this.filters.profileStatuses || [];
    this.filters.regionsNames = this.filters.regionsNames || [];
    this.filters.skillsIds = this.filters.skillsIds || [];
    this.filters.candidateName = this.filters.candidateName || null;
    this.filteredItems = this.filterService.generateChips(this.CandidateFilterFormGroup, this.filterColumns);
    this.dispatchNewPage();
    this.store.dispatch(new ShowFilterDialog(false));
    this.filteredItems$.next(this.filteredItems.length);
    this.filterService.setPreservedFIltersGlobal(this.filters);
  }

  private setDefaultFilter(): void {
    if (this.filterService.canPreserveFilters() && !this.isIRP) {
      const preservedFilters = this.store.selectSnapshot(PreservedFiltersState.preservedFiltersGlobal);
      if (preservedFilters?.regions) {
        this.CandidateFilterFormGroup.get('regionsNames')?.setValue([...preservedFilters.regions]);
        this.filters.regionsNames = [...preservedFilters.regions];
        this.filteredItems = this.filterService.generateChips(this.CandidateFilterFormGroup, this.filterColumns);
        this.filteredItems$.next(this.filteredItems.length);
      }
    }
  }

  public onFilterClose(): void {
    this.candidateListService.refreshFilters(this.isIRP, this.CandidateFilterFormGroup, this.filters);
    this.filteredItems = this.filterService.generateChips(this.CandidateFilterFormGroup, this.filterColumns);
    this.filteredItems$.next(this.filteredItems.length);
  }

  public showCandidateStatus(status: number): boolean {
    return [ApplicantStatus.OnBoarded, ApplicantStatus.Accepted].includes(status);
  }

  public dataBound(): void {
    this.grid.hideScroll();
    this.contentLoadedHandler();
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
    this.store.dispatch(
      new ExportCandidateList({
        filterQuery: {
          profileStatuses: this.filters.profileStatuses!,
          regionsNames: this.filters.regionsNames!,
          skillsIds: this.filters.skillsIds!,
          includeDeployedCandidates: this.includeDeployedCandidates,
          candidateProfileIds: this.selectedItems.length
            ? this.selectedItems.map((val) => val.candidateProfileId)
            : null,

          orderBy: '',
        },
        exportFileType: fileType,
        properties: options
          ? options.columns.map((val: ExportColumn) => val.column)
          : this.columnsToExport.map((val: ExportColumn) => val.column),
        filename: options?.fileName || this.defaultFileName,
      })
    );
    this.clearSelection(this.grid);
  }

  public dispatchNewPage(): void {
    const candidateListRequest: CandidateListRequest = {
      orderBy: '',
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      profileStatuses: this.filters.profileStatuses!,
      skillsIds: this.filters.skillsIds!,
      regionsNames: this.filters.regionsNames!,
      candidateName: this.filters.candidateName!,
      tab: this.activeTab ?? 0,
      includeDeployedCandidates: this.includeDeployedCandidates,
      candidateId: this.filters.candidateId!,
      locationIds: this.filters.locationIds!,
      departmentIds: this.filters.departmentIds!,
      primarySkillIds: this.filters.primarySkillIds!,
      secondarySkillIds: this.filters.secondarySkillIds!,
      hireDate: this.filters.hireDate ? DateTimeHelper.toUtcFormat(this.filters.hireDate) : null,
    };
    this.store.dispatch(
      this.isIRP
        ? new GetIRPCandidatesByPage(candidateListRequest)
        : new GetCandidatesByPage(candidateListRequest)
    );
  }

  public regionTrackBy(index: number, region: string): string {
    return region;
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

  private addSkillRegionEllipsis(candidates: CandidateRow[]): CandidateRow[] {
    return (
      candidates &&
      candidates.map((candidate: CandidateRow) => {
        if (candidate.candidateProfileSkills.length > 2) {
          const [first, second] = candidate.candidateProfileSkills;
          candidate = {
            ...candidate,
            candidateProfileSkills: [first, second, { skillDescription: '...' }],
          };
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
          const [first, second] = candidate.employeeSkills;
          candidate = {
            ...candidate,
            employeeSkills: [first, second, '...'],
          };
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
    this.filteredItems$.next(this.filteredItems.length);
  }

  private dispatchInitialIcon(): void {
    this.store.dispatch(new SetHeaderState({ title: 'Candidates', iconName: 'clock' }));
  }

  private IRPVMSGridHandler(): void {
    if (this.isIRP) {
      this.refreshGridColumns(IRPCandidates, this.grid);
    } else {
      this.refreshGridColumns(VMSCandidates, this.grid);
    }
  }

  private subscribeOnSaveState(): void {
    merge(this.lastSelectedAgencyId$, this.lastSelectedOrgId$, this.regions$)
      .pipe(
        filter((value) => !!value),
        debounceTime(600),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        !this.isAgency && this.IRPVMSGridHandler();
        this.updateCandidates();
        this.clearFilters();
        this.setDefaultFilter();
        this.dispatchNewPage();
        this.store.dispatch([new GetAllSkills()]);
        this.store.dispatch(new GetAssignedSkillsByOrganization({ params: { SystemType: SystemType.IRP } }));
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
        this.defaultFileName = `Candidates ${this.generateDateTime(this.datePipe)}`;
        this.defaultExport(event);
      });
  }

  private setFileName(): void {
    this.fileName = `Candidates ${this.generateDateTime(this.datePipe)}`;
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
    if (this.filterService.canPreserveFilters()) {
      this.store.dispatch(new GetRegionList());
    } else {
      merge(this.lastSelectedAgencyId$, this.lastSelectedOrgId$)
        .pipe(
          filter(Boolean),
          switchMap(() => this.store.dispatch(new GetRegionList())),
          takeUntil(this.unsubscribe$)
          ).subscribe();
    }
  }
}
