import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilteredCredentialsComponent } from './filtered-credentials.component';

describe('FilteredCredentialsComponent', () => {
  let component: FilteredCredentialsComponent;
  let fixture: ComponentFixture<FilteredCredentialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilteredCredentialsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilteredCredentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
