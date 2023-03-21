import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpTerminationComponent } from './emp-termination.component';

describe('EmpTerminationComponent', () => {
  let component: EmpTerminationComponent;
  let fixture: ComponentFixture<EmpTerminationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmpTerminationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmpTerminationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
