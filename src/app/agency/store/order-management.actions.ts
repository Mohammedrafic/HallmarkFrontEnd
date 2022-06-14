import { DialogNextPreviousOption } from "@shared/components/dialog-next-previous/dialog-next-previous.component";

export class GetAgencyOrdersPage {
  static readonly type = '[agency order management] Get Agency Orders Page';
  constructor(public pageNumber: number, public pageSize: number) {}
}
export class GetOrderById {
  static readonly type = '[agency order management] Get Order By Id';
  constructor(public id: number, public organizationId: number, public options: DialogNextPreviousOption) {}
}

export class GetAgencyOrderCandidatesList {
  static readonly type = '[agency order management] Get Agency Order Candidates Page';
  constructor(
    public orderId: number,
    public organizationId: number,
    public pageNumber: number,
    public pageSize: number
  ) {}
}

export class GetAgencyOrderGeneralInformation {
  static readonly type = '[agency order management] Get Agency Order General Information';
  constructor(
    public id: number,
    public organizationId: number
  ) {}
}
