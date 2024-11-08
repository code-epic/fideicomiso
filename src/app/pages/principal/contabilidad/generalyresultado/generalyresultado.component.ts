import { Component, OnInit } from '@angular/core';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { MatSnackBar } from "@angular/material/snack-bar";
import { NgbDateParserFormatter } from "@ng-bootstrap/ng-bootstrap";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { UtilService } from "src/app/services/util/util.service";
import { ToastrService } from 'ngx-toastr';
import { log } from 'console';

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

  public lstIndex = [] //Cuentas totalizadores de Fideicomiso

  constructor(private apiService: ApiService,
    private _snackBar: MatSnackBar,
    private ngxService: NgxUiLoaderService,
    private toasService: ToastrService,
    private util: UtilService,
    public formatter: NgbDateParserFormatter) { }

  ngOnInit(): void {
    this.consultarUltimoCierre()
  }

  consultarUltimoCierre() {
    this.ngxService.stopLoader('load-precierre')
    this.xAPI.funcion = "FID_CUltimoCierre"
    this.xAPI.parametros = ''
    this.xAPI.valores = ''
    // console.log('hola')
    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {

        let ultc = data.Cuerpo
        if (ultc.length > 0) {
          let fecha = ultc[0].fecha_cierre;
          let d = fecha.split('-');
          this.fechaultimo = d[2] + '/' + d[1] + '/' + d[0];
          this.fechaUltimoComparacion = d[1] + '/' + d[2] + '/' + d[0];
        }
        this.ngxService.stopLoader('load-precierre')

      },
      (error) => {
        console.log(error)
      }
    )
  }


  ConsultarComprobante() {
    if (this.fechai == undefined) {
      this.toasService.warning("Debe seleccionar una fecha ", "Fideicomiso")
      return
    }

    const fechaInicio = new Date(this.fechai)
    const fechaUltimo = new Date(this.fechaUltimoComparacion)

    const fechaUltimoMasUnDia = new Date(fechaUltimo)
    fechaUltimoMasUnDia.setDate(fechaUltimo.getDate() + 1)
    
    if (fechaInicio > fechaUltimoMasUnDia) {
      this.toasService.warning("La fecha del último cierre es menor a la fecha seleccionada", "Fideicomiso");
      this.fechai = new Date(fechaUltimoMasUnDia)
      console.log(this.fechai);
    }

    let antes = new Date(this.fechai).setHours(-23)
    let despues = new Date(this.fechai).setHours(23)

    let sHoy = new Date(this.fechai).toISOString().substring(0, 10)
    let sAntes = new Date(antes).toISOString().substring(0, 10)
    let sDesspues = new Date(despues).toISOString().substring(0, 10)

    this.fecha = `${sHoy},${sAntes}`
    let fini = this.util.ConvertirFechaHumana(this.fechai)
    this.fechaTexto = fini
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

  validarCombo() {
    let fini = this.util.ConvertirFechaHumana(this.fechai)
    // console.log(fini)
  }

  consultarBalance() {

    this.xAPI.funcion = "FID_CBalanceFecha"
    this.xAPI.parametros = `${this.fecha},${this.estatus}`
    // this.xAPI.parametros = '2024-01-02,2024-01-03,2024-01-01,%'
    this.xAPI.valores = "";
    console.log(this.xAPI)
    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {
        this.printv = true
        if (data.Cuerpo.length == 0) {
          this.toasService.warning("No se encontraron datos para la fecha ", "Fideicomiso")
          return
        }
        console.log(data.Cuerpo)
        this.lstBalance = data.Cuerpo;
        this.HTMLBalance = `
          <table class="asientos" >
          <thead background-color: #e1e1d154; height: 35px;>
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


        this.lstIndex[this.posicion].debe = this.acumuladord;
        this.lstIndex[this.posicion].haber = this.acumuladorh;
        console.log(this.lstIndex)
        console.log(this.lstIndex[4].haber, this.lstIndex[3].debe);
        let result = this.lstIndex[4].haber - this.lstIndex[3].debe;

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
        // this.ngxService.stopLoader('load-precierre')
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getDetalle(e) {
    let debe = e.debe == null ? 0 : e.debe;
    let haber = e.haber == null ? 0 : e.haber;
    let saldo_inicial = e.saldo_inicial == null ? 0 : e.saldo_inicial;
    let saldo_actual = e.saldo_actual == null ? 0 : e.saldo_actual;
    console.log(e.codigo_padre, this.lstIndex[this.posicion], this.posicion)
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
          <th >${this.lstIndex[this.posicion].nombre} </th>
          <th class="text-right">${this.getMoneda(this.acum_saldo_actual) == "0"
          ? "-$$"
          : this.getMoneda(this.acum_saldo_actual)
        }</th>
        </tr>
        <tr>  
          <td  colspan="5">${this.getTitulosACuentasBalance(e)} </td>
        </tr>`
        // console.log('imprimiendo valores ', this.acum_saldo_actual, this.calcularacero )
        // if (this.acum_saldo_actual != 0) this.calcularacero = 1
        
     

      this.cambio = true;
      this.acumuladord = parseFloat(debe);
      this.acumuladorh = parseFloat(haber);
      this.acum_saldo_inicial = parseFloat(saldo_inicial);
      this.acum_saldo_actual = parseFloat(saldo_actual);
      this.posicion++;
    }
  }

  getDetalleResultados(e, tiempo) {

    // console.log(e.codigo_padre, this.tiempo)
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
      this.lstIndex[this.posicion].debe = this.acumuladord
      this.lstIndex[this.posicion].haber = this.acumuladorh
      let cadena = `
        <tr style="border: 0px; border-bottom: 1px solid #ccc; background-color: #e1e1d154; height: 35px;">  
          <th >${this.lstIndex[this.posicion].nombre} </th>
          <th class="text-right">${this.getMoneda(this.acum_saldo_actual) == "0"
          ? "-"
          : this.getMoneda(this.acum_saldo_actual)
        }</th>
        </tr>
       
      `;
      // console.log('imprimiendo valores ', this.acum_saldo_actual, this.calcularacero )
      if (this.acum_saldo_actual == 0) this.calcularacero = 1
      
      if (this.tiempo == 0) {
        this.HTMLBalance += cadena
        this.HTMLResultados += `
        <tr>  
          <td  colspan="5">${this.getTitulosACuentasBalance(e)} </td>
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
    // console.log(e)
    let saldo_actual = e.saldo_actual == null ? 0 : e.saldo_actual;
    let titulo = "";
    if (e.totalizadora == "0" || e.totalizadora == "3") {
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
      titulo = `
      <tr>  
        <td colspan="5" style="background-color: #eeeee4;">${e.codigo_padre + ". " + e.descripcion.toUpperCase()
        }</td>
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
          <th >${this.lstIndex[this.posicion].nombre} </th>
          <th class="text-right">${this.getMoneda(this.acum_saldo_actual) == "0"
          ? "-"
          : this.getMoneda(this.acum_saldo_actual)
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

  PrintPage() {

  }

}

