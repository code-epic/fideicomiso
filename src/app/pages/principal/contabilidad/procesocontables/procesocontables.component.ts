import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { NgbDate, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { FID_IComprobante, FID_IDetalleComprobante } from 'src/app/services/banfanb/comprobante.service';
import { LPosicionInversiones } from 'src/app/services/banfanb/contabilidad.service';
import { UtilService } from 'src/app/services/util/util.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-procesocontables',
  templateUrl: './procesocontables.component.html',
  styleUrls: ['./procesocontables.component.scss']
})
export class ProcesocontablesComponent implements OnInit {

  public ELEMENT_DATA: LPosicionInversiones[] = [];
  displayedColumns: string[] = [
    "codigo",
    "instrumento",
    "valor_nominal",
    "costo_adquisicion",
    "interes_diario",
    "interes_acumulado",
  ];
  dataSource: any;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  public fechau: any
  public fechaultimo = ''
  public fechai: any
  public fechaf: any

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

  public Comprobante: FID_IComprobante = {
    plan: 0,
    codigo: "",
    descripcion: "",
    detalle: "",
    fecha_operacion: "",
    fecha_ejercicio: "",
    debe: 0,
    haber: 0,
    llave: ""
  };


  public IDComprobante: FID_IDetalleComprobante = {
    comprobante: 0,
    cuenta: 0,
    debe: 0,
    haber: 0,
    fecha_operacion: "",
    fecha_ejercicio: "",
  };


  lstData = []
  public total_debe : number = 0
  public total_haber : number = 0

  constructor(private apiService: ApiService,
    private _snackBar: MatSnackBar,
    private ngxService: NgxUiLoaderService,
    private util: UtilService,
    public formatter: NgbDateParserFormatter,) { }

