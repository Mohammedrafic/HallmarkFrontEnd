import { Component, OnInit } from '@angular/core';
import { AbstractContactDetails } from '@client/candidates/candidate-profile/candidate-details/abstract-contact-details';
import { JobClassifications } from '@client/order-management/constants';

@Component({
  selector: 'app-general-info',
  templateUrl: './general-info.component.html',
  styleUrls: ['./general-info.component.scss']
})
export class GeneralInfoComponent extends AbstractContactDetails implements OnInit {
  public readonly classifications = JobClassifications;

  constructor() {
    super();
  }

  ngOnInit(): void {
  }

}
