import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';

@Component({
  selector: 'app-penalties-edit-icon',
  templateUrl: './penalties-grid-actions-renderer.component.html',
  styleUrls: ['./penalties-grid-actions-renderer.component.scss'],
})
export class PenaltiesGridActionsRendererComponent implements ICellRendererAngularComp {

  private params: any;

  public constructor() {}

  public agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  public refresh(params: ICellRendererParams): boolean {
    return false;
  }

  public onEdit(): void {
    this.params.onEdit(this.params.value);
  }

  public onDelete(): void {
    this.params.onDelete(this.params.value);
  }
}
