import { Component, OnInit } from '@angular/core';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { CierreService } from 'src/app/services/banfanb/cierre.service';
import { ImprimirService } from 'src/app/services/util/imprimir.service';
import { UtilService } from 'src/app/services/util/util.service';
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

  public lstFecha = [
    { id: 0, value: '2023-12-01,2023-12-31,2023-11-30', nombre: 'DICIEMBRE - 2023' },
    { id: 1, value: '2024-01-01,2024-01-31,2023-12-31', nombre: 'ENERO - 2024' },
    { id: 2, value: '2024-02-01,2024-02-28,2024-01-31', nombre: 'FEBRERO - 2024' },
    { id: 3, value: '2024-03-01,2024-03-31,2024-02-28', nombre: 'MARZO - 2024' },
    { id: 4, value: '2024-04-01,2024-04-30,2024-03-31', nombre: 'ABRIL - 2024' },
    { id: 5, value: '2024-05-01,2024-05-31,2024-04-30', nombre: 'MAYO - 2024' },
    { id: 6, value: '2024-06-01,2024-06-30,2024-05-31', nombre: 'JUNIO - 2024' },
    { id: 7, value: '2024-07-01,2024-07-31,2024-06-30', nombre: 'JULIO - 2024' },
    { id: 9, value: '2024-08-01,2024-08-31,2024-07-31', nombre: 'AGOSTO - 2024' },
    { id: 10, value: '2024-09-01,2024-09-30,2024-08-31', nombre: 'SEPTIEMBRE - 2024' },
    { id: 11, value: '2024-10-01,2024-10-31,2024-09-30', nombre: '0CTUBRE - 2024' },
    { id: 12, value: '2024-11-01,2024-11-30,2024-10-31', nombre: 'NOVIEMBRE - 2024' },
    { id: 13, value: '2024-12-01,2024-12-31,2024-11-30', nombre: 'DICIEMBRE - 2024' },
  ]

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

  constructor(
    private apiService: ApiService,
    private ngxService: NgxUiLoaderService,
    private util: UtilService,
    public formatter: NgbDateParserFormatter,
    private _imprimir: ImprimirService,
    private cierre: CierreService
  ) { }

  ngOnInit(): void {
    this.consultarUltimoCierre()

  }

  async consultarUltimoCierre() {
    this.ngxService.stopLoader('load-precierre')
    this.fechaultimo = await this.cierre.getUltimoCierre()
    this.ngxService.stopLoader('load-precierre')
  }

  ConsultarComprobacion() {
    this.ngxService.startLoader('load-cont')
    console.log(this.mes)
    this.xAPI.funcion = environment.xApi.CONSULTAR_BALANCE_COMPROBACION
    this.xAPI.parametros = `${this.lstFecha[this.mes].value},S`
    this.xAPI.valores = "";

    this.apiService.Ejecutar(this.xAPI).subscribe(
      async (data) => {
        this.lstComprobacion = data.Cuerpo;
        this.HTMLComprobacion = `
          <table class="asientos" >
                          
          <thead background-color: #e1e1d154; height: 35px;>
            <tr style="border: 0px; border-bottom: 1px solid #ccc; background-color: #e1e1d154; height: 35px;">
              <th style="text-align: left; " >DESCRIPCION DE LA CUENTA</th>
              <th style="text-align: center;">SALDO INICIAL</th>
              <th style="text-align: center;">MONTO DEBE</th>
              <th style="text-align: center;">MONTO HABER</th>
              <th style="text-align: center;">SALDO ACTUAL</th>
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
        console.log(this.lstIndex);
        let result = this.lstIndex[4].haber - this.lstIndex[3].debe;

        this.HTMLComprobacion += `
            <tr style="border: 0px; border-bottom: 1px solid #ccc; background-color: #e1e1d154; height: 35px;">  
              <th >${this.lstIndex[this.posicion].nombre} </th>
              <th class="text-right">${this.getMoneda(this.acum_saldo_inicial) == "0"
            ? "-"
            : this.getMoneda(this.acum_saldo_inicial)
          }</th>
              <th class="text-right">${this.getMoneda(this.acumuladord) == "0"
            ? "-"
            : this.getMoneda(this.acumuladord)
          }</th>
              <th class="text-right">${this.getMoneda(this.acumuladorh) == "0"
            ? "-"
            : this.getMoneda(this.acumuladorh)
          }</th>
              <th class="text-right">${this.getMoneda(this.acum_saldo_actual) == "0"
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
        console.log(error);
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
      <tr>  
          <td>${txt + ". " + e.descripcion.toUpperCase()}</td>
          <td class="text-right">${this.getMoneda(saldo_inicial) == "0"
          ? "-"
          : this.getMoneda(saldo_inicial)
        }</td>
          <td class="text-right">${this.getMoneda(debe) == "0" ? "-" : this.getMoneda(debe)
        }</td>
          <td class="text-right">${this.getMoneda(haber) == "0" ? "-" : this.getMoneda(haber)
        }</td>
          <td class="text-right">${this.getMoneda(saldo_actual) == "0"
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
        <tr style="border: 0px; border-bottom: 1px solid #ccc; background-color: #e1e1d154; height: 35px;">  
          <th >${this.lstIndex[this.posicion].nombre} </th>
          <th class="text-right">${this.getMoneda(this.acum_saldo_inicial) == "0"
          ? "-"
          : this.getMoneda(this.acum_saldo_inicial)
        }</th>
          <th class="text-right">${this.getMoneda(this.acumuladord) == "0"
          ? "-"
          : this.getMoneda(this.acumuladord)
        }</th>
          <th class="text-right">${this.getMoneda(this.acumuladorh) == "0"
          ? "-"
          : this.getMoneda(this.acumuladorh)
        }</th>
          <th class="text-right">${this.getMoneda(this.acum_saldo_actual) == "0"
          ? "-"
          : this.getMoneda(this.acum_saldo_actual)
        }</th>
        </tr>
        <tr>  
          <td  colspan="5">${this.getTitulosACuentas(e)} </td>
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
