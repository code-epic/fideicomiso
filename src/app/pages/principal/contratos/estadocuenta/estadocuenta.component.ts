import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { Contrato } from 'src/app/services/banfanb/contrato.service';
import { CierreService } from 'src/app/services/banfanb/cierre.service';
import { UtilService } from 'src/app/services/util/util.service';
import { ImprimirService } from 'src/app/services/util/imprimir.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-estadocuenta',
  templateUrl: './estadocuenta.component.html',
  styleUrls: ['./estadocuenta.component.scss']
})
export class EstadocuentaComponent implements OnInit {

  dataSource: any
  @ViewChild(MatPaginator) paginator: MatPaginator;
  displayedColumns: string[] = ['descripcion', 'fecha', 'dias', 'ingresos', 'egresos', 'saldo'];

  public Contrato: Contrato
  public desde: Date
  public hasta: Date
  public saldoInicial: number = 0
  public saldoFinal: number = 0
  public totalIngresos: number = 0
  public totalEgresos: number = 0
  public lstMovimientos: any[] = []

  constructor(
    public dialogRef: MatDialogRef<EstadocuentaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {contrato: Contrato},
    private _apiService: ApiService,
    private ngxService: NgxUiLoaderService,
    private cierre: CierreService,
    public util: UtilService,
    private _imprimir: ImprimirService,
  ) {
      this.Contrato = data.contrato
  }

  async ngOnInit(): Promise<void> {
    await this.periodoPorDefecto()
    this.consultarEstadoCuenta()
  }

  private async periodoPorDefecto() {
    const ultCierre = await this.cierre.getUltimoCierre()
    if (ultCierre) {
      const [dia, mes, anio] = ultCierre.split('/').map(Number)
      this.desde = new Date(anio, mes - 1, 1)
      this.hasta = new Date(anio, mes - 1, dia)
    } else {
      const hoy = new Date()
      this.desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
      this.hasta = hoy
    }
  }

  consultarEstadoCuenta() {
    if (this.desde == undefined || this.hasta == undefined) {
      return
    }
    this.ngxService.startLoader('load-EstadoCuenta')
    let xAPI: IAPICore = {
      funcion: environment.xApi.CONSULTAR_ESTADO_CUENTA_PLAN,
      parametros: `${this.fechaISO(this.desde)},${this.fechaISO(this.hasta)},${this.Contrato.numero}`
    }

    this._apiService.Ejecutar(xAPI).subscribe({
      next: (data) => {
        this.procesarMovimientos(data.Cuerpo || [])
        this.dataSource = new MatTableDataSource<any>(this.lstMovimientos)
        this.dataSource.paginator = this.paginator;
        this.ngxService.stopLoader('load-EstadoCuenta')
      },
      error: (err) => {
        console.error(err)
        this.ngxService.stopLoader('load-EstadoCuenta')
      }
    })
  }

  private procesarMovimientos(cuerpo: any[]) {
    this.lstMovimientos = []
    this.saldoInicial = 0
    this.saldoFinal = 0
    this.totalIngresos = 0
    this.totalEgresos = 0

    let saldo = 0
    let fechaAnterior: Date = new Date(this.desde)

    cuerpo.forEach(e => {
      if (e.tipo == 'INICIAL') {
        saldo = parseFloat(e.saldo || 0)
        this.saldoInicial = saldo
        this.lstMovimientos.push({
          descripcion: `SALDO AL ${this.fechaTexto(this.desde)}`,
          fecha: null,
          dias: 0,
          ingresos: null,
          egresos: null,
          saldo: saldo,
          esSaldo: true
        })
      } else if (e.tipo == 'MOVIMIENTO') {
        const ingresos = parseFloat(e.ingresos || 0)
        const egresos = parseFloat(e.egresos || 0)
        const fecha = new Date(e.fecha_operacion)
        saldo += ingresos - egresos
        this.totalIngresos += ingresos
        this.totalEgresos += egresos
        this.lstMovimientos.push({
          descripcion: e.descripcion,
          fecha: this.fechaTexto(fecha),
          dias: this.diasEntre(fechaAnterior, fecha),
          ingresos: ingresos,
          egresos: egresos,
          saldo: saldo,
          esSaldo: false
        })
        fechaAnterior = fecha
      } else if (e.tipo == 'FINAL') {
        this.saldoFinal = parseFloat(e.saldo || 0)
      }
    })

    this.lstMovimientos.push({
      descripcion: 'SALDO FINAL DEL PERÍODO',
      fecha: null,
      dias: null,
      ingresos: this.totalIngresos,
      egresos: this.totalEgresos,
      saldo: this.saldoFinal,
      esSaldo: true
    })
  }

