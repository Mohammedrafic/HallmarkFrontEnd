import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-edit-departments',
  templateUrl: './edit-departments.component.html',
  styleUrls: ['./edit-departments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditDepartmentsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
