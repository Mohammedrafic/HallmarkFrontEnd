import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { ChangeEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { FileInfo, UploaderComponent } from '@syncfusion/ej2-angular-inputs';
import { Observable } from 'rxjs';
import { BusinessUnit } from 'src/app/shared/models/business-unit.model';
import { Organization } from 'src/app/shared/models/organization.model';
import { SetHeaderState } from 'src/app/store/app.actions';
import { CreateOrganization, GetBusinessUnitList, SetBillingStatesByCountry, SetGeneralStatesByCountry } from '../../store/admin.actions';
import { AdminState } from '../../store/admin.state';

@Component({
  selector: 'app-add-edit-organization',
  templateUrl: './add-edit-organization.component.html',
  styleUrls: ['./add-edit-organization.component.scss']
})
export class AddEditOrganizationComponent implements OnInit, AfterViewInit {
  public allowExtensions: string = '.png, .jpg, .jpeg';
  public dropElement: HTMLElement;
  public filesDetails : FileInfo[] = [];
  public filesName: string[] = [];
  public filesList: HTMLElement[] = [];
  public OrganizationFormArray = new FormArray([]);
  public ContactFormArray: FormArray;
  public CreateUnderFormGroup: FormGroup;
  public GeneralInformationFormGroup: FormGroup;
  public BillingDetailsFormGroup: FormGroup;
  public ContactFormGroup: FormGroup;
  public PreferencesFormGroup: FormGroup;
  public isSameAsOrg: boolean = false;
  public isEditTitle: boolean[] = [false];;

  public createUnderFields = { 
    text: 'name', value: 'id'
  };

  public optionFields = {
    text: 'text', value: 'id'
  };

  @ViewChild('previewupload')
  public uploadObj: UploaderComponent;

  @Select(AdminState.countries)
  countries$: Observable<string[]>;

  @Select(AdminState.statesGeneral)
  statesGeneral$: Observable<string[]>;

  @Select(AdminState.statesBilling)
  statesBilling$: Observable<string[]>;

  @Select(AdminState.businessUnits)
  businessUnits$: Observable<BusinessUnit[]>;

  @Select(AdminState.days)
  days$: Observable<[]>;

  @Select(AdminState.statuses)
  statuses$: Observable<[]>;

  @Select(AdminState.titles)
  titles$: Observable<[]>;

  public path: Object = {
    saveUrl: '',
    removeUrl: ''
  };

  constructor(private store: Store, private router: Router, private route: ActivatedRoute, private fb: FormBuilder) {
    store.dispatch(new SetHeaderState({title: 'Organization List'}));
    store.dispatch(new GetBusinessUnitList());
    this.CreateUnderFormGroup = fb.group({
      createUnder: new FormControl('', [ Validators.required ])
    });
    this.GeneralInformationFormGroup = fb.group({
      name: new FormControl('', [ Validators.required ]),
      externalId: new FormControl(''),
      taxId: new FormControl('', [ Validators.required, Validators.minLength(9), Validators.pattern(/^[0-9\s\-]+$/) ]),
      addressLine1: new FormControl('', [ Validators.required ]),
      addressLine2: new FormControl(''),
      country: new FormControl('', [ Validators.required ]),
      state: new FormControl('', [ Validators.required ]),
      city: new FormControl('', [ Validators.required ]),
      zipCode: new FormControl('', [ Validators.minLength(5), Validators.pattern(/^[0-9]+$/) ]),
      phone1Ext: new FormControl('', [ Validators.pattern(/^[0-9]+$/) ]),
      phone2Ext: new FormControl('', [ Validators.pattern(/^[0-9]+$/) ]),
      fax: new FormControl('', [ Validators.pattern(/^[0-9]+$/) ]),
      status: new FormControl('', [ Validators.required ]),
      website: new FormControl('')
    });
    this.BillingDetailsFormGroup = fb.group({
      name: new FormControl('', [ Validators.required ]),
      address: new FormControl(''),
      country: new FormControl('', [ Validators.required ]),
      state: new FormControl('', [ Validators.required ]),
      city: new FormControl('', [ Validators.required ]),
      zipCode: new FormControl('', [ Validators.minLength(5), Validators.pattern(/^[0-9]+$/) ]),
      phone1: new FormControl('', [ Validators.pattern(/^[0-9]+$/) ]),
      phone2: new FormControl('', [ Validators.pattern(/^[0-9]+$/) ]),
      fax: new FormControl('', [ Validators.pattern(/^[0-9]+$/) ]),
      ext: new FormControl(''),
      website: new FormControl('')
    });
    this.ContactFormGroup = fb.group({
      contacts: new FormArray([this.newContactFormGroup()])
    });
    this.ContactFormArray = this.ContactFormGroup.get("contacts") as FormArray;
    this.PreferencesFormGroup = fb.group({
      purchaseOrderBy: new FormControl(0, [ Validators.required ]),
      timesheetSubmittedBy: new FormControl(0, [ Validators.required ]),
      weekStartsOn: new FormControl('', [ Validators.required ]),
      paymentOptions: new FormControl(0, [ Validators.required ]),
      timePeriodInMins: new FormControl('', [ Validators.pattern(/^[0-9]+$/), Validators.min(1)] ),
      paymentDescription: new FormControl('', [ Validators.required ])
    });
  }

  ngOnInit(): void {
    this.dropElement = document.getElementById('droparea') as HTMLElement;
  }

  ngAfterViewInit(): void {
    
  }

  public editTitleHandler(i: number): void {
    this.isEditTitle[i] = !this.isEditTitle[i];
  }

  private newContactFormGroup(): FormGroup {
    this.isEditTitle.push(false);
    return this.fb.group({
      title: new FormControl(''),
      contactPerson: new FormControl('', [ Validators.required ]),
      phoneNumberExt: new FormControl('', [ Validators.pattern(/^[0-9]+$/) ]),
      email: new FormControl('', [ Validators.pattern(/^\S+@\S+\.\S+$/) ])
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
      name: this.GeneralInformationFormGroup.controls['name'].value,
      address: this.GeneralInformationFormGroup.controls['addressLine1'].value,
      country: this.GeneralInformationFormGroup.controls['country'].value,
      state: this.GeneralInformationFormGroup.controls['state'].value,
      city: this.GeneralInformationFormGroup.controls['city'].value,
      zipCode: this.GeneralInformationFormGroup.controls['zipCode'].value,
      phone1: this.GeneralInformationFormGroup.controls['phone1Ext'].value,
      phone2: this.GeneralInformationFormGroup.controls['phone2Ext'].value,
      fax: this.GeneralInformationFormGroup.controls['fax'].value,
      ext: '',
      website: this.GeneralInformationFormGroup.controls['website'].value,
    })
  }

  public sameAsOrgChange(event: any): void {
    this.isSameAsOrg = event.checked;
    if (this.isSameAsOrg) {
      Object.keys(this.BillingDetailsFormGroup.controls).forEach((key: string) => {
        this.BillingDetailsFormGroup.get(key)?.disable();
      });
      this.copyGeneralToBilling();
    } else {
      Object.keys(this.BillingDetailsFormGroup.controls).forEach((key: string) => {
        this.BillingDetailsFormGroup.get(key)?.enable();
      });
    }
  }

  public navigateBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  public onGeneralCountryChange(event: ChangeEventArgs): void {
    this.store.dispatch(new SetGeneralStatesByCountry(event.value as string));
  }

  public onBillingCountryChange(event: ChangeEventArgs): void {
    this.store.dispatch(new SetBillingStatesByCountry(event.value as string));
    this.statesBilling$.subscribe(state => console.log(state))
  }

  public uploadImages(): void {
    this.uploadObj.upload(this.filesDetails, true);
  }

  public onImageSelect(event: any): void {
    let validFiles: FileInfo[] = this.validateFiles(event, this.filesDetails);
    if (validFiles.length === 0) {
      event.cancel = true;
      return;
    }
    this.filesDetails = this.filesDetails.concat(validFiles);
    console.log(event);
  }

  public onUploadSuccess(event: any): void {
    console.log(event);
  }

  public onFileUpload(event: any): void {
    console.log(event);
  }

  public onUploadFailed(event: any): void {
    console.log(event);
  }

  public onFileRemove(event: any): void {
    console.log(event);
  }

  public validateFiles(args: any, viewedFiles: FileInfo[]): FileInfo[] {
    // TODO: validation goes here
    return args.filesData;
  }

  public save(): void {
    if (
      this.CreateUnderFormGroup.valid &&
      this.GeneralInformationFormGroup.valid &&
      (this.BillingDetailsFormGroup.valid || this.isSameAsOrg) &&
      this.ContactFormArray.valid &&
      this.PreferencesFormGroup.valid 
    ) {
      this.store.dispatch(new CreateOrganization(new Organization(
        this.CreateUnderFormGroup.controls['createUnder'].value,
        this.GeneralInformationFormGroup.getRawValue(),
        this.BillingDetailsFormGroup.getRawValue(),
        this.ContactFormArray.getRawValue(),
        this.PreferencesFormGroup.getRawValue()
      )));
    } else {
      this.CreateUnderFormGroup.markAllAsTouched();
      this.GeneralInformationFormGroup.markAllAsTouched();
      this.BillingDetailsFormGroup.markAllAsTouched();
      this.ContactFormArray.markAllAsTouched();
      this.PreferencesFormGroup.markAllAsTouched();
    }
  }
}
