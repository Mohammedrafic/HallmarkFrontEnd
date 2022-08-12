import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { debounceTime, filter, map, Observable, Subject, takeUntil, takeWhile } from 'rxjs';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AbstractGridConfigurationComponent } from '../../../abstract-grid-configuration/abstract-grid-configuration.component';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { CandidateStatus, CandidateStatusOptions, STATUS_COLOR_GROUP } from '../../../../enums/status';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { UserState } from '../../../../../store/user.state';
import { SaveCandidateSucceeded } from '@agency/store/candidate.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmService } from '../../../../services/confirm.service';
import { FilterService } from '../../../../services/filter.service';
import { SetHeaderState, ShowExportDialog, ShowFilterDialog } from '../../../../../store/app.actions';
import { FilteredItem } from '../../../../models/filter.model';
import { SelectionSettingsModel } from '@syncfusion/ej2-grids/src/grid/base/grid-model';
import { ApplicantStatus } from '../../../../enums/applicant-status.enum';
import { CandidateListState } from '../../store/candidate-list.state';
import {
  CandidateList,
  CandidateListFilters,
  CandidateListFiltersColumn,
  CandidateListRequest,
  CandidateRow,
} from '../../types/candidate-list.model';
import { Candidate } from '../../../../models/candidate.model';
import {
  ChangeCandidateProfileStatus,
  ExportCandidateList,
  GetAllSkills,
  GetCandidatesByPage,
} from '../../store/candidate-list.actions';
import { ControlTypes, ValueType } from '../../../../enums/control-types.enum';
import { ListOfSkills } from '../../../../models/skill.model';
import { ExportColumn, ExportOptions } from '../../../../models/export.model';
import { ExportedFileType } from '../../../../enums/exported-file-type';
import { DatePipe } from '@angular/common';

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

  @Input() filteredItems$: Subject<number>;
  @Input() export$: Subject<ExportedFileType>;
  @Input() search$: Subject<string>;
  @Input() includeDeployedCandidates$: Subject<boolean>;
  @Input() isAgency: boolean;

  public filters: CandidateListFilters = {
    profileStatuses: [],
    regionsIds: [],
    skillsIds: [],
  };
  public CandidateFilterFormGroup: FormGroup;
  public filterColumns: CandidateListFiltersColumn;
  public readonly statusEnum = CandidateStatus;
  public candidates$: Observable<CandidateList>;
  public columnsToExport: ExportColumn[] = [
    { text: 'Name', column: 'Name' },
    { text: 'Profile Status', column: 'ProfileStatus' },
    { text: 'Candidate Status', column: 'CandidateStatus' },
    { text: 'Skills', column: 'Skill' },
    { text: 'Current Assignment End Date', column: 'LastAssignmentEndDate' },
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
  public optionFields = {
    text: 'name',
    value: 'id',
  };

  private pageSubject = new Subject<number>();
  private includeDeployedCandidates: boolean = true;
  private unsubscribe$: Subject<void> = new Subject();
  private isAlive = true;

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
      profileStatuses: new FormControl([]),
      regionsIds: new FormControl([]),
      skillsIds: new FormControl([]),
    });
  }

  ngOnInit(): void {
    this.subscribeOnInitialData();
    this.updateCandidates();
    this.candidateFilterSetup();
    this.onSkillDataLoadHandler();
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
    this.filters.regionsIds = this.filters.regionsIds || [];
    this.filters.skillsIds = this.filters.skillsIds || [];
    this.filteredItems = this.filterService.generateChips(this.CandidateFilterFormGroup, this.filterColumns);
    this.dispatchNewPage();
    this.store.dispatch(new ShowFilterDialog(false));
    this.filteredItems$.next(this.filteredItems.length);
    console.log('LSAJHDJLFJAHSLDJFHLJAH', this.filterColumns);
  }

  public onFilterClose(): void {
    this.CandidateFilterFormGroup.setValue({
      profileStatuses: this.filters.profileStatuses || [],
      regionsIds: this.filters.regionsIds || [],
      skillsIds: this.filters.skillsIds || [],
    });
    this.filteredItems = this.filterService.generateChips(this.CandidateFilterFormGroup, this.filterColumns);
    this.filteredItems$.next(this.filteredItems.length);
  }

  public getCandidateStatusName(status: number): string {
    switch (status) {
      case ApplicantStatus.OnBoarded:
        return 'Onboard';
        break;
      case ApplicantStatus.Accepted:
        return 'Accepted';
        break;
      default:
        return '';
    }
  }

  public dataBound(): void {
    this.grid.hideScroll();
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
      .pipe(filter((confirm) => !!confirm))
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
          regionsIds: this.filters.regionsIds!,
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

  private updateCandidates(): void {
    this.candidates$ = this._candidates$.pipe(
      map((value: CandidateList) => {
        return {
          ...value,
          items: this.addSkillEllipsis(value?.items),
        };
      })
    );
  }

  private addSkillEllipsis(candidates: CandidateRow[]): any {
    return (
      candidates &&
      candidates.map((candidate: CandidateRow) => {
        if (candidate.candidateProfileSkills.length > 2) {
          const [first, second] = candidate.candidateProfileSkills;
          return {
            ...candidate,
            candidateProfileSkills: [first, second, { skillDescription: '...' }],
          };
        } else {
          return candidate;
        }
      })
    );
  }

  private inactivateCandidate(id: number) {
    this.store.dispatch(new ChangeCandidateProfileStatus(id, CandidateStatus.Inactive)).subscribe(() => {
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

  private dispatchNewPage(): void {
    const candidateListRequest: CandidateListRequest = {
      orderBy: '',
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      profileStatuses: this.filters.profileStatuses!,
      skillsIds: this.filters.skillsIds!,
      regionsIds: this.filters.regionsIds!,
      includeDeployedCandidates: this.includeDeployedCandidates,
    };
    this.store.dispatch(new GetCandidatesByPage(candidateListRequest));
  }

  private candidateFilterSetup(): void {
    this.filterColumns = {
      regionsIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      skillsIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      profileStatuses: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: CandidateStatusOptions,
        valueField: 'name',
        valueId: 'id',
      },
    };
  }

  private subscribeOnInitialData(): void {
    this.store.dispatch(new SetHeaderState({ title: 'Candidates', iconName: 'clock' }));
    if (this.isAgency) {
      this.lastSelectedAgencyId$.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
        this.dispatchNewPage();
        this.clearFilters();
      });
    } else {
      this.lastSelectedOrgId$.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
        this.dispatchNewPage();
        this.clearFilters();
      });
    }
    this.pageSubject.pipe(debounceTime(1)).subscribe((page) => {
      this.currentPage = page;
      this.dispatchNewPage();
    });
    this.actions$
      .pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(SaveCandidateSucceeded))
      .subscribe((agency: { payload: Candidate }) => {
        this.dispatchNewPage();
      });
    this.includeDeployedCandidates$.subscribe((isInclude: boolean) => {
      this.includeDeployedCandidates = isInclude;
      this.dispatchNewPage();
    });
  }

  private onSkillDataLoadHandler(): void {
    this.store.dispatch(new GetAllSkills());
    this.skills$.pipe(takeUntil(this.unsubscribe$)).subscribe((skills) => {
      if (skills && skills.length > 0) {
        this.filterColumns.skillsIds.dataSource = skills;
      }
    });
  }

  private subscribeOnExportAction(): void {
    this.export$.pipe(takeWhile(() => this.isAlive)).subscribe((event: ExportedFileType) => {
      this.defaultFileName = `Candidate List/${this.generateDateTime(this.datePipe)}`;
      this.defaultExport(event);
    });
  }

  private setFileName(): void {
    this.fileName = `Candidate List/${this.generateDateTime(this.datePipe)}`;
  }
}
