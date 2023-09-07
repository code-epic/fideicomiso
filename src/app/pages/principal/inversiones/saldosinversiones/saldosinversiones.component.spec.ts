import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaldosinversionesComponent } from './saldosinversiones.component';

describe('SaldosinversionesComponent', () => {
  let component: SaldosinversionesComponent;
  let fixture: ComponentFixture<SaldosinversionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SaldosinversionesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaldosinversionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
