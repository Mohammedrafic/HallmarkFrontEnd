import { IRPOrderPosition, IRPOrderPositionDisplay } from '@shared/models/order-management.model';
import { OrderStatusText } from '@shared/enums/status';

export class OrderManagementIrpRowPositionAdapter {
  static prepareTableData(positions: IRPOrderPosition[]): IRPOrderPositionDisplay[] {
    return positions.map((el: IRPOrderPosition) => ({
      ...el,
      name: `${el.lastName} ${el.firstName}`,
      candidateStatus: OrderStatusText[el.candidateStatus as number],
      contract: el.contract ? 'Yes': 'No',
    }));
  }
}
