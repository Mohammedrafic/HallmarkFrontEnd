import { Component, Input, OnInit } from '@angular/core';
@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {
  @Input() public tasks: any;

  constructor() { }

  ngOnInit(): void {
  }
}
