import { Component, OnInit } from '@angular/core';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { NgbDateParserFormatter } from "@ng-bootstrap/ng-bootstrap";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { UtilService } from "src/app/services/util/util.service";
import { ToastrService } from 'ngx-toastr';
import { ImprimirService } from 'src/app/services/util/imprimir.service';
import { environment } from 'src/environments/environment';
import { CierreService } from 'src/app/services/banfanb/cierre.service';

@Component({
  selector: 'app-generalyresultado',
  templateUrl: './generalyresultado.component.html',
  styleUrls: ['./generalyresultado.component.scss']
})
export class GeneralyresultadoComponent implements OnInit {

  public codigo = "";
  public xAPI: IAPICore = {
    funcion: "",
    parametros: "",
  };

  public csvHead;
  public csvBody;
  public delimitador = ";";

  public lstTotales = []
  public lstDetalles = []
  public lstBalance = []
  public lstComprobacion = []
  public printv: boolean = false

  public fechaultimo = ''
  public fechaUltimoComparacion = ''
  public fechaTexto = ''
  public fechai: any

  public acumuladord = 0
  public acumuladorh = 0
  public acum_saldo_inicial = 0
  public acum_saldo_actual = 0

  public posicion = 0
  public tiempo = 0
  public cambio = false
  public HTMLBalance = ""
  public HTMLComprobacion = ""
  public HTMLResultados = ""
  public fecha: string = ''
  public fdesde: string = '2023-12-01'
  public fhasta: string = '2023-12-31'
  public fecha_vienen: string = '2023-11-30'
  public estatus: string = '%'
  public bAntes: boolean = true
  public calcularacero : number = 0
  public total_gastos  : number = 0

  public plan : string = '%'
  public tipoVista: string = 'TODAS'

  public lstIndex = [] //Cuentas totalizadores de Fideicomiso

  constructor(
    private apiService: ApiService,
    private ngxService: NgxUiLoaderService,
    private toasService: ToastrService,
    private util: UtilService,
    private _imprimir: ImprimirService,
    private cierre: CierreService,
    public formatter: NgbDateParserFormatter,
  ) { }

  ngOnInit(): void {
    this.consultarUltimoCierre()
  }

  async consultarUltimoCierre() {
    this.ngxService.stopLoader('load-precierre')
    this.fechaultimo = await this.cierre.getUltimoCierre()
    this.fechai = this.cierre.getSiguienteDia(this.fechaultimo);
    this.ngxService.stopLoader('load-precierre')
  }

  ConsultarComprobante() {
    if (this.fechai == undefined) {
      this.toasService.warning("Debe seleccionar una fecha ", "Fideicomiso")
      return
    }

    let antes = new Date(this.fechai).setHours(-23)

    let fechaHoy = new Date(this.fechai);
    let sHoy = fechaHoy.toISOString().substring(0, 10);
    let sAntes = new Date(antes).toISOString().substring(0, 10)

    this.fecha = `${sHoy},${sAntes}`

    this.fechaTexto = this.util.ConvertirFechaHumana(this.fechai);    

    this.iniciarIndex()
    this.lstBalance = []
    this.HTMLBalance = ''
    this.HTMLResultados = ''
    this.acumuladord = 0
    this.acumuladorh = 0
    this.acum_saldo_inicial = 0
    this.posicion = 0
    this.acum_saldo_actual = 0
    this.calcularacero = 0
    this.consultarBalance()
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
  }

