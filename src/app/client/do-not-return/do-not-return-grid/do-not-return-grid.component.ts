import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild, OnDestroy, SimpleChanges, NgZone } from '@angular/core';
import { DonotReturnState } from '@admin/store/donotreturn.state';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { UserPermissions } from '@core/enums';
import { CustomFormGroup, Permission } from '@core/interface';
import { BehaviorSubject, debounceTime, filter, Observable, Subject, takeUntil, distinctUntilChanged, switchMap } from 'rxjs';
import { ShowExportDialog, ShowFilterDialog, ShowSideDialog, ShowToast } from 'src/app/store/app.actions';
import { GridComponent, SortService } from '@syncfusion/ej2-angular-grids';
import {
  DonoreturnFilters, DonoreturnAddedit, DoNotReturnsPage,
  AllOrganization, GetLocationByOrganization, DoNotReturnCandidateSearchFilter, DoNotReturnCandidateListSearchFilter
} from '@shared/models/donotreturn.model';
import { DonotreturnByPage, ExportDonotreturn, GetAllOrganization, GetDoNotReturnCandidateListSearch, GetDoNotReturnCandidateSearch, GetDoNotReturnPage, GetLocationByOrgId, RemoveDonotReturn, SaveDonotreturn, UpdateDoNotReturn } from '@admin/store/donotreturn.actions';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { AgencyStatus } from '@shared/enums/status';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LastSelectedOrganisationAgency, SaveLastSelectedOrganizationAgencyId, SetAgencyActionsAllowed, SetAgencyInvoicesActionsAllowed } from 'src/app/store/user.actions';
import { UserState, UserStateModel } from 'src/app/store/user.state';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { User } from '@shared/models/user.model';
import { BLOCK_RECORD_TEXT, BLOCK_RECORD_TITLE, CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE, DELETE_RECORD_TEXT, DELETE_RECORD_TITLE, ONLY_NUMBER, RECORD_SAVED } from '@shared/constants';
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
import { doNotReturnFilterConfig, MasterDNRExportCols } from '../donotreturn-grid.constants';
import { DatePipe } from '@angular/common';
import { FilterService } from '@shared/services/filter.service';

interface IOrganizationAgency {
  id: number;
  name: string;
  type: 'Organization' | 'Agency';
  hasLogo?: boolean;
  lastUpdateTicks?: number;
  status?: AgencyStatus;
}

