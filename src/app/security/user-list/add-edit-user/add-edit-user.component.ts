import { Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { FormGroup } from "@angular/forms";

import { User } from "@shared/models/user-managment-page.model";
import { BusinessUnitType } from "@shared/enums/business-unit-type";
import { SelectEventArgs } from "@syncfusion/ej2-angular-navigations";
import { TabComponent } from "@syncfusion/ej2-angular-navigations";
import { Subject, takeUntil } from "rxjs";

@Component({
  selector: 'app-add-edit-user',
  templateUrl: './add-edit-user.component.html',
  styleUrls: ['./add-edit-user.component.scss']
})
export class AddEditUserComponent implements OnDestroy {
  @ViewChild('tab') tab: TabComponent;

  @Input() form: FormGroup;
  @Input() businessUnits: { text: string | BusinessUnitType, id: number }[];
  
  @Output() changeBusinessUnitId = new EventEmitter();

  @Input() set user (user: User | null) {
    this.isAgencyUser = user?.businessUnitType === BusinessUnitType.Agency;
    this.createdUser = user;
    this.switchVisibilityTab(!!this.createdUser && !this.isAgencyUser);
  }

  public firstActive = true;
  public isAgencyUser = false;
  public createdUser: User | null;

  private unsubscribe$: Subject<void> = new Subject();

  constructor() { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onTabSelecting(event: SelectEventArgs): void {
    if (event.isSwiped) {
      event.cancel = true;
    }
  }

  public onTabCreated(): void {
    this.switchVisibilityTab(false);

    this.tab.selected.pipe(takeUntil(this.unsubscribe$))
      .subscribe((event: SelectEventArgs) => {
        const visibilityTabIndex = 1;
        this.firstActive = event.selectedIndex !== visibilityTabIndex;
      });
  }

  private switchVisibilityTab(enable: boolean): void {
    const visibilityTabIndex = 1;
    this.tab?.enableTab(visibilityTabIndex, enable);
  }

  ChangeBusinessUnitID(){
    alert("ChangeBusinessUnitType-")
    this.changeBusinessUnitId.emit();
  }
}
