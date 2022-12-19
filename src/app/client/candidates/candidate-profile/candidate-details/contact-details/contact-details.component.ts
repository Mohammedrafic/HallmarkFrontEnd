import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractContactDetails } from '@client/candidates/candidate-profile/candidate-details/abstract-contact-details';
import { formatDate, PhoneMask, ZipCodeMask } from '@shared/constants';
import { COUNTRIES } from '@shared/constants/countries-list';
import { BehaviorSubject } from 'rxjs';
import { CanadaStates, Country, UsaStates } from '@shared/enums/states';
import { CandidateProfileService } from '@client/candidates/candidate-profile/candidate-profile.service';

@Component({
  selector: 'app-contact-details',
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.scss']
})
export class ContactDetailsComponent extends AbstractContactDetails implements OnInit {
  public readonly formatDate = formatDate;
  public readonly phoneMask = PhoneMask;
  public readonly zipCodeMask = ZipCodeMask;
  public readonly countries = COUNTRIES;

  public readonly addressFieldSettings = { text: 'text', value: 'id' };

  public states$: BehaviorSubject<string[]>;

  constructor(
    protected override cdr: ChangeDetectorRef,
    protected override candidateProfileService: CandidateProfileService
  ) {
    super(cdr, candidateProfileService);
  }

  public override ngOnInit(): void {
    super.ngOnInit();
    this.setCountryState();
    this.listenCountryChanges();
  }

  private setCountryState(): void {
    const { country } = this.candidateForm.value ?? Country.USA;
    this.states$ = new BehaviorSubject(country === Country.USA ? UsaStates : CanadaStates);
  }

  private listenCountryChanges(): void {
    this.candidateForm.get('country')?.valueChanges.subscribe((country: Country) => {
      this.states$.next(country === Country.USA ? UsaStates : CanadaStates);
      this.candidateForm.get('state')?.reset();
    });
  }

}
