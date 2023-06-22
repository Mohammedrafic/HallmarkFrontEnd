import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractContactDetails } from '@client/candidates/candidate-profile/candidate-details/abstract-contact-details';
import { formatDate, PhoneMask, ZipCodeMask } from '@shared/constants';
import { COUNTRIES } from '@shared/constants/countries-list';
import { BehaviorSubject, Observable, takeUntil } from 'rxjs';
import { CanadaStates, Country, UsaStates } from '@shared/enums/states';
import { CandidateProfileFormService } from '@client/candidates/candidate-profile/candidate-profile-form.service';
import { TakeUntilDestroy } from '@core/decorators';

@Component({
  selector: 'app-contact-details',
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.scss'],
})
@TakeUntilDestroy
export class ContactDetailsComponent extends AbstractContactDetails implements OnInit,OnDestroy {
  public readonly formatDate = formatDate;
  public readonly phoneMask = PhoneMask;
  public readonly zipCodeMask = ZipCodeMask;
  public readonly countries = COUNTRIES;

  public readonly addressFieldSettings = { text: 'text', value: 'id' };

  public states$: BehaviorSubject<string[]>;

  protected componentDestroy: () => Observable<unknown>;

  constructor(
    protected override cdr: ChangeDetectorRef,
    protected override candidateProfileFormService: CandidateProfileFormService
  ) {
    super(cdr, candidateProfileFormService);
  }

  public override ngOnInit(): void {
    super.ngOnInit();
    this.setCountryState();
    this.listenCountryChanges();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  private setCountryState(): void {
    const { country } = this.candidateForm.value ?? Country.USA;
    this.states$ = new BehaviorSubject(country === Country.USA ? UsaStates : CanadaStates);
  }

  private listenCountryChanges(): void {
    this.candidateForm.get('country')?.valueChanges.pipe(
      takeUntil((this.componentDestroy()))
    ).subscribe((country: Country) => {
      this.states$.next(country === Country.USA ? UsaStates : CanadaStates);
      this.candidateForm.get('state')?.reset();
    });
  }

}
