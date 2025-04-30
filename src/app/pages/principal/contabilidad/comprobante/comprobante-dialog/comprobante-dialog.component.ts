import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { log } from 'console';
import { DialogData } from 'src/app/pages/generico/perfil/perfil.component';
import { ImprimirService } from 'src/app/services/util/imprimir.service';

@Component({
  selector: 'app-comprobante-dialog',
  templateUrl: './comprobante-dialog.component.html',
  styleUrls: ['./comprobante-dialog.component.scss']
})
export class ComprobanteDialogComponent implements OnInit {

  xData: any
  totalDebe: any = 0;
  totalHaber: any = 0;

  constructor(public dialogRef: MatDialogRef<ComprobanteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _imprimir: ImprimirService
  ) {
      this.xData = data.datos;
    }

  ngOnInit(): void {
    this.totalDebeHaber();
    this.totalDebe = Number(this.totalDebe).toFixed(2);
    this.totalHaber = Number(this.totalHaber).toFixed(2);
  }

  totalDebeHaber(){
    this.xData.forEach((item: any) => {
      this.totalDebe += item.debe;
      this.totalHaber += item.haber;
    });
  }

  getFechaActual(): string {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0'); // Asegura que el día tenga 2 dígitos
    const mes = String(hoy.getMonth() + 1).padStart(2, '0'); // Los meses comienzan en 0, por eso se suma 1
    const anio = hoy.getFullYear();
    return `${dia}-${mes}-${anio}`;
  }

  imprimir(){
    const contenido = document.getElementById('contenido')?.innerHTML;
    if (contenido) {
      this._imprimir.createHtmlSectionForPrint(contenido);
    }
  }
}