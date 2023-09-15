import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import{ OrderGridSystemStateService } from '@client/order-management/containers/irp-container/services/order-grid-system-state.service'
import { OrderType } from '@shared/enums/order-type';
import {
  Order,
  OrderManagement,
} from '@shared/models/order-management.model';
@Component({
  selector: 'app-table-system-cell',
  templateUrl: './table-system-cell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableSystemCellComponent implements ICellRendererAngularComp {
  public cellValue: string;
  public publicId:number;
  public orderType:OrderType;
  public order = new Order();

  constructor(private ordergridsystemservice:OrderGridSystemStateService){

  }

  agInit(params: ICellRendererParams): void {
    this.cellValue = params.data.system;
     this.order.publicId=params.data.publicId;
     this.order.orderType=params.data.orderType;
     this.order.id=params.data.id;
  }
  onClickSystem(system:string)
  {
    this.ordergridsystemservice.HandleClickEvent(system,this.order);
  }

  refresh(params: ICellRendererParams): boolean {
    this.cellValue = params.data.system;

    return true;
  }
}