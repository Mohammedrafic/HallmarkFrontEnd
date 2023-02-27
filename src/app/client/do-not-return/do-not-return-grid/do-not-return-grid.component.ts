import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild, OnDestroy, NgZone } from '@angular/core';
import { DonotReturnState } from '@admin/store/donotreturn.state';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { UserPermissions } from '@core/enums';
import { CustomFormGroup, Permission } from '@core/interface';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { ShowExportDialog, ShowFilterDialog, ShowSideDialog } from 'src/app/store/app.actions';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import {
  DonoreturnAddedit, DoNotReturnsPage,
  AllOrganization, GetLocationByOrganization, DoNotReturnCandidateSearchFilter, DoNotReturnCandidateListSearchFilter, DoNotReturnSearchCandidate, DonoreturnFilter
} from '@shared/models/donotreturn.model';
import { DoNotReturn } from '@admin/store/donotreturn.actions';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { AbstractControl, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { UserState } from 'src/app/store/user.state';
import { User } from '@shared/models/user.model';
import { BLOCK_RECORD_TEXT, BLOCK_RECORD_TITLE, CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { ConfirmService } from '@shared/services/confirm.service';
import { AdminState } from '@admin/store/admin.state';
import { OrganizationDataSource } from '@shared/models/organization.model';
import { GetOrganizationDataSources, GetOrganizationsByPage, SetDirtyState } from '@admin/store/admin.actions';
import { DoNotReturnFilterForm, DoNotReturnForm } from '../do-not-return.interface';
import { DoNotReturnFormService } from '../do-not-return.form.service';
import { ChangeEventArgs, FieldSettingsModel, FilteringEventArgs, MultiSelectComponent } from '@syncfusion/ej2-angular-dropdowns';
import { EmitType } from '@syncfusion/ej2-base';
import { OutsideZone } from '@core/decorators';
import { Location } from '@shared/models/visibility-settings.model';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { doNotReturnFilterConfig, MasterDNRExportCols, WATERMARK } from '../donotreturn-grid.constants';
import { DatePipe } from '@angular/common';
import { FilterService } from '@shared/services/filter.service';
import { UserAgencyOrganization } from '@shared/models/user-agency-organization.model';

@Component({
  selector: 'app-do-not-return-grid',
  templateUrl: './do-not-return-grid.component.html',
  styleUrls: ['./do-not-return-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DoNotReturnGridComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  public organizationAgencyControl: FormControl = new FormControl();
  public generalInformationForm: FormGroup;
  public locationIdControl: AbstractControl;
  public columnsToExport: ExportColumn[] = MasterDNRExportCols;
  public filterColumns = doNotReturnFilterConfig;
  public customAttributes: object;
  public location: Location[];
  public doNotReturnForm: FormGroup;
  public isEdit: boolean = false;
  public doNotReturnFormGroup: CustomFormGroup<DoNotReturnForm>;
  public doNotReturnFilterForm: CustomFormGroup<DoNotReturnFilterForm>;
  public fileName: string;
  public defaultFileName: string;
  public readonly userPermissions = UserPermissions;
  public CandidateNames: DoNotReturnSearchCandidate[];
  public masterDonotreturn: DonoreturnAddedit[] = [];
  public submited: boolean = false;
  public editedDNRId?: number;
  public candidateNameFields: FieldSettingsModel = { text: 'fullName', value: 'id' };
  public remoteWaterMark: string = WATERMARK;

  public optionFields = {
    text: 'name',
    value: 'id',
  };

  public readonly orgsFields = {
    text: 'name',
    value: 'organizationId',
  };

  public filters: DonoreturnFilter = {};

  private pageSubject = new Subject<number>();
  private unsubscribe$: Subject<void> = new Subject();
  private selectedOrganization: AllOrganization;

  @Input() isActive = false;
  @Input() public isMobile: boolean;
  @Input() public userIsAdmin: boolean;
  @Input() export$: Subject<ExportedFileType>;
  @Input() userPermission: Permission;
  @Input() filteredItems$: Subject<number>;

  @ViewChild('grid')
  public grid: GridComponent;
  @ViewChild('locationMultiselect') public locationMultiselect: MultiSelectComponent;

  @Select(DonotReturnState.donotreturnpage)
  public donotreturnpage$: Observable<DoNotReturnsPage>;

  @Select(AdminState.organizationDataSources)
  public organizationDataSources$: Observable<OrganizationDataSource>;

  @Select(UserState.user)
  public user$: Observable<User>;

  @Select(DonotReturnState.GetMasterDoNotReturn)
  masterDoNotReturn$: Observable<DonoreturnAddedit[]>;

  @Select(DonotReturnState.allOrganizations)
  allOrganizations$: Observable<UserAgencyOrganization>;


  @Select(DonotReturnState.GetLocationsByOrgId)
  locations$: Observable<GetLocationByOrganization[]>;


  get reasonControl(): AbstractControl | null {
    return this.doNotReturnForm.get('firstName');
  }

  get dialogHeader(): string {
    return this.isEdit ? 'Edit' : 'Add';
  }

  constructor(private store: Store, private confirmService: ConfirmService, private readonly fb: FormBuilder,
    private donoreturnservice: DoNotReturnFormService, private readonly ngZone: NgZone,
    private actions$: Actions,
    private filterService: FilterService,
    private datePipe: DatePipe,) {
    super();
    this.doNotReturnFormGroup = this.donoreturnservice.createDoNotreturnForm();
    this.doNotReturnFilterForm = this.donoreturnservice.createDoNotreturnFilterForm();
  }

  ngOnInit(): void {
    this.getDoNotReturn();
    this.GetAllOrganization();
    this.watchForExportDialog();
    this.watchForDefaultExport();
    this.store.dispatch(new GetOrganizationDataSources());
    this.getOrganizationList();
  }

  private getOrganizationList(): void {
    this.filters.pageNumber = this.currentPage;
    this.filters.pageSize = this.pageSize;
    this.store.dispatch(new GetOrganizationsByPage(this.currentPage, this.pageSize, this.filters));
  }

  ngOnDestroy(): void {
    this.getDoNotReturn();
    this.GetAllOrganization();
  }

  public onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.grid.pageSettings.pageSize = this.pageSize;
  }

  public onChangePage(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

  private getDoNotReturn(): void {
    this.store.dispatch([new DoNotReturn.DonotreturnByPage(this.currentPage, this.pageSize, this.filters)]);
  }

  private GetAllOrganization(): void {
    this.store.dispatch(
      new DoNotReturn.GetAllOrganization());
  }
  get selectedOrganizations(): number {
    return this.doNotReturnForm.get('organizationIds')?.value?.length || 0;
  }

  @OutsideZone
  public editDonotReturn(data: DonoreturnAddedit, event: any): void {
    this.addActiveCssClass(event);
    this.getEditBasedValues(data, event);
    setTimeout(() =>
      this.doNotReturnFormGroup.patchValue({
        id: data.id,
        businessUnitId: data.businessUnitId,
        candidateProfileId: data.candidateProfileId,
        locationIds: (data.locations.split(',')).map(m => parseInt(m)),
        locations: data.locations,
        dnrComment: data.dnrComment,
        ssn: data.ssn,
        dnrRequestedBy: data.dnrRequestedBy,
        dnrStatus: data.dnrStatus,
      })
      , 5000);
    setTimeout(() =>
      this.store.dispatch(new ShowSideDialog(true))
      , 2000);
  }

  getEditBasedValues(data: DonoreturnAddedit, event: any) {
    this.store.dispatch(new DoNotReturn.GetLocationByOrgId(data.businessUnitId))
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
      });
    let filter: DoNotReturnCandidateListSearchFilter = {
      candidateProfileId: data.candidateProfileId
    };
    this.store.dispatch(new DoNotReturn.GetDoNotReturnCandidateListSearch(filter))
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        this.CandidateNames = result.donotreturn.searchCandidates
      });
  }

  public onOrganizationDropDownChanged(event: ChangeEventArgs): void {
    this.selectedOrganization = event.itemData as AllOrganization;
    if (this.selectedOrganization.id) {
      this.store.dispatch(new DoNotReturn.GetLocationByOrgId(this.selectedOrganization.id));
    }
  }

  @OutsideZone
  public blockDonotReturn(data: DonoreturnAddedit, event: any): void {
    this.addActiveCssClass(event);
    this.confirmService
      .confirm(BLOCK_RECORD_TEXT, {
        title: BLOCK_RECORD_TITLE,
        okButtonLabel: 'Block',
        okButtonClass: 'delete-button'
      }).pipe(filter(confirm => !!confirm),
        takeUntil(this.unsubscribe$))
      .subscribe((confirm) => {
        if (confirm) {
          this.store.dispatch(new DoNotReturn.RemoveDonotReturn(data));
        }
        this.removeActiveCssClass();
        setTimeout(() =>
          this.getDoNotReturn()
          , 2000)
      });
  }

  @OutsideZone
  public saveDonotReturn(): void {
    if (this.doNotReturnFormGroup.valid) {
      let selectedLocationIds = this.doNotReturnFormGroup.get('locationIds')?.value;
      this.doNotReturnFormGroup.controls['locations'].setValue(selectedLocationIds.length > 0 ? selectedLocationIds.join(",") : selectedLocationIds);
      this.store.dispatch(new DoNotReturn.SaveDonotreturn(new DonoreturnAddedit(
        this.doNotReturnFormGroup.getRawValue()
      )));
      this.doNotReturnFormGroup.reset();
      this.store.dispatch([new ShowSideDialog(false), new SetDirtyState(false)]);
      this.removeActiveCssClass();
      setTimeout(() => {
        this.getDoNotReturn();
      }, 2000)
    } else {
      this.doNotReturnFormGroup.markAllAsTouched();
    }
  }

  onFormCancelClick(): void {
    if (this.doNotReturnFormGroup.dirty) {
      this.confirmService
        .confirm(CANCEL_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button'
        }).pipe(filter(confirm => !!confirm),
          takeUntil(this.unsubscribe$))
        .subscribe(() => {
          this.store.dispatch(new ShowSideDialog(false));
          this.doNotReturnFormGroup.reset();
          this.removeActiveCssClass();
        });
    } else {
      this.store.dispatch(new ShowSideDialog(false));
      this.doNotReturnFormGroup.reset();
      this.removeActiveCssClass();
    }
  }

  public closeExport(): void {
    this.fileName = '';
    this.store.dispatch(new ShowExportDialog(false));
  }

  public export(event: ExportOptions): void {
    this.closeExport();
    this.defaultExport(event.fileType, event);
  }

  private watchForDefaultExport(): void {
    this.export$.pipe(
      takeUntil(this.unsubscribe$),
    ).subscribe((event: ExportedFileType) => {
      this.defaultFileName = 'Do Not Return Candidatelist' + this.generateDateTime(this.datePipe);
      this.defaultExport(event);
    });
  }

  private watchForExportDialog(): void {
    this.actions$.pipe(
      ofActionDispatched(ShowExportDialog),
      filter((value) => value.isDialogShown),
      takeUntil(this.unsubscribe$),
    ).subscribe(() => {
      this.defaultFileName = 'Do Not Return Candidatelist' + this.generateDateTime(this.datePipe);
      this.fileName = this.defaultFileName;
    });
  }

  public override defaultExport(fileType: ExportedFileType, options?: ExportOptions): void {
    this.store.dispatch(new DoNotReturn.ExportDonotreturn(new ExportPayload(
      fileType,
      { ...this.filters },
      options ? options.columns.map(val => val.column) : this.columnsToExport.map(val => val.column),
      this.selectedItems.length ? this.selectedItems.map(val => val[this.idFieldName]) : null,
      options?.fileName || this.defaultFileName
    )));
    this.clearSelection(this.grid);
  }

  public onFilterClearAll(): void {
    this.doNotReturnFormGroup.reset();
    this.filteredItems = [];
    this.currentPage = 1;
    this.filters = {};
    this.getDoNotReturn();
    this.filteredItems$.next(this.filteredItems.length);
    this.store.dispatch(new ShowFilterDialog(false));
  }

  public onFilterApply(): void {
    this.filters = this.doNotReturnFilterForm.getRawValue();
    this.filteredItems = this.filterService.generateChips(this.doNotReturnFilterForm, this.filterColumns);
    this.getDoNotReturn();
    this.store.dispatch(new ShowFilterDialog(false));
    this.filteredItems$.next(this.filteredItems.length);
  }

  public onFiltering: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    this.onFilterChild(e);
  }

  @OutsideZone
  private onFilterChild(e: FilteringEventArgs) {
    if (e.text != '') {
      let ids = 0;
      ids = (this.doNotReturnFormGroup.get('businessUnitId')?.value);
      let filter: DoNotReturnCandidateSearchFilter = {
        searchText: e.text,
        businessUnitId: ids
      };
      this.CandidateNames = [];
      this.store.dispatch(new DoNotReturn.GetDoNotReturnCandidateSearch(filter))
        .pipe(takeUntil(this.unsubscribe$),)
        .subscribe((result) => {
          this.CandidateNames = result.donotreturn.searchCandidates
          e.updateData(result.donotreturn.searchCandidates);
        });
    }
  }
}
