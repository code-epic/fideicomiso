import { Component, OnInit } from '@angular/core';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { CierreService } from 'src/app/services/banfanb/cierre.service';
import { ImprimirService } from 'src/app/services/util/imprimir.service';
import { UtilService } from 'src/app/services/util/util.service';
import { PlanGuardService } from 'src/app/services/banfanb/plan-guard.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-comprobacion',
  templateUrl: './comprobacion.component.html',
  styleUrls: ['./comprobacion.component.scss']
})
export class ComprobacionComponent implements OnInit {

  public codigo = "";
  public xAPI: IAPICore = {
    funcion: "",
    parametros: "",
  };
  public lstTotales = [];
  public lstDetalles = [];
  public lstBalance = [];
  public lstComprobacion = [];

  public acumuladord = 0;
  public acumuladorh = 0;
  public acum_saldo_inicial = 0;
  public acum_saldo_actual = 0;

  public posicion = 0;
  public tiempo = 0
  public cambio = false;
  public HTMLBalance = "";
  public HTMLComprobacion = "";
  public HTMLResultados = "";
  public fecha: string = ''
  public fdesde: string = '2023-12-01'
  public fhasta: string = '2023-12-31'
  public fecha_vienen: string = '2023-11-30'
  public plan = '%'

  printv: boolean = false

  public lstFecha: { id: number; value: string; nombre: string }[] = []

  public lstIndex = [
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
  ]; //Cuentas totalizadores de Fideicomiso

  public fechaultimo = ''
  public fechaTexto = ''
  public fechai: any
  public mes = 0
  public lstPlanesFideicomiso: any[] = []
  public planNombre: string = ''

  constructor(
    private apiService: ApiService,
    private ngxService: NgxUiLoaderService,
    private util: UtilService,
    public formatter: NgbDateParserFormatter,
    private _imprimir: ImprimirService,
    private cierre: CierreService,
    private planGuard: PlanGuardService
  ) { }

  ngOnInit(): void {
    this.consultarUltimoCierre()
    this.ListarPlanesFideicomiso()
  }

  async consultarUltimoCierre() {
    this.ngxService.stopLoader('load-precierre')
    this.fechaultimo = await this.cierre.getUltimoCierre()
    this.generarMeses()
    this.ngxService.stopLoader('load-precierre')
  }

  ListarPlanesFideicomiso() {
    const xAPI: IAPICore = {
      funcion: 'FID_CPlanesFideicomiso',
      parametros: '',
      valores: ''
    }
    this.apiService.Ejecutar(xAPI).subscribe({
      next: (data) => {
        this.lstPlanesFideicomiso = (data.Cuerpo || []).map((p: any) => {
          const estatus = parseInt(p.estatus) || 0;
          const bloqueado = this.planGuard.esBloqueado(estatus);
          return {
            ...p,
            displayName: bloqueado
              ? `${p.observacion} [${this.planGuard.getNombreEstatus(estatus)}]`
              : p.observacion
          };
        })
      },
      error: (err) => console.error(err)
    })
  }

  seleccionarPlan() {
    if (this.plan === '%') {
      this.planNombre = 'TODOS LOS PLANES'
    } else {
      const plan = this.lstPlanesFideicomiso.find(p => p.id == this.plan)
      this.planNombre = plan ? (plan.displayName || plan.observacion) : ''
    }
  }

  onMesChange(event: any) {
    this.mes = Number(event.value)
  }

  getNombrePlan(): string {
    if (this.plan === '%') return 'TODOS LOS PLANES';
    const plan = this.lstPlanesFideicomiso.find(p => p.id == this.plan);
    return plan ? (plan.displayName || plan.observacion || plan.fideicomiso) : '';
  }

