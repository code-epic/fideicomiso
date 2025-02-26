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

  d: any
  totalDebe: any = 0;
  totalHaber: any = 0;

  constructor(public dialogRef: MatDialogRef<ComprobanteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private _imprimir: ImprimirService
  ) {
      this.d = data;
    }

  ngOnInit(): void {
    this.totalDebeHaber();
    this.totalDebe = Number(this.totalDebe).toFixed(2);
    this.totalHaber = Number(this.totalHaber).toFixed(2);
  }

  imprimir(){
    const contenido = document.getElementById('contenido')?.innerHTML;
    if (contenido) {
      this._imprimir.createHtmlSectionForPrint(contenido);
    }
  }

  totalDebeHaber(){
    this.d.datos.forEach((item: any) => {
      this.totalDebe += item.debe;
      this.totalHaber += item.haber;
    });
  }
}