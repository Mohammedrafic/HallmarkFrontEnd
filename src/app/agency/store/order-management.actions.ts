import { DialogNextPreviousOption } from "@shared/components/dialog-next-previous/dialog-next-previous.component";

export class GetAgencyOrdersPage {
  static readonly type = '[agency order management] Get Agency Orders Page';
  constructor(public pageNumber: number, public pageSize: number) {}
}
export class GetOrderById {
  static readonly type = '[agency order management] Get Order By Id';
  constructor(public id: number, public organizationId: number, public options: DialogNextPreviousOption) {}
}
