import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';

import { AccordionComponent } from '@syncfusion/ej2-angular-navigations';
import { Subscription, takeWhile } from 'rxjs';

import { MessageTypes } from 'src/app/shared/enums/message-types';
import { SetHeaderState, ShowToast } from 'src/app/store/app.actions';
import { BillingDetailsGroupComponent } from './billing-details-group/billing-details-group.component';
import { ContactDetailsGroupComponent } from './contact-details-group/contact-details-group.component';
import { GeneralInfoGroupComponent } from './general-info-group/general-info-group.component';

enum MESSAGES {
  SAVE = 'Agency details saved successfully',
  BACK = 'All the data will be lost',
}

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

  constructor(private store: Store, private fb: FormBuilder, private router: Router, private route: ActivatedRoute) {
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

  public onSave(): void {
    this.agencyForm.markAllAsTouched();
    if (this.agencyForm.valid) {
      this.store.dispatch(new ShowToast(MessageTypes.Success, MESSAGES.SAVE));
    }
    console.log(this.agencyForm.value);
  }

  public onClear(): void {
    this.agencyForm.reset();
  }

  public onBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
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
      payments: this.fb.array([]),
    });
  }
}
