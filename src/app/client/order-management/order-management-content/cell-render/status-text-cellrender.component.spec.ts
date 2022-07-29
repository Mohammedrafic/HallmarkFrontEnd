import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusTextCellRenderer } from './status-text-cellrender.component';

describe('StatusTextCellRenderer', () => {
  let component: StatusTextCellRenderer;
  let fixture: ComponentFixture<StatusTextCellRenderer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatusTextCellRenderer ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusTextCellRenderer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