  consultarBalance() {
  // Asignar la fecha restada a this.fecha
    this.xAPI.funcion = environment.xApi.CONSULTAR_BALANCE_FECHA

    this.xAPI.parametros = `${this.fecha},${this.estatus}`
    this.xAPI.valores = "";
    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {
        this.printv = true
        if (data.Cuerpo.length == 0) {
          this.toasService.warning("No se encontraron datos para la fecha ", "Fideicomiso")
          return
        }
        this.csvHead = data.Cabecera;
        this.csvBody = data.Cuerpo
        this.lstBalance = data.Cuerpo;
        this.HTMLBalance = `
          <table class="asientos">
          <thead>
            <tr style="border: 0px; border-bottom: 1px solid #ccc; background-color: #e1e1d154; height: 35px;">
              <th style="text-align:left">DESCRIPCION DE LA CUENTA</th>
              <th class='text-right'></th>
            </tr>
          </thead>
          <tbody>`
          
        this.HTMLResultados += this.HTMLBalance

        this.lstBalance.forEach((e) => {
          if (
            e.codigo_padre.indexOf("74") == -1 &&
            e.codigo_padre.indexOf("75") == -1
          ) {
            this.getDetalle(e);
          } else {
            this.getDetalleResultados(e, this.tiempo)
          }
        });

        let result = this.acum_saldo_actual - this.total_gastos;

        this.HTMLBalance += ``;
        this.HTMLResultados += `
        <tr style="border: 0px; border-bottom: 1px solid #ccc; background-color: #e1e1d154; height: 35px;">  
        <th >${this.lstIndex[this.posicion].nombre} </th>
        <th class="text-right">${this.getMoneda(this.acum_saldo_actual) == "0"
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
                  Bs. ${ this.calcularacero==1?'-':this.getMoneda(result) }
                </th>
              </tr>
            </tbody>
          </table>
          `;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  getDetalle(e) {
    let debe = e.debe == null ? 0 : e.debe;
    let haber = e.haber == null ? 0 : e.haber;
    let saldo_inicial = e.saldo_inicial == null ? 0 : e.saldo_inicial;
    let saldo_actual = e.saldo_actual == null ? 0 : e.saldo_actual;
    if (e.codigo_padre.substring(0, 2) == this.lstIndex[this.posicion].id) {
      this.acumuladord += parseFloat(debe);
      this.acumuladorh += parseFloat(haber);
      this.acum_saldo_inicial += parseFloat(saldo_inicial);
      this.acum_saldo_actual += parseFloat(saldo_actual);

      this.HTMLBalance += this.getTitulosACuentasBalance(e);
    } else {
      this.lstIndex[this.posicion].debe = this.acumuladord;
      this.lstIndex[this.posicion].haber = this.acumuladorh;

      this.HTMLBalance += `
        <tr style="border: 0px; border-bottom: 1px solid #ccc; background-color: #e1e1d154; height: 35px;">  
          <th class="th-general">${this.lstIndex[this.posicion].nombre} </th>
          <th class="text-right class="th-general">${this.getMoneda(this.acum_saldo_actual) == "0"
          ? ""
          : this.getMoneda(this.acum_saldo_actual) 
        }</th>
        </tr>
        <tr>  
          <td  colspan="5" class="td-general">${this.getTitulosACuentasBalance(e)} </td>
        </tr>`

      this.cambio = true;
      this.acumuladord = parseFloat(debe);
      this.acumuladorh = parseFloat(haber);
      this.acum_saldo_inicial = parseFloat(saldo_inicial);
      this.acum_saldo_actual = parseFloat(saldo_actual);
      this.posicion++;
    }
  }

  getDetalleResultados(e, tiempo) {

    let debe = e.debe == null ? 0 : e.debe;
    let haber = e.haber == null ? 0 : e.haber;
    let saldo_inicial = e.saldo_inicial == null ? 0 : e.saldo_inicial;
    let saldo_actual = e.saldo_actual == null ? 0 : e.saldo_actual;
    
    if (e.codigo_padre.substring(0, 2) == this.lstIndex[this.posicion].id) {
      this.acumuladord += parseFloat(debe)
      this.acumuladorh += parseFloat(haber)
      this.acum_saldo_inicial += parseFloat(saldo_inicial)
      this.acum_saldo_actual += parseFloat(saldo_actual)
      this.HTMLResultados += this.getTitulosACuentasBalance(e)
    } else {
      this.total_gastos = this.posicion==3?this.acum_saldo_actual: 0
      let cadena = `
        <tr style="border: 0px; border-bottom: 1px solid #ccc; background-color: #e1e1d154; height: 35px;">  
          <th class="th-general">${this.lstIndex[this.posicion].nombre} </th>
          <th class="text-right th-general">${this.getMoneda(this.acum_saldo_actual) == "0"
          ? "-"
          : this.getMoneda(this.acum_saldo_actual) 
        }</th>
        </tr>
       
      `;
      if (this.acum_saldo_actual == 0) this.calcularacero = 1
      
      if (this.tiempo == 0) {
        this.HTMLBalance += cadena
        this.HTMLResultados += `
        <tr>  
          <td  colspan="5">${this.getTitulosACuentasBalance(e)}</td>
        </tr>`
      } else {
        this.HTMLResultados += cadena
      }
      this.cambio = true
      this.acumuladord = parseFloat(debe)
      this.acumuladorh = parseFloat(haber)
      this.acum_saldo_inicial = parseFloat(saldo_inicial)
      this.acum_saldo_actual = parseFloat(saldo_actual)
      this.posicion++
      this.tiempo++
    }
  }

  getTitulosACuentasBalance(e): string {
    let saldo_actual = e.saldo_actual == null ? 0 : e.saldo_actual;
    let titulo = "";
    if (e.totalizadora == "0" || e.totalizadora == "3") {
      if (this.tipoVista === 'MADRES') {
        return "";
      }
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
          <td class="text-right">${this.getMoneda(saldo_actual) == "0"
          ? "-"
          : this.getMoneda(saldo_actual) 
        }</td>
        </tr>`;
    } else {
      let montoMadre = "";
      if (this.tipoVista === 'MADRES') {
        montoMadre = `<td class="text-right" style="background-color: #eeeee4; font-weight: bold;">${
          this.getMoneda(saldo_actual) == "0" ? "-" : this.getMoneda(saldo_actual)
        }</td>`;
      }
      titulo = `
      <tr>  
        <td ${this.tipoVista === 'MADRES' ? '' : 'colspan="5"'} style="background-color: #eeeee4; font-weight: bold;">${e.codigo_padre + ". " + e.descripcion.toUpperCase()}</td>
        ${montoMadre}
      </tr>`;
    }
    return titulo;
  }

  getTitulosACuentas(e): string {
    let debe = e.debe == null ? 0 : e.debe;
    let haber = e.haber == null ? 0 : e.haber;
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
          <td class="text-right">${this.getMoneda(saldo_actual) == "0"
          ? "-"
          : this.getMoneda(saldo_actual) 
        }</td>
          <td class="text-right">${this.getMoneda(debe) == "0" ? "-" : this.getMoneda(debe) + "***"
        }</td>
          <td class="text-right">${this.getMoneda(haber) == "0" ? "-" : this.getMoneda(haber) + "=+++"
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
          <th class="th-general" >${this.lstIndex[this.posicion].nombre} </th>
          <th class="text-right th-general">${this.getMoneda(this.acum_saldo_actual) == "0"
          ? "-"
          : this.getMoneda(this.acum_saldo_actual)
        }</th>
          <th class="text-right th-general">${this.getMoneda(this.acumuladord) == "0"
          ? "-"
          : this.getMoneda(this.acumuladord)
        }</th>
          <th class="text-right th-general">${this.getMoneda(this.acumuladorh) == "0"
          ? "-"
          : this.getMoneda(this.acumuladorh)
        }</th>
          <th class="text-right th-general">${this.getMoneda(this.acum_saldo_actual) == "0"
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

  PrintPage() {

    let ventana = window.open("", "_blank");
    let contenido = document.getElementById('DivPrintPage').innerHTML
    ventana.document.write(contenido)

    ventana.document.head.innerHTML = ` 
      <meta charset="utf-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>Gestion de Documentos</title>
      <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
      
      <style type="text/css">
          @media print {
              body {
                    margin: 0px;
                    font-family: Calibri;
                }
          }
      </style>
    `;
    ventana.print()
    ventana.close()
  }
  

  downloadCSVEx() {
    let head = this.csvHead.map((e) => {
      return e.nombre;
    });
    this.util.downloadFile(
      head,
      this.csvBody,
      "RC-" + this.util.GenerarUnicId(),
      this.delimitador
    );
  }

  imprimir(){
    const fecha = this.fechaTexto;
    
    const balanceHTML = this.HTMLBalance
      .replace(/<table class="asientos">/g, '<table style="width: 100%; border-collapse: collapse; margin-top: 4px;">')
      .replace(/<td style="background-color: #eeeee4;">/g, '<td style="padding: 6px 8px; line-height: 1.8; width: 80%; text-align: left; background-color: #eeeee4;">')
      .replace(/<td >/g, '<td style="padding: 6px 8px; line-height: 1.8; width: 80%; text-align: left;">')
      .replace(/<th style="text-align:left">/g, '<th style="padding: 6px 8px; line-height: 1.8; width: 80%; text-align: left;">')
      .replace(/<th class='text-right'>/g, '<th style="padding: 6px 8px; line-height: 1.8; width: 20%; text-align: right;">')
      .replace(/<th class="text-right">/g, '<th style="padding: 6px 8px; line-height: 1.8; width: 20%; text-align: right;">')
      .replace(/<th class="th-general">/g, '<th style="padding: 6px 8px; line-height: 1.8; width: 80%; text-align: left; font-weight: 600;">')
      .replace(/<th class="text-right class="th-general">/g, '<th style="padding: 6px 8px; line-height: 1.8; width: 20%; text-align: right; font-weight: 600;">')
      .replace(/<th class="text-right th-general">/g, '<th style="padding: 6px 8px; line-height: 1.8; width: 20%; text-align: right; font-weight: 600;">');

    const resultadosHTML = this.HTMLResultados
      .replace(/<thead>[\s\S]*?<\/thead>/g, '') // Quitar cabecera de la tabla de resultados para la impresión
      .replace(/<th >TOTAL DE INGRESOS/g, '<th style="padding: 6px 8px; line-height: 1.8; text-align: left;">TOTAL DE INGRESOS')
      .replace(/<tr style="border: 0px; border-bottom: 1px solid #ccc; background-color: #f3f3ea54; height: 35px;">\s*?<td colspan="5"> &nbsp; <\/td>\s*?<\/tr>/g, `
        <tr style="border: 0px; border-bottom: 1px solid #ccc; background-color: #f3f3ea54; height: 35px;">
          <td colspan="5"> &nbsp; </td>
        </tr>
        <tr style="border: 0px; border-bottom: 1px solid #ccc; background-color: #f3f3ea54; height: 35px;">
          <td colspan="5"> &nbsp; </td>
        </tr>
        <tr style="border: 0px; border-bottom: 1px solid #ccc; background-color: #f3f3ea54; height: 35px;">
          <td colspan="5"> &nbsp; </td>
        </tr>
        <tr style="border: 0px; border-bottom: 1px solid #ccc; background-color: #f3f3ea54; height: 35px;">
          <td colspan="5"> &nbsp; </td>
        </tr>
      `)
      .replace(/<table class="asientos">/g, '<table style="width: 100%; border-collapse: collapse; margin-top: 4px;">')
      .replace(/<td style="background-color: #eeeee4;">/g, '<td style="padding: 6px 8px; line-height: 1.8; width: 80%; text-align: left; background-color: #eeeee4;">')
      .replace(/<td >/g, '<td style="padding: 6px 8px; line-height: 1.8; width: 80%; text-align: left;">')
      .replace(/<th style="text-align:left">/g, '<th style="padding: 6px 8px; line-height: 1.8; width: 80%; text-align: left;">')
      .replace(/<th class='text-right'>/g, '<th style="padding: 6px 8px; line-height: 1.8; width: 20%; text-align: right;">')
      .replace(/<th class="text-right">/g, '<th style="padding: 6px 8px; line-height: 1.8; width: 20%; text-align: right;">')
      .replace(/<th class="th-general">/g, '<th style="padding: 6px 8px; line-height: 1.8; width: 80%; text-align: left; font-weight: 600;">')
      .replace(/<th class="text-right th-general">/g, '<th style="padding: 6px 8px; line-height: 1.8; width: 20%; text-align: right; font-weight: 600;">')
      .replace(/<th colspan="5" class="text-center total">/g, '<th colspan="5" style="padding: 6px 8px; line-height: 1.8; text-align: left; font-weight: 700; background-color: #e8eaf6;">');

    const contenido = `
      <div style="font-family: 'Roboto', sans-serif; font-size: 13px; color: #333; padding: 0; margin: 0;">

        <div style="text-align: center;">
          <img src="./assets/img/brand/logo.png" style="max-width: 200px; height: auto;">
        </div>
        <div style="text-align: center;">
          <p style="font-weight: 700; font-size: 14px; margin: 2px 0;">BANCO DE LA FUERZA ARMADA NACIONAL BOLIVARIANA</p>
          <p style="font-weight: 500; font-size: 12px; margin: 0; color: #555;">DIRECCION DE FIDEICOMISO</p>
        </div>
        <hr style="border: none; border-top: 2px solid #1a237e; margin: 4px 0;">
        <div style="text-align: center;">
          <p style="font-weight: 700; font-size: 13px; margin: 2px 0;">ESTADO DE SITUACION FINANCIERA AL - ${fecha}</p>
        </div>
        ${balanceHTML}
        ${resultadosHTML}

      </div>

      <div style="font-family: 'Roboto', sans-serif; font-size: 13px; color: #333; padding: 0; margin: 0;">
        <div style="margin-top: 115px; display: flex; flex-direction: column; align-items: center;">
          <hr style="width: 40%; border: none; border-top: 1px solid #333; margin-bottom: 0.5rem;">
          <p style="font-weight: 600; font-size: 13px; margin: 0;">FIRMA AUTORIZADA</p>
        </div>
      </div>
    `;

    this._imprimir.createHtmlSectionForPrint(contenido, 0);
  }
}

