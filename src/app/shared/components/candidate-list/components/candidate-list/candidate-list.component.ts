import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { debounceTime, filter, map, merge, Observable, Subject, takeUntil, takeWhile } from 'rxjs';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AbstractGridConfigurationComponent } from '../../../abstract-grid-configuration/abstract-grid-configuration.component';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { CandidatesStatusText, CandidateStatus, STATUS_COLOR_GROUP } from '@shared/enums/status';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { UserState } from '../../../../../store/user.state';
import { SaveCandidateSucceeded } from '@agency/store/candidate.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmService } from '@shared/services/confirm.service';
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
} from '../../types/candidate-list.model';
import { Candidate } from '@shared/models/candidate.model';
import {
  ChangeCandidateProfileStatus,
  ExportCandidateList,
  GetAllSkills,
  GetCandidatesByPage,
  GetRegionList,
} from '../../store/candidate-list.actions';
import { ListOfSkills } from '@shared/models/skill.model';
import { ExportColumn, ExportOptions } from '@shared/models/export.model';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { DatePipe } from '@angular/common';
import { isNil } from 'lodash';
import { optionFields, regionFields } from '@shared/constants';
import { adaptToNameEntity } from '../../../../helpers/dropdown-options.helper';
import { filterColumns } from './candidate-list.constants';
import { Permission } from '@core/interface';
import { UserPermissions } from '@core/enums';

@Component({
  selector: 'app-candidate-list',
  templateUrl: './candidate-list.component.html',
  styleUrls: ['./candidate-list.component.scss'],
})
export class CandidateListComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @ViewChild('grid') grid: GridComponent;

  @Select(CandidateListState.candidates)
  private _candidates$: Observable<CandidateList>;

  @Select(CandidateListState.listOfSkills)
  private skills$: Observable<ListOfSkills[]>;

  @Select(UserState.lastSelectedAgencyId)
  lastSelectedAgencyId$: Observable<number>;

  @Select(UserState.lastSelectedOrganizationId)
  lastSelectedOrgId$: Observable<number>;

  @Select(CandidateListState.listOfRegions)
  regions$: Observable<string[]>;

  @Input() filteredItems$: Subject<number>;
  @Input() export$: Subject<ExportedFileType>;
  @Input() search$: Subject<string>;
  @Input() includeDeployedCandidates$: Subject<boolean>;
  @Input() isAgency: boolean;
  @Input() agencyActionsAllowed: boolean;
  @Input() userPermission: Permission;
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
  public filterColumns: CandidateListFiltersColumn = filterColumns;
  public readonly statusEnum = CandidateStatus;
  public readonly candidateStatus = CandidatesStatusText;
  public candidates$: Observable<CandidateList>;
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
  public optionFields = optionFields;
  public regionFields = regionFields;

  private pageSubject = new Subject<number>();
  private includeDeployedCandidates: boolean = true;
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
    private fb: FormBuilder,
    private datePipe: DatePipe
  ) {
    super();
    this.CandidateFilterFormGroup = this.fb.group({
      candidateName: new FormControl([]),
      profileStatuses: new FormControl([]),
      regionsNames: new FormControl([]),
      skillsIds: new FormControl([]),
    });
  }

  ngOnInit(): void {
    this.dispatchInitialIcon();
    this.subscribeOnSaveState();
    this.subscribeOnPageSubject();
    this.subscribeOnActions();
    this.subscribeOnDeploydCandidates();
    this.subscribeOnSkills();
    this.subscribeOnRegions();
    this.updateCandidates();
    this.subscribeOnExportAction();
    this.setFileName();
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
  }

  public onFilterClose(): void {
    this.CandidateFilterFormGroup.setValue({
      profileStatuses: this.filters.profileStatuses || [],
      regionsNames: this.filters.regionsNames || [],
      skillsIds: this.filters.skillsIds || [],
    });
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

  public onEdit(data: any): void {
    this.router.navigate(['./edit', data.candidateProfileId], { relativeTo: this.route });
  }

  public onRemove(id: any): void {
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
    };
    this.store.dispatch(new GetCandidatesByPage(candidateListRequest));
  }

  public regionTrackBy(index: number, region: string): string {
    return region;
  }

  private updateCandidates(): void {
    this.candidates$ = this._candidates$.pipe(
      map((value: CandidateList) => {
        return {
          ...value,
          items: this.addSkillRegionEllipsis(value?.items),
        };
      })
    );
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

  private inactivateCandidate(id: number) {
    this.store
      .dispatch(new ChangeCandidateProfileStatus(id, CandidateStatus.Inactive))
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

  private subscribeOnSaveState(): void {
    merge(this.lastSelectedAgencyId$, this.lastSelectedOrgId$)
      .pipe(
        filter((value) => !!value),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.dispatchNewPage();
        this.clearFilters();
        this.store.dispatch([new GetRegionList(), new GetAllSkills()]);
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
        filter((skill) => !!skill),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((skills) => {
        this.filterColumns.skillsIds.dataSource = skills;
      });
  }

  private subscribeOnRegions(): void {
    this.regions$
      .pipe(
        filter((region) => !!region),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((regions) => {
        this.filterColumns.regionsNames.dataSource = adaptToNameEntity(regions);
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
}
