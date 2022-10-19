import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component, OnInit } from '@angular/core';
import { ItemModel } from '@syncfusion/ej2-angular-navigations';
import { MoreMenuType } from '../../../enums/documents.enum';

@Component({
  selector: 'app-action-cellrender',
  templateUrl: './action-cellrender.component.html',
  styleUrls: ['./action-cellrender.component.scss']
})
export class ActionCellrenderComponent implements ICellRendererAngularComp {

  public params: any;
  agInit(params: any): void {
    this.params = params;
    if (this.params.data.isSharedWithMe) {
      this.params.data.editMenuITems = [];
      let unShareItem: ItemModel = { text: MoreMenuType[3], id: '3' };
      this.params.data.editMenuITems.push(unShareItem);
    }
    else {
      this.params.data.editMenuITems = this.params.editMenuITems;
    }
  }

  documentDownload(event: MouseEvent) {
    event.stopImmediatePropagation();
    this.params.handleOnDownLoad(this.params.data);
  }

  menuOptionSelected(event:any) {
    this.params.select(event,this.params.data)
  }

  deleteDocument(event: any) {
    this.params.handleOnDownLoad(this.params.data);
  }

  refresh() {
    return true;
  }
}
