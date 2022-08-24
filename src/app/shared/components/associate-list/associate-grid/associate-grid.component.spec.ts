import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociateGridComponent } from './associate-grid.component';

describe('AssociateGridComponent', () => {
  let component: AssociateGridComponent;
  let fixture: ComponentFixture<AssociateGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssociateGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssociateGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
