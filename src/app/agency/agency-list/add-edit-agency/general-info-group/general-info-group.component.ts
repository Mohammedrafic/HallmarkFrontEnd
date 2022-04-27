import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, takeWhile } from 'rxjs';

import { ChangeEventArgs } from '@syncfusion/ej2-angular-dropdowns';

import { CanadaStates, Country, UsaStates } from 'src/app/shared/enums/states';

enum Status {
  Pending ='Pending', 
  Inactive = 'Inactive',
  Active = 'Active',
  Suspended = 'Suspended'
}

@Component({
  selector: 'app-general-info-group',
  templateUrl: './general-info-group.component.html',
  styleUrls: ['./general-info-group.component.scss'],
})
export class GeneralInfoGroupComponent implements OnInit, OnDestroy {
  @Input() formGroup: FormGroup;

  public countries = [
    { id: Country.USA, text: Country[0] },
    { id: Country.Canada, text: Country[1] },
  ];
  public states$ = new Subject();
  public statuses =  Object.values(Status);
  public optionFields = {
    text: 'text',
    value: 'id',
  };

  private isAlive = true;

  ngOnInit(): void {
    this.onCountryChange();
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  public onCountryChange(): void {
    this.formGroup
      .get('country')
      ?.valueChanges.pipe(takeWhile(() => this.isAlive))
      .subscribe((value) => {
        const statesValue = value === Country.USA ? UsaStates : CanadaStates;
        this.states$.next(statesValue);
      });
  }

  static createFormGroup(): FormGroup {
    return new FormGroup({
      name: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      externalId: new FormControl(''),
      taxId: new FormControl('', [Validators.required, Validators.minLength(9), Validators.pattern(/^[0-9\s\-]+$/)]),
      addressLine1: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      addressLine2: new FormControl('', [Validators.maxLength(100)]),
      country: new FormControl('', [Validators.required]),
      state: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required, Validators.max(20)]),
      zipCode: new FormControl('', [Validators.minLength(5), Validators.pattern(/^[0-9]+$/)]),
      phone1Ext: new FormControl('', [Validators.pattern(/^\d{3}-\d{3}-\d{4}$/)]),
      phone2Ext: new FormControl('', [Validators.pattern(/^\d{3}-\d{3}-\d{4}$/)]),
      fax: new FormControl('', [Validators.pattern(/^\d{3}-\d{3}-\d{4}$/)]),
      status: new FormControl({value: Status.Active, disabled: true}, [Validators.required]),
      website: new FormControl(''),
    });
  }
}
