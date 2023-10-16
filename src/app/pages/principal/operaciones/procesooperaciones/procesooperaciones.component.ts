import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
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
  public dias : number = 0
  public acum_debe = 0
  public acum_haber = 0

  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
  }

  events: string[] = [];
  constructor(private apiService: ApiService,
    private _snackBar: MatSnackBar,
    private ngxService: NgxUiLoaderService,
    private util: UtilService,
    public formatter: NgbDateParserFormatter) { }

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


  consultarComisiones(){

    let dia = parseInt( this.dias.toString() )
    this.ngxService.stopLoader('load-precierre')
    this.xAPI.funcion = "FID_CalcularComision"
    this.xAPI.parametros = dia + ',360'

    console.log(this.xAPI)
    this.xAPI.valores = ''
    console.log('Control de datas')

    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {
          console.log(data)
          this.lstComisiones = data.Cuerpo
         
          
          this.ngxService.stopLoader('load-precierre')
        
      },
      (error) => {
        console.log(error)
      }
    )
  }

  CalcularDias(type: string){
    this.dias = this.util.CalcuarDiasTranscurridos(this.fechai, this.fechaf)+1
  }


  CalcularDevengo(){
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
  }
  
   ListarDevengo(){


   }


   getMoneda(numero: number): string {
    return this.util.ConvertirMoneda(numero);
  }
  
  getCodigo(id ) : string{
    return "CON-" + this.util.zfill(id, 4)
  }


}
