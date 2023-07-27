import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Select } from '@ngxs/store';
import { Observable, Subject, takeWhile } from 'rxjs';
import { AgencyState } from 'src/app/agency/store/agency.state';

import { CanadaStates, Country, UsaStates } from 'src/app/shared/enums/states';
import { AgencyStatus } from 'src/app/shared/enums/status';

import { agencyStatusCreationOptions, agencyStatusOptions } from '../../agency-list.constants';
import PriceUtils from '@shared/utils/price.utils';
import { AgencyConfig, AgencyStatusesModel } from "@shared/models/agency.model";
import { ALPHANUMERIC } from '@shared/constants';
import { COUNTRIES } from '@shared/constants/countries-list';
import { ChangeEventArgs } from '@syncfusion/ej2-angular-buttons';

@Component({
  selector: 'app-general-info-group',
  templateUrl: './general-info-group.component.html',
  styleUrls: ['./general-info-group.component.scss'],
})
export class GeneralInfoGroupComponent implements OnInit, OnDestroy {
  @Input() formGroup: FormGroup;
  @Input() public agencyConfig: AgencyConfig

  @Output() private mspCheckboxEmitter: EventEmitter<boolean> = new EventEmitter();

  public countries = COUNTRIES;
  public priceUtils = PriceUtils;
  public states$ = new Subject();
  public statuses: AgencyStatusesModel[] = agencyStatusCreationOptions;
  public optionFields = {
    text: 'text',
    value: 'id',
  };

  private isAlive = true;

  @Select(AgencyState.isAgencyCreated)
  public isAgencyCreated$: Observable<boolean>;

  ngOnInit(): void {
    this.onCountryChange();
    this.isAgencyCreatedCahnge();
    this.setDefultStatus();
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

  public isAgencyCreatedCahnge(): void {
    this.isAgencyCreated$.pipe(takeWhile(() => this.isAlive)).subscribe((isCreated) => {
      this.statuses = isCreated ? agencyStatusOptions : agencyStatusCreationOptions;

      if (this.agencyConfig.isAgencyUser) {
        this.formGroup.get('status')?.disable();
      }
    });
  }

  static createFormGroup(): FormGroup {
    return new FormGroup({
      name: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      externalId: new FormControl('', [Validators.maxLength(10)]),
      taxId: new FormControl('', [Validators.required, Validators.minLength(9), Validators.pattern(ALPHANUMERIC)]),
      baseFee: new FormControl(''),
      addressLine1: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      addressLine2: new FormControl('', [Validators.maxLength(100)]),
      country: new FormControl('', [Validators.required]),
      state: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required, Validators.max(20)]),
      zipCode: new FormControl('', [Validators.minLength(5), Validators.pattern(/^[0-9]+$/)]),
      phone1Ext: new FormControl('', [Validators.minLength(10), Validators.pattern(/^[0-9]+$/)]),
      phone2Ext: new FormControl('', [Validators.minLength(10), Validators.pattern(/^[0-9]+$/)]),
      fax: new FormControl('', [Validators.minLength(10), Validators.pattern(/^[0-9]+$/)]),
      status: new FormControl(AgencyStatus.InProgress, [Validators.required]),
      website: new FormControl(''),
      netSuiteId: new FormControl(''),
    });
  }

  private setDefultStatus(): void {
    this.formGroup.get('status')?.patchValue(0);
  }

  public onChangeMspCheckbox(event: ChangeEventArgs): void {
    this.mspCheckboxEmitter.emit(event.checked);
  }
}