  generarMeses() {
    const meses = []
    const hoy = new Date()
    const inicio = new Date(2023, 11, 1)

    const fecha = new Date(inicio)

    while (fecha <= hoy) {
      const anio = fecha.getFullYear()
      const mes = fecha.getMonth()

      const desde = new Date(anio, mes, 1)
      const hasta = new Date(anio, mes + 1, 0)
      const vienen = new Date(anio, mes, 0)

      const formato = (d: Date) => {
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const dia = String(d.getDate()).padStart(2, '0')
        return `${y}-${m}-${dia}`
      }

      const nombreMes = desde.toLocaleDateString('es-ES', { month: 'long' }).toUpperCase()

      meses.push({
        id: 0,
        value: `${formato(desde)},${formato(hasta)},${formato(vienen)}`,
        nombre: `${nombreMes} - ${anio}`
      })

      fecha.setMonth(fecha.getMonth() + 1)
    }

    this.lstFecha = meses.reverse()
    this.lstFecha.forEach((item, index) => {
      item.id = index
    })
    this.mes = 0
  }

  ConsultarComprobacion() {
    this.ngxService.startLoader('load-cont')
    this.xAPI.funcion = environment.xApi.CONSULTAR_BALANCE_COMPROBACION
    const mesIndex = Number(this.mes)
    this.xAPI.parametros = `${this.lstFecha[mesIndex].value},M,${this.plan}`
    this.xAPI.valores = "";

    this.apiService.Ejecutar(this.xAPI).subscribe(
      async (data) => {
        this.lstComprobacion = data.Cuerpo;
        this.HTMLComprobacion = `
          <table class="asientos" style="width: 100%; min-width: 700px; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="border: 1px solid #ccc; background-color: #e1e1d154; height: 35px;">
              <th style="text-align: left; padding: 6px 10px; width: 46%;">DESCRIPCION DE LA CUENTA</th>
              <th style="text-align: right; padding: 6px 12px; width: 13%;">SALDO INICIAL</th>
              <th style="text-align: right; padding: 6px 12px; width: 13%;">MONTO DEBE</th>
              <th style="text-align: right; padding: 6px 12px; width: 13%;">MONTO HABER</th>
              <th style="text-align: right; padding: 6px 12px; width: 15%;">SALDO ACTUAL</th>
            </tr>
          </thead>
          <tbody>
          `;
        this.posicion = 0;
        this.acumuladord = 0
        this.acumuladorh = 0
        this.acum_saldo_inicial = 0
        this.acum_saldo_actual = 0
        this.lstComprobacion.forEach((e) => {
          this.getPaso(e);
        });

        this.lstIndex[this.posicion].debe = this.acumuladord;
        this.lstIndex[this.posicion].haber = this.acumuladorh;
        let result = this.lstIndex[4].haber - this.lstIndex[3].debe;

        this.HTMLComprobacion += `
            <tr style="border-top: 2px solid #999; border-bottom: 1px solid #ccc; background-color: #d4d4c8; height: 40px;">  
              <th style="padding: 8px 10px; text-align: left;">${this.lstIndex[this.posicion].nombre} </th>
              <th style="padding: 8px 12px; text-align: right;">${this.getMoneda(this.acum_saldo_inicial) == "0"
            ? "-"
            : this.getMoneda(this.acum_saldo_inicial)
          }</th>
              <th style="padding: 8px 12px; text-align: right;">${this.getMoneda(this.acumuladord) == "0"
            ? "-"
            : this.getMoneda(this.acumuladord)
          }</th>
              <th style="padding: 8px 12px; text-align: right;">${this.getMoneda(this.acumuladorh) == "0"
            ? "-"
            : this.getMoneda(this.acumuladorh)
          }</th>
              <th style="padding: 8px 12px; text-align: right;">${this.getMoneda(this.acum_saldo_actual) == "0"
            ? "-"
            : this.getMoneda(this.acum_saldo_actual)
          }</th>
            </tr>
            
          </tbody>
        </table>
          `;
        this.printv = true,
          this.ngxService.stopLoader('load-cont')
      },
      (error) => {
        console.error(error);
      }
    );
  }

