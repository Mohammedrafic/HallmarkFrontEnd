import {
  OrderManagementIrpCandidateSystem,
} from '@shared/components/grid/cell-renderers/order-management-irp-row-position/order-management-irp-row-position.enum';
import { CandidatesStatusText, OrderStatusText } from '@shared/enums/status';
import {
  IRPCandidateForPosition,
  IRPOrderPosition,
  IRPOrderPositionMain,
  IrpPositionSkillName,
} from '@shared/models/order-management.model';
import {
  getCandidateList,
  getCandidatesForSystem,
} from '@shared/components/grid/cell-renderers/order-management-irp-row-position/order-management-row-position.helper';
import { getCandidateDate } from '@shared/helpers';
import { EllipsisText } from '@core/helpers';

export class OrderManagementIrpRowCandidatesAdapter {
  static prepareTableData(positions: IRPOrderPositionMain[]): IRPCandidateForPosition[] {
    const candidates: IRPOrderPosition[] = getCandidateList(positions);
    const modifiedCandidates = this.modifyCandidates(candidates);
    const irpCandidates = getCandidatesForSystem(modifiedCandidates, OrderManagementIrpCandidateSystem.IRP);
    const vmsCandidates = getCandidatesForSystem(modifiedCandidates, OrderManagementIrpCandidateSystem.VMS);

    return [
      {
        system: OrderManagementIrpCandidateSystem[OrderManagementIrpCandidateSystem.IRP],
        rowsSource: [...irpCandidates],
      },
      {
        system: OrderManagementIrpCandidateSystem[OrderManagementIrpCandidateSystem.VMS],
        rowsSource: [...vmsCandidates],
      },
    ];
  }

  private static modifyCandidates(candidates: IRPOrderPosition[]): IRPOrderPosition[] {
    return candidates.map((candidate: IRPOrderPosition) => {
      return {
        ...candidate,
        positionId: `${candidate.organizationPrefix}-${candidate.orderPublicId}-${candidate.positionId}`,
        candidateStatus: CandidatesStatusText[candidate.candidateStatus as number],
        orderStatus: OrderStatusText[candidate.orderStatus as number],
        system: OrderManagementIrpCandidateSystem[candidate.system as number],
        agency: candidate.businessUnitName,
        name: `${candidate.lastName}, ${candidate.firstName}`,
        billRate: candidate.billRate ? Number(candidate.billRate).toFixed(2) : null,
        actualStartDate: getCandidateDate(candidate.actualStartDate as Date),
        actualEndDate: getCandidateDate(candidate.actualEndDate as Date),
        ...this.getSkillName(candidate.primarySkillName),
      };
    });
  }

  private static getSkillName(skillName: string): IrpPositionSkillName {
    const showSkillToolTip = skillName?.length >= 30;

    return {
      skillToolTip: showSkillToolTip,
      fullSkillName: skillName,
      skill: EllipsisText(skillName, 30),
    };
  }
}
