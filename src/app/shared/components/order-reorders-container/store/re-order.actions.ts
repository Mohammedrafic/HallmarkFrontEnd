export class GetReOrdersByOrderId {
  static readonly type = '[re-order] Get ReOrders By Order Id';
  constructor(
    public orderId: number,
    public pageNumber: number,
    public pageSize: number,
    public organizationId?: number,
  ) { }
}
