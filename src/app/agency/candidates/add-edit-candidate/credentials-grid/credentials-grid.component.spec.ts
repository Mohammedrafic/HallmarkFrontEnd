import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CredentialsGridComponent } from './credentials-grid.component';

describe('CredentialsGridComponent', () => {
  let component: CredentialsGridComponent;
  let fixture: ComponentFixture<CredentialsGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CredentialsGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CredentialsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
