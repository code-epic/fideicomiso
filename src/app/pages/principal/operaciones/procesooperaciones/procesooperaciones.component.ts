import { Component, OnInit } from '@angular/core';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { CierreService } from 'src/app/services/banfanb/cierre.service';
import { FID_IComprobante } from 'src/app/services/banfanb/comprobante.service';
import { UtilService } from 'src/app/services/util/util.service';
import { PlanGuardService } from 'src/app/services/banfanb/plan-guard.service';
import { environment } from 'src/environments/environment';

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
  public lstIncrementos: any[] = []
  public lstRetiros: any[] = []
  public bcuentat = false
  public dias: number = 0
  public acum_debe = 0
  public acum_haber = 0

  blComprobante = true
  
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
    private ngxService: NgxUiLoaderService,
    private cierre: CierreService,
    private util: UtilService,
    private planGuard: PlanGuardService,
    public formatter: NgbDateParserFormatter
  ) { }

  ngOnInit(): void {
    this.consultarUltimoPrecierre()
  }

  async consultarUltimoPrecierre() {
    this.fechaultimo = await this.cierre.getUltimoCierre()
    this.fechai = this.cierre.getSiguienteDia(this.fechaultimo);
    this.fechaf = this.cierre.getSiguienteDia(this.fechaultimo);    
    this.dias = 1
  }

  consultarComisiones() {
    let dia = parseInt(this.dias.toString())
    let fechaFin = this.util.ConvertirFechaDB(this.fechai)
    this.ngxService.startLoader('load-cont')
    this.xAPI.funcion = environment.xApi.CALCULAR_COMISION
    this.xAPI.parametros = dia + ',360,' + fechaFin
    this.xAPI.valores = ''
    this.visible = false
    this.blComprobante = true
    this.acum_debe = 0
    this.acum_haber = 0

    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {
        this.lstComisiones = data.Cuerpo

        const filtered = [];
        for (const e of this.lstComisiones) {
          if (!(await this.planGuard.planBloqueado(e.id))) {
            filtered.push(e);
          }
        }
        this.lstComisiones = filtered;
        
        this.lstComisiones.map(e => {
          this.acum_debe += parseFloat(e.calculo_capital)
          this.acum_haber += parseFloat(e.calculo_capital)
        })
        if (this.lstComisiones.length > 0) this.visible = true

        this.ConsultarIncrementos()
        this.ConsultarRetiros()

        let factual = new Date(this.fechau + ' 00:00:00')
        let fcalculo = new Date(this.fechai)
        
        if( factual.getTime() >= fcalculo.getTime() ) this.blComprobante = false

        this.ngxService.stopLoader('load-cont')
      },
      (error) => {
        console.error(error)
        this.ngxService.stopLoader('load-cont')
      }
    )
  }

  CalcularDias(type: string) {
    this.dias = this.util.CalcuarDiasTranscurridos(this.fechai, this.fechaf) + 1
  }

  ConsultarIncrementos() {
    let fecha = this.util.ConvertirFechaDB(this.fechai)
    this.xAPI.funcion = environment.xApi.CONSULTAR_INCREMENTOS_POR_FECHA
    this.xAPI.parametros = fecha
    this.xAPI.valores = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstIncrementos = data.Cuerpo || []
      },
      (error) => {
        console.error(error)
      }
    )
  }

  ConsultarRetiros() {
    let fecha = this.util.ConvertirFechaDB(this.fechai)
    this.xAPI.funcion = environment.xApi.CONSULTAR_RETIROS_POR_FECHA
    this.xAPI.parametros = fecha
    this.xAPI.valores = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstRetiros = data.Cuerpo || []
      },
      (error) => {
        console.error(error)
      }
    )
  }

  getMoneda(numero: number): string {
    return this.util.ConvertirMoneda(numero);
  }

  getCodigo(id): string {
    return "CON-" + this.util.zfill(id, 4)
  }

  GenerarComprobante() {
    let fecha = this.util.ConvertirFechaDB(this.fechai)

    let xApi: IAPICore = {
      funcion: "FID_IComprobante",
      parametros: '',
      valores: ''
    }

    let xApiDelete: IAPICore = {
      funcion: environment.xApi.ELIMINAR_COMISIONES_ADMINISTRATIVAS,
      parametros: fecha,
      valores: ''
    }

    this.apiService.Ejecutar(xApiDelete).subscribe({
      next: () => {
        this.lstComisiones.forEach((e) =>{
          let Comprobante = {
            plan: e.id,
            codigo: this.util.GenerarUnicId(),
            descripcion: `COMISIONES ADMINISTRATIVAS ${this.util.ConvertirFechaHumana(fecha)}`,
            detalle: e.plan,
            fecha_operacion: this.util.ConvertirFechaDB(this.fechai),
            fecha_ejercicio: this.util.ConvertirFechaDB(this.fechai),
            debe: e.calculo_capital,
            haber: e.calculo_capital,
            llave: 'M'
          }

          xApi.valores = JSON.stringify(Comprobante)      

          this.apiService.Ejecutar(xApi).subscribe(
            data => {
              this.InsertData(data, this.lstComisiones.length, Comprobante)
            },
            (error) => {
              console.error(error)
              this.ngxService.stopLoader('load-cont')
            }
          )
        })

        this.apiService.Mensaje(
          "Proceso exitoso",
          "Se realizaron los comprobantes para el dia: " + this.util.ConvertirFechaHumana(this.fechai),
          "success",
          "Comprobantes"
        )
      },
      error: (error) => {
        console.error('Error eliminando comisiones existentes', error)
      }
    })
  }

  InsertData(dt: any, cant: number, e: any) {
    let fecha = this.util.ConvertirFechaDB(this.fechai)
    cant++
    this.xAPI.funcion = environment.xApi.INSERTAR_COMISIONES_ADMINISTRATIVAS
    this.xAPI.parametros = `${dt.msj}, 360, ${e.plan}, ${fecha}, ${e.debe}, ${e.haber}`
    
    this.xAPI.valores = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      data => {
        this.visible = false
        this.lstComisiones = []
      },
      (error) => {
        console.error(error)
        this.ngxService.stopLoader('load-cont')
      }
    )
  }
}