  imprimir() {
    const fideicomiso = (this.Contrato.razonsocial || '').toUpperCase()
    const oficina = (this.Contrato.oficinatutora || '').split('|')[0].trim()

    let filas = ''
    this.lstMovimientos.forEach(e => {
      const estilo = e.esSaldo
        ? 'background-color: #eeeee4; font-weight: bold;'
        : ''
      filas += `
        <tr style="${estilo}">
          <td style="padding: 6px 8px; text-align: left; ${estilo}">${e.descripcion || ''}</td>
          <td style="padding: 6px 8px; text-align: center; ${estilo}">${e.fecha || ''}</td>
          <td style="padding: 6px 8px; text-align: center; ${estilo}">${e.dias != null ? e.dias : ''}</td>
          <td style="padding: 6px 8px; text-align: right; ${estilo}">${e.ingresos != null ? this.moneda(e.ingresos) : ''}</td>
          <td style="padding: 6px 8px; text-align: right; ${estilo}">${e.egresos != null ? this.moneda(e.egresos) : ''}</td>
          <td style="padding: 6px 8px; text-align: right; ${estilo}">${this.moneda(e.saldo)}</td>
        </tr>`
    })

    const contenido = `
      <div style="font-family: 'Roboto', sans-serif; font-size: 13px; color: #333; padding: 0; margin: 0;">

        <div style="text-align: center;">
          <img src="./assets/img/brand/logo.png" style="max-width: 200px; height: auto;">
        </div>
        <div style="text-align: center;">
          <p style="font-weight: 700; font-size: 14px; margin: 1px 0;">BANCO DE LA FUERZA ARMADA NACIONAL BOLIVARIANA</p>
          <p style="font-weight: 500; font-size: 12px; margin: 0; color: #555;">DIRECCION DE FIDEICOMISO</p>
        </div>
        <hr style="border: none; border-top: 2px solid #1a237e; margin: 3px 0;">
        <div style="text-align: center;">
          <p style="font-weight: 700; font-size: 13px; margin: 1px 0;">ESTADO DE CUENTA</p>
          <p style="font-weight: 500; font-size: 12px; margin: 0;">DESDE: ${this.fechaTexto(this.desde)} &nbsp;&nbsp; HASTA: ${this.fechaTexto(this.hasta)}</p>
        </div>

        <div style="margin-top: 10px;">
          <p style="margin: 2px 0; font-weight: 600;">Fideicomiso: ${fideicomiso}</p>
          ${oficina ? `<p style="margin: 2px 0; color: #555;">${oficina}</p>` : ''}
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
          <thead>
            <tr style="background-color: #eeeee4;">
              <th style="padding: 6px 8px; text-align: left; font-weight: 600;">Descripción Movimiento</th>
              <th style="padding: 6px 8px; text-align: center; font-weight: 600;">Fecha</th>
              <th style="padding: 6px 8px; text-align: center; font-weight: 600;">Días</th>
              <th style="padding: 6px 8px; text-align: right; font-weight: 600;">Ingresos</th>
              <th style="padding: 6px 8px; text-align: right; font-weight: 600;">Egresos</th>
              <th style="padding: 6px 8px; text-align: right; font-weight: 600;">Saldo</th>
            </tr>
          </thead>
          <tbody>
            ${filas}
          </tbody>
        </table>

      </div>

      <div style="font-family: 'Roboto', sans-serif; font-size: 12px; color: #333; padding: 0; margin: 0;">
        <div style="margin-top: 90px; display: flex; flex-direction: column; align-items: center;">
          <hr style="width: 40%; border: none; border-top: 1px solid #333; margin-bottom: 0.5rem;">
          <p style="font-weight: 600; font-size: 12px; margin: 0;">Tcnel. Carlos Contreras</p>
          <p style="font-weight: 500; font-size: 12px; margin: 0; color: #555;">Director de Fideicomiso</p>
        </div>
      </div>
    `;

    this._imprimir.createHtmlSectionForPrint(contenido, 0);
  }

  moneda(valor: number): string {
    return this.util.ConvertirMoneda(valor)
  }

  fechaTexto(f: Date): string {
    if (!f) return ''
    const d = new Date(f)
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
  }

  private fechaISO(f: Date): string {
    const d = new Date(f)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  private diasEntre(f1: Date, f2: Date): number {
    const d1 = new Date(f1.getFullYear(), f1.getMonth(), f1.getDate()).getTime()
    const d2 = new Date(f2.getFullYear(), f2.getMonth(), f2.getDate()).getTime()
    return Math.round((d2 - d1) / (1000 * 60 * 60 * 24))
  }

}
