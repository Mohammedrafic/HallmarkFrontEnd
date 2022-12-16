import { Component, OnInit } from '@angular/core';
import { AbstractContactDetails } from '@client/candidates/candidate-profile/candidate-details/abstract-contact-details';
import { formatDate, phoneMask, zipCodeMask } from '@shared/constants';

@Component({
  selector: 'app-contact-details',
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.scss']
})
export class ContactDetailsComponent extends AbstractContactDetails implements OnInit {
  public readonly formatDate = formatDate;
  public readonly phoneMask = phoneMask;
  public readonly zipCodeMask = zipCodeMask;

  constructor() {
    super();
  }

  ngOnInit(): void {
  }

}
