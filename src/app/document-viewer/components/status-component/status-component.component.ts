import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-status-component',
  templateUrl: './status-component.component.html',
  styleUrls: ['./status-component.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusComponentComponent implements OnInit {
  statusForm = new FormGroup({})

  constructor(private fb:FormBuilder) { }

  ngOnInit(): void {
    this.statusForm = this.fb.group({
      jobId: [''],
    });
  }

}
