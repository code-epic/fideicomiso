import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ImprimirService } from 'src/app/services/util/imprimir.service';
import { UtilService } from 'src/app/services/util/util.service';

@Component({
  selector: 'app-comprobante-dialog',
  templateUrl: './comprobante-dialog.component.html',
  styleUrls: ['./comprobante-dialog.component.scss']
})
export class ComprobanteDialogComponent implements OnInit {

  xData: any
  totalDebe: any = 0;
  totalHaber: any = 0;
  fechaComprobante: string
  descripcionComprobante: string

  constructor(public dialogRef: MatDialogRef<ComprobanteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _imprimir: ImprimirService,
    private _util: UtilService
  ) {
      this.xData = data.datos;
      this.descripcionComprobante = data.descripcion || '';
    }

  ngOnInit(): void {
    this.fechaComprobante = this._util.ConvertirFechaHumana(this.xData[0].fecha)
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
    const fecha = this.fechaComprobante;
    const descripcion = this.descripcionComprobante;
    const totalDebe = this.totalDebe;
    const totalHaber = this.totalHaber;

    const filasHTML = this.xData.map(e => `
      <tr>
        <td style="padding: 10px 16px; font-size: 12px; color: #0F172A; border-bottom: 1px solid #E4E5E7; text-align: center;">${e.detalle || e.cuenta}</td>
        <td style="padding: 10px 16px; font-size: 12px; color: #0F172A; border-bottom: 1px solid #E4E5E7; text-align: left;">${e.descripcion}</td>
        <td style="padding: 10px 16px; font-size: 12px; color: #0F172A; border-bottom: 1px solid #E4E5E7; text-align: right;">${Number(e.debe).toFixed(2)}</td>
        <td style="padding: 10px 16px; font-size: 12px; color: #0F172A; border-bottom: 1px solid #E4E5E7; text-align: right;">${Number(e.haber).toFixed(2)}</td>
      </tr>
    `).join('');

    const contenido = `
      <div style="font-family: 'IBM Plex Sans', sans-serif; color: #0F172A; background: #fff; padding: 30px 40px; max-width: 800px; margin: 0 auto;">

        <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 16px; border-bottom: 3px solid #1E293B; margin-bottom: 24px;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <img src="./assets/img/brand/logo.png" alt="Logo" style="height: 50px;">
            <div>
              <p style="margin: 0; font-size: 14px; font-weight: 700; color: #1E293B; letter-spacing: 0.5px;">
                BANCO DE LA FUERZA ARMADA NACIONAL BOLIVARIANA
              </p>
              <p style="margin: 2px 0 0 0; font-size: 11px; font-weight: 500; color: #64748B; letter-spacing: 1px; text-transform: uppercase;">
                Dirección de Fideicomiso
              </p>
            </div>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 10px; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.5px;">Fecha de impresión</p>
            <p style="margin: 2px 0 0 0; font-size: 12px; font-weight: 600; color: #334155;">${this.getFechaActual()}</p>
          </div>
        </div>

        <div style="text-align: center; margin-bottom: 28px;">
          <p style="margin: 0; font-size: 11px; font-weight: 500; color: #2563EB; text-transform: uppercase; letter-spacing: 2px;">
            Comprobante Contable
          </p>
          <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 700; color: #1E293B;">
            ${descripcion.toUpperCase()}
          </p>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748B;">
            ${fecha}
          </p>
        </div>

        <div style="margin-bottom: 20px;">
          <div style="background: #1E293B; color: #fff; padding: 8px 16px; font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; border-radius: 4px 4px 0 0;">
            Asientos Contables
          </div>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #E4E5E7; border-top: none;">
            <thead>
              <tr style="background: #F8FAFC;">
                <th style="padding: 10px 16px; font-size: 11px; font-weight: 600; color: #64748B; text-align: center; border-bottom: 1px solid #E4E5E7;">CUENTA</th>
                <th style="padding: 10px 16px; font-size: 11px; font-weight: 600; color: #64748B; text-align: left; border-bottom: 1px solid #E4E5E7;">DESCRIPCIÓN</th>
                <th style="padding: 10px 16px; font-size: 11px; font-weight: 600; color: #64748B; text-align: right; border-bottom: 1px solid #E4E5E7;">DEBE</th>
                <th style="padding: 10px 16px; font-size: 11px; font-weight: 600; color: #64748B; text-align: right; border-bottom: 1px solid #E4E5E7;">HABER</th>
              </tr>
            </thead>
            <tbody>
              ${filasHTML}
            </tbody>
            <tfoot>
              <tr style="background: #F1F5F9; font-weight: 700;">
                <td colspan="2" style="padding: 10px 16px; font-size: 12px; color: #1E293B; text-align: right; border-top: 2px solid #1E293B;">TOTAL</td>
                <td style="padding: 10px 16px; font-size: 12px; color: #1E293B; text-align: right; border-top: 2px solid #1E293B;">${totalDebe}</td>
                <td style="padding: 10px 16px; font-size: 12px; color: #1E293B; text-align: right; border-top: 2px solid #1E293B;">${totalHaber}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style="margin-top: 75px; display: flex; flex-direction: column; align-items: center;">
          <hr style="width: 40%; border: none; border-top: 1px solid #94A3B8; margin-bottom: 8px;">
          <p style="font-size: 11px; font-weight: 600; color: #64748B; margin: 0; letter-spacing: 1px; text-transform: uppercase;">FIRMA AUTORIZADA</p>
        </div>

      </div>
    `;

    this._imprimir.createHtmlSectionForPrint(contenido);
  }
}