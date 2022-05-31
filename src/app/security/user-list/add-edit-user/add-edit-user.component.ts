import { Component, Input } from '@angular/core';
import { FormGroup } from "@angular/forms";
import { BusinessUnitType } from "@shared/enums/business-unit-type";
import { SelectEventArgs } from "@syncfusion/ej2-angular-navigations";

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

  public onTabSelecting(event: SelectEventArgs): void {
    if (event.isSwiped) {
      event.cancel = true;
    }
    
    this.firstActive = false;
  }
}
