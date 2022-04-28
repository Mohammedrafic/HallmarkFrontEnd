import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngxs/store';

import { AccordionComponent } from '@syncfusion/ej2-angular-navigations';
import { Subscription, takeWhile } from 'rxjs';

import { SetHeaderState } from 'src/app/store/app.actions';
import { BillingDetailsGroupComponent } from './billing-details-group/billing-details-group.component';
import { ContactDetailsGroupComponent } from './contact-details-group/contact-details-group.component';
import { GeneralInfoGroupComponent } from './general-info-group/general-info-group.component';

@Component({
  selector: 'app-add-edit-agency',
  templateUrl: './add-edit-agency.component.html',
  styleUrls: ['./add-edit-agency.component.scss'],
})
export class AddEditAgencyComponent implements OnInit, OnDestroy {
  @ViewChild('accordion') accordion: AccordionComponent;

  public agencyForm: FormGroup;

  get contacts(): FormArray {
    return this.agencyForm.get('contacts') as FormArray;
  }

  private populatedSubscription: Subscription | undefined;
  private isAlive = true;
  private logoFile: Blob | null;

  constructor(private store: Store, private fb: FormBuilder) {
    this.store.dispatch(new SetHeaderState({ title: 'Agency' }));
  }

  ngOnInit(): void {
    this.generateAgencyForm();
    this.onBillingPopulatedChange();
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  public addContact(): void {
    this.contacts.push(ContactDetailsGroupComponent.createFormGroup());
  }

  public deleteContact(index: number): void {
    this.contacts.removeAt(index);
  }

  public onNext(): void {
    this.agencyForm.get('isBillingPopulated');
    this.agencyForm.markAllAsTouched();
    console.log(this.agencyForm.value);
  }

  public setLogoFile(file: Blob | null) {
    this.logoFile = file;
    console.log(this.logoFile);
  }

  private onBillingPopulatedChange(): void {
    this.agencyForm
      .get('isBillingPopulated')
      ?.valueChanges.pipe(takeWhile(() => this.isAlive))
      .subscribe((checked: boolean) => {
        const billing = this.agencyForm.get('billing');
        const agency = this.agencyForm.get('agency');
        if (checked) {
          this.populatedSubscription = agency?.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe(() => {
            this.populateBillingFromGeneral();
          });
          agency?.updateValueAndValidity();
          billing?.disable();
        } else {
          this.populatedSubscription?.unsubscribe();
          billing?.enable();
        }
      });
  }

  private populateBillingFromGeneral(): void {
    const agency = this.agencyForm.get('agency')?.value;
    const billing = this.agencyForm.get('billing');

    billing?.patchValue({
      name: agency.name,
      address: agency.addressLine1,
      country: agency.country,
      state: agency.state,
      city: agency.city,
      zipCode: agency.zipCode,
      phone1: agency.phone1Ext,
      phone2: agency.phone2Ext,
      fax: agency.fax,
      ext: '',
    });
  }

  private generateAgencyForm(): void {
    this.agencyForm = this.fb.group({
      agency: GeneralInfoGroupComponent.createFormGroup(),
      isBillingPopulated: false,
      billing: BillingDetailsGroupComponent.createFormGroup(),
      contacts: this.fb.array([ContactDetailsGroupComponent.createFormGroup()]),
    });
  }
}
