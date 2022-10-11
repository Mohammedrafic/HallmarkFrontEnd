import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupEmailTableComponent } from './group-email-table.component';

describe('GroupEmailTableComponent', () => {
  let component: GroupEmailTableComponent;
  let fixture: ComponentFixture<GroupEmailTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupEmailTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupEmailTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