  getTitulosACuentas(e): string {
    let debe = e.debe == null ? 0 : e.debe;
    let haber = e.haber == null ? 0 : e.haber;
    let saldo_inicial = e.saldo_inicial == null ? 0 : e.saldo_inicial;
    let saldo_actual = e.saldo_actual == null ? 0 : e.saldo_actual;
    let titulo = "";
    if (e.totalizadora == "0") {
      let txt =
        "&nbsp;&nbsp;&nbsp;" +
        e.codigo_padre +
        "." +
        e.parte +
        "." +
        e.moneda +
        "." +
        e.nivel_1 +
        "." +
        e.nivel_2;
      titulo = `
      <tr style="border-bottom: 1px solid #eee;">  
          <td style="padding: 4px 10px;">${txt + ". " + e.descripcion.toUpperCase()}</td>
          <td style="text-align: right; padding: 4px 12px;">${this.getMoneda(saldo_inicial) == "0"
          ? "-"
          : this.getMoneda(saldo_inicial)
        }</td>
          <td style="text-align: right; padding: 4px 12px;">${this.getMoneda(debe) == "0" ? "-" : this.getMoneda(debe)
        }</td>
          <td style="text-align: right; padding: 4px 12px;">${this.getMoneda(haber) == "0" ? "-" : this.getMoneda(haber)
        }</td>
          <td style="text-align: right; padding: 4px 12px;">${this.getMoneda(saldo_actual) == "0"
          ? "-"
          : this.getMoneda(saldo_actual)
        }</td>
        </tr>`;
    } else {
      titulo = `
      <tr>  
        <td colspan="5" style="background-color: #eeeee4;">${e.codigo_padre + ". " + e.descripcion.toUpperCase()
        }</td>
      </tr>`;
    }
    return titulo;
  }

  getPaso(e) {
    let debe = e.debe == null ? 0 : e.debe;
    let haber = e.haber == null ? 0 : e.haber;
    let saldo_inicial = e.saldo_inicial == null ? 0 : e.saldo_inicial;
    let saldo_actual = e.saldo_actual == null ? 0 : e.saldo_actual;

    if (e.codigo_padre.substring(0, 2) == this.lstIndex[this.posicion].id) {
      this.acumuladord += parseFloat(debe);
      this.acumuladorh += parseFloat(haber);
      this.acum_saldo_inicial += parseFloat(saldo_inicial);
      this.acum_saldo_actual += parseFloat(saldo_actual);

      this.HTMLComprobacion += this.getTitulosACuentas(e);
    } else {
      this.lstIndex[this.posicion].debe = this.acumuladord;
      this.lstIndex[this.posicion].haber = this.acumuladorh;

      this.HTMLComprobacion += `
        <tr style="border-top: 2px solid #999; border-bottom: 1px solid #ccc; background-color: #e1e1d154; height: 35px;">  
          <th style="padding: 6px 10px; text-align: left;">${this.lstIndex[this.posicion].nombre} </th>
          <th style="padding: 6px 12px; text-align: right;">${this.getMoneda(this.acum_saldo_inicial) == "0"
          ? "-"
          : this.getMoneda(this.acum_saldo_inicial)
        }</th>
          <th style="padding: 6px 12px; text-align: right;">${this.getMoneda(this.acumuladord) == "0"
          ? "-"
          : this.getMoneda(this.acumuladord)
        }</th>
          <th style="padding: 6px 12px; text-align: right;">${this.getMoneda(this.acumuladorh) == "0"
          ? "-"
          : this.getMoneda(this.acumuladorh)
        }</th>
          <th style="padding: 6px 12px; text-align: right;">${this.getMoneda(this.acum_saldo_actual) == "0"
          ? "-"
          : this.getMoneda(this.acum_saldo_actual)
        }</th>
        </tr>
        <tr>  
          <td colspan="5" style="padding: 4px 10px;">${this.getTitulosACuentas(e)} </td>
        </tr>
        
      `;

      this.cambio = true;
      this.acumuladord = parseFloat(debe);
      this.acumuladorh = parseFloat(haber);
      this.acum_saldo_inicial = parseFloat(saldo_inicial);
      this.acum_saldo_actual = parseFloat(saldo_actual);
      this.posicion++;
    }
  }

  getMoneda(numero: number): string {
    return this.util.ConvertirMoneda(numero);
  }

  imprimir() {
    const p = document.getElementById("DivPrintPage").innerHTML;
    this._imprimir.createHtmlSectionForPrint(p);
  }
}
