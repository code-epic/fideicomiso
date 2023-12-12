import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { NgbDate, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { LPosicionInversiones } from 'src/app/services/banfanb/contabilidad.service';
import { UtilService } from 'src/app/services/util/util.service';

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
  public dias: number = 0
  public acum_debe = 0
  public acum_haber = 0

  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
  }

  events: string[] = [];
  blista : boolean = false
  bauxiliar : boolean = false

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
    this.xAPI.funcion = "FID_CUltimoCierre"
    this.xAPI.parametros = ''
    this.xAPI.valores = ''

    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {

        let ultc = data.Cuerpo
        if (ultc.length > 0) {
          let fecha = ultc[0].fecha_cierre
          let d = fecha.split('-')
          this.fechaultimo = d[2] + '/' + d[1] + '/' + d[0]
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
    let fini = this.util.ConvertirFechaDB(this.fechai)
    let ffin = this.util.ConvertirFechaDB(this.fechaf)
    this.ELEMENT_DATA = []
    this.ngxService.startLoader('load-cont')
    this.xAPI.funcion = "FID_CMovimientosComprobante"
    this.xAPI.parametros = fini + ',' + ffin
    this.xAPI.valores = ''

    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {
        console.log(data)
        this.lstMovimientos = data.Cuerpo

        this.blista = true

        await this.ngxService.stopLoader('load-cont')
      },
      (error) => {
        console.log(error)
        this.ngxService.stopLoader('load-cont')
      }
    )
  }




  GenerarPrecierre(){
    
    if (this.fechai == undefined || this.fechaf == undefined) {
      this._snackBar.open('Recuerde seleccionar un rango de fechas', 'OK')
      return
    }

    this.ngxService.stopLoader('load-precierre')
    this.xAPI.funcion = "FID_IMovimientosComprobantes"
    this.xAPI.parametros = this.util.ConvertirFechaDB(this.fechai)
    this.xAPI.valores = ''

    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {
          console.log(data)
          this.ngxService.stopLoader('load-precierre')
      },
      (error) => {
        console.log(error)
      }
    )


    
  }



  ConsultarMovimientosAuxiliares() {
    if (this.fechai == undefined || this.fechaf == undefined) {
      this._snackBar.open('Recuerde seleccionar un rango de fechas', 'OK')
      return
    }
    let fini = this.util.ConvertirFechaDB(this.fechai)
    let ffin = this.util.ConvertirFechaDB(this.fechaf)
    this.ELEMENT_DATA = []
    this.ngxService.startLoader('load-cont')
    this.xAPI.funcion = "FID_CMovimientosAuxiliares"
    this.xAPI.parametros = fini + ',' + ffin
    this.xAPI.valores = ''

    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {
        this.lstMovimientosAuxliares = data.Cuerpo

        this.blista = false
        this.bauxiliar = true
        await this.ngxService.stopLoader('load-cont')
      },
      (error) => {
        console.log(error)
        this.ngxService.stopLoader('load-cont')
      }
    )
  }


  GenerarCierre(){
    
    if (this.fechai == undefined || this.fechaf == undefined) {
      this._snackBar.open('Recuerde seleccionar un rango de fechas', 'OK')
      return
    }

    this.ngxService.stopLoader('load-precierre')
    this.xAPI.funcion = "FID_UPlanFideicomiso"
    this.xAPI.parametros = '1,' + this.util.ConvertirFechaDB(this.fechai)
    this.xAPI.valores = ''

    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {
        this.xAPI.funcion = "FID_IMovimientosSaldos"
        this.xAPI.parametros = this.util.ConvertirFechaDB(this.fechai)
        this.xAPI.valores = ''
    
        this.apiService.Ejecutar(this.xAPI).subscribe(
          async data => {
              this.lstMovimientosAuxliares = []
              this.bauxiliar = false
              this.blista = false
              this.apiService.Mensaje(
                "Felicitaciones, Proceso exitoso",
                "Se ha realizado el cierre para el dia: " + this.util.ConvertirFechaDB(this.fechai),
                "success",
                "contratos"
              );
              this.ngxService.stopLoader('load-precierre')
          },
          (error) => {
            console.log(error)
          }
        )
    
      },
      (error) => {
        console.log(error)
      }
    )


    
  }


  

  getMoneda(e) : string {
    return this.util.ConvertirMoneda(e.debe);
  }

}
