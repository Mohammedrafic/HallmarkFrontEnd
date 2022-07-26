import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionBtnCellRenderer } from './action-btns-cellrender.component';

describe('ActionBtnCellRenderer', () => {
  let component: ActionBtnCellRenderer;
  let fixture: ComponentFixture<ActionBtnCellRenderer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionBtnCellRenderer ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionBtnCellRenderer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
