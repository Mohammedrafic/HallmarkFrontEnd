import { Component, OnInit } from '@angular/core';
import { AbstractContactDetails } from '@client/candidates/candidate-profile/candidate-details/abstract-contact-details';

@Component({
  selector: 'app-hr-info',
  templateUrl: './hr-info.component.html',
  styleUrls: ['./hr-info.component.scss']
})
export class HrInfoComponent extends AbstractContactDetails implements OnInit {
  constructor() {
    super();
  }

  ngOnInit(): void {
  }

}
