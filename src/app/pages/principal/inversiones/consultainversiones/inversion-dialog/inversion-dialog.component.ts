import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ImprimirService } from 'src/app/services/util/imprimir.service';
import { UtilService } from 'src/app/services/util/util.service';

@Component({
  selector: 'app-inversion-dialog',
  templateUrl: './inversion-dialog.component.html',
  styleUrls: ['./inversion-dialog.component.scss']
})
export class InversionDialogComponent implements OnInit {

  inv: any;

  constructor(
    public dialogRef: MatDialogRef<InversionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _imprimir: ImprimirService,
    private _util: UtilService
  ) {
    this.inv = data.inversion;
  }

  ngOnInit(): void {}

  getMoneda(e): string {
    return this._util.ConvertirMoneda(e);
  }

  getFecha(f): string {
    return this._util.ConvertirFechaHumana(f);
  }

  getFechaHoy(): string {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const anio = hoy.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }

  getZFill(numero: any): string {
    return this._util.zfill(numero, 4);
  }

  imprimir() {
    const contenido = document.getElementById('contenido')?.innerHTML;
    if (contenido) {
      this._imprimir.createHtmlSectionForPrint(contenido);
    }
  }
}
