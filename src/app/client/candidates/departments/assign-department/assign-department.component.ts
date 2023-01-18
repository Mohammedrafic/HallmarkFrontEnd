import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-assign-department',
  templateUrl: './assign-department.component.html',
  styleUrls: ['./assign-department.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssignDepartmentComponent implements OnInit {

  public assignDepartmentForm: FormGroup;

  public constructor(private formBuilder: FormBuilder) { }

  public ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.assignDepartmentForm = this.formBuilder.group({
      region: [null, [Validators.required]],
      location: [null, [Validators.required]],
      department: [null, [Validators.required]],
      startDate: [null, [Validators.required]],
      endDate: [null],
      oriented: [null],
      homeCostCenter: [null],
    });
  }

}
