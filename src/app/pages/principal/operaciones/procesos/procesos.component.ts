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
  selector: 'app-procesos',
  templateUrl: './procesos.component.html',
  styleUrls: ['./procesos.component.scss']
})
export class ProcesosComponent implements OnInit {

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

  public lstAsientos = []
  public bcuentat = false
  public dias : number = 0
  public acum_debe = 0
  public acum_haber = 0

  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
  }

  events: string[] = [];
  
  constructor( private apiService: ApiService,
    private _snackBar: MatSnackBar,
    private ngxService: NgxUiLoaderService,
    private util: UtilService,
    public formatter: NgbDateParserFormatter,) { }

  ngOnInit(): void {
    let d = new Date().toISOString().substring(0,10).split('-')
    this.fechaultimo = d[2] + '/' + d[1] + '/' + d[0]
    this.consultarUltimoCierre()
    
  }

  consultarUltimoCierre(){
    this.ngxService.stopLoader('load-precierre')
    this.xAPI.funcion = "FID_CUltimoCierre"
    this.xAPI.parametros = ''
    this.xAPI.valores = ''

    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {

          let ultc = data.Cuerpo
          if (ultc.length > 0 ) this.fechaultimo = this.util.ConvertirFechaHumana( ultc[0].ultimo_cierre)
          
          this.ngxService.stopLoader('load-precierre')
        
      },
      (error) => {
        console.log(error)
      }
    )
  }

  CalcularDias(type: string, event: MatDatepickerInputEvent<Date>){
    this.dias = this.util.CalcuarDiasTranscurridos(this.fechai, this.fechaf)+1
  }



  CalculoPosicion(){

    if (this.fechai == undefined || this.fechaf == undefined) {
      this._snackBar.open('Recuerde seleccionar un rango de fechas', 'OK')
      return
    }
    let fini = this.util.ConvertirFechaDB(this.fechai)
    let usuario = ''
    let llave = ''

    this.ngxService.startLoader('load-cont')
    this.xAPI.funcion = "FID_BashIPosicion"
    this.xAPI.parametros = fini + ',I,'  + usuario + ',' + llave
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

  CalcularInversion(){
    if (this.fechai == undefined || this.fechaf == undefined) {
      this._snackBar.open('Recuerde seleccionar un rango de fechas', 'OK')
      return
    }
    let fini = this.util.ConvertirFechaDB(this.fechai)
    let ffin = this.util.ConvertirFechaDB(this.fechaf)
    let fope = new Date().toISOString().substring(0,10)
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
  

  ListarInversiones( ){
   

    if (this.fechai == undefined || this.fechaf == undefined) {
      this._snackBar.open('Recuerde seleccionar un rango de fechas', 'OK')
      return
    }
    let fini = this.util.ConvertirFechaDB(this.fechai)
    let ffin = this.util.ConvertirFechaDB(this.fechaf)
    this.ELEMENT_DATA = []
    this.ngxService.startLoader('load-cont')
    this.xAPI.funcion = "FID_CPosicionInversiones"
    this.xAPI.parametros = fini + ',' + ffin
    this.xAPI.valores = ''

    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {
        
        this.ELEMENT_DATA = data.Cuerpo
        this.dataSource = new MatTableDataSource<LPosicionInversiones>(
          this.ELEMENT_DATA
        );
        this.dataSource.paginator = this.paginator;
        this.ConsultarAsientos()
        // this.fechai = ''
        // this.fechaf = ''
        // await this.ngxService.stopLoader('load-cont')
        // this.apiService.Mensaje('Proceso exitoso', 'Felicitaciones', 'success', 'inversion')
        
        
      },
      (error) => {
        console.log(error)
        this.ngxService.stopLoader('load-cont')
      }
    )
   
  }
  CalcularComision(){
    
    this.ngxService.stopLoader('load-precierre')
    this.xAPI.funcion = "FID_CalcularComision"
    this.xAPI.parametros = '1,360'
    this.xAPI.valores = ''

    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {

          let ultc = data.Cuerpo
          if (ultc.length > 0 ) {
            console.log(ultc)
          }
          
          this.ngxService.stopLoader('load-precierre')
        
      },
      (error) => {
        console.log(error)
      }
    )


    
  }


  ConsultarAsientos(){

    if (this.fechai == undefined || this.fechaf == undefined) {
      this._snackBar.open('Recuerde seleccionar un rango de fechas', 'OK')
      return
    }
    let fini = this.util.ConvertirFechaDB(this.fechai)
    let ffin = this.util.ConvertirFechaDB(this.fechaf)
    this.ELEMENT_DATA = []
    this.ngxService.startLoader('load-cont')
    this.xAPI.funcion = "FID_CTotalizadorCuentas"
    this.xAPI.parametros = fini + ',' + ffin
    this.xAPI.valores = ''
    this.acum_debe = 0
    this.acum_haber = 0
    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {
        
        this.lstAsientos = data.Cuerpo
        data.Cuerpo.forEach(e => {
          this.acum_debe += parseFloat( e.debe) 
          this.acum_haber += parseFloat( e.haber) 
        });

        this.fechai = ''
        this.fechaf = ''
        await this.ngxService.stopLoader('load-cont')
        // this.apiService.Mensaje('Proceso exitoso', 'Felicitaciones', 'success', 'inversion')
        
        
      },
      (error) => {
        console.log(error)
        this.ngxService.stopLoader('load-cont')
      }
    )
  }

  getCuenta(e){
    return e.codigo_padre + '.' + e.parte + '.' + e.moneda + '.' + e.nivel_1 + '.' + e.nivel_2 + '.' + e.nivel_3 + '.' + e.nivel_4 + '.' + e.nivel_5
  }


}
