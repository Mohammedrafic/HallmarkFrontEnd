import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild, OnDestroy, NgZone, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { DonotReturnState } from '@admin/store/donotreturn.state';
import { Actions, ofActionDispatched, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { UserPermissions } from '@core/enums';
import { CustomFormGroup, Permission } from '@core/interface';
import { BehaviorSubject, combineLatest, debounceTime, delay, distinctUntilChanged, filter, Observable, Subject, takeUntil, takeWhile } from 'rxjs';
import { ShowExportDialog, ShowFilterDialog, ShowSideDialog } from 'src/app/store/app.actions';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import {
  DonoreturnAddedit, DoNotReturnsPage,
  AllOrganization, DoNotReturnCandidateSearchFilter, DoNotReturnCandidateListSearchFilter, DoNotReturnSearchCandidate, DonoreturnFilter, Donotreturn
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
import { UserAgencyOrganization, UserAgencyOrganizationBusinessUnit } from '@shared/models/user-agency-organization.model';

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
  public isBlock: boolean = true;
  isFilterBlock: boolean = false;
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
  public maskSSNPattern: string = '000-00-0000';
  public maskedSSN: string = '';
  public maskedFilterSSN: string = '';
  public filterSSNPattern: string = '000-00-0000';
  public readonly today = new Date();
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
  public organizationRegionIds$: Subject<any> = new Subject();
  public gridApi: any;
  private gridColumnApi: any;
  allOrganizations : UserAgencyOrganizationBusinessUnit[] = []
  sortByField : number = 1;
  fliterFlag:boolean = false;
  requestAPIData:boolean = false;
  public filteredItemsData$: BehaviorSubject<any> = new BehaviorSubject<any>([]);

  @Input() fliterFlag$:BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  @Input() isActive = false;
  @Input() public isMobile: boolean;
  @Input() public userIsAdmin: boolean;
  @Input() export$: Subject<ExportedFileType>;
  @Input() userPermission: Permission;
  @Output() appliedFilteredItems: EventEmitter<number> = new EventEmitter<number>();
  @Input() refreshGrid$: Subject<boolean>;

  @ViewChild('grid')
  public grid: GridComponent;
  @ViewChild('locationMultiselect') public locationMultiselect: MultiSelectComponent;

  @Select(UserState.userPermission)
  currentUserPermissions$: Observable<Permission>;

  @Select(DonotReturnState.donotreturnpage)
  public donotreturnpage$: Observable<DoNotReturnsPage>;

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

  @Select(UserState.lastSelectedAgencyId)
  private lastSelectedAgencyId$: Observable<number>;
  @Select(UserState.lastSelectedOrganizationId)
  private lastSelectedOrganizationId$: Observable<number>;
  private isAlive = true;

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
    this.fliterFlag$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: any) => {
        this.fliterFlag = data;
     });
    this.sortByField = 1;
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(DoNotReturn.SaveDonotReturnSucceeded)).subscribe(() => {
      this.doNotReturnFormGroup.reset();
      this.store.dispatch([new DoNotReturn.DonotreturnByPage(this.orgid,this.currentPage, this.pageSize, this.filters, this.sortByField)]);
    });
    // this.store.dispatch([new DoNotReturn.DonotreturnByPage(this.currentPage, this.pageSize, this.filters, this.sortByField)]);
    this.pageSubject.pipe(takeUntil(this.unsubscribe$), debounceTime(1)).subscribe((page) => {
      this.currentPage = page;
      this.store.dispatch([new DoNotReturn.DonotreturnByPage(this.orgid,this.currentPage, this.pageSize, this.filters, this.sortByField)]);
    });
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(DoNotReturn.UpdateDonotReturnSucceeded)).subscribe(() => {
      this.doNotReturnFormGroup.reset();
      this.store.dispatch([new DoNotReturn.DonotreturnByPage(this.orgid,this.currentPage, this.pageSize, this.filters, this.sortByField)]);
    });
    this.actions$.pipe(ofActionDispatched(ShowSideDialog,ShowFilterDialog), takeUntil(this.unsubscribe$)).subscribe((payload) => {
      if (payload.isDialogShown) {
        if(this.allOrganizations != null && this.allOrganizations.length > 0 && JSON.parse((localStorage.getItem('lastSelectedOrganizationId') || '0'))  as number != 0 ){      
          this.selectedOrganization = this.allOrganizations.find((ele:any)=> ele.id == localStorage.getItem('lastSelectedOrganizationId')) as AllOrganization;
          this.orgid=this.selectedOrganization.id;
          this.loadRegionsAndLocations(this.selectedOrganization.id);
          this.doNotReturnFormGroup.get(FormControlNames.BusinessUnitId)?.setValue(this.selectedOrganization.id);
          let locationFilter: LocationsByRegionsFilter = {
            getAll: true,
            businessUnitId: this.selectedOrganization.id,
            orderBy:'Name'
          };
          this.store.dispatch(new GetLocationsByRegions(locationFilter));
          if(!this.isEdit){
            this.doNotReturnFormGroup.get('isExternal')?.setValue('false');
          }

        }
        if(this.fliterFlag){
            this.doNotReturnFilterForm.get(FormControlNames.BusinessUnitId)?.setValue(this.selectedOrganization.id);
            if(this.doNotReturnFilterForm.value.currentStatus == "Blocked"){
              this.isFilterBlock = true;
            }
            else{
              this.isFilterBlock = false;
            }
            if(this.doNotReturnFilterForm.value.regionBlocked != null && this.doNotReturnFilterForm.value.regionBlocked.length > 0){
              let locationFilter: LocationsByRegionsFilter = {
                ids: this.doNotReturnFilterForm.value.regionBlocked,
                getAll: true,
                businessUnitId: this.orgid,
                orderBy:'Name'
              };
              this.store.dispatch(new GetLocationsByRegions(locationFilter)).pipe(delay(500)).subscribe(()=>
              {});
            }
        }

     }
    });
    
    this.GetAllOrganization();
    this.watchForExportDialog();
    this.watchForDefaultExport();
    this.store.dispatch(new GetOrganizationDataSources());
    this.getOrganizationList();
    this.subscribeOnBusinessUnitChange();
    this.doNotReturnFormGroup.get('ssn')?.valueChanges.pipe(delay(500),distinctUntilChanged(),takeUntil(this.unsubscribe$)).subscribe((ssnValue: any) => {
      if(ssnValue!= '' && ssnValue!= null && ssnValue.indexOf('XXX-XX') == -1){
        this.maskedSSN = ssnValue;
      }
      if(ssnValue === ''){
        this.maskedSSN = '';
      }
    });

    this.organizationRegionIds$.pipe(delay(500),distinctUntilChanged(),takeUntil(this.unsubscribe$)).subscribe((data: any) => {
     });

    this.allOrganizations$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: any) => {
      if(data != null && data.length > 0){
        this.allOrganizations = data;
      }
     });

     this.regions$.pipe(takeUntil(this.unsubscribe$)).subscribe((regions: any) => {
        if(this.filterColumns.regionBlocked){
          this.filterColumns.regionBlocked.dataSource = regions;
        }
     });

     this.locations$.pipe(takeUntil(this.unsubscribe$)).subscribe((locations: any) => {
        this.requestAPIData = false;
        let selectedLoactions:any; 
        if(this.filterColumns.locationBlocked){
          this.filterColumns.locationBlocked.dataSource = locations;
        }
        if(locations != null && locations.length > 0){
          if(this.fliterFlag)
            selectedLoactions = this.doNotReturnFilterForm.get('locationBlocked')?.value;
          else
            selectedLoactions = this.doNotReturnFormGroup.get(FormControlNames.LocationIds)?.value;
          if (selectedLoactions != null && selectedLoactions.length > 0) {
            let difference = locations.filter((x:any) => selectedLoactions.includes(x.id));
            if(difference.length === 0){
              if(this.fliterFlag)
                this.doNotReturnFilterForm.get('locationBlocked')?.setValue(null);
              else
                this.doNotReturnFormGroup.get(FormControlNames.LocationIds)?.setValue(null);
            }
          }
        }else{
          if(this.fliterFlag)
            this.doNotReturnFilterForm.get('locationBlocked')?.setValue(null);
          else
            this.doNotReturnFormGroup.get(FormControlNames.LocationIds)?.setValue(null);
        }
     });

    this.doNotReturnFilterForm.get('ssn')?.valueChanges.pipe(delay(500),distinctUntilChanged()).subscribe((ssnValue: any) => {
      if(ssnValue!= '' && ssnValue!= null && ssnValue.indexOf('XXX-XX') == -1){
        this.maskedFilterSSN = ssnValue;
      }
    });    
    this.doNotReturnFormGroup.get('isExternal')?.valueChanges.pipe(delay(500),distinctUntilChanged(),takeUntil(this.unsubscribe$)).subscribe((isExternalValue: any) => {
      
          if(isExternalValue == "true"){
            this.doNotReturnFormGroup.get('candidateProfileId')?.setValue(0);
          }else if(!this.isEdit){
            this.doNotReturnFormGroup.get('candidateProfileId')?.setValue(null);
          }
          this.doNotReturnFormGroup.markAsUntouched();  
          this.doNotReturnFormGroup.controls['isExternal']?.markAsTouched();  
          this.changeDetectorRef.markForCheck();              
    });

    this.doNotReturnFormGroup.get('candidateProfileId')?.valueChanges.pipe(delay(500),distinctUntilChanged()).subscribe((CandidateProfileId: any) => {
      if(CandidateProfileId!= '' && CandidateProfileId!= null ){
        if(this.CandidateNames.length > 0 && !this.isEdit){
            let selectedCandidate : DoNotReturnSearchCandidate | undefined = this.CandidateNames.find(data=> data.id == CandidateProfileId || data.fullName == CandidateProfileId)
            this.doNotReturnFormGroup.get('candidateEmail')?.setValue(selectedCandidate?.email);
            this.doNotReturnFormGroup.get('dob')?.setValue(selectedCandidate?.dob);
            this.doNotReturnFormGroup.get('firstName')?.setValue(selectedCandidate?.firstName);
            this.doNotReturnFormGroup.get('lastName')?.setValue(selectedCandidate?.lastName);
            this.doNotReturnFormGroup.get('middleName')?.setValue(selectedCandidate?.middleName);
          if (selectedCandidate?.ssn != null) {
            this.maskedSSN = selectedCandidate?.ssn.toString();
            this.onSSNBlur();
          }
          else {
            this.maskSSNPattern = "000-00-0000";
            this.doNotReturnFormGroup.get('ssn')?.setValue(null); 
          }
        }        
      }else if(!this.isEdit){
        this.doNotReturnFormGroup.get('candidateEmail')?.setValue(null);
        this.doNotReturnFormGroup.get('dob')?.setValue(null);
        this.doNotReturnFormGroup.get('firstName')?.setValue(null);
        this.doNotReturnFormGroup.get('lastName')?.setValue(null);
        this.doNotReturnFormGroup.get('middleName')?.setValue(null);
        this.maskSSNPattern = "000-00-0000";
        this.maskedSSN = '';
        this.doNotReturnFormGroup.get('ssn')?.setValue(null); 
      }
    });

    this.doNotReturnFormGroup.get(FormControlNames.RegionIds)?.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data: any) => {
        this.onChangeOfRegions(data,false);      
    });

    this.doNotReturnFormGroup.get(FormControlNames.LocationIds)?.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data: any) => {
      this.changeDetectorRef.markForCheck();
    });

    this.doNotReturnFilterForm.get('regionBlocked')?.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data: any) => {
        this.onChangeOfRegions(data,true);      
    });

    this.refreshGrid$.subscribe((res)=>{
      if(res){
        this.pageSubject.next(1);
      }
    })
  }

  get formAltaControls(): any {
    return this.doNotReturnFormGroup['controls'];
  }

  public onChangeOfRegions(data:any,isFilter:boolean){
    if(this.selectedOrganization != null && this.selectedOrganization.id != null){
        this.requestAPIData = true;
        if(data != null && data?.length > 0) {
          let locationFilter: LocationsByRegionsFilter = {
            ids: data,
            getAll: true,
            businessUnitId: this.selectedOrganization.id,
            orderBy:'Name'
          };
          this.store.dispatch(new GetLocationsByRegions(locationFilter));
          this.changeDetectorRef.markForCheck();
        }
        else{
          let locationFilter: LocationsByRegionsFilter = {
            getAll: true,
            businessUnitId: this.selectedOrganization.id,
            orderBy:'Name'
          };
          this.store.dispatch(new GetLocationsByRegions(locationFilter));
          if(isFilter)
            this.doNotReturnFilterForm.get('locationBlocked')?.setValue(null);
          else
            this.doNotReturnFormGroup.get(FormControlNames.LocationIds)?.setValue(null); 
        }
    }
  }

  public onFilterSSNBlur(): void {
    if(this.maskedFilterSSN != null && this.maskedFilterSSN.length > 0 && this.maskedFilterSSN.length >= 9){
      this.filterSSNPattern = "AAA-AA-0000";
      this.doNotReturnFilterForm.get('ssn')?.setValue("XXX-XX-" + this.maskedFilterSSN.slice(-4)); 
    }
   
  }

  public onFilterSSNFocus(): void {
      this.filterSSNPattern = "000-00-0000";
      this.doNotReturnFilterForm.get('ssn')?.setValue(this.maskedFilterSSN); 
  }

  public onSSNBlur(): void {
    if(this.maskedSSN != null && this.maskedSSN.length > 0 && this.maskedSSN.length >= 9){
      this.maskSSNPattern = "AAA-AA-0000";
      this.doNotReturnFormGroup.get('ssn')?.setValue("XXX-XX-" + this.maskedSSN.slice(-4)); 
    }
   
  }

  public onSSNFocus(): void {
      this.maskSSNPattern = "000-00-0000";
      this.doNotReturnFormGroup.get('ssn')?.setValue(this.maskedSSN); 
  }

  private getOrganizationList(): void {
    this.store.dispatch(new DoNotReturn.GetAllOrganization());
  }

  ngOnDestroy(): void {
    this.isAlive = false;
    this.getDoNotReturn();
    this.GetAllOrganization();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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
    this.selectedOrganization = {} as AllOrganization;
    this.store.dispatch([new DoNotReturn.DonotreturnByPage(this.orgid,this.currentPage, this.pageSize, this.filters, this.sortByField)]);
  }

  private GetAllOrganization(): void {
    this.store.dispatch(
      new DoNotReturn.GetAllOrganization());
  }
  get selectedOrganizations(): number {
    return this.doNotReturnForm.get('organizationIds')?.value?.length || 0;
  }


  public addRemoveFormcontrols() {
      this.doNotReturnFormGroup.addControl(FormControlNames.BusinessUnitId, new FormControl('', []));
      this.doNotReturnFormGroup.addControl(FormControlNames.RegionIds, new FormControl('', []));
      this.doNotReturnFormGroup.addControl(FormControlNames.LocationIds, new FormControl('', []));
      this.doNotReturnFormGroup.addControl(FormControlNames.CandidateProfileId, new FormControl('', []));
      this.doNotReturnFormGroup.addControl(FormControlNames.Ssn, new FormControl('', []));
      this.doNotReturnFormGroup.addControl(FormControlNames.DnrComment, new FormControl('', []));
  }


  public loadRegionsAndLocations(selectedBusinessUnitId: number) {
   // this.createForm();
      this.regionIdControl = this.doNotReturnFormGroup.get(FormControlNames.RegionIds) as AbstractControl;
      let regionFilter: regionFilter = {
        businessUnitId: selectedBusinessUnitId,
        getAll: true,
        ids: [selectedBusinessUnitId],
        orderBy:'Name'
      };
      this.store.dispatch(new GetRegionsByOrganizations(regionFilter));
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
  }
  
  public onFilterSwitcher(event: { checked: boolean }): void {
    this.isFilterBlock = event.checked;
    if(event.checked){
      this.doNotReturnFilterForm.get('currentStatus')?.setValue('Blocked');
    }else{
      this.doNotReturnFilterForm.get('currentStatus')?.setValue('Unblocked');
    }
  }
  
  @OutsideZone
  public editDonotReturn(data: Donotreturn, event: any) {
    this.fliterFlag = false;
    this.isEdit=true;
    if (data.currentStatus == Candidatests.Block) {
      this.isBlock = true;
    }
    else
    {
      this.isBlock=false;
    }
    this.addActiveCssClass(event);
    this.getEditBasedValues(data, event);
    
  }

  getEditBasedValues(data: Donotreturn, event: any) {
      this.selectedOrganization.id = data?.businessUnitId;
      let regionFilter: regionFilter = {
        businessUnitId: data.businessUnitId,
        getAll: true,
        ids: [data.businessUnitId]
      };
      this.store.dispatch(new GetRegionsByOrganizations(regionFilter)).pipe(delay(500)).subscribe(()=>{  });
          let locationFilter: LocationsByRegionsFilter = {
            ids: (data.regionId.split(',')).map(m => parseInt(m)),
            getAll: true,
            businessUnitId: data.businessUnitId,
            orderBy:'Name'
          };
          this.store.dispatch(new GetLocationsByRegions(locationFilter)).pipe(delay(500)).subscribe(()=>
          {
            this.maskedSSN = data.ssn!=null && data.ssn!=0 ? data.ssn.toString() : '';   
            if(data.ssn!=null && data.ssn!=0){
              this.maskSSNPattern = "AAA-AA-0000";
            }
            this.doNotReturnFormGroup.patchValue({
              id: data.id,
              isExternal: data.isExternal ? 'true' : 'false',
              businessUnitId: data.businessUnitId,
              candidateProfileId: data.candidateProfileId,
              firstName: data.firstName,
              middleName: data.middleName,
              lastName: data.lastName,
              locationIds: (data.locationId.split(',')).map(m => parseInt(m)),
              regionIds: (data.regionId.split(',')).map(m => parseInt(m)),
              candidateEmail:data.email,
              dnrComment: data.comment,
              ssn: data.ssn != null && data.ssn!=0 ?  "XXX-XX-" + this.maskedSSN.slice(-4): "",
              dob: data.dob,
              dnrStatus: data.currentStatus == Candidatests.Block ? true : false,
            }) 
          });

          if(data.candidateProfileId != null ){
            let filter: DoNotReturnCandidateListSearchFilter = {
              candidateProfileId: data.candidateProfileId,
              businessUnitId: this.orgid,
            };
            this.store.dispatch(new DoNotReturn.GetDoNotReturnCandidateListSearch(filter))
              .pipe(delay(500))
              .subscribe((result) => {
                this.CandidateNames = result.donotreturn.searchCandidates
                this.store.dispatch(new ShowSideDialog(true))
                this.changeDetectorRef.markForCheck();
              });
          }else{
            this.store.dispatch(new ShowSideDialog(true))
          }
      
   
  }

  public onOrganizationDropDownChanged(event: ChangeEventArgs): void {
    this.selectedOrganization = event.itemData as AllOrganization;
    // this.orgid=this.selectedOrganization.id;
    if (this.selectedOrganization.id) {
       this.loadRegionsAndLocations(this.selectedOrganization.id);
    }
    let isExternal = this.doNotReturnFormGroup.value.isExternal;
    this.doNotReturnFormGroup.reset();
    this.doNotReturnFormGroup.get(FormControlNames.BusinessUnitId)?.setValue(this.selectedOrganization.id);
    this.doNotReturnFormGroup.get('isExternal')?.setValue(isExternal);
    
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
      this.sortByField = 2;
     const donotreturn :DonoreturnAddedit = {
      id: this.doNotReturnFormGroup.value.id,
      isExternal:this.doNotReturnFormGroup.value.isExternal === 'true' ? true : false,
      businessUnitId:this.doNotReturnFormGroup.value.businessUnitId,
      regionLocationMappings: this.setDictionaryRegionMappings(),
      locationId:"",
      regionId:"",
      email: this.doNotReturnFormGroup.value.candidateEmail,
      candidateProfileId: this.doNotReturnFormGroup.value.candidateProfileId === 0 ? null : this.doNotReturnFormGroup.value.candidateProfileId,
      comment: this.doNotReturnFormGroup.value.dnrComment,
      firstName: this.doNotReturnFormGroup.value.firstName,
      middleName:this.doNotReturnFormGroup.value.middleName,
      lastName:this.doNotReturnFormGroup.value.lastName,
      status: this.doNotReturnFormGroup.value.dnrStatus === null ?  Candidatests.Block : this.doNotReturnFormGroup.value.dnrStatus ? Candidatests.Block : Candidatests.UnBlock,
      dob:this.doNotReturnFormGroup.value.dob,
      ssn: this.maskedSSN == '' ? null : parseInt(this.maskedSSN)
    }
     this.store.dispatch(new DoNotReturn.SaveDonotreturn(new DonoreturnAddedit(
      donotreturn
      )));
      this.doNotReturnFormGroup.reset();
      this.store.dispatch([new ShowSideDialog(false), new SetDirtyState(false)]);
      this.removeActiveCssClass();
      this.isEdit=false;
      this.isBlock=true;
      this.maskSSNPattern = '000-00-0000';
      this.maskedSSN = '';
      setTimeout(() => {
        this.getDoNotReturn();
      }, 5000)
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
          this.maskSSNPattern = '000-00-0000';
          this.maskedSSN = '';
          this.sortByField = 1;
          this.isEdit=false;
          this.isBlock = true;
        });
    } else {
      this.store.dispatch(new ShowSideDialog(false));
      this.doNotReturnFormGroup.reset();
      this.removeActiveCssClass();
      this.maskSSNPattern = '000-00-0000';
      this.maskedSSN = '';
      this.isEdit=false;
      this.isBlock = true;
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
    this.isFilterBlock = false;
    this.sortByField = 1;
    this.doNotReturnFilterForm.reset();
    this.filteredItems = [];
    this.filteredItemsData$.next(this.filteredItems);
    this.currentPage = 1;
    this.filters = {};
    this.maskedFilterSSN = '';
    this.filterSSNPattern = '000-00-0000';
    this.getDoNotReturn();
    this.appliedFilteredItems.emit(this.filteredItems.length);
    this.store.dispatch(new ShowFilterDialog(false));
  }

  public onFilterDelete(data:any){
    if(data.column == 'currentStatus'){
      this.doNotReturnFilterForm.get(data.column)?.setValue('Unblocked');
      this.isFilterBlock = false;
    }else if(data.column == 'ssn'){
      this.maskedFilterSSN = '';
      this.filterSSNPattern = '000-00-0000';
      this.doNotReturnFilterForm.get(data.column)?.setValue('');
    }else if(data.column == 'regionBlocked' || data.column == 'locationBlocked'){
      const newArr: any[] = this.doNotReturnFilterForm.get(data.column)?.value.filter((element:any) => {
        return element !== data.value;
      });
      this.doNotReturnFilterForm.get(data.column)?.setValue(newArr);    
      setTimeout(() =>{
          this.filteredItems = this.filterService.generateChips(this.doNotReturnFilterForm, this.filterColumns);
          this.filteredItemsData$.next(this.filteredItems);
        }, 1000);
    }else{
      this.doNotReturnFilterForm.get(data.column)?.setValue('');
    }
  }

  public onFilterApply(): void {
    if (this.doNotReturnFilterForm.valid) {
      this.sortByField = 1;
      this.isFilterBlock = false;
      this.filters = this.doNotReturnFilterForm.getRawValue();
      if(this.filters.businessUnitId === null || this.filters.businessUnitId === undefined){
        this.filters.businessUnitId = this.selectedOrganization?.id == undefined ? this.orgid : this.selectedOrganization?.id;
      }
      this.filters.ssn = this.maskedFilterSSN == '' ? null : parseInt(this.maskedFilterSSN);
      this.filters.locationBlocked = this.doNotReturnFilterForm.value.locationBlocked?.join(',');
      this.filters.regionBlocked = this.doNotReturnFilterForm.value.regionBlocked?.join(',');
      this.filters.currentStatus = this.filters.currentStatus === null ? Candidatests.UnBlock : this.filters.currentStatus;
      this.filters.pageNumber = 1;
      this.filters.pageSize = this.pageSize;
      this.filteredItems = this.filterService.generateChips(this.doNotReturnFilterForm, this.filterColumns);
      this.filteredItemsData$.next(this.filteredItems);
      this.getDoNotReturn();
      this.store.dispatch(new ShowFilterDialog(false));
      this.appliedFilteredItems.emit(this.filteredItems.length);
    }
  }

  public onFiltering: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    this.onFilterChild(e);
  }


  public export(event: ExportOptions): void {
    this.closeExport();
    this.defaultExport(event.fileType, event);
  }

  private subscribeOnBusinessUnitChange(): void {
    this.lastSelectedOrganizationId$
      .pipe(takeWhile(() => this.isAlive))
      .subscribe((data) => {
        if(data != null && data != undefined){
          this.orgid=data;
          this.onFormCancelClick();
          this.onFilterClearAll();
          this.store.dispatch(new ShowSideDialog(false));
        }

      });
  }

  public override defaultExport(fileType: ExportedFileType, options?: ExportOptions): void {
    if(this.filters.businessUnitId == null || this.filters.businessUnitId == undefined){
      this.filters.businessUnitId = this.selectedOrganization?.id == undefined ? this.orgid : this.selectedOrganization?.id;
    }
    this.store.dispatch(new DoNotReturn.ExportDonotreturn(new ExportPayload(
      fileType,
      { ...this.filters },
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
        businessUnitId: this.selectedOrganization?.id == undefined ? this.orgid : this.selectedOrganization?.id, //this.orgid,
      };
      this.CandidateNames = [];
      this.store.dispatch(new DoNotReturn.GetDoNotReturnCandidateSearch(filter))
        .pipe(delay(500),distinctUntilChanged(),takeUntil(this.unsubscribe$),)
        .subscribe((result) => {
          this.CandidateNames = result.donotreturn.searchCandidates;
          e.updateData(result.donotreturn.searchCandidates);
        });
    }
  }
}
