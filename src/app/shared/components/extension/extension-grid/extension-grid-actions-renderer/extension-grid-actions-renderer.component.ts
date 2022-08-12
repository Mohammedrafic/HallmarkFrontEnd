import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppState } from '../../../../../store/app.state';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { IsOrganizationAgencyAreaStateModel } from '@shared/models/is-organization-agency-area-state.model';

@Component({
  selector: 'app-extension-edit-icon',
  templateUrl: './extension-grid-actions-renderer.component.html',
  styleUrls: ['./extension-grid-actions-renderer.component.scss'],
})
export class ExtensionGridActionsRendererComponent implements ICellRendererAngularComp {
  @Select(AppState.isOrganizationAgencyArea)
  public isOrganizationAgencyArea$: Observable<IsOrganizationAgencyAreaStateModel>;

  private params: ICellRendererParams;

  public constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  public agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  public refresh(params: ICellRendererParams): boolean {
    return false;
  }

  public onEdit(): void {
    this.router.navigate(['./edit', this.params.data.id], { relativeTo: this.activatedRoute });
  }
}
