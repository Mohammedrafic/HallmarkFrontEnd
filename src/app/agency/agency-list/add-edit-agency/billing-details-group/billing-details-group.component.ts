import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { COUNTRIES } from '@shared/constants/countries-list';
import { Subject, takeWhile } from 'rxjs';
import { CanadaStates, Country, UsaStates } from 'src/app/shared/enums/states';

@Component({
  selector: 'app-billing-details-group',
  templateUrl: './billing-details-group.component.html',
  styleUrls: ['./billing-details-group.component.scss'],
})
export class BillingDetailsGroupComponent implements OnInit, OnDestroy {
  @Input() formGroup: FormGroup;

  public countries = COUNTRIES;
  public states$ = new Subject();
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
        this.formGroup.get('state')?.reset();
        this.states$.next(statesValue);
      });
  }

  static createFormGroup(): FormGroup {
    return new FormGroup({
      name: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      address: new FormControl('', [Validators.maxLength(100)]),
      country: new FormControl('', [Validators.required]),
      state: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required, Validators.maxLength(20)]),
      zipcode: new FormControl('', [Validators.minLength(5), Validators.pattern(/^[0-9]+$/)]),
      phone1: new FormControl('', [Validators.minLength(10), Validators.pattern(/^[0-9]+$/)]),
      phone2: new FormControl('', [Validators.minLength(10), Validators.pattern(/^[0-9]+$/)]),
      fax: new FormControl('', [Validators.minLength(10), Validators.pattern(/^[0-9]+$/)]),
      ext: new FormControl(''),
    });
  }
}
