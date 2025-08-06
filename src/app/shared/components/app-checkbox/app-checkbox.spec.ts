import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppCheckbox } from './app-checkbox';

describe('AppCheckbox', () => {
  let component: AppCheckbox;
  let fixture: ComponentFixture<AppCheckbox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppCheckbox],
    }).compileComponents();

    fixture = TestBed.createComponent(AppCheckbox);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
