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
  selector: 'app-ccierre',
  templateUrl: './ccierre.component.html',
  styleUrls: ['./ccierre.component.scss']
})
export class CcierreComponent implements OnInit {


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
  public dias: number = 0
  public acum_debe = 0
  public acum_haber = 0

  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
  }


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


  public IDComprobante: FID_IDetalleComprobante = {
    comprobante: 0,
    cuenta: 0,
    debe: 0,
    haber: 0,
    fecha_operacion: "",
    fecha_ejercicio: "",
  };


  lstData = []
  public semestral: boolean = false
  
  events: string[] = [];
  blista : boolean = false
  bauxiliar : boolean = false
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
          let fechaCierre = new Date(`${d[0]}-${d[1]}-${d[2]}`);
          fechaCierre.setDate(fechaCierre.getDate() + 2);
          fechaCierre.setHours(0, 0, 0, 0);
          this.fechai = fechaCierre;   
          this.fechaf = fechaCierre;
          this.dias = 1
        }

        //console.log(this.fechaultimo)
        if ( this.fechaultimo == "30/06/2024" || this.fechaultimo == "31/12/2024"  ) {
          this.semestral = true
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


  ValidarPreCierre(llave ) {
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
            this.CrearSaldos(llave)
          }else{
            this.apiService.Mensaje(
              "Pendiente",
              "Tiene pendiente el Precierre para el dia: " + this.util.ConvertirFechaHumana(this.fechai),
              "error",
              "Cierre"
            )
            this.consultarUltimoCierre()
            this.ngxService.stopLoader('load-precierre')
          }
        }
      },
      err => {

      }
    )
  }

  CrearSaldos(llave){
    let d = this.fechaultimo.split('/')
    let fultimo =  d[2] + '-' + d[1] + '-' + d[0];
    let dt = new Date(this.fechai).toISOString()

    d =  dt.split('T')
    let fopera =  d[0]
    if (llave == 'S') {
      console.log(fultimo, fopera)
      fopera = fultimo
      let f = new Date(fultimo);
      f.setDate(f.getDate());
      f.setHours(0, 0, 0, 0);
      
      
      fultimo = f.toISOString().split('T')[0]
      console.log( fultimo )
    }
    let usuario = 'Administrador'
    let plan = '1'



    this.ngxService.startLoader('load-precierre')
    this.xAPI.funcion = "FID_ISaldosCierre"
    this.xAPI.parametros = `${fopera},${usuario},${llave},${plan},${fultimo}`
    this.xAPI.valores = ''
    console.log(this.xAPI)
    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {

        this.apiService.Mensaje(
          "Proceso exitoso",
          "Se ha realizado el cierre para el dia: " + this.util.ConvertirFechaHumana(this.fechai),
          "success",
          "Cierres"
        )
        this.consultarUltimoCierre()
        this.ngxService.stopLoader('load-precierre')

      },
      (error) => {
        console.log(error)
      }
    )

    
  }

  // //Recorrer cada plan y realizar cierres individuales **pendientes
  // registrarComprobante(fecha ){
  //   this.Comprobante.descripcion = 'CIERRE SEMESTRAL ASIENTO ' + fecha
  //   this.Comprobante.detalle = 'CIERRE SEMESTRAL ASIENTO ' + fecha
  //   this.Comprobante.plan = 1
  //   this.Comprobante.fecha_ejercicio = this.util.FechaActual()
  //   this.Comprobante.fecha_operacion = fecha
  //   this.Comprobante.debe = 0.00
  //   this.Comprobante.haber = 0.00

  // }


  // consultarValoresSemestrales(){
  //   let fecha = '2024-06-30'
  //   this.xAPI.funcion = 'FID_CMovimientosSemestrales'
  //   this.xAPI.parametros = fecha
  //   this.xAPI.valores = ''

  //   this.registrarComprobante(fecha)

  //   this.apiService.Ejecutar(this.xAPI).subscribe(
  //     data => {
  //       console.log(data.Cuerpo)
  //       let debe = 0
  //       let haber = 0
  //       data.Cuerpo.forEach(e => {
  //         debe += e.disminuye=="DEBE"? parseFloat(e.saldo) :0
  //         haber += e.disminuye=="HABER"? parseFloat(e.saldo) :0
  //         let dc = {
  //           'comprobante' : 0,
  //           'cuenta' :  e.id_cuenta,
  //           'debe' : e.disminuye=="DEBE"? parseFloat(e.saldo) :0,
  //           'haber' : e.disminuye=="HABER"? parseFloat(e.saldo) :0,
  //           'fecha_ejercicio' : this.util.FechaActual(),
  //           'fecha_operacion' : fecha
  //         }
  //         this.lstData.push(dc)
  //       });

  //       let saldo = debe - haber
  //       let dcx = {
  //         'comprobante' : 0,
  //         'cuenta' :  '40',
  //         'debe' : 0,
  //         'haber' : saldo,
  //         'fecha_ejercicio' : this.util.FechaActual(),
  //         'fecha_operacion' : fecha
  //       }
  //       this.lstData.push(dcx)
  //       this.Comprobante.debe = debe
  //       this.Comprobante.haber = debe
  //       Swal.fire({
  //         title: 'Esta seguro que desea realizar la operación de cierre semestral',
  //         icon: "question",
  //         showCancelButton: true,
  //         confirmButtonColor: '#3085d6',
  //         cancelButtonColor: '#d33',
  //         confirmButtonText: 'Si',
  //         cancelButtonText: 'No',
  //         allowEscapeKey: true,
  //       }).then((result) => {
  //         if (result.isConfirmed) {
  //           this.Acepar()
  //         }
  //       })

  //     },
  //     error => {

  //     }
  //   )
    

  // }

  // Acepar(){
    
   
  //   this.ngxService.startLoader("load-cont");
  //   this.xAPI.funcion = "FID_IComprobante";
  //   this.xAPI.parametros = "";
  //   this.xAPI.valores = JSON.stringify(this.Comprobante);
  //   this.apiService.Ejecutar(this.xAPI).subscribe(
  //     async (data) => {
  //       console.log(data);
  //       await this.GuardarDetalle(data.msj);
  //       this.ngxService.stopLoader("load-cont");
  //       this.lstData = [];
  //     },
  //     (err) => {}
  //   );
  // }

  // async GuardarDetalle(comprobante: number) {
  //   this.IDComprobante.comprobante = comprobante;
  //   await this.lstData.map(async (e) => {
  //     this.IDComprobante.debe = e.debe
  //     this.IDComprobante.haber = e.haber
  //     this.IDComprobante.fecha_ejercicio = e.fecha_ejercicio
  //     this.IDComprobante.fecha_operacion = e.fecha_operacion
  //     this.IDComprobante.cuenta = e.cuenta

  //     this.xAPI.funcion = "FID_IDetalleComprobante";
  //     this.xAPI.parametros = "";

  //     this.xAPI.valores = JSON.stringify(this.IDComprobante);

  //     await this.apiService.Ejecutar(this.xAPI).subscribe(
  //       (data) => {
  //         console.log("detalle insertado ", data);
  //       },
  //       (err) => {}
  //     );
  //   });
  // }


  CrearSemestral(llave){


    this.ngxService.startLoader('load-precierre')
    this.xAPI.funcion = "FID_DCierreSemestral"
    this.xAPI.parametros = `2024-06-30`
    this.xAPI.valores = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {

        this.CrearSaldos(llave)
        this.ngxService.stopLoader('load-precierre')

      },
      (error) => {
        console.log(error)
      }
    )
  }


}
