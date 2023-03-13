import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { DonotReturnState } from '@admin/store/donotreturn.state';
import { Actions, ofActionDispatched, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { UserPermissions } from '@core/enums';
import { CustomFormGroup, Permission } from '@core/interface';
import { debounceTime, delay, filter, Observable, Subject, takeUntil } from 'rxjs';
import { ShowExportDialog, ShowFilterDialog, ShowSideDialog } from 'src/app/store/app.actions';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import {
  DonoreturnAddedit, DoNotReturnsPage,
  AllOrganization, DoNotReturnCandidateSearchFilter, DoNotReturnCandidateListSearchFilter, DoNotReturnSearchCandidate, DonoreturnFilter
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

import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { doNotReturnFilterConfig, MasterDNRExportCols, WATERMARK } from '../donotreturn-grid.constants';
import { DatePipe } from '@angular/common';
import { FilterService } from '@shared/services/filter.service';
import { UserAgencyOrganization } from '@shared/models/user-agency-organization.model';

import { LocationsByRegionsFilter ,regionFilter} from 'src/app/modules/document-library/store/model/document-library.model';
import { DocumentLibraryState } from 'src/app/modules/document-library/store/state/document-library.state';
import { Region } from '@shared/models/region.model';
import { GetLocationsByRegions, GetRegionsByOrganizations } from 'src/app/modules/document-library/store/actions/document-library.actions';
import { Candidatests, FormControlNames } from '../enums/dnotreturn.enum';

@Component({
  selector: 'app-do-not-return-grid',
  templateUrl: './do-not-return-grid.component.html',
  styleUrls: ['./do-not-return-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DoNotReturnGridComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  public blockunblockcandidate$: Subject<boolean> = new Subject<boolean>();
  public organizationAgencyControl: FormControl = new FormControl();
  public generalInformationForm: FormGroup;
  public columnsToExport: ExportColumn[] = MasterDNRExportCols;
  public filterColumns = doNotReturnFilterConfig;
  public customAttributes: object;
  public doNotReturnForm: FormGroup;
  public isEdit: boolean = false;
  public isBlock: boolean;
  public orgid:number;
  public status:string;
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
  public allOption: string = "All";
  public regionIdControl: AbstractControl;
  public locationIdControl: AbstractControl;
  public IsSwitcher: boolean = false;

  filterSelectedBusinesUnitId: number | null;

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

  @Select(DocumentLibraryState.regions)
  public regions$: Observable<Region[]>;
  selectedRegions: Region[];

  @Select(DocumentLibraryState.locations)
  public locations$: Observable<Location[]>;
  selectedLocations: Location[];

  get reasonControl(): AbstractControl | null {
    return this.doNotReturnForm.get('firstName');
  }

  get dialogHeader(): string {
    return this.isEdit ? 'Edit' : 'Add';
  }

  constructor(private store: Store, private confirmService: ConfirmService, private readonly fb: FormBuilder,
    private donoreturnservice: DoNotReturnFormService, private readonly ngZone: NgZone,
    private actions$: Actions,
    private changeDetectorRef: ChangeDetectorRef,
    private filterService: FilterService,
    private datePipe: DatePipe,) {
    super();
    this.doNotReturnFormGroup = this.donoreturnservice.createDoNotreturnForm();
    this.doNotReturnFilterForm = this.donoreturnservice.createDoNotreturnFilterForm();
  }

  ngOnInit(): void {
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(DoNotReturn.SaveDonotReturnSucceeded)).subscribe(() => {
      this.doNotReturnFormGroup.reset();
      this.store.dispatch([new DoNotReturn.DonotreturnByPage(this.currentPage, this.pageSize, this.filters)]);
    });
    this.store.dispatch([new DoNotReturn.DonotreturnByPage(this.currentPage, this.pageSize, this.filters)]);
    this.pageSubject.pipe(takeUntil(this.unsubscribe$), debounceTime(1)).subscribe((page) => {
      this.currentPage = page;
      this.store.dispatch([new DoNotReturn.DonotreturnByPage(this.currentPage, this.pageSize, this.filters)]);
    });
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(DoNotReturn.UpdateDonotReturnSucceeded)).subscribe(() => {
      this.doNotReturnFormGroup.reset();
      this.store.dispatch([new DoNotReturn.DonotreturnByPage(this.currentPage, this.pageSize, this.filters)]);
    });
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

  // public createForm(): void {
  //   //this.doNotReturnFormGroup = new FormGroup({})
  //   // this.addRemoveFormcontrols();
  // }

  public addRemoveFormcontrols() {
      this.doNotReturnFormGroup.addControl(FormControlNames.BusinessUnitId, new FormControl('', []));
      this.doNotReturnFormGroup.addControl(FormControlNames.RegionIds, new FormControl('', []));
      this.doNotReturnFormGroup.addControl(FormControlNames.LocationIds, new FormControl('', []));
      this.doNotReturnFormGroup.addControl(FormControlNames.CandidateProfileId, new FormControl('', []));
      this.doNotReturnFormGroup.addControl(FormControlNames.Ssn, new FormControl('', []));
      this.doNotReturnFormGroup.addControl(FormControlNames.DnrComment, new FormControl('', []));
  }


  public onRegionSelect(event: any) {
    this.regionIdControl = this.doNotReturnFormGroup.get(FormControlNames.RegionIds) as AbstractControl;
    this.regionIdControl?.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data: any) => {
      if (this.regionIdControl?.value?.length > 0) {
        let locationFilter: LocationsByRegionsFilter = {
          ids: data,
          getAll: true,
          businessUnitId: this.filterSelectedBusinesUnitId != null ? this.filterSelectedBusinesUnitId : 0,
          orderBy:'Name'
        };
        this.store.dispatch(new GetLocationsByRegions(locationFilter));
        this.changeDetectorRef.markForCheck();
      }
      else{
        let locationFilter: LocationsByRegionsFilter = {
          ids: data,
          getAll: true,
          businessUnitId: this.filterSelectedBusinesUnitId != null ? this.filterSelectedBusinesUnitId : 0,
        };
        this.store.dispatch(new GetLocationsByRegions(locationFilter));
        this.doNotReturnFormGroup.get(FormControlNames.LocationIds)?.setValue([]); 
      }
    });
  }

  public loadRegionsAndLocations(selectedBusinessUnitId: number) {
   // this.createForm();
      this.regionIdControl = this.doNotReturnFormGroup.get(FormControlNames.RegionIds) as AbstractControl;
      let regionFilter: regionFilter = {
        businessUnitId: selectedBusinessUnitId,
        getAll: true,
        ids: [selectedBusinessUnitId]
      };
      this.store.dispatch(new GetRegionsByOrganizations(regionFilter)).pipe(delay(500)).subscribe(()=>
      {
        this.regionIdControl?.valueChanges.pipe(delay(500)).subscribe((data: any) => {
          if (this.regionIdControl?.value?.length > 0) {
            let locationFilter: LocationsByRegionsFilter = {
              ids: data,
              getAll: true,
              businessUnitId: selectedBusinessUnitId,
              orderBy:'Name'
            };
            this.store.dispatch(new GetLocationsByRegions(locationFilter));
            this.changeDetectorRef.markForCheck();
          }
        });
      });
      this.changeDetectorRef.markForCheck();
  }
  


  public setDictionaryRegionMappings() {
    let mapping: { [id: number]: number[]; } = {};
    const selectedRegions = this.doNotReturnFormGroup.get(FormControlNames.RegionIds)?.value;
    if (selectedRegions.length > 0) {
      selectedRegions.forEach((regionItem: any) => {
        let mappingLocItems: number[] = [];
        const selectedLoactions = this.doNotReturnFormGroup.get(FormControlNames.LocationIds)?.value;
        let x = this.locations$.subscribe((data: any) => {
          if (selectedLoactions.length > 0) {
            selectedLoactions.forEach((selLocItem: any) => {
              let selectedLocation = data.filter((locItem: any) => { return locItem.id == selLocItem && locItem.regionId == regionItem });
              if (selectedLocation.length > 0)
                mappingLocItems.push(selectedLocation[0].id);
            });
            mapping[regionItem] = mappingLocItems;
          }
          else {
            mapping[regionItem] = [];
          }
        });

      });
    }
    return mapping;
  }

  public setRegionsOnEdit(editRegionIds: any) {
    if (editRegionIds.length > 0) {
      this.regions$.subscribe((data) => {
        this.doNotReturnFormGroup.get(FormControlNames.RegionIds)?.setValue(editRegionIds);
      });
    } else {
      this.doNotReturnFormGroup.get(FormControlNames.RegionIds)?.setValue(editRegionIds);
    }
  }

  public setLocationsOnEdit(editLocationIds: any) {
    if (editLocationIds.length > 0) {
      this.locations$.subscribe((data) => {
        this.doNotReturnFormGroup.get(FormControlNames.LocationIds)?.setValue(editLocationIds);
      });
    } else {
      this.doNotReturnFormGroup.get(FormControlNames.LocationIds)?.setValue(editLocationIds);
    }
  }

  
  public onSwitcher(event: { checked: boolean }): void {
    this.blockunblockcandidate$.next(event.checked);
   this.isBlock= event.checked;
   this.status=this.isBlock?Candidatests.UnBlock:Candidatests.Block;
   //this.isBlock=false;
  //  if (this.doNotReturnFormGroup.valid) {
  //   const donotreturn: DonoreturnAddedit ={
  //    businessUnitId:this.doNotReturnFormGroup.get("businessUnitId")?.value,
  //    regionLocationMappings: this.setDictionaryRegionMappings(),
  //    id: this.doNotReturnFormGroup.get("id")?.value,
  //    locationId:"",
  //    regionId:"",
  //    candidateProfileId:this.doNotReturnFormGroup.get("candidateProfileId")?.value,
  //    dnrRequestedBy:this.doNotReturnFormGroup.get("dnrRequestedBy")?.value,
  //    dnrStatus: this.IsSwitcher? Candidatests.UnBlock:Candidatests.Block,
  //    ssn:this.doNotReturnFormGroup.get("ssn")?.value,
  //    dnrComment:this.doNotReturnFormGroup.get("dnrComment")?.value,
  //    status:this.IsSwitcher?Candidatests.UnBlock:Candidatests.Block,
  //    candidateEmail: this.doNotReturnFormGroup.controls['candidateEmail'].value,
  //   } 
  //   this.store.dispatch(new DoNotReturn.SaveDonotreturn(new DonoreturnAddedit(
  //    donotreturn
  //    )));
  //    this.doNotReturnFormGroup.reset();
  //    this.store.dispatch([new ShowSideDialog(false), new SetDirtyState(false)]);
  //    this.removeActiveCssClass();
  //    setTimeout(() => {
  //      this.getDoNotReturn();
  //    }, 5000)
  //  } else {
  //    this.doNotReturnFormGroup.markAllAsTouched();
  //  }
  // this.isEdit=false;
  }

  
  @OutsideZone
  public editDonotReturn(data: DonoreturnAddedit, event: any) {
    this.isEdit=true;
    // if (data.businessUnitId) {
    //  this.loadRegionsAndLocations(data.businessUnitId);
    // }
    if (data.dnrStatus == Candidatests.Block) {
      this.isBlock = false;
    }
    else
    {
      this.isBlock=true;
    }
    this.addActiveCssClass(event);
    this.getEditBasedValues(data, event);
   
  
  }

  getEditBasedValues(data: DonoreturnAddedit, event: any) {
    // this.store.dispatch(new DoNotReturn.GetLocationByOrgId(data.businessUnitId))
    //   .pipe(takeUntil(this.unsubscribe$))
    //   .subscribe((result) => {
    //   });
   // this.regionIdControl = this.doNotReturnFormGroup.get(FormControlNames.RegionIds) as AbstractControl;
      let regionFilter: regionFilter = {
        businessUnitId: data.businessUnitId,
        getAll: true,
        ids: [data.businessUnitId]
      };
      this.store.dispatch(new GetRegionsByOrganizations(regionFilter)).pipe(delay(500)).subscribe(()=>
      {
        
      });
      // this.regionIdControl?.valueChanges.pipe(delay(500)).subscribe((result: any) => {
      //   if (this.regionIdControl?.value?.length > 0) {
          let locationFilter: LocationsByRegionsFilter = {
            ids: (data.regionId.split(',')).map(m => parseInt(m)),
            getAll: true,
            businessUnitId: data.businessUnitId,
            orderBy:'Name'
          };
          this.store.dispatch(new GetLocationsByRegions(locationFilter)).pipe(delay(500)).subscribe(()=>
          {
            this.doNotReturnFormGroup.patchValue({
              id: data.id,
              businessUnitId: data.businessUnitId,
              candidateProfileId: data.candidateProfileId,
             locationIds: (data.locationId.split(',')).map(m => parseInt(m)),
             regionIds: (data.regionId.split(',')).map(m => parseInt(m)),
              candidateEmail:data.candidateEmail,
              dnrComment: data.dnrComment,
              ssn: data.ssn,
              dnrRequestedBy: data.dnrRequestedBy,
              dnrStatus: data.dnrStatus,
            }) 
          });

          // setTimeout(() =>
         
          // , 5000);

          
       // }
      //});
      //this.changeDetectorRef.markForCheck();

    let filter: DoNotReturnCandidateListSearchFilter = {
      candidateProfileId: data.candidateProfileId
    };
    this.store.dispatch(new DoNotReturn.GetDoNotReturnCandidateListSearch(filter))
      .pipe(delay(500))
      .subscribe((result) => {
        this.CandidateNames = result.donotreturn.searchCandidates
        this.store.dispatch(new ShowSideDialog(true))
        this.changeDetectorRef.markForCheck();
      });
      // setTimeout(() =>
     
      // , 3000);
  }

  public onOrganizationDropDownChanged(event: ChangeEventArgs): void {
    this.selectedOrganization = event.itemData as AllOrganization;
    this.orgid=this.selectedOrganization.id;
    if (this.selectedOrganization.id) {
      this.loadRegionsAndLocations(this.selectedOrganization.id);
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
     const donotreturn: DonoreturnAddedit ={
      businessUnitId:this.doNotReturnFormGroup.get("businessUnitId")?.value,
      regionLocationMappings: this.setDictionaryRegionMappings(),
      id: this.doNotReturnFormGroup.get("id")?.value,
      locationId:"",
      regionId:"",
      candidateProfileId:this.doNotReturnFormGroup.get("candidateProfileId")?.value,
      dnrRequestedBy:this.doNotReturnFormGroup.get("dnrRequestedBy")?.value,
      dnrStatus: this.isBlock? this.status: Candidatests.Block,
      ssn:this.doNotReturnFormGroup.get("ssn")?.value,
      dnrComment:this.doNotReturnFormGroup.get("dnrComment")?.value,
      status: this.isBlock? this.status: Candidatests.Block,
      candidateEmail: this.doNotReturnFormGroup.controls['candidateEmail'].value,
     } 
     this.store.dispatch(new DoNotReturn.SaveDonotreturn(new DonoreturnAddedit(
      donotreturn
      )));
      this.doNotReturnFormGroup.reset();
      this.store.dispatch([new ShowSideDialog(false), new SetDirtyState(false)]);
      this.removeActiveCssClass();
      setTimeout(() => {
        this.getDoNotReturn();
      }, 5000)
    } else {
      this.doNotReturnFormGroup.markAllAsTouched();
    }
    this.isEdit=false;
    this.isBlock=false;
  }

  onFormCancelClick(): void {
    this.isEdit=false;
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

  public onFilterClearAll(): void {
    this.doNotReturnFilterForm.reset();
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


  public export(event: ExportOptions): void {
    this.closeExport();
    this.defaultExport(event.fileType, event);
  }

  public override defaultExport(fileType: ExportedFileType, options?: ExportOptions): void {
    this.store.dispatch(new DoNotReturn.ExportDonotreturn(new ExportPayload(
      fileType,
      { ...this.filters, offset: Math.abs(new Date().getTimezoneOffset())  },
      options ? options.columns.map(val => val.column) : this.columnsToExport.map(val => val.column),
      this.selectedItems.length ? this.selectedItems.map(val => val[this.idFieldName]) : null,
      options?.fileName || this.defaultFileName
    )));
    this.clearSelection(this.grid);
  }

  @OutsideZone
  private onFilterChild(e: FilteringEventArgs) {
    if (e.text != '') {
      let ids = 0;
      ids = this.orgid;
      let filter: DoNotReturnCandidateSearchFilter = {
        searchText: e.text,
        businessUnitId: this.orgid,
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
