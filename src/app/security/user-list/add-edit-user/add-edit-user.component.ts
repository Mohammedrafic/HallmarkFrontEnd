import { Component, Input } from '@angular/core';
import { FormGroup } from "@angular/forms";
import { BusinessUnitType } from "@shared/enums/business-unit-type";

@Component({
  selector: 'app-add-edit-user',
  templateUrl: './add-edit-user.component.html',
  styleUrls: ['./add-edit-user.component.scss']
})
export class AddEditUserComponent {
  @Input() form: FormGroup;
  @Input() businessUnits: { text: string | BusinessUnitType, id: number }[];

  public firstActive = true;

  constructor() { }

  public onTabSelecting(): void {
    this.firstActive = false;
  }

}
