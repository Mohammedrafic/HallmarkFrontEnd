import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-edit-order-credential-form',
  templateUrl: './edit-order-credential-form.component.html',
  styleUrls: ['./edit-order-credential-form.component.scss']
})
export class EditOrderCredentialFormComponent implements OnInit {

  @Input() form: FormGroup;

  constructor() { }

  ngOnInit(): void {
  }

}
