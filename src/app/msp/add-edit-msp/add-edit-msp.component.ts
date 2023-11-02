import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { debounceTime, Observable, takeUntil } from 'rxjs';
import { take } from 'rxjs/operators';

import { ChangeEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { Titles } from '@shared/enums/title';
import { OrganizationTypes } from '@shared/enums/organization-type';
import { User } from '@shared/models/user-managment-page.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { SHOULD_LOC_DEP_INCLUDE_IRP } from '@shared/constants';
import { AddEditOrganizationService } from '@admin/client-management/services/add-edit-organization.service';
import { OrganizationStatus } from '@shared/enums/status';

import { AbstractPermission } from "@shared/helpers/permissions";
import { Country } from 'src/app/shared/enums/states';
import { BusinessUnit } from 'src/app/shared/models/business-unit.model';
import { ContactDetails, Organization } from 'src/app/shared/models/organization.model';
import { SetHeaderState } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import { AdminState } from '@admin/store/admin.state';
import { AppState } from 'src/app/store/app.state';
import { GetOrganizationById, GetOrganizationLogo, SaveOrganization, SetDirtyState, SetBillingStatesByCountry, SetGeneralStatesByCountry, UploadOrganizationLogo, RemoveOrganizationLogo, GetOrganizationByIdSucceeded, GetOrganizationLogoSucceeded, GetBusinessUnitList, GetDBConnections, SaveOrganizationSucceeded } from '@admin/store/admin.actions';
import { AddEditMSPService } from '../services/msp-addedit.service';
import { GetMspById, GetMSPByIdSucceeded, GetMspLogo, GetMspLogoSucceeded, SaveMSP, SaveMSPSucceeded, UploadMspLogo } from '../store/actions/msp.actions';
import { businessUnit, MSP } from '../store/model/msp.model';

@Component({
  selector: 'app-add-edit-msp',
  templateUrl: './add-edit-msp.component.html',
  styleUrls: ['./add-edit-msp.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditMspComponent extends AbstractPermission implements OnInit, OnDestroy {
  public allowExtensions: string = '.png, .jpg, .jpeg';
  public dropElement: HTMLElement;
  public filesDetails: Blob[] = [];
  public filesName: string[] = [];
  public filesList: HTMLElement[] = [];
  public ContactFormArray: FormArray;
  public CreateUnderFormGroup: FormGroup;
  public dataBaseConnectionsFormGroup: FormGroup;
  public GeneralInformationFormGroup: FormGroup;
  public BillingDetailsFormGroup: FormGroup;
  public ContactFormGroup: FormGroup;
  public PreferencesFormGroup: FormGroup;
  public isSameAsOrg: boolean = false;
  public isEditTitle: boolean[] = [];
  public currentBusinessUnitId: number | null = null;
  public title = 'Add';
  public logo: Blob | null = null;
  public titles = Titles;
  public isMspUser = false;
  public organizationTypes = OrganizationTypes;
  public createUnderFields = {
    text: 'name',
    value: 'id',
  };
  public optionFields = {
    text: 'text',
    value: 'id',
  };
  public profileMode: boolean = false;
  public isIRPFlagEnabled = false;
  public isOrgHasIRPPermissions = true;

  private isInitStatusIsActive = false;
  private showDataBaseControlValue: boolean = false;
  private logoToDelete: boolean = false;
  private user: User | null;
  businessvalue:businessUnit

  @Select(AdminState.countries)
  countries$: Observable<string[]>;

  @Select(AdminState.statesGeneral)
  statesGeneral$: Observable<string[]>;

  @Select(AdminState.statesBilling)
  statesBilling$: Observable<string[]>;

  @Select(AdminState.businessUnits)
  businessUnits$: Observable<BusinessUnit[]>;

  @Select(AdminState.sendDocumentAgencies)
  sendDocumentAgencies$: Observable<[]>;

  @Select(AdminState.days)
  days$: Observable<[]>;

  @Select(AdminState.organizationStatuses)
  public organizationStatuses$: Observable<[]>;

  @Select(UserState.user)
  user$: Observable<User>;

  @Select(AdminState.dataBaseConnections)
  dataBaseConnections$: Observable<string[]>;

  @Select(AppState.isSidebarOpened)
  isSidebarOpened$:Observable<boolean>;

  get isAddMode(): boolean {
    return this.title === 'Add';
  }

  get showDataBaseControl(): boolean {
    return this.showDataBaseControlValue;
  }

  set showDataBaseControl(value: boolean) {
    this.showDataBaseControlValue = value;
  }

  constructor(
    private actions$: Actions,
    protected override store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private addEditMspService: AddEditMSPService,
    private confirmService: ConfirmService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super(store);

    this.checkFeatureFlag();
    this.checkOrgPermissions();

    this.startGetOrgByIdActionWatching();
    this.startGetOrgLogoActionWatching();

    if (route.snapshot.paramMap.get('profile')) {
      this.orgProfileActions();
    } else {
      this.orgListActions();

      if (route.snapshot.paramMap.get('id')) {
        this.title = 'Edit';
        const businessUnitId = parseInt(route.snapshot.paramMap.get('id') as string);
        store.dispatch(new GetMspById(businessUnitId));
        store.dispatch(new GetMspLogo(businessUnitId));
      } else {
        this.initForms();
      }
    }
    if (!this.profileMode) {
      this.startSaveOrgActionWatching();
    }
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.dropElement = document.getElementById('droparea') as HTMLElement;
    const user = this.store.selectSnapshot(UserState.user);
    if (user?.businessUnitType === BusinessUnitType.MSP) {
      this.isMspUser = true;
    }
    this.subscribeOnUser();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();

    this.user = null;
  }

  private disableForms(): void {
    if (this.profileMode) {
      this.GeneralInformationFormGroup.disable();
      this.BillingDetailsFormGroup.disable();
    }
  }

  public save(): void {

    if (
      (this.GeneralInformationFormGroup.disabled || this.GeneralInformationFormGroup.valid) &&
      (this.BillingDetailsFormGroup.disabled || this.BillingDetailsFormGroup.valid) &&
      this.ContactFormArray.valid 
    ) {
      const organizationId=true;

      this.store.dispatch(
        new SaveMSP(
          new MSP(
           this.GeneralInformationFormGroup.getRawValue(),
            this.BillingDetailsFormGroup.getRawValue(),
            this.ContactFormArray.getRawValue(),
            this.isSameAsOrg,
            this.businessvalue,
            this.currentBusinessUnitId as number,
          )
        )
      );
      this.store.dispatch(new SetDirtyState(false));
    } else {
      this.GeneralInformationFormGroup.markAllAsTouched();
      this.BillingDetailsFormGroup.markAllAsTouched();
      this.ContactFormArray.markAllAsTouched();
    }
  }

  public browse(): void {
    const wrapper = document.getElementsByClassName('e-file-select-wrap')[0];
    if (wrapper) {
      wrapper.querySelector('button')?.click();
    }
  }

  public editTitleHandler(i: number): void {
    this.isEditTitle[i] = !this.isEditTitle[i];
  }

  private generateContactsFormArray(contacts: ContactDetails[]): Array<FormGroup> {
    const formArray: FormGroup[] = [];
    contacts.forEach((contact: ContactDetails) => {
      formArray.push(this.newContactFormGroup(contact));
    });
    return formArray;
  }

  private newContactFormGroup(contact?: ContactDetails): FormGroup {
    if (contact && contact.title) {
      this.isEditTitle.push(!this.titles.find((val) => val === contact.title));
    } else {
      this.isEditTitle.push(false);
    }

    return this.addEditMspService.createContactForm(contact);
  }

  private createContactForm(): void {
    this.ContactFormArray.push(this.newContactFormGroup());
  }

  public addContact(): void {
    this.createContactForm();
  }

  public removeContact(index: number): void {
    this.isEditTitle.splice(index, 1);
    this.ContactFormArray.removeAt(index);
  }

  private copyGeneralToBilling(): void {
    // Populate billing states dropdown with correct data
    this.store.dispatch(new SetBillingStatesByCountry(this.GeneralInformationFormGroup.controls['country'].value));
    this.addEditMspService.populateBillingForm(this.BillingDetailsFormGroup, this.GeneralInformationFormGroup);
  }

  private enableBillingForm(): void {
    Object.keys(this.BillingDetailsFormGroup.controls)
      .filter((key: string) => key !== 'ext')
      .forEach((key: string) => {
        this.BillingDetailsFormGroup.get(key)?.enable();
      });
  }

  private disableBillingForm(): void {
    Object.keys(this.BillingDetailsFormGroup.controls)
      .filter((key: string) => key !== 'ext')
      .forEach((key: string) => {
        this.BillingDetailsFormGroup.get(key)?.disable();
      });
  }

  public sameAsOrgChange(event: any): void {
    this.isSameAsOrg = event.checked;
    if (this.isSameAsOrg) {
      this.disableBillingForm();
      this.copyGeneralToBilling();
    } else {
      this.enableBillingForm();
    }
  }

  public navigateBack(): void {
      this.router.navigate(['/msp/msp-list']);
   
  }

  public clearForm(): void {
    this.GeneralInformationFormGroup.reset();
    this.BillingDetailsFormGroup.reset();
    this.ContactFormArray.reset();
    this.store.dispatch(new SetDirtyState(false));
  }

  public onGeneralCountryChange(event: ChangeEventArgs): void {
    this.GeneralInformationFormGroup.get('state')?.reset();
    this.store.dispatch(new SetGeneralStatesByCountry(event.value as Country));
  }

  public onBillingCountryChange(event: ChangeEventArgs): void {
    this.BillingDetailsFormGroup.get('state')?.reset();
    this.store.dispatch(new SetBillingStatesByCountry(event.value as Country));
  }

  public uploadImages(businessUnitId: number): void {
    if (this.filesDetails.length) {
      this.store.dispatch(new UploadMspLogo(this.filesDetails[0] as Blob, businessUnitId));
    } else if (this.logo && this.logoToDelete) {
      this.store.dispatch(new RemoveOrganizationLogo(businessUnitId));
    }
  }

  public onImageSelect(event: Blob | null): void {
    if (event) {
      this.logoToDelete = false;
      this.filesDetails = [event as Blob];
    } else {
      this.logoToDelete = true;
      this.filesDetails = [];
    }
  }



  private initForms(organization?: MSP): void {
    let businessUnitId: string | number = '';
    if (organization?.mspDetails?.id) {
      businessUnitId = organization.mspDetails.id;
    } else if (organization?.mspDetails?.id === null) {
      businessUnitId = 0;
    }

    this.GeneralInformationFormGroup = this.addEditMspService.createGeneralInfoGroup(organization, this.user);
  
   this.GeneralInformationFormGroup.valueChanges.pipe(debounceTime(500), takeUntil(this.componentDestroy())).subscribe(() => {
      this.store.dispatch(new SetDirtyState(this.GeneralInformationFormGroup.dirty));
    });
    if(this.title=='Edit')
    {
      this.changeDetectorRef.detectChanges()
    }
     this.BillingDetailsFormGroup = this.addEditMspService.createBillingDetailForm(organization);

    this.BillingDetailsFormGroup.valueChanges.pipe(debounceTime(500), takeUntil(this.componentDestroy())).subscribe(() => {
      this.store.dispatch(new SetDirtyState(this.BillingDetailsFormGroup.dirty));
    });
    if(this.title=='Edit')
    {
      this.changeDetectorRef.detectChanges()
    }
    if (organization) {
      this.ContactFormGroup = this.fb.group({
        contacts: new FormArray(this.generateContactsFormArray(organization.mspContactDetails)),
      });
    } else {
      this.ContactFormGroup = this.fb.group({
        contacts: new FormArray([this.newContactFormGroup()]),
      });
    }
    this.ContactFormGroup.valueChanges.pipe(debounceTime(500), takeUntil(this.componentDestroy())).subscribe(() => {
      this.store.dispatch(new SetDirtyState(this.ContactFormGroup.dirty));
    });
    this.ContactFormArray = this.ContactFormGroup.get('contacts') as FormArray;

 

    this.isInitStatusIsActive = organization?.mspDetails.status === OrganizationStatus.Active;
    
    if(this.title=='Edit')
    {
      this.changeDetectorRef.detectChanges()
    }
    if (organization) {
      //Populate state dropdown with values based on selected country
      this.store.dispatch(new SetGeneralStatesByCountry(organization.mspDetails.country));
      this.store.dispatch(new SetBillingStatesByCountry(organization.mspDetails.country));
      this.store.dispatch(new SetDirtyState(false));
    } else {
      this.store.dispatch(new SetGeneralStatesByCountry(Country.USA));
      this.store.dispatch(new SetBillingStatesByCountry(Country.USA));
      this.store.dispatch(new SetDirtyState(false));
    }

  }

  private subscribeOnUser(): void {
    this.user$.pipe(takeUntil(this.componentDestroy())).subscribe((user) => {
      this.user = user;
      this.showDataBaseControl = this.title === 'Add' && this.user?.businessUnitType === BusinessUnitType.Hallmark;
    });
  }



  private startGetOrgByIdActionWatching(): void {
    this.actions$
      .pipe(ofActionSuccessful(GetMSPByIdSucceeded), takeUntil(this.componentDestroy()))
      .subscribe((organization: { payload: MSP }) => {
        this.businessvalue=organization.payload.businessUnit
        this.currentBusinessUnitId = organization.payload.mspDetails.id as number;
        this.initForms(organization.payload);
        this.isSameAsOrg = organization.payload.mspBillingDetails.sameAsMsp;
        if (this.isSameAsOrg) {
          this.disableBillingForm();
        }
        if (this.profileMode) {
          this.disableForms();
        }
      });
  }

  private startGetOrgLogoActionWatching(): void {
    this.actions$
      .pipe(ofActionSuccessful(GetMspLogoSucceeded), takeUntil(this.componentDestroy()))
      .subscribe((logo: { payload: Blob }) => {
        this.logo = logo.payload;
        this.changeDetectorRef.detectChanges()
      });
  }

  private orgProfileActions(): void {
    this.profileMode = true;
    this.store.dispatch(new SetHeaderState({ iconName: 'organization', custom: true, title: 'Organization Profile' }));
    const user = this.store.selectSnapshot(UserState.user);
    this.store.dispatch(new GetMspById(user?.businessUnitId as number));
    this.store.dispatch(new GetMspLogo(user?.businessUnitId as number));
  }

  private orgListActions(): void {
    this.store.dispatch(new SetHeaderState({ iconName: 'organization', custom: true, title: ' MSP List' }));
    this.store.dispatch(new GetBusinessUnitList());
    this.store.dispatch(new GetDBConnections());
  }

  private startSaveOrgActionWatching(): void {
    this.actions$
      .pipe(ofActionSuccessful(SaveMSPSucceeded), takeUntil(this.componentDestroy()))
      .subscribe((msp: { payload: MSP }) => {
         this.currentBusinessUnitId = msp.payload.mspDetails.id as number;
        this.uploadImages(this.currentBusinessUnitId);
        this.navigateBack();
      });
  }

  private checkFeatureFlag(): void {
    this.isIRPFlagEnabled = this.store.selectSnapshot(AppState.isIrpFlagEnabled);
  }

  private checkOrgPermissions(): void {
    this.isOrgHasIRPPermissions = this.store.selectSnapshot(UserState.isHallmarkUser);
  }


}
