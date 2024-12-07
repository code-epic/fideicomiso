import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { FID_IComprobante } from 'src/app/services/banfanb/comprobante.service';
import { UtilService } from 'src/app/services/util/util.service';

@Component({
  selector: 'app-procesooperaciones',
  templateUrl: './procesooperaciones.component.html',
  styleUrls: ['./procesooperaciones.component.scss']
})
export class ProcesooperacionesComponent implements OnInit {

  public fechau: any
  public fechaultimo = ''
  public fechai: any
  public fechaf: any

  public lstAsientos = []
  public lstComisiones = []
  public bcuentat = false
  public dias: number = 0
  public acum_debe = 0
  public acum_haber = 0

  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
  }

  events: string[] = [];
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

  constructor(private apiService: ApiService,
    private _snackBar: MatSnackBar,
    private ngxService: NgxUiLoaderService,
    private util: UtilService,
    public formatter: NgbDateParserFormatter) { }

  ngOnInit(): void {
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

  consultarComisiones() {

    let dia = parseInt(this.dias.toString())
    this.ngxService.stopLoader('load-precierre')
    this.xAPI.funcion = "FID_CalcularComision"
    this.xAPI.parametros = dia + ',360'
    this.xAPI.valores = ''
    this.visible = false
    this.acum_debe = 0
    this.acum_haber = 0

    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {
        this.lstComisiones = data.Cuerpo
        this.lstComisiones.map(e => {
          this.acum_debe += parseFloat(e.calculo_capital)
          this.acum_haber += parseFloat(e.calculo_capital)
        })
        if (this.lstComisiones.length > 0) this.visible = true
        this.ngxService.stopLoader('load-precierre')
      },
      (error) => {
        console.log(error)
      }
    )
  }

  CalcularDias(type: string) {
    this.dias = this.util.CalcuarDiasTranscurridos(this.fechai, this.fechaf) + 1
  }


  // CalcularDevengo(){
  //   if (this.fechai == undefined || this.fechaf == undefined) {
  //     this._snackBar.open('Recuerde seleccionar un rango de fechas', 'OK')
  //     return
  //   }
  //   let fini = this.util.ConvertirFechaDB(this.fechai)
  //   let ffin = this.util.ConvertirFechaDB(this.fechaf)
  //   let fope = new Date().toISOString().substring(0,10)
  //   let usuario = ''
  //   let llave = ''

  //   this.ngxService.startLoader('load-cont')
  //   this.xAPI.funcion = "FID_BashIntereses"
  //   this.xAPI.parametros = fope + ',' + fini + ',' + ffin + ',' + usuario + ',' + llave
  //   this.xAPI.valores = ''
  // }


  getMoneda(numero: number): string {
    return this.util.ConvertirMoneda(numero);
  }

  getCodigo(id): string {
    return "CON-" + this.util.zfill(id, 4)
  }





  GenerarComprobante() {


    let fecha = this.util.ConvertirFechaDB(this.fechai)

    this.Comprobante = {
      plan: 1,
      codigo: this.util.GenerarUnicId(),
      descripcion: `COMISIONES ADMINISTRATIVAS ${this.util.ConvertirFechaHumana(fecha)}`,
      detalle: `COMISIONES ADMINISTRATIVAS ${this.util.ConvertirFechaHumana(fecha)}`,
      fecha_operacion: this.util.ConvertirFechaDB(this.fechai),
      fecha_ejercicio: this.util.ConvertirFechaDB(this.fechai),
      debe: this.acum_debe,
      haber: this.acum_haber,
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
        this.InsertData(data, this.lstComisiones.length)
      },
      (error) => {
        console.log(error)
        this.ngxService.stopLoader('load-cont')
      }
    )

  }

  InsertData(dt, cant: number) {
    let fecha = this.util.ConvertirFechaDB(this.fechai)
    cant++
    this.xAPI.funcion = "FID_IComisionesAdministrativas"
    this.xAPI.parametros = dt.msj + ',360,1,' + fecha
    this.xAPI.valores = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      data => {
        console.log(data)
        // this.InsertData(dt, cant)
      },
      (error) => {
        console.log(error)
        this.ngxService.stopLoader('load-cont')
      }
    )
  }



}
