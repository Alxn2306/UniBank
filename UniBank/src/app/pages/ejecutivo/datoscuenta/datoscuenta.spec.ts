import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Datoscuenta } from './datoscuenta';

describe('Datoscuenta', () => {
  let component: Datoscuenta;
  let fixture: ComponentFixture<Datoscuenta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Datoscuenta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Datoscuenta);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