  ngOnInit(): void {
    this.semestral = false
    this.estatus = 'M'
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


        if ( this.fechaultimo == "30/06/2024" || this.fechaultimo == "31/12/2024"  ) {
          this.semestral = true
          this.estatus = 'S'
        }

        this.ngxService.stopLoader('load-precierre')

      },
      (error) => {
        console.log(error)
      }
    )
  }

  CalcularDias(type: string, event: MatDatepickerInputEvent<Date>) {
    this.dias = this.util.CalcuarDiasTranscurridos(this.fechai, this.fechaf) + 1
  }







  ConsultarComprobante() {

    if (this.fechai == undefined || this.fechaf == undefined) {
      this._snackBar.open('Recuerde seleccionar un rango de fechas', 'OK')
      return
    }

    this.total_debe = 0
    this.total_haber = 0

    let fini = this.util.ConvertirFechaDB(this.fechai)
    let ffin = this.util.ConvertirFechaDB(this.fechaf)
    this.ELEMENT_DATA = []
    this.ngxService.startLoader('load-cont')
    this.xAPI.funcion = "FID_CMovimientosComprobante"
    // this.xAPI.parametros = fini + ',' + ffin + ',' + this.estatus
    this.xAPI.valores = ''
    if(this.estatus == "S") fini = this.fechau
    this.xAPI.parametros = fini + ',' + this.estatus

    //console.log(this.xAPI)
    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {
        // console.log(data)
        
        this.lstMovimientos = data.Cuerpo
        this.lstMovimientos.map(e => {
          //console.log(e)
          this.total_debe += parseFloat(e.debe)
          this.total_haber += parseFloat(e.haber)
        })
        this.blista = true

        await this.ngxService.stopLoader('load-cont')
      },
      (error) => {
        console.log(error)
        this.ngxService.stopLoader('load-cont')
      }
    )
  }




  GenerarPrecierre() {

    if (this.fechai == undefined || this.fechaf == undefined) {
      this._snackBar.open('Recuerde seleccionar un rango de fechas', 'OK')
      return
    }
    let fini = this.util.ConvertirFechaDB(this.fechai)

    this.ngxService.stopLoader('load-precierre')
    this.xAPI.funcion = "FID_IMovimientosComprobantes"
    if(this.estatus == "S") fini = this.fechau
    this.xAPI.parametros = fini + ',' + this.estatus
    this.xAPI.valores = ''
    console.log(this.xAPI)
    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {
        this.apiService.Mensaje(
          "Proceso exitoso",
          "Se ha realizado el Precierre",
          "success",
          "Cierre"
        )
        this.ngxService.stopLoader('load-precierre')
        this.lstMovimientos = []
        this.blista = false
      },
      (error) => {
        console.log(error)
      }
    )



  }



  // ConsultarMovimientosAuxiliares() {
  //   if (this.fechai == undefined || this.fechaf == undefined) {
  //     this._snackBar.open('Recuerde seleccionar un rango de fechas', 'OK')
  //     return
  //   }
  //   let fini = this.util.ConvertirFechaDB(this.fechai)
  //   let ffin = this.util.ConvertirFechaDB(this.fechaf)
  //   this.ELEMENT_DATA = []
  //   this.ngxService.startLoader('load-cont')
  //   this.xAPI.funcion = "FID_CMovimientosAuxiliares"
  //   this.xAPI.parametros = fini + ',' + ffin
  //   this.xAPI.valores = ''

  //   this.apiService.Ejecutar(this.xAPI).subscribe(
  //     async data => {
  //       this.lstMovimientosAuxliares = data.Cuerpo

  //       this.blista = false
  //       this.bauxiliar = true
  //       await this.ngxService.stopLoader('load-cont')
  //     },
  //     (error) => {
  //       console.log(error)
  //       this.ngxService.stopLoader('load-cont')
  //     }
  //   )
  // }


  // GenerarCierre() {

  //   if (this.fechai == undefined || this.fechaf == undefined) {
  //     this._snackBar.open('Recuerde seleccionar un rango de fechas', 'OK')
  //     return
  //   }

  //   this.ngxService.stopLoader('load-precierre')
  //   this.xAPI.funcion = "FID_UPlanFideicomiso"
  //   this.xAPI.parametros = '1,' + this.util.ConvertirFechaDB(this.fechai)
  //   this.xAPI.valores = ''

  //   this.apiService.Ejecutar(this.xAPI).subscribe(
  //     async data => {
  //       this.xAPI.funcion = "FID_IMovimientosSaldos"
  //       this.xAPI.parametros = this.util.ConvertirFechaDB(this.fechai)
  //       this.xAPI.valores = ''

  //       this.apiService.Ejecutar(this.xAPI).subscribe(
  //         async data => {
  //           this.lstMovimientosAuxliares = []
  //           this.bauxiliar = false
  //           this.blista = false
  //           this.apiService.Mensaje(
  //             "Felicitaciones, Proceso exitoso",
  //             "Se ha realizado el cierre para el dia: " + this.util.ConvertirFechaDB(this.fechai),
  //             "success",
  //             "contratos"
  //           );
  //           this.ngxService.stopLoader('load-precierre')
  //         },
  //         (error) => {
  //           console.log(error)
  //         }
  //       )

  //     },
  //     (error) => {
  //       console.log(error)
  //     }
  //   )



  // }




  getMoneda(monto: number): string {
    return this.util.ConvertirMoneda( monto );
  }








  //Recorrer cada plan y realizar cierres individuales **pendientes
  registrarComprobante(fecha) {
    this.Comprobante.descripcion = 'CIERRE SEMESTRAL ASIENTO ' + fecha
    this.Comprobante.detalle = 'CIERRE SEMESTRAL ASIENTO ' + fecha
    this.Comprobante.plan = 1
    this.Comprobante.fecha_ejercicio = this.util.FechaActual()
    this.Comprobante.fecha_operacion = fecha
    this.Comprobante.debe = 0.00
    this.Comprobante.haber = 0.00
    this.Comprobante.llave = 'S'


  }


  consultarValoresSemestrales() {
    let fecha = '2024-12-31'
    this.xAPI.funcion = 'FID_CMovimientosSemestrales'
    this.xAPI.parametros = fecha
    this.xAPI.valores = ''

    this.registrarComprobante(fecha)

    this.apiService.Ejecutar(this.xAPI).subscribe(
      data => {
        console.log(data.Cuerpo)
        let debe = 0
        let haber = 0
        data.Cuerpo.forEach(e => {
          debe += e.disminuye == "DEBE" ? parseFloat(e.saldo) : 0
          haber += e.disminuye == "HABER" ? parseFloat(e.saldo) : 0
          let dc = {
            'comprobante': 0,
            'cuenta': e.id_cuenta,
            'debe': e.disminuye == "DEBE" ? parseFloat(e.saldo) : 0,
            'haber': e.disminuye == "HABER" ? parseFloat(e.saldo) : 0,
            'fecha_ejercicio': fecha,
            'fecha_operacion': this.util.FechaActual()
          }
          this.lstData.push(dc)
        });

        let saldo = debe - haber
        let dcx = {
          'comprobante': 0,
          'cuenta': '40',
          'debe': 0,
          'haber': saldo,
          'fecha_ejercicio': fecha,
          'fecha_operacion': this.util.FechaActual()
        }
        this.lstData.push(dcx)
        this.Comprobante.debe = debe
        this.Comprobante.haber = debe
        Swal.fire({
          title: 'Esta seguro que desea realizar la operación de cierre semestral',
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Si',
          cancelButtonText: 'No',
          allowEscapeKey: true,
        }).then((result) => {
          if (result.isConfirmed) {
            this.Acepar()
          }
        })

      },
      error => {

      }
    )


  }

  Acepar() {


    this.ngxService.startLoader("load-cont");
    this.xAPI.funcion = "FID_IComprobante";
    this.xAPI.parametros = "";
    // this.Comprobante.codigo = this.util.GenerarUnicId()
    
    this.xAPI.valores = JSON.stringify(this.Comprobante);
    //console.log(this.xAPI);
    this.apiService.Ejecutar(this.xAPI).subscribe(
      async (data) => {
        
        await this.GuardarDetalle(data.msj);
        this.ngxService.stopLoader("load-cont");
        this.lstData = [];
      },
      (err) => { }
    );
  }

  async GuardarDetalle(comprobante: number) {
    this.IDComprobante.comprobante = comprobante;
    await this.lstData.map(async (e) => {
      this.IDComprobante.debe = e.debe
      this.IDComprobante.haber = e.haber
      this.IDComprobante.fecha_ejercicio = e.fecha_ejercicio
      this.IDComprobante.fecha_operacion = e.fecha_operacion
      this.IDComprobante.cuenta = e.cuenta

      this.xAPI.funcion = "FID_IDetalleComprobante";
      this.xAPI.parametros = "";

      this.xAPI.valores = JSON.stringify(this.IDComprobante);

      await this.apiService.Ejecutar(this.xAPI).subscribe(
        (data) => {
          console.log("detalle insertado ", data);
        },
        (err) => { }
      );
    })
    this.ConsultarComprobante()
  }

  ValidarPreCierre( ) {
    this.xAPI.funcion = 'FID_CFechaMaxPreCierre'
    this.xAPI.parametros = ''
    this.xAPI.valores = ''
    this.ngxService.startLoader('load-precierre')

    this.apiService.Ejecutar(this.xAPI).subscribe(
      data => {
        if (data.Cuerpo != undefined ){
          
          let fentrada = data.Cuerpo[0].fecha
          let finicio = this.util.ConvertirFechaDB(this.fechai)

          if (fentrada == finicio){
            this.apiService.Mensaje(
              "Pendiente",
              "Ya fue procesado el Precierre: " + this.util.ConvertirFechaHumana(this.fechai),
              "error",
              "Cierre"
            )
           
            this.ngxService.stopLoader('load-precierre')
          }else{
            this.GenerarPrecierre()
          }
        }
      },
      err => {

      }
    )
  }



}
