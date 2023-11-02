import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { takeUntil } from 'rxjs';

import { DestroyDialog } from '@core/helpers';
import { OpenJob } from '@shared/models';
import { CandidatStatus } from '@shared/enums/applicant-status.enum';
import { ButtonsConfig, EmployeeActionEvent } from './constants';
import { EmployeeService } from '../../services';
import { EmployeeAction } from '../../enums';
import { EmployeeButton} from '../../interfaces';

@Component({
  selector: 'app-employee-details-modal',
  templateUrl: './employee-details-modal.component.html',
  styleUrls: ['./employee-details-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeDetailsModalComponent extends DestroyDialog implements OnInit {
  @Input() selectedEmployeeDetails: OpenJob | null;

  public readonly candidateStatus = CandidatStatus;
  public readonly buttonConfig: EmployeeButton[] = ButtonsConfig();

  constructor(
    private employeeService: EmployeeService
  ) {
    super();
  }

  ngOnInit(): void {
    this.watchForCloseStream();
  }

  public trackByTitle(index: number, config: EmployeeButton): string {
    return config.title;
  }

  public handleModalAction(type: EmployeeAction): void {
    const method = EmployeeActionEvent[type];
    const action = this.employeeService[method](this.selectedEmployeeDetails as OpenJob);

    action.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.employeeService.setEmployeeDetailsEvent(null);
      this.closeDialog();
    });
  }

  public closeModal(): void {
    this.employeeService.setEmployeeDetailsEvent(null);
    this.closeDialog();
  }
}
