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


  ValidarPreCierre() {
    this.xAPI.funcion = 'FID_CFechaMaxPreCierre'
    this.xAPI.parametros = ''
    this.xAPI.valores = ''
    this.ngxService.startLoader('load-precierre')

    this.apiService.Ejecutar(this.xAPI).subscribe(
      data => {
        if (data.Cuerpo != undefined ){
          
          let fentrada = data.Cuerpo[0].fecha
          let finicio = this.util.ConvertirFechaDB(this.fechai)

          let fentradaDate = new Date(fentrada).toISOString(); // Convertir fentrada a formato UTC
          let finicioDate = new Date(finicio).toISOString();   // Convertir finicio a formato UTC

          if (fentradaDate >= finicioDate){
            let fechaultimoDate = new Date(this.util.ConvertirFechaDB(this.fechaultimo)).toISOString();

            if (fechaultimoDate < finicioDate) {
              this.CrearSaldos()
            } else {
              this.apiService.Mensaje(
                "Pendiente",
                "Ya ha cerrado el dia " + this.util.ConvertirFechaHumana(this.fechai),
                "error",
                "Cierre"
              )
              this.consultarUltimoCierre()
            }

            // this.CrearSaldos()
            console.log("AQUI");
            
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

  CrearSaldos(llave = 'M'){
    let d = this.fechaultimo.split('/')
    let fultimo =  d[2] + '-' + d[1] + '-' + d[0];
    let dt = new Date(this.fechai).toISOString()

    d =  dt.split('T')
    let fopera =  d[0]
    if (llave == 'S') {
      fopera = fultimo
      let f = new Date(fultimo);
      f.setDate(f.getDate());
      f.setHours(0, 0, 0, 0);
      fultimo = f.toISOString().split('T')[0]
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


  CrearSemestral(llave){


    this.ngxService.startLoader('load-precierre')
    this.xAPI.funcion = "FID_DCierreSemestral"
    this.xAPI.parametros = `2024-12-31`
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
