import { Component } from '@angular/core';
import { ICellRendererParams } from '@ag-grid-community/core';
import { CategoryModel } from '@client/candidates/candidate-profile/general-notes/models/category.model';
import { GridCellRenderer } from '@shared/components/grid/models';

@Component({
  selector: 'app-general-notes-grid-category-renderer',
  templateUrl: './general-notes-grid-category-renderer.component.html',
  styleUrls: ['./general-notes-grid-category-renderer.component.scss']
})
export class GeneralNotesGridCategoryRendererComponent extends GridCellRenderer<CategoryModel & ICellRendererParams> {
  public categoryName: string;
  public isRedFlag: boolean;

  constructor() {
    super();
  }

  public override agInit(params: ICellRendererParams & CategoryModel): void {
    super.agInit(params);
    this.categoryName = params.categoryName;
    this.isRedFlag = params.isRedFlag;
  }

  public override refresh(params: ICellRendererParams): boolean {
    return false;
  }
}
