import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Subject, distinctUntilChanged, pairwise, startWith, takeUntil } from 'rxjs';
import { ONLY_NUMBER } from '@shared/constants';


import { CanadaStates, Country, UsaStates } from 'src/app/shared/enums/states';
import { COUNTRIES } from '@shared/constants/countries-list';

@Component({
  selector: 'app-candidate-contact-details',
  templateUrl: './candidate-contact-details.component.html',
  styleUrls: ['./candidate-contact-details.component.scss'],
})
export class CandidateContactDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
   @Input() formGroup: FormGroup;
   @Input() customMaskChar:string

  public optionFields = {
    text: 'text',
    value: 'id',
  };
  public countries = COUNTRIES;
  public states$: BehaviorSubject<Array<string>>;
  public dependentFieldsList = ['country', 'state', 'city','zip','address1'];
  private unsubscribe$: Subject<void> = new Subject();

  ngOnInit(): void {
    this.setCountryState();
  }

  ngAfterViewInit(): void {
    this.addressFieldsValueChanges();
   
    this.formGroup.get('country')?.valueChanges.pipe(
      distinctUntilChanged(),takeUntil(this.unsubscribe$),startWith(null), pairwise()
    ).subscribe(([prev, next]: [any, any]) => {
      this.states$.next(next === Country.USA ? UsaStates : CanadaStates);
      if(prev === null){
        this.dependentFieldsList.filter(ele => ele != 'country' && ele != 'address1').forEach(element => {
          this.formGroup.controls[element].setValue(null);
        });
      }else{
        this.dependentFieldsList.filter(ele => ele != 'country').forEach(element => {
          this.formGroup.controls[element].setValue(null);
        });
        this.formGroup.controls['address2'].setValue(null);
      }
    });
  }

  private setCountryState(): void {
    const country = this.formGroup.value.country ?? Country.USA;
    this.states$ = new BehaviorSubject(country === Country.USA ? UsaStates : CanadaStates);
  }

  static createFormGroup(): FormGroup {
    return new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email, Validators.maxLength(200)]),
      country: new FormControl(null),
      state: new FormControl(null),
      city: new FormControl(null, [Validators.maxLength(20)]),
      zip: new FormControl(null, [Validators.minLength(5)]),
      address1: new FormControl(null, [Validators.maxLength(100)]),
      address2: new FormControl(null, [Validators.maxLength(100)]),
      phone1: new FormControl(null, [Validators.minLength(10), Validators.pattern(ONLY_NUMBER)]),
      phone2: new FormControl(null, [Validators.minLength(10), Validators.pattern(ONLY_NUMBER)]),
    });
  }

  private addressFieldsValueChanges() :void{
    this.formGroup.valueChanges.pipe(
          takeUntil(this.unsubscribe$),
        ).subscribe((data:any)=>{

      let dependentValueList = [];
      
      Object.keys(data).forEach(ele=>{                
        if(data[ele] !== null && data[ele] !== '' && this.dependentFieldsList.indexOf(ele) > -1){
          dependentValueList.push(ele);
        }
      });

      if(dependentValueList.length > 0 && dependentValueList.length < this.dependentFieldsList.length){
        this.dependentFieldsList.forEach(element => {
          if(this.formGroup.controls[element]?.errors?.['required'] === undefined 
              && (this.formGroup.controls[element]?.value === '' || this.formGroup.controls[element]?.value === null)){
            this.formGroup.controls[element].addValidators([Validators.required]);
            this.formGroup.controls[element].updateValueAndValidity({emitEvent : false});
            this.formGroup.controls[element]?.markAsTouched();         
          }
        }); 
      }else{
        this.dependentFieldsList.forEach(element => {
          this.formGroup.controls[element].removeValidators(Validators.required);
          this.formGroup.controls[element].updateValueAndValidity({emitEvent : false});
        }); 
      }

      if(data['address2'] != null){
        if((this.formGroup.controls['address1']?.value === '' || this.formGroup.controls['address1']?.value === null) && data['address2'] != ''){            
          this.formGroup.controls['address1'].addValidators([Validators.required]);
          this.formGroup.controls['address1'].updateValueAndValidity({emitEvent : false});
          this.formGroup.controls['address1'].markAsTouched();    
        }else if(this.formGroup.controls['address1']?.errors?.['required'] && data['address2'] === '' && dependentValueList.length == 0){
          this.formGroup.controls['address1'].removeValidators(Validators.required);
          this.formGroup.controls['address1'].updateValueAndValidity({emitEvent : false});
        }
      }

       if(data['country'] !== null && data['country'] !== ''){
        this.formGroup.controls['zip'].clearValidators();
        if(data['country'] === Country.Canada){ 
            this.customMaskChar = '>L0L >0L0'; 
            this.formGroup.controls['zip'].addValidators([Validators.required,Validators.minLength(6)]);
        }
        if(data['country'] === Country.USA){
            this.customMaskChar = '00000';
            this.formGroup.controls['zip'].addValidators([Validators.required,Validators.minLength(5)]);
        }
        this.formGroup.controls['zip'].updateValueAndValidity({emitEvent : false});
        this.formGroup.controls['zip'].markAsTouched();
      }   
      
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
