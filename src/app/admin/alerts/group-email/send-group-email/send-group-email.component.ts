import { OrderManagementContentService } from '@shared/services/order-management-content.service';
import { ValidatorFn } from '@angular/forms';
import { OrderTypeOptions } from './../../../../shared/enums/order-type';
import {
  AgencyDto,
  CandidateStatusAndReasonFilterOptionsDto,
  MasterSkillDto,
  StaffScheduleReportFilterOptions,
  workCommitmentDto,
} from './../../../analytics/models/common-report.model';
import {
  GetGroupEmailRoles,
  GetGroupEmailInternalUsers,
  GetGroupEmailAgencies,
  GetGroupEmailSkills,
  GetGroupEmailCandidateStatuses,
  GetGroupEmailCandidates,
  GetDocumentPreviewDeatils,
  GetDocumentDownloadDeatils,
  GetGroupEmailDepartmentSkills,
  GetGroupEmailEmployees,
  GetStaffScheduleReportFilterOptions
} from './../../../store/alerts.actions';
import { DownloadDocumentDetail, GroupEmailRole } from '@shared/models/group-email.model';
import { takeUntil } from 'rxjs';
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import {
  HtmlEditorService,
  ImageService,
  LinkService,
  RichTextEditorComponent,
  TableService,
  ToolbarType,
} from '@syncfusion/ej2-angular-richtexteditor';
import { Observable, Subject, takeWhile, filter } from 'rxjs';
import { BusinessUnit } from '@shared/models/business-unit.model';
import {
  BUSINESS_DATA_FIELDS,
  DISABLED_GROUP,
  OPRION_FIELDS,
  toolsRichTextEditor,
  User_DATA_FIELDS,
} from '../../alerts.constants';
import { Actions, Select, Store } from '@ngxs/store';
import {
  GetBusinessByUnitType,
  GetAllUsersPage,
  GetOrganizationsStructureAll,
} from 'src/app/security/store/security.actions';
import { GetUserSubscriptionPage } from '@admin/store/alerts.actions';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { UserState } from 'src/app/store/user.state';
import { FileInfo, SelectedEventArgs, UploaderComponent } from '@syncfusion/ej2-angular-inputs';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { SecurityState } from 'src/app/security/store/security.state';
import { User, UsersPage } from '@shared/models/user.model';
import { AppState } from 'src/app/store/app.state';
import { AlertsState } from '@admin/store/alerts.state';
import { UserSubscriptionFilters, UserSubscriptionPage } from '@shared/models/user-subscription.model';
import { BUSINESS_UNITS_VALUES } from '@shared/constants/business-unit-type-list';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { AgencyUserType, OrganizationUserType } from '@admin/alerts/group-email.enum';
import { Organisation, Region, Location, Department } from '@shared/models/visibility-settings.model';
import { uniqBy } from 'lodash';
import { CommonReportFilter, CommonReportFilterOptions } from '@admin/analytics/models/common-report.model';
import { LogiReportState } from '@organization-management/store/logi-report.state';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { ShowDocPreviewSideDialog } from 'src/app/store/app.actions';
import {
  PdfViewerComponent, 
  MagnificationService, 
  NavigationService, 
  TextSelectionService, 
  AnnotationService, 
  ToolbarService,
} from '@syncfusion/ej2-angular-pdfviewer';
import { sortByField } from '@shared/helpers/sort-by-field.helper';

