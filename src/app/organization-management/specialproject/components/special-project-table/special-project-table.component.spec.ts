import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialProjectTableComponent } from './special-project-table.component';

describe('SpecialProjectTableComponent', () => {
  let component: SpecialProjectTableComponent;
  let fixture: ComponentFixture<SpecialProjectTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpecialProjectTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecialProjectTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
