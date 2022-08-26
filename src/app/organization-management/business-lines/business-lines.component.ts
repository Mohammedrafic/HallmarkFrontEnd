import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { GetBusinessLines } from '@organization-management/store/business-lines.action';
import { BusinessLinesState } from '@organization-management/store/business-lines.state';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { BusinessLines } from '@shared/models/business-line.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-business-lines',
  templateUrl: './business-lines.component.html',
  styleUrls: ['./business-lines.component.scss'],
})
export class BusinessLinesComponent extends AbstractGridConfigurationComponent implements OnInit {
  @Select(BusinessLinesState.businessLines) public readonly businessLines$: Observable<BusinessLines[]>;
  
  constructor(private readonly store: Store) {
    super();
  }

  public ngOnInit(): void {
    this.store.dispatch(new GetBusinessLines());
  }

  public onEdit(data: any): void {}
  public onRemove(data: any): void {}
  public addBusinessLine(): void {}
}
