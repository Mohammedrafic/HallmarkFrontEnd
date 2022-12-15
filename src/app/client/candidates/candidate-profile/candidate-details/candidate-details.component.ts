import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-candidate-details',
  templateUrl: './candidate-details.component.html',
  styleUrls: ['./candidate-details.component.scss']
})
export class CandidateDetailsComponent implements OnInit {
  public candidateForm: FormGroup;

  public readonly textAreaAttributes = [{ rows: '5' }];

  constructor(private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.createForm();
  }

  private createForm(): void {
    this.candidateForm = this.formBuilder.group({
      employeeId: [null, [Validators.required, Validators.maxLength(50)]],
      firstName: [null, [Validators.required, Validators.maxLength(50)]],
      middleName: [null, [Validators.maxLength(10)]],
      lastName: [null, [Validators.required, Validators.maxLength(50)]],
      dob: [null, [Validators.required, Validators.maxLength(100)]],
      primarySkill: [null, [Validators.required]],
      skill: [null, [Validators.required]],
      classification: [null],
      hireDate: [null, [Validators.required]],
      fte: [''],
      profileStatus: [''],
      hrCompanyCode: [''],
      internalTransferRecruitment: [''],
      orientationConfiguration: [''],
      organizationOrientationDate: [''],
      contract: [''],
      address: [''],
      state: [''],
      city: [''],
      zipCode: [''],
      email: [''],
      workEmail: [''],
      cellphone: [''],
      alternativePhone: [''],
      professionalSummary: ['']
    });
  }

}
