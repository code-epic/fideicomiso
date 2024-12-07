import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { NgbDate, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { FID_IComprobante } from 'src/app/services/banfanb/comprobante.service';
import { LPosicionInversiones } from 'src/app/services/banfanb/contabilidad.service';
import { UtilService } from 'src/app/services/util/util.service';

@Component({
  selector: 'app-procesos',
  templateUrl: './procesos.component.html',
  styleUrls: ['./procesos.component.scss']
})
export class ProcesosComponent implements OnInit {


  public fechau: any
  public fechaultimo = ''
  public fechai: any
  public fechaf: any
  public fecha_al: string = ''

  public lstAsientos = []
  public lstVencimiento = []
  public bcuentat = false
  public dias: number = 0
  public acum_debe = 0
  public acum_haber = 0
  public acum_debev = 0
  public acum_haberv = 0

  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
  }

  events: string[] = []

  public Comprobante: FID_IComprobante = {
    plan: 0,
    codigo: "",
    descripcion: "",
    detalle: "",
    fecha_operacion: "",
    fecha_ejercicio: "",
    debe: 0,
    haber: 0,
    llave: ''
  };

  visible: boolean = false

  // public lstData = []

  constructor(private apiService: ApiService,
    private _snackBar: MatSnackBar,
    private ngxService: NgxUiLoaderService,
    private util: UtilService,
    public formatter: NgbDateParserFormatter,) { }

  ngOnInit(): void {
    // let d = new Date().toISOString().substring(0,10).split('-')
    // this.fechaultimo = d[2] + '/' + d[1] + '/' + d[0]
    this.consultarUltimoCierre()

  }

  consultarUltimoCierre() {
    this.ngxService.stopLoader('load-precierre')
    this.xAPI.funcion = "FID_CUltimoPreCierre"
    this.xAPI.parametros = ''
    this.xAPI.valores = ''
    // console.log('hola')
    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {

        let ultc = data.Cuerpo
        if (ultc.length > 0) {
          let fecha = ultc[0].fecha_cierre;
          let d = fecha.split('-');
          this.fechau = fecha
          this.fechaultimo = d[2] + '/' + d[1] + '/' + d[0];
          let fechaCierre = new Date(`${d[0]}-${d[1]}-${d[2]}`);
          fechaCierre.setDate(fechaCierre.getDate() + 2);
          fechaCierre.setHours(0, 0, 0, 0);
          this.fechai = fechaCierre;
          this.fechaf = fechaCierre;
          this.dias = 1
        }
        this.ngxService.stopLoader('load-precierre')
      },
      (error) => {
        console.log(error)
      }
    )
  }



  // consultarUltimoCierre() {
  //   this.ngxService.stopLoader('load-precierre')
  //   this.xAPI.funcion = "FID_CUltimoCierre"
  //   this.xAPI.parametros = ''
  //   this.xAPI.valores = ''
  //   // console.log('hola')
  //   this.apiService.Ejecutar(this.xAPI).subscribe(
  //     async data => {

  //       let ultc = data.Cuerpo
  //       if (ultc.length > 0) {
  //         let fecha = ultc[0].fecha_cierre;
  //         let d = fecha.split('-');
  //         this.fechaultimo = d[2] + '/' + d[1] + '/' + d[0];
  //         let fechaCierre = new Date(`${d[0]}-${d[1]}-${d[2]}`);
  //         fechaCierre.setDate(fechaCierre.getDate() + 2);
  //         fechaCierre.setHours(0, 0, 0, 0);
  //         this.fechai = fechaCierre;   
  //         this.fechaf = fechaCierre;
  //         this.dias = 1
  //       }

  //       //console.log(this.fechaultimo)
  //       // if ( this.fechaultimo == "30/06/2024" || this.fechaultimo == "31/12/2024"  ) {
  //       //   this.semestral = true
  //       // }
  //       this.ngxService.stopLoader('load-precierre')

  //     },
  //     (error) => {
  //       console.log(error)
  //     }
  //   )
  // }


  CalcularDias(type: string, event: MatDatepickerInputEvent<Date>) {
    this.dias = this.util.CalcuarDiasTranscurridos(this.fechai, this.fechaf) + 1
  }

  CalcularDiasInterese(fechai, fechaf): number {
    let calculo = this.util.CalcuarDiasTranscurridos(fechai, fechaf) + 1

    return calculo
  }


  CalculoPosicion() {

    if (this.fechai == undefined || this.fechaf == undefined) {
      this._snackBar.open('Recuerde seleccionar un rango de fechas', 'OK')
      return
    }
    let fini = this.util.ConvertirFechaDB(this.fechai)
    let usuario = ''
    let llave = ''

    this.ngxService.startLoader('load-cont')
    this.xAPI.funcion = "FID_BashIPosicion"
    this.xAPI.parametros = fini + ',I,' + usuario + ',' + llave
    this.xAPI.valores = ''

    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {
        this.CalcularInversion()
      },
      (error) => {
        console.log(error)
        this.ngxService.stopLoader('load-cont')
      }
    )
  }

  CalcularInversion() {
    if (this.fechai == undefined || this.fechaf == undefined) {
      this._snackBar.open('Recuerde seleccionar un rango de fechas', 'OK')
      return
    }
    let fini = this.util.ConvertirFechaDB(this.fechai)
    let ffin = this.util.ConvertirFechaDB(this.fechaf)
    let fope = new Date().toISOString().substring(0, 10)
    let usuario = ''
    let llave = ''

    this.ngxService.startLoader('load-cont')
    this.xAPI.funcion = "FID_BashIntereses"
    this.xAPI.parametros = fope + ',' + fini + ',' + ffin + ',' + usuario + ',' + llave
    this.xAPI.valores = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {
        // console.log(data)
        // this.fechai = ''
        // this.fechaf = ''
        // this.ngxService.stopLoader('load-cont')
        // this.apiService.Mensaje('Proceso exitoso', 'Felicitaciones', 'success', 'inversion')
        this.ListarInversiones()

      },
      (error) => {
        console.log(error)
        this.ngxService.stopLoader('load-cont')
      }
    )
  }


  ListarInversiones() {


    if (this.fechai == undefined || this.fechaf == undefined) {
      this._snackBar.open('Recuerde seleccionar un rango de fechas', 'OK')
      return
    }
    let fini = this.util.ConvertirFechaDB(this.fechai)
    let ffin = this.util.ConvertirFechaDB(this.fechaf)

    this.fecha_al = fini
    this.ngxService.startLoader('load-cont')
    this.xAPI.funcion = "FID_CPosicionInversiones"
    this.xAPI.parametros = fini + ',' + ffin
    this.xAPI.valores = ''
    this.lstAsientos = []
    this.acum_debe = 0
    this.acum_haber = 0
    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {

        this.lstAsientos = data.Cuerpo
        data.Cuerpo.forEach(e => {
          this.acum_debe += parseFloat(e.interes_acumulado)
          this.acum_haber += parseFloat(e.interes_acumulado)
        });


        if (this.lstAsientos.length > 0) {
          this.visible = true
        }

        this.ListarVencimiento()

      },
      (error) => {
        console.log(error)
        this.ngxService.stopLoader('load-cont')
      }
    )

  }


  ListarVencimiento() {

    this.lstVencimiento = []
    let fini = this.util.ConvertirFechaDB(this.fechai)
    let ffin = this.util.ConvertirFechaDB(this.fechaf)

    this.fecha_al = fini
    this.xAPI.funcion = "FID_CVencimientoInversiones"
    this.xAPI.parametros = fini + ',' + ffin
    this.xAPI.valores = ''
    console.log(this.xAPI)
    this.acum_debev = 0
    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {
        this.lstVencimiento = data.Cuerpo

        if (this.lstVencimiento.length > 0) {
          this.visible = true
        }

        this.lstVencimiento.map(e => {
          this.acum_debev += this.RendicionCupon(e)
        })

        await this.ngxService.stopLoader('load-cont')

      },
      (error) => {
        console.log(error)
        this.ngxService.stopLoader('load-cont')
      }
    )

  }

  RendicionCupon(inv): number {
    let rendicion =
      (inv.valor_nominal * inv.tasa_cupon * (inv.plazo_cupon / 100)) /
      inv.base_calculo;
    return parseFloat(rendicion.toFixed(2));
  }



  // ConsultarAsientos(){

  //   if (this.fechai == undefined || this.fechaf == undefined) {
  //     this._snackBar.open('Recuerde seleccionar un rango de fechas', 'OK')
  //     return
  //   }
  //   let fini = this.util.ConvertirFechaDB(this.fechai)
  //   let ffin = this.util.ConvertirFechaDB(this.fechaf)

  //   this.ngxService.startLoader('load-cont')
  //   this.xAPI.funcion = "FID_CTotalizadorCuentas"
  //   this.xAPI.parametros = fini + ',' + ffin
  //   this.xAPI.valores = ''
  //   this.acum_debe = 0
  //   this.acum_haber = 0
  //   this.apiService.Ejecutar(this.xAPI).subscribe(
  //     async data => {
  //       console.log(data)

  //       await this.ngxService.stopLoader('load-cont')
  //       // this.apiService.Mensaje('Proceso exitoso', 'Felicitaciones', 'success', 'inversion')


  //     },
  //     (error) => {
  //       console.log(error)
  //       this.ngxService.stopLoader('load-cont')
  //     }
  //   )
  // }

  getCuenta(e) {
    return e.codigo_padre + '.' + e.parte + '.' + e.moneda + '.' + e.nivel_1 + '.' + e.nivel_2 + '.' + e.nivel_3 + '.' + e.nivel_4 + '.' + e.nivel_5
  }

  GenerarComprobante() {


    let fecha = this.util.ConvertirFechaDB(this.fechai)

    this.Comprobante = {
      plan: 1,
      codigo: this.util.GenerarUnicId(),
      descripcion: `DEVENGO DE INVERSIONES ${this.util.ConvertirFechaHumana(fecha)}`,
      detalle: `DEVENGO DE INVERSIONES ${this.util.ConvertirFechaHumana(fecha)}`,
      fecha_operacion: this.util.ConvertirFechaDB(this.fechai),
      fecha_ejercicio: this.util.ConvertirFechaDB(this.fechai),
      debe: this.acum_debe,
      haber: this.acum_haber,
      llave: 'M'
    }

    this.xAPI.funcion = "FID_IComprobante"
    this.xAPI.parametros = ''
    this.xAPI.valores = JSON.stringify(this.Comprobante)
    this.ngxService.startLoader('load-cont')
    console.log(this.Comprobante)
    // this.InsertData(cant)

    this.apiService.Ejecutar(this.xAPI).subscribe(
      data => {
        console.log(data)
        this.InsertData(data, this.lstAsientos.length)
      },
      (error) => {
        console.log(error)
        this.ngxService.stopLoader('load-cont')
      }
    )

  }

  InsertData(dt, cant: number) {
    cant++
    this.xAPI.funcion = "FID_IDevengoInversiones"
    this.xAPI.parametros = dt.msj + ',' + this.util.ConvertirFechaDB(this.fechai)
    this.xAPI.valores = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      data => {
        console.log(data)
        // this.InsertData(dt, cant)
        // if (this.lstVencimiento.length > 0) {
        //   this.GenerarComprobanteVencimiento()
        // }else{
        this.ngxService.stopLoader('load-cont')
        this.lstAsientos = []
        this.lstVencimiento = []
        this.visible = false
        // }

      },
      (error) => {
        console.log(error)
        this.ngxService.stopLoader('load-cont')
      }
    )
  }




  GenerarComprobanteVencimiento() {


    let fecha = this.util.ConvertirFechaDB(this.fechai)

    this.Comprobante = {
      plan: 1,
      codigo: this.util.GenerarUnicId(),
      descripcion: `VENCIMIENTO DE INVERSIONES ${this.util.ConvertirFechaHumana(fecha)}`,
      detalle: `VENCIMIENTO DE INVERSIONES ${this.util.ConvertirFechaHumana(fecha)}`,
      fecha_operacion: this.util.ConvertirFechaDB(this.fechai),
      fecha_ejercicio: this.util.ConvertirFechaDB(this.fechai),
      debe: this.acum_debev,
      haber: this.acum_debev,
      llave: 'M'
    }

    this.xAPI.funcion = "FID_IComprobante"
    this.xAPI.parametros = ''
    this.xAPI.valores = JSON.stringify(this.Comprobante)

    console.log(this.Comprobante)
    // this.InsertData(cant)

    this.apiService.Ejecutar(this.xAPI).subscribe(
      data => {
        console.log(data)
        this.InsertDataVencimiento(data, this.lstVencimiento.length)
      },
      (error) => {
        console.log(error)
        this.ngxService.stopLoader('load-cont')
      }
    )

  }

  InsertDataVencimiento(dt, cant: number) {
    cant++
    this.xAPI.funcion = "FID_IVencimientoInversiones"
    this.xAPI.parametros = dt.msj + ',' + this.util.ConvertirFechaDB(this.fechai)
    this.xAPI.valores = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      data => {
        console.log(data)
        // this.InsertData(dt, cant)
        this.lstAsientos = []
        this.lstVencimiento = []
        this.visible = false
      },
      (error) => {
        console.log(error)
        this.ngxService.stopLoader('load-cont')
      }
    )
  }






  getMoneda(numero: number): string {
    let valor = this.util.ConvertirMoneda(numero)
    let result = valor.toString()
    let cant = result.split(',')

    if (cant.length == 1)
      result = result + ',00'

    return result
  }

  InteresDiarioCupon(inv: any, dias: number): number {

    let rendicion =
      ((inv.valor_nominal * inv.tasa_cupon * (1 / 100)) / inv.base_calculo) * dias


    return parseFloat(rendicion.toFixed(2));
  }

}
