import { BUSINESS_DATA_FIELDS, OPRION_FIELDS, User_DATA_FIELDS } from '@admin/alerts/alerts.constants';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Actions, Select, Store } from '@ngxs/store';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { BUSINESS_UNITS_VALUES } from '@shared/constants/business-unit-type-list';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { BusinessUnit } from '@shared/models/business-unit.model';
import { FilteredItem } from '@shared/models/filter.model';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { User, UsersPage } from '@shared/models/user.model';
import { OrderManagementContentService } from '@shared/services/order-management-content.service';
import { Observable, Subject, map, takeUntil, takeWhile } from 'rxjs';
import { APP_SETTINGS, AppSettings } from 'src/app.settings';
import { BUSSINES_DATA_FIELDS } from 'src/app/security/roles-and-permissions/roles-and-permissions.constants';
import { GetAllUsersPage, GetBusinessByUnitType, GetUsersPage } from 'src/app/security/store/security.actions';
import { SecurityState } from 'src/app/security/store/security.state';
import { UNIT_FIELDS } from 'src/app/security/user-list/user-list.constants';
import { SetHeaderState, ShowFilterDialog } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';

@Component({
  selector: 'app-user-activity',
  templateUrl: './user-activity.component.html',
  styleUrls: ['./user-activity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserActivityComponent implements OnInit {
  public title: string = "User Activity Details";
  public message: string = ''
  userActivityForm: FormGroup;
  public businessUnits = BUSINESS_UNITS_VALUES;
  public bussinesDataFields = BUSSINES_DATA_FIELDS;
  public userDataFields = User_DATA_FIELDS;

  public unitFields = UNIT_FIELDS;
  public filteredItems: FilteredItem[] = [];
  private isAlive = true;
  public userData: User[];
  public baseUrl: string = '';

  @Select(SecurityState.allUsersPage)
  public userData$: Observable<UsersPage>;

  @Select(SecurityState.businessUserData)
  public businessUserData$: Observable<(type: number) => BusinessUnit[]>;
  isBusinessFormDisabled = false;
  public reportName: LogiReportFileDetails = { name: "/JsonApiReports/TimeSheetReport/TimeSheet.cls" };
  public catelogName: LogiReportFileDetails = { name: "/JsonApiReports/TimeSheetReport/TimeSheet.cat" };
  public reportType: LogiReportTypes = LogiReportTypes.WebReport;

  public paramsData: any = {
    "businessUnitType":'',
    "businnessUnit":  ''  ,  
    "userId":  ''  ,
    "StartDateParamTS": '',
    "EndDateParamTS": '',
    "BearerParamAR": '',
    "HostName":'',
  };
  @ViewChild(LogiReportComponent, { static: true }) logiReportComponent: LogiReportComponent;

  constructor(private store: Store, private actions$: Actions, private formBuilder: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(APP_SETTINGS) private appSettings: AppSettings

  ) {
    this.baseUrl = this.appSettings.host.replace("https://", "").replace("http://", "");
    this.store.dispatch(new SetHeaderState({ title: "Analytics", iconName: '' }));

   }
  get businessUnitControl(): AbstractControl {
    return this.userActivityForm.get('businessunitType') as AbstractControl;
  }

  get businessControl(): AbstractControl {
    return this.userActivityForm.get('businessunitName') as AbstractControl;
  }

  get userControl(): AbstractControl {
    return this.userActivityForm.get('userName') as AbstractControl;
  }
  isInitialloadCalled=false


  ngOnInit(): void {
    this.initForm();
    this.onBusinesstypeValueChanged();
    this.onBusinesunitValueChanged();
    const user = this.store.selectSnapshot(UserState.user) as User;
    this.businessUnitControl.patchValue(user?.businessUnitType);
    this.businessControl.patchValue(user?.businessUnitId || 0);

  }
  get bussinesUserData$(): Observable<BusinessUnit[]> {
    return this.businessUserData$.pipe(map((fn) => fn(this.businessUnitControl?.value)));
  }
  getLastWeek() {
    var today = new Date(Date.now());
    var lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    return lastWeek;
  }


  private initForm(): void {
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 7);
    this.userActivityForm = this.formBuilder.group(
      {
        businessunitType: new FormControl([], [Validators.required]),
        businessunitName: new FormControl([], [Validators.required]),
        userName: new FormControl([], [Validators.required]),
        startDate: new FormControl(startDate),
        endDate: new FormControl(new Date(Date.now())),
      }
    );
  }
  public onFilterApply(): void {
    this.userActivityForm.markAllAsTouched();
    if (this.userActivityForm.invalid) {
      return;
    }
    this.SearchReport();
    this.store.dispatch(new ShowFilterDialog(false));
  }
  onFilterClearAll() {

  }
  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }
  onFilterDelete(value: any) {


    
  }
  private onBusinesstypeValueChanged(): void {
    this.businessUnitControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {
      value && this.store.dispatch(new GetBusinessByUnitType(value));
      // this.dispatchUserPage([])
      // this.userData=[];
      // this.userData$.pipe(takeWhile(() => this.isAlive)).subscribe((data) => {
      //   if (data != undefined && data != null) {
      //     this.userData = data.items;
      //     this.userControl.patchValue(this.userData[0]?.id)
 
      // }
      // });
      if (!this.isBusinessFormDisabled) {
        this.businessControl.patchValue(0);
      }
    });

  }

  private onBusinesunitValueChanged(): void {

    this.businessControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {
        if(value==0)
        {        

          this.dispatchUserPage([]);
        }
        else{
          this.dispatchUserPage([value]);
          this.userData=[];

        }
        if(!this.isInitialloadCalled)
        {
        this.userData$.pipe(takeWhile(() => this.isAlive)).subscribe((data) => {
          if (data != undefined && data != null) {
            this.userData = data.items;
            this.userControl.patchValue(this.userData[0]?.id)
            if (!this.isInitialloadCalled) { 
              this.isInitialload(); 
              this.isInitialloadCalled = true; 
              this.changeDetectorRef.detectChanges();

          }
          }
        })
      }
        
    })
  
  }


  private dispatchUserPage(businessUnitIds: number[]) {
    if (this.businessUnitControl.value != null) {
      this.store.dispatch(
        new GetAllUsersPage(
          this.userActivityForm.getRawValue().businessunitType,
          businessUnitIds,
          1,
          100,
          null,
          null,
          true
        )
      );
    }


  }


  public SearchReport(): void {   
    console.log(this.userActivityForm)
    this.filteredItems = [];
    let auth = "Bearer ";
    for (let x = 0; x < window.localStorage.length; x++) {
      if (window.localStorage.key(x)!.indexOf('accesstoken') > 0) {
        auth = auth + JSON.parse(window.localStorage.getItem(window.localStorage.key(x)!)!).secret
      }
    }
    console.log(this.userActivityForm.getRawValue())
    let { businessunitType,businessunitName,userName,startDate,endDate } = this.userActivityForm.getRawValue();
 
 

    this.paramsData =
    {
      "businessUnitType":businessunitType,
      "businnessUnit":  businessunitName  ,  
      "userId":  userName  ,
      "StartDateParamTS": startDate,
      "EndDateParamTS": endDate,
      "BearerParamAR": auth,
      "HostName": this.baseUrl,
    };
     this.logiReportComponent.paramsData = this.paramsData;
    // this.logiReportComponent.RenderReport();
  }
  isInitialload(){
    this.SearchReport()
  }

}
