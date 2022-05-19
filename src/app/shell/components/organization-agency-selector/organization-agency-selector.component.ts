import { AfterViewInit, Component } from '@angular/core';
import { FormControl } from '@angular/forms';

interface IOptionField {
  id: number;
  name: string;
}

interface IOrganizationAgency {
  id: number;
  name: string;
  type: 'Organization' | 'Agency';
  logo: string;
}

@Component({
  selector: 'app-organization-agency-selector',
  templateUrl: './organization-agency-selector.component.html',
  styleUrls: ['./organization-agency-selector.component.scss']
})
export class OrganizationAgencySelectorComponent implements AfterViewInit {
  public organizationAgencyControl: FormControl = new FormControl();

  public optionFields = {
    text: 'name',
    value: 'id'
  };

  public dataSource: IOptionField[] = [];
  public organizationAgencies: IOrganizationAgency[] = [
    {
      id: 1,
      name: 'Awesome agency 1',
      type: 'Agency',
      logo: './assets/cropped-einstein-ll-logo-icon-32x32.png'
    },
    {
      id: 2,
      name: 'Awesome agency 2',
      type: 'Agency',
      logo: './assets/cropped-einstein-ll-logo-icon-32x32.png'
    },
    {
      id: 3,
      name: 'Awesome organization 1',
      type: 'Organization',
      logo: './assets/cropped-einstein-ll-logo-icon-32x32.png'
    },
    {
      id: 4,
      name: 'Awesome organization 2',
      type: 'Organization',
      logo: './assets/cropped-einstein-ll-logo-icon-32x32.png'
    },
    {
      id: 5,
      name: 'Awesome organization 3',
      type: 'Organization',
      logo: './assets/cropped-einstein-ll-logo-icon-32x32.png'
    }
  ];

  constructor() {
    this.dataSource = this.organizationAgencies.map(i => ({ id: i.id, name: i.name }));
  }

  ngAfterViewInit(): void {
    this.organizationAgencyControl.setValue(this.dataSource[0].id);
  }

}