@Component({
  selector: 'app-do-not-return-grid',
  templateUrl: './do-not-return-grid.component.html',
  styleUrls: ['./do-not-return-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DoNotReturnGridComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  public organizationAgencyControl: FormControl = new FormControl();
  public generalInformationForm: FormGroup;
  private pageSubject = new Subject<number>();
  private unsubscribe$: Subject<void> = new Subject();
  @ViewChild('locationMultiselect') locationMultiselect: MultiSelectComponent;
  private selectedOrganization: AllOrganization;
  public locationIdControl: AbstractControl;
  @Input() filteredItems$: Subject<number>;
  public columnsToExport: ExportColumn[] = MasterDNRExportCols;
  public filterColumns = doNotReturnFilterConfig;
  public customAttributes: object;
  isEdit: boolean = false;
  location: Location[];
  @Input() isActive = false;
  @Input() public isMobile: boolean;
  @Input() public userIsAdmin: boolean;
  @Input() export$: Subject<ExportedFileType>;
  @ViewChild('grid')
  public grid: GridComponent;
  @Select(DonotReturnState.donotreturnpage)
  donotreturnpage$: Observable<DoNotReturnsPage>;
  @Select(AdminState.organizationDataSources)
  organizationDataSources$: Observable<OrganizationDataSource>;
  @Select(UserState.user)
  user$: Observable<User>;


  @Select(DonotReturnState.GetMasterDoNotReturn)
  masterDoNotReturn$: Observable<DonoreturnAddedit[]>;

  @Select(DonotReturnState.allOrganizations)
  allOrganizations$: Observable<AllOrganization[]>;


  @Select(DonotReturnState.GetLocationsByOrgId)
  locations$: Observable<GetLocationByOrganization[]>;


  get reasonControl(): AbstractControl | null {
    return this.doNotReturnForm.get('firstName');
  }
  public doNotReturnForm: FormGroup;
  private organizations: IOrganizationAgency[] = [];
  private agencies: IOrganizationAgency[] = [];
  public masterDonotreturn: DonoreturnAddedit[] = [];
  submited: boolean = false;
  editedDNRId?: number;

  public doNotReturnFormGroup: CustomFormGroup<DoNotReturnForm>;
  public doNotReturnFilterForm: CustomFormGroup<DoNotReturnFilterForm>;
  get dialogHeader(): string {
    return this.isEdit ? 'Edit' : 'Add';
  }
  candidateNameFields: FieldSettingsModel = { text: 'fullName', value: 'id' };
  remoteWaterMark: string = 'e.g. Andrew Fuller';
  public CandidateNames: any;
  constructor(private store: Store, private confirmService: ConfirmService, private readonly fb: FormBuilder,
    private donoreturnservice: DoNotReturnFormService, private readonly ngZone: NgZone,
    private actions$: Actions,
    private filterService: FilterService,
    private datePipe: DatePipe,) {
    super();
    this.doNotReturnFormGroup = this.donoreturnservice.createDoNotreturnForm();
    this.doNotReturnFilterForm = this.donoreturnservice.createDoNotreturnFilterForm();
  }

  ngOnInit() {
    this.getDoNotReturn();
    this.GetAllOrganization();
    this.watchForExportDialog();
    this.watchForDefaultExport();
    this.store.dispatch(new GetOrganizationDataSources());
    this.getOrganizationList();
    this.organizationAgencyControl.valueChanges
      .pipe(
        takeUntil(this.unsubscribe$),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(() => this.user$)
      )
      .subscribe((user) => {
        const agencyOrganizations = [BusinessUnitType.Agency, BusinessUnitType.Organization];
        if (!user) {
          return;
        }
        if (agencyOrganizations.includes(user.businessUnitType)) {
          this.store.dispatch(new LastSelectedOrganisationAgency(user.businessUnitName));
          const isAgency = user.businessUnitType === BusinessUnitType.Agency;
          this.store.dispatch(
            new SaveLastSelectedOrganizationAgencyId(
              {
                lastSelectedOrganizationId: !isAgency ? user.businessUnitId : null,
                lastSelectedAgencyId: isAgency ? user.businessUnitId : null,
              },
              !isAgency
            )
          );
        }
        const selectedOrganizationAgencyId: number = this.organizationAgencyControl.value;
        const selectedOrganizationAgency = this.organizationsAgencies$
          .getValue()
          .find((i) => i.id === selectedOrganizationAgencyId);
        if (!selectedOrganizationAgency) {
          return;
        }
        const selectedType = selectedOrganizationAgency.type;
        if (selectedType === 'Organization') {
          this.store.dispatch(new LastSelectedOrganisationAgency(selectedType));
          this.store.dispatch(
            new SaveLastSelectedOrganizationAgencyId(
              {
                lastSelectedOrganizationId: selectedOrganizationAgencyId,
                lastSelectedAgencyId: this.store.selectSnapshot(UserState.lastSelectedAgencyId),
              },
              true
            )
          );
        }
        if (selectedType === 'Agency') {
          this.store.dispatch(new LastSelectedOrganisationAgency(selectedType));
          this.store.dispatch(
            new SaveLastSelectedOrganizationAgencyId(
              {
                lastSelectedOrganizationId: this.store.selectSnapshot(UserState.lastSelectedOrganizationId),
                lastSelectedAgencyId: selectedOrganizationAgencyId,
              },
              false
            )
          );
          this.setAgencyStatus(selectedOrganizationAgency);
        }
      });
  }

  private getOrganizationList(): void {
    this.filters.pageNumber = this.currentPage;
    this.filters.pageSize = this.pageSize;
    this.store.dispatch(new GetOrganizationsByPage(this.currentPage, this.pageSize, this.filters));
  }
  private setAgencyStatus(agency: IOrganizationAgency | undefined): void {
    const agencyIsActive = agency?.status !== AgencyStatus.Inactive && agency?.status !== AgencyStatus.Terminated;
    const userUnit = (this.store.snapshot().user as UserStateModel).user?.businessUnitType;

    let invoiceActionsActive: boolean;

    if (agency?.status === AgencyStatus.Inactive) {
      invoiceActionsActive = userUnit === BusinessUnitType.Hallmark;
    } else if (agency?.status === AgencyStatus.Terminated) {
      invoiceActionsActive = false;
    } else {
      invoiceActionsActive = true;
    }

    this.store.dispatch(new SetAgencyActionsAllowed(agencyIsActive));
    this.store.dispatch(new SetAgencyInvoicesActionsAllowed(invoiceActionsActive));
  }
  ngOnDestroy(): void {
    this.getDoNotReturn();
    this.GetAllOrganization();
  }
  
  @Input() userPermission: Permission;
  public onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.grid.pageSettings.pageSize = this.pageSize;
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

  public optionFields = {
    text: 'name',
    value: 'id',
  };
  public readonly orgsFields = {
    text: 'name',
    value: 'organizationId',
  };
  public organizationsAgencies$: BehaviorSubject<IOrganizationAgency[]> = new BehaviorSubject<IOrganizationAgency[]>(
    []
  );
  private getDoNotReturn(): void {
    this.store.dispatch([new DonotreturnByPage(this.currentPage, this.pageSize, this.filters)]);
  }


  private GetAllOrganization(): void {
    this.store.dispatch([new AllOrganization(),
    new GetAllOrganization()]);
  }
  get selectedOrganizations(): number {
    return this.doNotReturnForm.get('organizationIds')?.value?.length || 0;
  }

  public editDonotReturn(data: any, event: any): void {
    this.addActiveCssClass(event);

    this.getEditBasedValues(data, event);
    console.log(data.locations.split(','));
    setTimeout(() =>

      this.doNotReturnFormGroup.setValue({
        id: data.id,
        businessUnitId: data.businessUnitId,
        candidateProfileId: data.candidateProfileId,
        locationIds: data.locations.split(','),
        locations: data.locations,
        dnrComment: data.dnrComment,
        ssn: data.ssn,
        dnrRequestedBy: data.dnrRequestedBy,
        dnrstatus: data.dnrStatus,
      }), 4000);
    setTimeout(() =>
      this.store.dispatch(new ShowSideDialog(true)),
      1000);

  }
  getEditBasedValues(data: any, event: any) {

    this.store.dispatch(new GetLocationByOrgId(data.businessUnitId))
    let filter: DoNotReturnCandidateListSearchFilter = {
      candidateProfileId: data.candidateProfileId
    };
    this.store.dispatch(new GetDoNotReturnCandidateListSearch(filter))
      .subscribe((result) => {
        console.log(result)
        this.CandidateNames = result.donotreturn.searchCandidates
      });
  }


  public onOrganizationDropDownChanged(event: ChangeEventArgs): void {
    this.selectedOrganization = event.itemData as AllOrganization;
    if (this.selectedOrganization.id) {
      this.store.dispatch(new GetLocationByOrgId(this.selectedOrganization.id));
      console.log(this.location);
    }

  }

  public blockDonotReturn(data: any, event: any): void {
    this.addActiveCssClass(event);
    this.confirmService
      .confirm(BLOCK_RECORD_TEXT, {
        title: BLOCK_RECORD_TITLE,
        okButtonLabel: 'Block',
        okButtonClass: 'delete-button'
      })
      .subscribe((confirm) => {
        if (confirm) {
          this.store.dispatch(new RemoveDonotReturn(data));

        }
        this.removeActiveCssClass();
        this.getDoNotReturn();
      });

  }

  public saveDonotReturn(): void {

    if (this.doNotReturnFormGroup.valid) {
      let selectedLocationIds = this.doNotReturnFormGroup.get('locationIds')?.value;
      this.doNotReturnFormGroup.controls['locations'].setValue(selectedLocationIds.length > 0 ? selectedLocationIds.join(",") : selectedLocationIds);
      this.store.dispatch(new SaveDonotreturn(new DonoreturnAddedit(
        this.doNotReturnFormGroup.getRawValue()
      )));
      this.doNotReturnFormGroup.reset();
      this.store.dispatch(new ShowSideDialog(false));
      this.store.dispatch(new SetDirtyState(false));
      this.removeActiveCssClass();
      setTimeout(() => {
        this.getDoNotReturn();
      }, 1000)
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
        }).pipe(filter(confirm => !!confirm))
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
  public fileName: string;
  public defaultFileName: string;
  public readonly userPermissions = UserPermissions;
  public filters: DonoreturnFilters = {
    candidatename: undefined,
    ssn: undefined,
    pageSize: undefined,
    pageNumber: undefined,
  };
  public closeExport() {
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
      this.defaultFileName = 'Donotreturn/Do Not Return ' + this.generateDateTime(this.datePipe);
      this.defaultExport(event);
    });

  }
  private watchForExportDialog(): void {
    this.actions$.pipe(
      ofActionDispatched(ShowExportDialog),
      filter((value) => value.isDialogShown),
      takeUntil(this.unsubscribe$),
    ).subscribe(() => {
      this.defaultFileName = 'Donotreturn/Do Not Return ' + this.generateDateTime(this.datePipe);
      this.fileName = this.defaultFileName;
    });
  }
  public override defaultExport(fileType: ExportedFileType, options?: ExportOptions): void {
    this.store.dispatch(new ExportDonotreturn(new ExportPayload(
      fileType,
      { ...this.filters },
      options ? options.columns.map(val => val.column) : this.columnsToExport.map(val => val.column),
      this.selectedItems.length ? this.selectedItems.map(val => val[this.idFieldName]) : null,
      options?.fileName || this.defaultFileName
    )));
    this.clearSelection(this.grid);
  }
  public onFilterClose() {

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
      this.store.dispatch(new GetDoNotReturnCandidateSearch(filter))
        .subscribe((result) => {
          console.log(result)
          this.CandidateNames = result.donotreturn.searchCandidates
          e.updateData(result.donotreturn.searchCandidates);
        });
    }
  }
}
