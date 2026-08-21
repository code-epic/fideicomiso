import { Component, OnInit } from '@angular/core';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { CierreService } from 'src/app/services/banfanb/cierre.service';
import { UtilService } from 'src/app/services/util/util.service';
import { ImprimirService } from 'src/app/services/util/imprimir.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-auxiliar',
  templateUrl: './auxiliar.component.html',
  styleUrls: ['./auxiliar.component.css']
})
export class AuxiliarComponent implements OnInit {

  public fechau = ''
  public fechaultimo = ''
  public fechai: any

  public lstMovimientos = []
  public lstMovimientosAuxliares = []
  public bcuentat = false
  public semestral = false

  public dias: number = 0
  public acum_debe = 0
  public acum_haber = 0

  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
  }

  events: string[] = [];
  blista: boolean = false
  bauxiliar: boolean = false
  bAntes = false
  estatus: string = 'M'


  public lstIndex = [] 
  public cuenta = ''
  public plan = ''
  lstData = []
  public total_debe : number = 0
  public total_haber : number = 0

  constructor(private apiService: ApiService,
    private toastrService: ToastrService,
    private ngxService: NgxUiLoaderService,
    private util: UtilService,
    public formatter: NgbDateParserFormatter,
    private cierre: CierreService,
    private _imprimir: ImprimirService
  ) { }

  ngOnInit(): void {
    this.semestral = false
    this.estatus = 'M'
    this.plan = '%'
    this.consultarUltimoPreCierre()
    this.iniciarIndex()
  }

  iniciarIndex() {
    this.lstIndex = [
      {
        id: "71",
        total: 0,
        nombre: "TOTAL DE ACTIVOS",
        debe: 0,
        haber: 0,
        acc: 0,
      },
      {
        id: "72",
        total: 0,
        nombre: "TOTAL DE PASIVOS",
        debe: 0,
        haber: 0,
        acc: 0,
      },
      {
        id: "73",
        total: 0,
        nombre: "TOTAL DE PATRIMONIO",
        debe: 0,
        haber: 0,
        acc: 0,
      },
      {
        id: "74",
        total: 0,
        nombre: "TOTAL DE GASTOS",
        debe: 0,
        haber: 0,
        acc: 1,
      },
      {
        id: "75",
        total: 0,
        nombre: "TOTAL DE INGRESOS",
        debe: 0,
        haber: 0,
        acc: 1,
      },
    ]
    this.cuenta = 'X'
  }


  async consultarUltimoPreCierre() {
    this.fechaultimo = await this.cierre.getUltimoPrecierre()
    this.fechai = this.cierre.getSiguienteDia(this.fechaultimo);  
    this.semestral = this.cierre.getSemestral(this.fechaultimo)
    this.estatus = this.semestral ? 'S' : this.estatus
    this.dias = 1
  }

  ConsultarDetalles(){
    let fecha = new Date(this.fechai).toISOString().substring(0, 10)
    if(this.cuenta == 'X') {
      this.toastrService.error(
        'Debe seleccionar una cuenta contable',
        `Bus Empresarial`
      );
      return false
    }
    
    this.ngxService.startLoader('load-precierre')
    this.xAPI.funcion = environment.xApi.CONSULTAR_AUXILIAR
    this.xAPI.parametros = `${fecha},${this.cuenta}`
    this.xAPI.valores = ''

    this.apiService.Ejecutar(this.xAPI).subscribe(
      data => {
        this.blista = true
        this.lstMovimientos = data.Cuerpo
        this.ngxService.stopLoader('load-precierre')
      },
      error => {
        console.error(error)
      }
    )
  }

  getMoneda(numero: number): string {
    return this.util.ConvertirMoneda(numero);
  }

  imprimir() {
    const fecha = new Date(this.fechai).toLocaleDateString('es-VE');
    const cuentaSeleccionada = this.lstIndex.find(e => e.id === this.cuenta);
    const nombreCuenta = cuentaSeleccionada ? cuentaSeleccionada.nombre : '';

    let filasHTML = this.lstMovimientos.map(e => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #E4E5E7; font-size: 11px;">${e.cuenta}</td>
        <td style="padding: 8px; border-bottom: 1px solid #E4E5E7; text-align: left; font-size: 11px;">${e.descripcion || ''}</td>
        <td style="padding: 8px; border-bottom: 1px solid #E4E5E7; text-align: right; font-size: 11px;">${e.debe > 0 ? this.getMoneda(e.debe) : ''}</td>
        <td style="padding: 8px; border-bottom: 1px solid #E4E5E7; text-align: right; font-size: 11px;">${e.haber > 0 ? this.getMoneda(e.haber) : ''}</td>
      </tr>
    `).join('');

    const contenido = `
      <div style="font-family: 'IBM Plex Sans', sans-serif; color: #0F172A; padding: 20px 30px;">
        <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 16px; border-bottom: 3px solid #1E293B; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <img src="./assets/img/brand/logo.png" alt="Logo" style="height: 50px;">
            <div>
              <p style="margin: 0; font-size: 14px; font-weight: 700; color: #1E293B;">BANCO DE LA FUERZA ARMADA NACIONAL BOLIVARIANA</p>
              <p style="margin: 2px 0 0 0; font-size: 11px; color: #64748B;">Dirección de Fideicomiso</p>
            </div>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 10px; color: #94A3B8; text-transform: uppercase;">Fecha de impresión</p>
            <p style="margin: 2px 0 0 0; font-size: 12px; font-weight: 600; color: #334155;">${new Date().toLocaleDateString('es-VE')}</p>
          </div>
        </div>

        <div style="text-align: center; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid #E4E5E7;">
          <p style="font-size: 11px; color: #2563EB; text-transform: uppercase; letter-spacing: 2px; margin: 0;">AUXILIAR CONTABLE</p>
          <p style="font-size: 16px; font-weight: 700; color: #1E293B; margin: 4px 0 0 0;">${this.cuenta} - ${nombreCuenta}</p>
          <p style="font-size: 13px; color: #64748B; margin: 4px 0 0 0;">Fecha: ${fecha}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #E4E5E7;">
            <thead>
              <tr style="background: #1E293B;">
                <th style="padding: 10px 12px; font-size: 11px; text-align: left; color: #fff; border-bottom: 1px solid #E4E5E7;">CUENTA</th>
                <th style="padding: 10px 12px; font-size: 11px; text-align: left; color: #fff; border-bottom: 1px solid #E4E5E7;">DESCRIPCIÓN</th>
                <th style="padding: 10px 12px; font-size: 11px; text-align: right; color: #fff; border-bottom: 1px solid #E4E5E7;">DEBE</th>
                <th style="padding: 10px 12px; font-size: 11px; text-align: right; color: #fff; border-bottom: 1px solid #E4E5E7;">HABER</th>
              </tr>
            </thead>
            <tbody>
              ${filasHTML}
            </tbody>
          </table>
        </div>

        <div style="margin-top: 60px; display: flex; flex-direction: column; align-items: center;">
          <hr style="width: 40%; border: none; border-top: 1px solid #94A3B8; margin-bottom: 8px;">
          <p style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase;">FIRMA AUTORIZADA</p>
        </div>
      </div>
    `;

    this._imprimir.createHtmlSectionForPrint(contenido, 0);
  }
}