@Component({
  selector: 'app-send-group-email',
  templateUrl: './send-group-email.component.html',
  styleUrls: ['./send-group-email.component.scss'],
  providers: [ToolbarService, LinkService, ImageService, HtmlEditorService, TableService, MagnificationService, NavigationService, TextSelectionService, AnnotationService],
})
export class SendGroupEmailComponent
  extends AbstractGridConfigurationComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  public tools = toolsRichTextEditor;
  public form: FormGroup;
  @Input() groupEmailTemplateForm: FormGroup;
  @Input() title: string;
  @Input() emailSubject: string;
  @Input() emailBody: string;
  @Input() emailTo: string | null;
  @Input() emailCc: string | null;
  @Input() isSend: boolean = true;
  @Input() fileName : string | null;
  @Input() isFormInvalid: boolean = false;
  @Input() businessUnitType: number | null;
  @Input() businessUnit: number | null;  
  @Input() userTypeInput: number | null;
  @Input() fileNameInput: string | undefined;
  @Input() id:any;
  override selectedItems: any;

  public selectedBusinessUnit: number | null;

  @Output() formCancelClicked = new EventEmitter();
  @Output() formSaveClicked = new EventEmitter();

  @Select(SecurityState.bussinesData)
  public businessData$: Observable<BusinessUnit[]>;

  @Select(SecurityState.allUsersPage)
  public userData$: Observable<UsersPage>;

  @Select(AlertsState.GetGroupEmailInternalUsers)
  public groupEmailUserData$: Observable<User[]>;

  @Select(AlertsState.UserSubscriptionPage)
  public userSubscriptionPage$: Observable<UserSubscriptionPage>;

  @Select(AlertsState.UpdateUserSubscription)
  public updateUserSubscription$: Observable<boolean>;

  @Select(AppState.isDarkTheme)
  isDarkTheme$: Observable<boolean>;

  @Select(AppState.shouldDisableUserDropDown)
  public shouldDisableUserDropDown$: Observable<boolean>;

  @Select(SecurityState.organisations)
  public organizationData$: Observable<Organisation[]>;

  @Select(AlertsState.GetGroupRolesByOrgId)
  public roleData$: Observable<GroupEmailRole[]>;

  @Select(AlertsState.GetGroupEmailAgencies)
  public agencyData$: Observable<AgencyDto[]>;

  @Select(AlertsState.GetGroupEmailSkills)
  public skillData$: Observable<MasterSkillDto[]>;

  @Select(AlertsState.GetGroupEmailDeptSkills)
  public deptSkillData$: Observable<MasterSkillDto[]>;

  @Select(AlertsState.GetGroupEmailCandidates)
  public candidateData$: Observable<User[]>;

  @Select(AlertsState.GetGroupEmailEmployees)
  public employeeData$: Observable<User[]>;

  @Select(AlertsState.GetGroupEmailCandidateStatuses)
  public candidateStatusData$: Observable<CandidateStatusAndReasonFilterOptionsDto[]>;

  @Select(AlertsState.documentDownloadDetail)
  documentDownloadDetail$: Observable<DownloadDocumentDetail>;

  @Select(AlertsState.getStaffScheduleReportOptionData)
  public staffScheduleReportFilterData$: Observable<StaffScheduleReportFilterOptions>;

  public organizations: Organisation[] = [];
  public agencies: AgencyDto[] = [];
  public regionsList: Region[] = [];
  public candidateStatusData: CandidateStatusAndReasonFilterOptionsDto[] = [];
  public orderTypes: any[] = OrderTypeOptions;
  public defaultOrderTypes: (number | undefined)[] = OrderTypeOptions.map((list) => list.id);
  public locationsList: Location[] = [];
  public locationsData: Location[] = [];
  public departmentsData: Department[] = [];
  public departmentsList: Department[] = [];
  public regionFields: FieldSettingsModel = { text: 'name', value: 'id' };
  public agencyFields: FieldSettingsModel = { text: 'agencyName', value: 'agencyId' };
  public candidateStatusFields: FieldSettingsModel = { text: 'statusText', value: 'status' };
  @ViewChild('pdfViewer', { static: true })
  public pdfViewer: PdfViewerComponent;
  @ViewChild('RTEGroupEmail') public rteObj: RichTextEditorComponent;
  private listboxEle: HTMLElement;
  private editArea: HTMLElement;
  public userData: User[];
  public agencyData: AgencyDto[];
  public businessData: BusinessUnit[];
  public roleData: GroupEmailRole[];
  public skillData: MasterSkillDto[];
  public workCommitmentData:workCommitmentDto[];
  public range: Range = new Range();
  public isBusinessFormDisabled = false;
  public businessUnits = BUSINESS_UNITS_VALUES;
  public optionFields = OPRION_FIELDS;
  public businessDataFields = BUSINESS_DATA_FIELDS;
  public userDataFields = User_DATA_FIELDS;
  public allOption: string = 'All';
  public placeholderValue: string = 'Select User';
  public readonly maxFileSize = 2000000; // 2 mb
  private isAlive: boolean = true;
  defaultBusinessValue: any;
  defaultUserValue: any;
  defaultValue: number;
  defaultUserType: number = 1;
  public userGuid: string = '';
  private filters: UserSubscriptionFilters = {};
  public unsubscribe$: Subject<void> = new Subject();
  public orgStructureData: any;
  public dropElement: HTMLElement;
  public readonly allowedExtensions: string = '.pdf, .doc, .docx, .jpg, .jpeg, .png';
  public uploaderErrorMessageElement: HTMLElement;
  public file: any;
  public files: File[] = [];
  public commonFields: FieldSettingsModel = { text: 'name', value: 'value' };
  public userType: any = [];
  public filteredUserType: any = [];
  @ViewChild('filesUploaderGroupEmail') uploadObj: UploaderComponent;

  public isOrgInternalUserType: boolean = false;
  public isOrgCandidatesType: boolean = false;
  public isAgencyUserType: boolean = false;
  public hideUserTypeControl: boolean = false;
  public isAgencyCandidatesType: boolean = false;
  public isBusinessUnitTypeAgency: boolean = false;
  public isEmployeeType: boolean = false;
  public isOrgUser: boolean = false;
  public userBusinessUnitType: BusinessUnitType | undefined;
  public uploaderstatus:boolean = true;
  public service: string = 'https://ej2services.syncfusion.com/production/web-services/api/pdfviewer';
  public downloadedFileName: string = '';
  public dialogWidth: string = '434px';
  public previewUrl: SafeResourceUrl | null;
  public isImage: boolean = false;
  public isWordDoc: boolean = false;
  public isPdf: boolean = false;
  public pdfDocumentPath:string = "";
  public previewTitle: string = "Document Preview";
  public isExcel: boolean = false;
  fileAsBase64: string;
  faDownload = faDownload as IconProp;


  constructor(private actions$: Actions, 
              private store: Store, 
              private fb: FormBuilder,
              private changeDetectorRef: ChangeDetectorRef,
              private sanitizer: DomSanitizer,
              private orderManagementContentService: OrderManagementContentService) {
    super();
  }
  get businessUnitControl(): AbstractControl {
    return this.groupEmailTemplateForm.get('businessUnit') as AbstractControl;
  }

  get businessControl(): AbstractControl {
    return this.groupEmailTemplateForm.get('business') as AbstractControl;
  }
  get businessesControl(): AbstractControl {
    return this.groupEmailTemplateForm.get('businesses') as AbstractControl;
  }
  get orientationCompleteControl(): AbstractControl {
    return this.groupEmailTemplateForm.get('orientationComplete') as AbstractControl;
  }
  get usersControl(): AbstractControl {
    return this.groupEmailTemplateForm.get('user') as AbstractControl;
  }
  get richTextControl(): AbstractControl {
    return this.groupEmailTemplateForm.get('emailBody') as AbstractControl;
  }

  get regionControl(): AbstractControl {
    return this.groupEmailTemplateForm.get('region') as AbstractControl;
  }

  get locationControl(): AbstractControl {
    return this.groupEmailTemplateForm.get('location') as AbstractControl;
  }

  get departmentControl(): AbstractControl {
    return this.groupEmailTemplateForm.get('departmentIds') as AbstractControl;
  }

  get rolesControl(): AbstractControl {
    return this.groupEmailTemplateForm.get('roles') as AbstractControl;
  }

  get agenciesControl(): AbstractControl {
    return this.groupEmailTemplateForm.get('agencies') as AbstractControl;
  }

  get skillsControl(): AbstractControl {
    return this.groupEmailTemplateForm.get('skills') as AbstractControl;
  }

  get workCommitmentsControl(): AbstractControl {
    return this.groupEmailTemplateForm.get('workCommitments') as AbstractControl;
  }

  get orderTypesControl(): AbstractControl {
    return this.groupEmailTemplateForm.get('orderTypes') as AbstractControl;
  }

  get statusControl(): AbstractControl {
    return this.groupEmailTemplateForm.get('candidateStatus') as AbstractControl;
  }

  get candidateStatusControl(): AbstractControl {
    return this.groupEmailTemplateForm.get('candidateStatus') as AbstractControl;
  }

  get jobIDControl(): AbstractControl {
    return this.groupEmailTemplateForm.get('jobID') as AbstractControl;
  }

  get userTypeControl(): AbstractControl {
    return this.groupEmailTemplateForm.get('userType') as AbstractControl;
  }

  get candidateControl(): AbstractControl {
    return this.groupEmailTemplateForm.get('candidate') as AbstractControl;
  }

  get subjectControl(): AbstractControl { 
    return this.groupEmailTemplateForm.get('emailSubject') as AbstractControl; 
  }

  get emailToControl(): AbstractControl { 
    return this.groupEmailTemplateForm.get('emailTo') as AbstractControl; 
  }

  get emailBodyControl(): AbstractControl { 
    return this.groupEmailTemplateForm.get('emailBody') as AbstractControl; 
  }

  get emailCcControl(): AbstractControl { 
    return this.groupEmailTemplateForm.get('emailCc') as AbstractControl; 
  }

  private dispatchNewPage(user: any, sortModel: any = null, filterModel: any = null): void {
    const { businessUnit } = this.groupEmailTemplateForm?.getRawValue();
    if (user != 0 && businessUnit != null) {
      this.userGuid = user;
      this.store.dispatch(
        new GetUserSubscriptionPage(
          businessUnit || null,
          user,
          this.currentPage,
          this.pageSize,
          sortModel,
          filterModel,
          this.filters
        )
      );
    }
  }

  receivedData(data: any) {}
  ngOnInit(): void {
    this.onBusinessUnitValueChanged();
    this.onBusinessValueChanged();
    this.onBusinessesValueChanged();
    this.onUserValueChanged();
    this.onRolesValueChanged();
    this.onUserTypeValueChanged();
    this.onRegionValueChanged();
    this.onLocationValueChanged();
    this.onDepartmentValueChanged();    
    this.onSkillsValueChanged();
    this.onCandidateValueChanged();
    this.onCandidateStatusValueChanged();
    this.onOrderTypeValueChanged();
    this.onWorkCommitmentValueChanged();
    this.onOrientationValueChanged();
    const user = this.store.selectSnapshot(UserState.user);
    this.userBusinessUnitType = user?.businessUnitType;
    if (user?.businessUnitType === BusinessUnitType.MSP || 
      user?.businessUnitType === BusinessUnitType.Hallmark) {
      this.businessUnitControl.patchValue(BusinessUnitType.Organization);
      this.businessUnitType = BusinessUnitType.Organization;
    } else {    
      this.businessUnitControl.patchValue(user?.businessUnitType);
      this.businessUnitType = user?.businessUnitType as BusinessUnitType;
    }
    this.isBusinessUnitTypeAgency = user?.businessUnitType === BusinessUnitType.Agency;
    if (user?.businessUnitType) {
      this.isBusinessFormDisabled = DISABLED_GROUP.includes(user?.businessUnitType);
      // this.isBusinessFormDisabled && this.groupEmailTemplateForm.disable();
    }
    this.isOrgUser = false;
    if (user?.businessUnitType === BusinessUnitType.MSP) {
      const [Hallmark, ...rest] = this.businessUnits;
      this.businessUnits = rest;
    } else if (user?.businessUnitType === BusinessUnitType.Organization) {
      this.isOrgUser = true;
      this.businessUnits = [
        { id: BusinessUnitType.Agency, text: 'Agency' },
        { id: BusinessUnitType.Organization, text: 'Organization' },
      ];
    } else if (user?.businessUnitType === BusinessUnitType.Agency) {
      this.businessUnits = [
        { id: BusinessUnitType.Agency, text: 'Agency' }
      ];
    }

    if(this.isSend == true)
      this.businessControl.patchValue(this.isBusinessFormDisabled ? user?.businessUnitId : 0);

    this.actions$.pipe(takeWhile(() => this.isAlive));

    this.businessData$.pipe(takeWhile(() => this.isAlive)).subscribe((data) => {
      if (data != undefined) {
        this.businessData = data;
        if(this.isSend == true){
          this.defaultBusinessValue = data[0]?.id;
          if (!this.isBusinessFormDisabled) {
            this.defaultValue = data[0]?.id;
          }        
        }
      }
    });

    this.populateUserType();

    this.store.dispatch(new GetOrganizationsStructureAll(user?.id!));
    if(this.isBusinessFormDisabled) {
      this.organizationData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
        this.organizations = [];
        if (data != null && data.length > 0) {
          this.organizations = uniqBy(data, 'organizationId');
        }
      });
    }
  }

  populateUserType(): void{
    this.userType = [];
    var agencyUserTypes = Object.keys(AgencyUserType);
    agencyUserTypes.forEach((v, i) => {
      if (i > agencyUserTypes.length / 2 - 1) {
        var val = parseInt(agencyUserTypes[i - agencyUserTypes.length / 2]);
        this.userType.push({ name: v, value: val, isAgency: true });
      }
    });

    var orgUserTypes = Object.keys(OrganizationUserType);
    orgUserTypes.forEach((v, i) => {
      if (i > orgUserTypes.length / 2 - 1) {
        var val = parseInt(orgUserTypes[i - orgUserTypes.length / 2]);
        this.userType.push({ name: v, value: val, isAgency: false });
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.isAlive = false;
  }
  private dispatchUserPage(businessUnitIds: number[]) {
    if (this.businessUnitControl.value != null) {
      this.store.dispatch(
        new GetAllUsersPage(
          this.businessUnitControl.value,
          businessUnitIds,
          this.currentPage,
          this.pageSize,
          null,
          null,
          true
        )
      );
    }
  }

  public onFileSelectedGroup(event: SelectedEventArgs): void {
    if (event.filesData[0].statusCode !== '1') {
      this.addFilesValidationMessage(event.filesData[0]);
    } else {
      this.files = [];
      this.file = event.filesData[0];
      this.files.push(this.file.rawFile);
      this.groupEmailTemplateForm.controls['fileUpload'].setValue(this.file.rawFile);
    }
  }

  public browseGroupEmail(): void {
    document
      .getElementById('group-attachment-files')
      ?.getElementsByClassName('e-file-select-wrap')[0]
      ?.querySelector('button')
      ?.click();
  }

  private addFilesValidationMessage(file: FileInfo) {
    requestAnimationFrame(() => {
      this.uploaderErrorMessageElement = document.getElementsByClassName('e-validation-fails')[0] as HTMLElement;
      if (this.uploaderErrorMessageElement) {
        this.uploaderErrorMessageElement.innerText =
          file.size > this.maxFileSize
            ? 'The file exceeds the limitation, max allowed 2 MB.'
            : 'The file should be in pdf, doc, docx, jpg, jpeg, png format.';
      }
    });
  }

  private onBusinessUnitValueChanged(): void {    
    this.businessUnitControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {
      this.isBusinessUnitTypeAgency = false;
      if (this.isSend == true && value != null) {
        this.clearFields();
        this.businessControl.patchValue(0);
        this.businessesControl.patchValue([]);
        this.userTypeControl.patchValue(0);        
        this.userData = [];
        this.dispatchNewPage(null);
        this.isAgencyCandidatesType = false;
        this.isAgencyUserType = false;
        this.isOrgCandidatesType = false;
        this.isOrgInternalUserType = false;        
        this.filteredUserType = [];
        if (value == 3) {
          this.filteredUserType = this.userType.filter((i: any) => i.isAgency == false);
        }
        if (value == 4) {
          this.filteredUserType = this.userType.filter((i: any) => i.isAgency == true);
          this.isBusinessUnitTypeAgency = true;
          if (this.isOrgUser) {
             this.filteredUserType.splice(1, 1);
          }
        }
        if (value == 1) {
          this.dispatchUserPage([]);
        } else {          
          this.businessData = [];
          if (this.isOrgUser && value == 4) {            
            this.orderManagementContentService.getAssociateAgencies().subscribe((data) => {
              if(data != undefined && data.length > 0){
                let businessUnits:BusinessUnit[] = [];
                data.forEach((item) => {
                  businessUnits.push({ 
                    id:item.agencyId, 
                    name:item.agencyName, 
                    businessUnitType: 0,
                    parentUnitId:0,
                    agencyStatus:0
                  });
                });
                this.businessData = businessUnits;                
              }
            });
          } else {
            this.store.dispatch(new GetBusinessByUnitType(value));
            this.businessData$.pipe(takeWhile(() => this.isAlive)).subscribe((data) => {
              if (!this.isBusinessFormDisabled && data.length > 0) {                
                this.businessData = data;
                if (this.groupEmailTemplateForm.controls['business'].value != data[0].id) {
                  this.groupEmailTemplateForm.controls['business'].setValue(data[0].id);
                }                
              }
              if (this.userBusinessUnitType === BusinessUnitType.Agency){
                var defaultAgencies = data.map((list) => list.id);
                console.log(defaultAgencies);
                this.businessesControl.setValue(defaultAgencies);
              }
            });
          }
          this.organizationData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
            this.organizations = [];
            if (data != null && data.length > 0) {
              this.organizations = uniqBy(data, 'organizationId');
            }
          });
          //this.userData$.pipe(takeWhile(() => this.isAlive)).subscribe((data) => {});
        }
      }
      if(this.isSend == false){      
        this.defaultBusinessValue = null;
        if(value != undefined) {
          if (this.isOrgUser && value == 4) {
            this.isBusinessUnitTypeAgency = true;            
            this.orderManagementContentService.getAssociateAgencies().subscribe((data) => {
              if(data != undefined && data.length > 0) {
                let businessUnits:BusinessUnit[] = [];
                data.forEach((item) => {
                  businessUnits.push({ 
                    id:item.agencyId, 
                    name:item.agencyName, 
                    businessUnitType: 0,
                    parentUnitId:0,
                    agencyStatus:0
                  });
                });
                this.businessData = businessUnits;                
              }
              if(this.businessUnit != undefined) {
                let businessUnits : (number | undefined)[] = [];
                businessUnits.push(this.businessUnit)
                this.groupEmailTemplateForm.controls['businesses'].setValue(businessUnits);
              }
            });
          } else {
            this.store.dispatch(new GetBusinessByUnitType(value));
            this.businessData$.pipe(takeWhile(() => this.isAlive)).subscribe((data) => {                      
              if(this.businessUnit != undefined)
                this.groupEmailTemplateForm.controls['business'].setValue(this.businessUnit);
            });
          }
        }
        if (value == 3) 
          this.filteredUserType = this.userType.filter((i: any) => i.isAgency == false);        
        if (value == 4)
          this.filteredUserType = this.userType.filter((i: any) => i.isAgency == true);                  
      }
    });
  }
  private onBusinessesValueChanged(): void {
    this.businessesControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {
      if(this.isSend == true){      
        this.clearFields();
        if(this.isAgencyCandidatesType)
          this.getCandidates();
        else {
          this.userData = [];            
          if(this.isOrgUser){
            let businessUnitIds = value.join();
            this.store.dispatch(new GetGroupEmailInternalUsers('null', 'null', 'null', businessUnitIds, true));
            this.groupEmailUserData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
              if(data != undefined) this.userData = data;
            });
          } else {
            let businessUnitIds = value;
            this.dispatchUserPage(businessUnitIds);
            this.userData$.pipe(takeWhile(() => this.isAlive)).subscribe((data) => {
              if (data != undefined) {
                this.userData = data.items.filter(i => i.isDeleted == false);
              }
            });
          }
        }        
      }
    });
  }

  private onBusinessValueChanged(): void {    
    this.businessControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {
      if (this.isSend == true) {        
        this.clearFields();
        this.userData = [];
        this.ResetForm();        
        let businessUnitIds = [];
        if (value != 0 && value != null) {
          businessUnitIds.push(this.businessControl.value);
        }
        let orgList = this.organizations?.filter((x) => value == x.organizationId);        
        this.regionsList = [];
        this.locationsList = [];
        orgList.forEach((value) => {
          this.regionsList.push(...value.regions);
          value.regions.forEach((region) => {
            this.locationsList.push(...region.locations);
          });
          this.departmentsList = this.locationsList
              .map((obj) => {
                return obj.departments.filter((department) => department.locationId === obj.id);
              })
              .reduce((a, b) => a.concat(b), []);
        });

        this.regionsList = sortByField(this.regionsList, 'name');
        this.locationsList = sortByField(this.locationsList, 'name');
        this.departmentsList = sortByField(this.departmentsList, 'name');

        this.locationsData = this.locationsList;
        this.departmentsData = this.departmentsList;        
        
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  private onUserValueChanged(): void {
    this.usersControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {
      if (this.isSend == true && value != null && value != undefined) {
        this.emailTo = this.userData
          ?.filter((item) => value.indexOf(item.id) !== -1)
          ?.map((item) => item.email)
          ?.join(', ');
      }
    });
  }

  private onCandidateValueChanged(): void {
    this.candidateControl.valueChanges?.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {
      if (this.isSend == true && value != null && value != undefined) {
        this.emailTo = this.userData
          ?.filter((item) => value.indexOf(item.id) !== -1 && item.email != '' && item.email != null)
          ?.map((item) => item.email)
          ?.join(', ');
      }
    });
  }

  private onRegionValueChanged(): void {
    this.regionControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {
      if (value != undefined && value.length > 0) {
        this.locationsList = this.locationsData.filter((i) => value.indexOf(i.regionId) !== -1);
        if(this.isEmployeeType) this.getEmployees();
      } else {
        this.locationsList = this.locationsData;
        this.locationControl.patchValue([]);        
      }
    });
  }

  private onLocationValueChanged(): void {
    this.locationControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {      
      if(this.isOrgInternalUserType){
        this.getUsersByRole();
      }
      if(this.isOrgCandidatesType){
        this.userData = [];
        this.candidateControl.patchValue([]);
        if (value != undefined && value.length > 0) {
          this.getCandidates()
        }
      }    
      if(this.isEmployeeType){
        this.departmentsList = this.departmentsData.filter((i) => value.indexOf(i.locationId) !== -1);
        if (value != undefined && value.length > 0)  this.getEmployees();
      } 
    });
  }

  private onDepartmentValueChanged(): void {
    this.departmentControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {
      this.getSkillsByDepartments();      
    });
  }

  private onWorkCommitmentValueChanged(): void {
    this.workCommitmentsControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {      
      if (value != undefined && value.length > 0) 
        this.getEmployees(); 
    });
  }

  private onOrientationValueChanged(): void { 
    this.orientationCompleteControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {      
      if (value != undefined && value != null 
        && (this.regionControl.value?.length > 0 || 
          this.locationControl.value?.length > 0 ||
          this.departmentControl.value?.length > 0 ||
          this.skillsControl.value?.length > 0 ||
          this.workCommitmentsControl.value?.length > 0)) 
        this.getEmployees(); 
    });
  }

  private getSkillsByDepartments(): void{
    this.skillData = [];
    var departments = this.departmentControl.value.join();
    var businessId = this.businessControl.value;        
    if(departments !=''){
      this.store.dispatch(new GetGroupEmailDepartmentSkills(departments, businessId));
      this.deptSkillData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
        this.skillData = data;
        this.getEmployees(); 
      });
    }else{      
      if(businessId > 0 && this.regionControl.value?.length > 0 && this.locationControl.value?.length > 0){
        this.loadSkillsAndWorkCommitments(businessId);
      }
    }
  }

  private onRolesValueChanged(): void {
    this.rolesControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {
      this.getUsersByRole();      
    });
  }

  private getUsersByRole(): void{
    this.userData = [];
    var regionId = this.regionControl.value.join();
    var locationId = this.locationControl.value.join();
    var roles = this.rolesControl.value.join();
    var businessUnitId = this.businessControl.value;
    if(regionId !='' && locationId !='' && roles !=''){
      this.store.dispatch(new GetGroupEmailInternalUsers(regionId, locationId, roles, businessUnitId, false));
      this.groupEmailUserData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
        this.userData = data;
      });
    }
  }

  private onUserTypeValueChanged(): void {
    this.userTypeControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => { 
      if(this.isSend == true){     
        this.isAgencyCandidatesType = false;
        this.isAgencyUserType = false;
        this.isOrgCandidatesType = false;
        this.isOrgInternalUserType = false;
        this.isEmployeeType = false;
        this.clearFields();
        var businessUnit = this.businessUnitControl.value;
        var businessId = this.businessControl.value;        
        if (businessUnit == 3) {
          if (value == 1) {
            this.isOrgInternalUserType = true;
            this.userData = [];
            this.dispatchNewPage(null);
            if (businessId != undefined && businessId > 0) {
              this.store.dispatch(new GetGroupEmailRoles(businessId));
              this.roleData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
                this.roleData = data;
              });
            }              
          }
          if (value == 2) {            
            this.userData = [];
            this.dispatchNewPage(null);
            this.isOrgCandidatesType = true;
            this.skillsControl.patchValue([]);
            this.candidateControl.patchValue([]);
            this.store.dispatch(new GetGroupEmailAgencies(businessId));
            this.agencyData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
              this.agencyData = data;
            });

            this.store.dispatch(new GetGroupEmailSkills(businessId, 0));
            this.skillData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
              this.skillData = data;
            });

            this.store.dispatch(new GetGroupEmailCandidateStatuses(businessId));
            this.candidateStatusData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
              this.candidateStatusData = data;
              let billRatePending = this.candidateStatusData.filter((item)=>item.statusText=="Bill Rate Pending")[0];
              let billRatePendingIndex = this.candidateStatusData.indexOf(billRatePending, 0);
              this.candidateStatusData.splice(billRatePendingIndex, 1);

              let offeredBillRate = this.candidateStatusData.filter((item)=>item.statusText=="Offered Bill Rate")[0];
              let offeredBillRateIndex = this.candidateStatusData.indexOf(offeredBillRate, 0);
              this.candidateStatusData.splice(offeredBillRateIndex, 1);
            });
          }
          if (value == 4) {                    
            this.isEmployeeType = true; 
            this.userData = [];
            this.loadSkillsAndWorkCommitments(businessId);
          }   
        } else if (businessUnit == 4) {
          if (value == 1) {
            this.isAgencyUserType = true;
            this.userData = [];            
            if(this.isOrgUser){
              let businessUnitIds = this.businessesControl.value.join();
              this.store.dispatch(new GetGroupEmailInternalUsers('null', 'null', 'null', businessUnitIds, true));
              this.groupEmailUserData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
                if(data != undefined) this.userData = data;
              });
            } else {
              let businessUnitIds = this.businessesControl.value;
              this.dispatchUserPage(businessUnitIds);
              this.userData$.pipe(takeWhile(() => this.isAlive)).subscribe((data) => {
                if (data != undefined) {
                  this.userData = data.items.filter(i => i.isDeleted == false);
                }
              });
            }
          }
          if (value == 2) {            
            this.userData = [];
            this.usersControl.patchValue([]);          
            this.isAgencyCandidatesType = true;          
            this.skillsControl.patchValue([]);
            this.candidateControl.patchValue([]);
            this.store.dispatch(new GetGroupEmailSkills(businessId, 1));
            this.skillData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
              this.skillData = data;
            });
          }
        }
      }
    });
  }

  private loadSkillsAndWorkCommitments(businessId:any): void{
    let businessIdData = [];
    businessIdData.push(businessId);
    let filter: CommonReportFilter = {
      businessUnitIds: businessIdData,
    };
    this.store.dispatch(new GetStaffScheduleReportFilterOptions(filter));
    this.staffScheduleReportFilterData$
      .pipe(takeWhile(() => this.isAlive))
      .subscribe((data: StaffScheduleReportFilterOptions | null) => {            
        if (data != null) {
          this.workCommitmentData = [];
          this.skillData = [];
          this.workCommitmentData = data.masterWorkCommitments;
          this.skillData = data.masterSkills;                  
        }
      });      
  }

  private onSkillsValueChanged(): void {
    this.skillsControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {                        
      this.userData = [];
      this.candidateControl.patchValue([]);
      if (value != undefined && value.length > 0) 
        this.isEmployeeType ? this.getEmployees() : this.getCandidates();      
    });
  }

  private onOrderTypeValueChanged(): void {
    this.orderTypesControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {
      if (value != undefined && value.length > 0) 
        this.getCandidates();      
    });
  }

  private onCandidateStatusValueChanged(): void {
    this.candidateStatusControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {
      if (value != undefined && value.length > 0) 
        this.getCandidates();      
    });
  }

  private clearFields(): void {
    this.usersControl.patchValue([]);
    this.skillsControl.patchValue([]);
    this.candidateControl.patchValue([]);
    this.regionControl.patchValue([]);
    this.locationControl.patchValue([]);
    this.departmentControl.patchValue([]);
    this.rolesControl.patchValue([]);
    this.agenciesControl.patchValue([]);
    this.orderTypesControl.patchValue([]);
    this.statusControl.patchValue([]);
    this.workCommitmentsControl.patchValue([]);
    this.orientationCompleteControl.patchValue(false);
    this.jobIDControl.patchValue('');  
  }

  onJobIdStatusValueChanged(): void {
    this.getCandidates();
  }

  private getCandidates(): void {
    this.candidateControl.patchValue([]);
    this.userData = [];
    var agencies =
      this.agenciesControl.value != null && this.agenciesControl.value != undefined
        ? this.agenciesControl.value.join()
        : 'null';
    var skills =
      this.skillsControl.value != null && this.skillsControl.value != undefined
        ? this.skillsControl.value.join()
        : 'null';
    var regions =
      this.regionControl.value != null && this.regionControl.value != undefined
        ? this.regionControl.value.join()
        : 'null';
    var locations =
      this.locationControl.value != null && this.locationControl.value != undefined
        ? this.locationControl.value.join()
        : 'null';
    var orderTypes =
      this.orderTypesControl.value != null && this.orderTypesControl.value != undefined
        ? this.orderTypesControl.value.join()
        : 'null';
    var statuses =
      this.candidateStatusControl.value != null && this.candidateStatusControl.value != undefined
        ? this.candidateStatusControl.value.join()
        : 'null';
    var jobId =
      this.jobIDControl.value != null && this.jobIDControl.value != undefined && this.jobIDControl.value != ''
        ? this.jobIDControl.value
        : 'null';
    
    var businessUnitId = []; 
    if(this.isAgencyCandidatesType)    
      businessUnitId = this.businessesControl.value;
    else
      businessUnitId.push(this.businessControl.value);

    this.store.dispatch(
      new GetGroupEmailCandidates(
        agencies !="" ? agencies : 'null',
        skills !="" ? skills : 'null',
        regions !="" ? regions : 'null',
        locations !="" ? locations : 'null',
        orderTypes !="" ? orderTypes : 'null',
        statuses !="" ? statuses : 'null',
        jobId !="" ? jobId : 'null',
        this.isAgencyCandidatesType ? true : false,
        businessUnitId.length > 0 ? businessUnitId.join(',') : 'null'
      )
    );
    this.candidateData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.userData = data;
    });
  }

  private getEmployees(): void {
    this.candidateControl.patchValue([]);
    this.userData = [];
    var skills =
      this.skillsControl.value != null && this.skillsControl.value != undefined
        ? this.skillsControl.value.join()
        : 'null';
    var regions =
      this.regionControl.value != null && this.regionControl.value != undefined
        ? this.regionControl.value.join()
        : 'null';
    var locations =
      this.locationControl.value != null && this.locationControl.value != undefined
        ? this.locationControl.value.join()
        : 'null';
    var departments =
      this.departmentControl.value != null && this.departmentControl.value != undefined
        ? this.departmentControl.value.join()
        : 'null';
    var workCommitments =
      this.workCommitmentsControl.value != null && this.workCommitmentsControl.value != undefined
        ? this.workCommitmentsControl.value.join()
        : 'null';
    var orientationComplete = this.orientationCompleteControl.value;
    
    this.store.dispatch(
      new GetGroupEmailEmployees(
        this.businessControl.value,
        regions,
        locations,
        departments,
        skills,
        workCommitments,
        orientationComplete
      )
    );
    this.employeeData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      console.log("employeedata",data);
      this.userData = data;
    });

    this.changeDetectorRef.detectChanges();
  }

  rteCreated(): void {
    this.rteObj.toolbarSettings.type = ToolbarType.Scrollable;
    this.rteObj.toolbarSettings.enableFloating = true;
    this.rteObj.height = '300px';
  }
  disableControls(isSend: boolean): void {
    let ele = document.getElementById('richTextEditorDiv') as HTMLElement;
    this.hideUserTypeControl = false;
    this.uploadObj?.clearAll();
    this.groupEmailTemplateForm.controls['fileUpload'].patchValue('');
    if (isSend) {
      this.businessControl?.enable();
      this.businessesControl?.enable();
      this.businessUnitControl?.enable();
      const user = this.store.selectSnapshot(UserState.user);
      this.businessControl.patchValue(this.isBusinessFormDisabled ? user?.businessUnitId : 0);
      this.groupEmailTemplateForm.controls['emailTo'].disable();
      this.groupEmailTemplateForm.controls['emailCc'].enable();
      this.groupEmailTemplateForm.controls['emailSubject'].enable();
      this.groupEmailTemplateForm.controls['user'].enable();
      this.groupEmailTemplateForm.controls['userType'].enable();
      this.rteObj.enabled = true;
      ele.className = 'rich-text-container-edit';      
      this.isFormInvalid = false;
      this.groupEmailTemplateForm.markAsUntouched();
    } else {
      this.businessControl?.disable();
      this.businessesControl?.disable();
      this.businessUnitControl?.disable();
      this.groupEmailTemplateForm.controls['emailTo'].disable();
      this.groupEmailTemplateForm.controls['emailCc'].disable();
      this.groupEmailTemplateForm.controls['emailSubject'].disable();
      this.groupEmailTemplateForm.controls['user'].disable();
      this.groupEmailTemplateForm.controls['userType'].disable();
      this.rteObj.enabled = false;
      ele.className = 'rich-text-container-disable';
      this.clearFields();
      this.isAgencyCandidatesType = false;
      this.isOrgCandidatesType = false;
      this.isOrgInternalUserType = false;
      this.isAgencyUserType = false;     
    }
  }

  static createForm(): FormGroup {
    return new FormGroup({
      businessUnit: new FormControl(),
      business: new FormControl(0),
      businesses: new FormControl([]),
      userType: new FormControl(0),
      region: new FormControl(),
      location: new FormControl(),
      departmentIds:new FormControl(),
      roles: new FormControl([]),
      agencies: new FormControl([]),
      skills: new FormControl([]),
      workCommitments: new FormControl([]),
      orderTypes: new FormControl([]),
      candidateStatus: new FormControl([]),
      jobID: new FormControl(''),
      user: new FormControl([]),
      candidate: new FormControl([]),
      orientationComplete: new FormControl(null),
      emailCc: new FormControl('', [emailsValidator()]),
      emailTo: new FormControl('', [
        Validators.required,
        Validators.email,
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
      ]),
      emailSubject: new FormControl('', [Validators.required]),
      emailBody: new FormControl('', [Validators.required]),
      fileUpload: new FormControl(null),
    });
  }  

  onFormCancelClick(): void {
    this.formCancelClicked.emit();
  }
  onFormSaveClick(): void {
    this.formSaveClicked.emit();
  }
  private ResetForm(): void {
    this.groupEmailTemplateForm.controls['emailTo'].setValue('');
    this.groupEmailTemplateForm.controls['emailCc'].setValue('');
    this.groupEmailTemplateForm.controls['emailSubject'].setValue('');
    this.groupEmailTemplateForm.controls['emailBody'].setValue('');
    this.groupEmailTemplateForm.controls['user'].setValue([]);
  }

  public openpdf(id: any) {
    this.downloadedFileName = '';
    const downloadFilter = {
      Id: id,
    }

    this.store.dispatch(new GetDocumentPreviewDeatils(downloadFilter)).pipe(takeUntil(this.unsubscribe$)).subscribe((val) => {
      if (val) {
        var data = val?.null?.documentPreviewDetail;
        if (data != null) {
          if (this.downloadedFileName != data.fileName) {
            this.downloadedFileName = data.fileName;
            if (data.fileAsBase64 && data.fileAsBase64 != '') {
              this.getPreviewUrl(data);
              this.dialogWidth = "1000px";
              this.store.dispatch(new ShowDocPreviewSideDialog(true));
            }
            this.changeDetectorRef.markForCheck();
          }
        }
      }
    });
  }


  load(url: string) {
    this.pdfViewer?.load(url, '');
  }

  getPreviewUrl(file: any) {
    let extension = (file != null) ? file.extension : null;
    switch (extension) {
      case '.pdf':
        this.previewUrl = '';
        this.isPdf = true;
        this.load(`data:application/pdf;base64,${file.fileAsBase64}`);
        break;
      case '.jpg':
        this.isImage = true;
        this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          `data:image/jpg;base64,${file.fileAsBase64}`
        );
        break;
      case '.jpeg':
        this.isImage = true;
        this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          `data:image/jpg;base64,${file.fileAsBase64}`
        );
        break;
      case '.png':
        this.isImage = true;
        this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          `data:image/png;base64,${file.fileAsBase64}`
        );
        break;
      case '.docx':
        this.isWordDoc = true;
        this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://view.officeapps.live.com/op/embed.aspx?src=' + file.sasUrl);
        break;
      case '.doc':
        this.isWordDoc = true;
        this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://view.officeapps.live.com/op/embed.aspx?src=' + file.sasUrl);
        break;
      case '.xlsx':
        this.isWordDoc = true;
        this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://view.officeapps.live.com/op/embed.aspx?src=' + file.sasUrl);
        break;
      case '.xls':
        this.isWordDoc = true;
        this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://view.officeapps.live.com/op/embed.aspx?src=' + file.sasUrl);
        break;
      default:

    }
    this.changeDetectorRef.markForCheck();
  }

  setDocumentMimeTypeDefaults() {
    this.isPdf = false;
    this.isWordDoc = false;
    this.isImage = false;
    this.isExcel = false;
    this.previewUrl = '';
    this.fileAsBase64 = '';
  }

  public onClosePreview(): void {
    this.setDocumentMimeTypeDefaults();
    this.previewUrl = null;
    this.downloadedFileName = '';
    this.changeDetectorRef.markForCheck();
    this.store.dispatch(new ShowDocPreviewSideDialog(false));
  }


  public downloadfile(docId: any) {
    this.setDocumentMimeTypeDefaults();
    const downloadFilter = {
      Id: docId,
    }
    this.store.dispatch(new GetDocumentDownloadDeatils(downloadFilter));
    this.documentDownloadDetail$.pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: DownloadDocumentDetail) => {
        if (data) {
          if (this.downloadedFileName != data.fileName) {
            this.downloadedFileName = data.fileName;
            this.createLinkToDownload(data.fileAsBase64, data.fileName, data.contentType);
          }
        }
      });
    this.changeDetectorRef.markForCheck();
  }
  createLinkToDownload(base64String: string, fileName: string, contentType: string) {
    if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
      const byteChar = atob(base64String);
      const byteArray = new Array(byteChar.length);
      for (let i = 0; i < byteChar.length; i++) {
        byteArray[i] = byteChar.charCodeAt(i);
      }
      const uIntArray = new Uint8Array(byteArray);
      const blob = new Blob([uIntArray], { type: contentType });
      (window.navigator as any).msSaveOrOpenBlob(blob, `${fileName}`);
    } else {
      const source = `data:${contentType};base64,${base64String}`;
      const link = document.createElement('a');
      link.href = source;
      link.download = `${fileName}`;
      link.click();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.dropElement = document.getElementById('droparea') as HTMLElement;    
    }, 4000);
  }

  onFileRemoving(){
    this.uploadObj.clearAll();
  }

  onCCFieldKeyup() {
    this.isFormInvalid = false;
  }
}


export function emailsValidator(): ValidatorFn {
  function validateEmails(emails: string) {
    console.log(emails);
    return (emails.split(',')
      .map(email => Validators.email(<AbstractControl>{ value: email.trim() }))
      .find(_ => _ !== null) === undefined);
  }
  
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === '' || !control.value || validateEmails(control.value)) {
      return null
    }
    return { emails: true };
  }
}