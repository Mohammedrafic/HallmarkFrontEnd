import { Component, OnInit } from '@angular/core';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';

@Component({
  selector: 'app-document-management',
  templateUrl: './document-management.component.html',
  styleUrls: ['./document-management.component.scss']
})
export class DocumentManagementComponent extends AbstractGridConfigurationComponent implements OnInit {

  constructor() { super(); }

  ngOnInit(): void {
  }

}
