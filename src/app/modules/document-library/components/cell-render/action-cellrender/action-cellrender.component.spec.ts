import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionCellrenderComponent } from './action-cellrender.component';

describe('ActionCellrenderComponent', () => {
  let component: ActionCellrenderComponent;
  let fixture: ComponentFixture<ActionCellrenderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionCellrenderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionCellrenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
