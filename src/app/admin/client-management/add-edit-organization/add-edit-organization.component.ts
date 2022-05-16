import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { ChangeEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { debounceTime, Observable, Subject, takeUntil } from 'rxjs';
import { RECORD_ADDED } from 'src/app/shared/constants/messages';
import { MessageTypes } from 'src/app/shared/enums/message-types';
import { Country } from 'src/app/shared/enums/states';
import { BusinessUnit } from 'src/app/shared/models/business-unit.model';
import { ContactDetails, Organization } from 'src/app/shared/models/organization.model';
import { SetHeaderState, ShowToast } from 'src/app/store/app.actions';
import { SaveOrganization, GetBusinessUnitList, SetBillingStatesByCountry, SetDirtyState, SetGeneralStatesByCountry, UploadOrganizationLogo, SaveOrganizationSucceeded, GetOrganizationById, GetOrganizationByIdSucceeded, GetOrganizationLogo, GetOrganizationLogoSucceeded } from '../../store/admin.actions';
import { AdminState } from '../../store/admin.state';

@Component({
  selector: 'app-add-edit-organization',
  templateUrl: './add-edit-organization.component.html',
  styleUrls: ['./add-edit-organization.component.scss']
})
export class AddEditOrganizationComponent implements OnInit, AfterViewInit, OnDestroy {
  public allowExtensions: string = '.png, .jpg, .jpeg';
  public dropElement: HTMLElement;
  public filesDetails : Blob[] = [];
  public filesName: string[] = [];
  public filesList: HTMLElement[] = [];
  public ContactFormArray: FormArray;
  public CreateUnderFormGroup: FormGroup;
  public GeneralInformationFormGroup: FormGroup;
  public BillingDetailsFormGroup: FormGroup;
  public ContactFormGroup: FormGroup;
  public PreferencesFormGroup: FormGroup;
  public isSameAsOrg: boolean = false;
  public isEditTitle: boolean[] = [false];
  public currentBusinessUnitId: number | null = null;
  public title = 'Add';
  public logo: Blob | null = null;

  public createUnderFields = { 
    text: 'name', value: 'id'
  };

  public optionFields = {
    text: 'text', value: 'id'
  };

  private unsubscribe$: Subject<void> = new Subject();

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

  @Select(AdminState.statuses)
  statuses$: Observable<[]>;

  @Select(AdminState.titles)
  titles$: Observable<[]>;

  constructor(private actions$: Actions, private store: Store, private router: Router, private route: ActivatedRoute, private fb: FormBuilder) {
    actions$.pipe(
      takeUntil(this.unsubscribe$),
      ofActionSuccessful(SaveOrganizationSucceeded)
    ).subscribe((organization: { payload: Organization }) => {
      this.currentBusinessUnitId = organization.payload.organizationId as number;
      this.uploadImages(this.currentBusinessUnitId);
      this.navigateBack();
    });
    actions$.pipe(
      takeUntil(this.unsubscribe$),
      ofActionSuccessful(GetOrganizationByIdSucceeded)
    ).subscribe((organization: { payload: Organization }) => {
      this.currentBusinessUnitId = organization.payload.organizationId as number;
      this.initForms(organization.payload);
      this.isSameAsOrg = organization.payload.billingDetails.sameAsOrganization;
      if (this.isSameAsOrg) {
        this.disableBillingForm();
      }
    });
    actions$.pipe(
      takeUntil(this.unsubscribe$),
      ofActionSuccessful(GetOrganizationLogoSucceeded)
    ).subscribe((logo: { payload: Blob }) => {
      this.logo = logo.payload;
    });
    store.dispatch(new SetHeaderState({iconName: 'file-text', title: 'Organization List'}));
    store.dispatch(new GetBusinessUnitList());
    if (route.snapshot.paramMap.get('organizationId')) {
      this.title = 'Edit';
      const businessUnitId = parseInt(route.snapshot.paramMap.get('organizationId') as string);
      store.dispatch(new GetOrganizationById(businessUnitId));
      store.dispatch(new GetOrganizationLogo(businessUnitId));
    } else {
      this.initForms();
    }
  }

  ngOnInit(): void {
    this.dropElement = document.getElementById('droparea') as HTMLElement;
  }

  ngAfterViewInit(): void {
    
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private initForms(organization?: Organization): void {
    let businessUnitId: string | number = '';
    if (organization?.createUnder?.parentUnitId) {
      businessUnitId = organization.createUnder.parentUnitId;
    } else if (organization?.createUnder?.parentUnitId === null) {
      businessUnitId = 0;
    }
    this.CreateUnderFormGroup = this.fb.group({
      createUnder: new FormControl(businessUnitId, [ Validators.required ])
    });
    this.CreateUnderFormGroup.valueChanges.subscribe(() => {
      this.store.dispatch(new SetDirtyState(this.CreateUnderFormGroup.dirty));
    });
    this.GeneralInformationFormGroup = this.fb.group({
      id: new FormControl(organization ? organization.generalInformation.id : 0),
      name: new FormControl(organization ? organization.generalInformation.name : '', [ Validators.required ]),
      externalId: new FormControl(organization ? organization.generalInformation.externalId : ''),
      taxId: new FormControl(organization ? organization.generalInformation.taxId : '', [ Validators.required, Validators.minLength(9), Validators.pattern(/^[0-9\s\-]+$/) ]),
      addressLine1: new FormControl(organization ? organization.generalInformation.addressLine1 : '', [ Validators.required ]),
      addressLine2: new FormControl(organization ? organization.generalInformation.addressLine2 : ''),
      country: new FormControl(organization ? organization.generalInformation.country : 0, [ Validators.required ]),
      state: new FormControl(organization ? organization.generalInformation.state : '', [ Validators.required ]),
      city: new FormControl(organization ? organization.generalInformation.city : '', [ Validators.required ]),
      zipCode: new FormControl(organization ? organization.generalInformation.zipCode : '', [ Validators.minLength(5), Validators.pattern(/^[0-9]+$/) ]),
      phone1Ext: new FormControl(organization ? organization.generalInformation.phone1Ext : '', [ Validators.pattern(/^[0-9]+$/) ]),
      phone2Ext: new FormControl(organization ? organization.generalInformation.phone2Ext : '', [ Validators.pattern(/^[0-9]+$/) ]),
      fax: new FormControl(organization ? organization.generalInformation.fax : '', [ Validators.pattern(/^[0-9]+$/) ]),
      status: new FormControl(organization ? organization.generalInformation.status : 0, [ Validators.required ]),
      website: new FormControl(organization ? organization.generalInformation.website : '')
    });
    this.GeneralInformationFormGroup.valueChanges.pipe(debounceTime(500)).subscribe(() => {
      this.store.dispatch(new SetDirtyState(this.GeneralInformationFormGroup.dirty));
    });
    this.BillingDetailsFormGroup = this.fb.group({
      id: new FormControl(organization ? organization.billingDetails.id : 0),
      name: new FormControl(organization ? organization.billingDetails.name : '', [ Validators.required ]),
      address: new FormControl(organization ? organization.billingDetails.address : ''),
      country: new FormControl(organization ? organization.billingDetails.country : 0, [ Validators.required ]),
      state: new FormControl(organization ? organization.billingDetails.state : '', [ Validators.required ]),
      city: new FormControl(organization ? organization.billingDetails.city : '', [ Validators.required ]),
      zipCode: new FormControl(organization ? organization.billingDetails.zipCode : '', [ Validators.minLength(5), Validators.pattern(/^[0-9]+$/) ]),
      phone1: new FormControl(organization ? organization.billingDetails.phone1 : '', [ Validators.pattern(/^[0-9]+$/) ]),
      phone2: new FormControl(organization ? organization.billingDetails.phone2 : '', [ Validators.pattern(/^[0-9]+$/) ]),
      fax: new FormControl(organization ? organization.billingDetails.fax : '', [ Validators.pattern(/^[0-9]+$/) ]),
      ext: new FormControl(organization ? organization.billingDetails.ext : '', [ Validators.pattern(/^[0-9]{5}$/)]),
    });
    this.BillingDetailsFormGroup.valueChanges.pipe(debounceTime(500)).subscribe(() => {
      this.store.dispatch(new SetDirtyState(this.BillingDetailsFormGroup.dirty));
    });
    if (organization) {
      this.ContactFormGroup = this.fb.group({
        contacts: new FormArray(this.generateContactsFormArray(organization.contactDetails))
      });
    } else {
      this.ContactFormGroup = this.fb.group({
        contacts: new FormArray([this.newContactFormGroup()])
      });
    }
    this.ContactFormGroup.valueChanges.pipe(debounceTime(500)).subscribe(() => {
      this.store.dispatch(new SetDirtyState(this.ContactFormGroup.dirty));
    });
    this.ContactFormArray = this.ContactFormGroup.get("contacts") as FormArray;
    this.PreferencesFormGroup = this.fb.group({
      id: new FormControl(organization ? organization.preferences.id : 0),
      purchaseOrderBy: new FormControl(organization ? organization.preferences.purchaseOrderBy.toString() : '0', [ Validators.required ]),
      sendDocumentToAgency: new FormControl(organization ? organization.preferences.sendDocumentToAgency : null),
      timesheetSubmittedBy: new FormControl(organization ? organization.preferences.timesheetSubmittedBy.toString() : '0', [ Validators.required ]),
      weekStartsOn: new FormControl(organization ? organization.preferences.weekStartsOn : '', [ Validators.required ]),
      paymentOptions: new FormControl(organization ? organization.preferences.paymentOptions.toString() : '0', [ Validators.required ]),
      timePeriodInMins: new FormControl(organization ? organization.preferences.timePeriodInMins : '', [ Validators.pattern(/^[0-9]+$/), Validators.min(1)] ),
      paymentDescription: new FormControl(organization ? organization.preferences.paymentDescription : '', [ Validators.required ])
    });
    this.PreferencesFormGroup.valueChanges.pipe(debounceTime(500)).subscribe(() => {
      this.store.dispatch(new SetDirtyState(this.PreferencesFormGroup.dirty));
    });
    if (organization) {
      //Populate state dropdown with values based on selected country
      this.store.dispatch(new SetGeneralStatesByCountry(organization.generalInformation.country));
      this.store.dispatch(new SetBillingStatesByCountry(organization.billingDetails.country));
      this.store.dispatch(new SetDirtyState(false));
    }
  }

  public browse() : void {
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
    this.isEditTitle.push(false);
    return this.fb.group({
      id: new FormControl(contact ? contact.id : 0),
      title: new FormControl(contact ? contact.title : ''),
      contactPerson: new FormControl(contact ? contact.contactPerson : '', [ Validators.required, Validators.maxLength(100) ]),
      phoneNumberExt: new FormControl(contact ? contact.phoneNumberExt : '', [ Validators.pattern(/^[0-9]+$/) ]),
      email: new FormControl(contact ? contact.email : '', [ Validators.pattern(/^\S+@\S+\.\S+$/) ])
    })
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
    this.BillingDetailsFormGroup.setValue({
      id: this.BillingDetailsFormGroup.controls['id'].value,
      name: this.GeneralInformationFormGroup.controls['name'].value,
      address: this.GeneralInformationFormGroup.controls['addressLine1'].value,
      country: this.GeneralInformationFormGroup.controls['country'].value,
      state: this.GeneralInformationFormGroup.controls['state'].value,
      city: this.GeneralInformationFormGroup.controls['city'].value,
      zipCode: this.GeneralInformationFormGroup.controls['zipCode'].value,
      phone1: this.GeneralInformationFormGroup.controls['phone1Ext'].value,
      phone2: this.GeneralInformationFormGroup.controls['phone2Ext'].value,
      fax: this.GeneralInformationFormGroup.controls['fax'].value,
      ext: ''
    })
  }

  private enableBillingForm(): void {
    Object.keys(this.BillingDetailsFormGroup.controls).filter((key: string) => key !== 'ext').forEach((key: string) => {
      this.BillingDetailsFormGroup.get(key)?.enable();
    });
  }

  private disableBillingForm(): void {
    Object.keys(this.BillingDetailsFormGroup.controls).filter((key: string) => key !== 'ext').forEach((key: string) => {
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
    this.router.navigate(['/admin/client-management']);
  }

  public clearForm(): void {
    this.CreateUnderFormGroup.reset();
    this.GeneralInformationFormGroup.reset();
    this.BillingDetailsFormGroup.reset();
    this.ContactFormArray.reset();
    this.PreferencesFormGroup.reset();
    this.store.dispatch(new SetDirtyState(false));
  }

  public onGeneralCountryChange(event: ChangeEventArgs): void {
    this.store.dispatch(new SetGeneralStatesByCountry(event.value as Country));
  }

  public onBillingCountryChange(event: ChangeEventArgs): void {
    this.store.dispatch(new SetBillingStatesByCountry(event.value as Country));
  }

  public uploadImages(businessUnitId: number): void {
    if (this.filesDetails.length) {
      this.store.dispatch(new UploadOrganizationLogo(this.filesDetails[0] as Blob, businessUnitId));
    }
  }

  public onImageSelect(event: Blob | null): void {
    if (event) {
      this.filesDetails = [event as Blob];
    } else {
      this.filesDetails = [];
    }
  }

  public save(): void {
    if (
      this.CreateUnderFormGroup.valid &&
      this.GeneralInformationFormGroup.valid &&
      (this.BillingDetailsFormGroup.valid || this.isSameAsOrg) &&
      this.ContactFormArray.valid &&
      this.PreferencesFormGroup.valid 
    ) {
      this.store.dispatch(new SaveOrganization(new Organization(
        this.currentBusinessUnitId as number,
        this.CreateUnderFormGroup.controls['createUnder'].value,
        this.GeneralInformationFormGroup.getRawValue(),
        this.BillingDetailsFormGroup.getRawValue(),
        this.ContactFormArray.getRawValue(),
        this.PreferencesFormGroup.getRawValue(),
        this.isSameAsOrg
      )));
      this.store.dispatch(new SetDirtyState(false));
    } else {
      this.CreateUnderFormGroup.markAllAsTouched();
      this.GeneralInformationFormGroup.markAllAsTouched();
      this.BillingDetailsFormGroup.markAllAsTouched();
      this.ContactFormArray.markAllAsTouched();
      this.PreferencesFormGroup.markAllAsTouched();
    }
  }
}
