import { Component, OnInit } from '@angular/core';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { UtilService } from 'src/app/services/util/util.service';

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
  public fecha : string = ''
  public fdesde : string = '2023-12-01'
  public fhasta : string = '2023-12-31'
  public fecha_vienen : string = '2023-11-30'

  public lstFecha = [
    {id : '2023-12-01,2023-12-31,2023-11-30', value: 'DICIEMBRE'},
    {id : '2024-01-01,2024-01-31,2023-12-31', value: 'ENERO'},
    {id : '2024-02-01,2024-02-28,2024-01-31', value: 'FEBRERO'},
    {id : '2024-03-01,2024-03-31,2024-02-28', value: 'MARZO'},
    {id : '2024-04-01,2024-04-30,2024-03-31', value: 'ABRIL'},
    {id : '2024-05-01,2024-05-31,2024-04-30', value: 'MAYO'},
    {id : '2024-06-01,2024-06-30,2024-05-31', value: 'JUNIO'},
    {id : '2024-07-01,2024-07-31,2024-06-30', value: 'JULIO'},
    {id : '2024-08-01,2024-08-31,2024-07-31', value: 'AGOSTO'},
    {id : '2024-09-01,2024-09-30,2024-08-31', value: 'SEPTIEMBRE'},
    {id : '2024-10-01,2024-10-31,2024-09-30', value: '0CTUBRE'},
    {id : '2024-11-01,2024-11-30,2024-10-31', value: 'NOVIEMBRE'},
    {id : '2024-12-01,2024-12-31,2024-11-30', value: 'DICIEMBRE'},
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

  public mes = 0
  constructor(
    private apiService: ApiService,
    private ngxService: NgxUiLoaderService,
    private util: UtilService,
    public formatter: NgbDateParserFormatter
  ) { }

  ngOnInit(): void {
    this.generarBalanceComprobacion()
  }




  generarBalanceComprobacion() {
    this.ngxService.startLoader('load-cont')
   
    this.xAPI.funcion = "FID_CBalanceComprobacion";
    // this.xAPI.parametros = "2023-08-01,2023-08-31,2023-07-31";
    this.xAPI.parametros = `${this.lstFecha[this.mes].id},S`
    // this.xAPI.parametros = '2023-06-01,2023-06-30,2023-05-31'
    this.xAPI.valores = "";
    console.log(this.xAPI)

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
              <th class="text-right">${
                this.getMoneda(this.acum_saldo_inicial) == "0"
                  ? "-"
                  : this.getMoneda(this.acum_saldo_inicial)
              }</th>
              <th class="text-right">${
                this.getMoneda(this.acumuladord) == "0"
                  ? "-"
                  : this.getMoneda(this.acumuladord)
              }</th>
              <th class="text-right">${
                this.getMoneda(this.acumuladorh) == "0"
                  ? "-"
                  : this.getMoneda(this.acumuladorh)
              }</th>
              <th class="text-right">${
                this.getMoneda(this.acum_saldo_actual) == "0"
                  ? "-"
                  : this.getMoneda(this.acum_saldo_actual)
              }</th>
            </tr>
            <tr style="border: 0px; border-bottom: 1px solid #ccc; background-color: #f3f3ea54; height: 35px;">  
              <td colspan="5"> &nbsp; </td>
            </tr>
            <tr style="border: 0px; border-bottom: 1px solid #ccc; background-color: #f3f3ea54; height: 35px;">  
              <th colspan=5 class="text-center total" > RESULTADO NETO </th>
            </tr>
            <tr style="border: 0px; border-bottom: 1px solid #ccc; background-color: #f3f3ea54; height: 35px;">  
              <th colspan=5 class="text-center total"> 
                Bs. ${this.getMoneda(result)}
              </th>
            </tr>
          </tbody>
        </table>
          `;
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
          <td class="text-right">${
            this.getMoneda(saldo_inicial) == "0"
              ? "-"
              : this.getMoneda(saldo_inicial)
          }</td>
          <td class="text-right">${
            this.getMoneda(debe) == "0" ? "-" : this.getMoneda(debe)
          }</td>
          <td class="text-right">${
            this.getMoneda(haber) == "0" ? "-" : this.getMoneda(haber)
          }</td>
          <td class="text-right">${
            this.getMoneda(saldo_actual) == "0"
              ? "-"
              : this.getMoneda(saldo_actual)
          }</td>
        </tr>`;
    } else {
      titulo = `
      <tr>  
        <td colspan="5" style="background-color: #eeeee4;">${
          e.codigo_padre + ". " + e.descripcion.toUpperCase()
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
          <th class="text-right">${
            this.getMoneda(this.acum_saldo_inicial) == "0"
              ? "-"
              : this.getMoneda(this.acum_saldo_inicial)
          }</th>
          <th class="text-right">${
            this.getMoneda(this.acumuladord) == "0"
              ? "-"
              : this.getMoneda(this.acumuladord)
          }</th>
          <th class="text-right">${
            this.getMoneda(this.acumuladorh) == "0"
              ? "-"
              : this.getMoneda(this.acumuladorh)
          }</th>
          <th class="text-right">${
            this.getMoneda(this.acum_saldo_actual) == "0"
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
}
