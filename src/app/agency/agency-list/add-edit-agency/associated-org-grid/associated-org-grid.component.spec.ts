import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociatedOrgGridComponent } from './associated-org-grid.component';

describe('AssociatedOrgGridComponent', () => {
  let component: AssociatedOrgGridComponent;
  let fixture: ComponentFixture<AssociatedOrgGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssociatedOrgGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssociatedOrgGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
