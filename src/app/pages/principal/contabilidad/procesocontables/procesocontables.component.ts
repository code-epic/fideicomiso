import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgbDate, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { CierreService } from 'src/app/services/banfanb/cierre.service';
import { FID_IComprobante, FID_IDetalleComprobante } from 'src/app/services/banfanb/comprobante.service';
import { LPosicionInversiones } from 'src/app/services/banfanb/contabilidad.service';
import { UtilService } from 'src/app/services/util/util.service';
import { PlanGuardService } from 'src/app/services/banfanb/plan-guard.service';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';
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

  /**
   * Ultimo cierre
   */
  public fechaultimo = ''

  /**
   * Fecha a Precerrar
   */
  public fechai: any
  public fechaf: any
  public fechauc: any

  public lstMovimientos = []
  public lstMovimientosAuxliares = []
  public bcuentat = false
  public semestral = false

  public dias: number = 1
  public acum_debe = 0
  public acum_haber = 0

  public yaProcesadoCierreSemestral = false
  public procesando = false

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
    id_comprobante: 0,
    cuenta: 0,
    debe: 0,
    haber: 0,
    fecha_operacion: "",
    fecha_ejercicio: "",
  };


  lstData = []
  public total_debe : number = 0
  public total_haber : number = 0

  constructor(
    private apiService: ApiService,
    private _snackBar: MatSnackBar,
    private ngxService: NgxUiLoaderService,
    private util: UtilService,
    private cierre: CierreService,
    private planGuard: PlanGuardService,
    public formatter: NgbDateParserFormatter,
  ) { }

  ngOnInit(): void {
    this.consultarUltimoCierre()
  }

  async consultarUltimoCierre() {
    this.ngxService.startLoader('load-precierre')
    this.fechaultimo = await this.cierre.getUltimoCierre()
    this.semestral = this.cierre.getSemestral(this.fechaultimo)
    this.fechai = this.cierre.getSiguienteDia(this.fechaultimo);
    this.fechaf = this.fechai

    this.estatus = this.semestral ? 'S' : 'M'

    this.ngxService.stopLoader('load-precierre')
  }

  CalcularDias(type: string, event: MatDatepickerInputEvent<Date>) {
    this.dias = this.util.CalcuarDiasTranscurridos(this.fechai, this.fechaf) + 2
  }

  ConsultarComprobante() {
    if (this.fechai == undefined || this.fechaf == undefined) {
      this._snackBar.open('Recuerde seleccionar un rango de fechas', 'OK')
      return
    }

    this.total_debe = 0
    this.total_haber = 0

    let fini = this.util.ConvertirFechaDB(this.fechai)
    this.ELEMENT_DATA = []
    this.ngxService.startLoader('load-cont')
    this.xAPI.funcion = environment.xApi.CONSULTAR_MOVIMIENTOS_COMPROBANTE
    this.xAPI.valores = ''
    if(this.estatus == "S") fini = this.util.ConvertirFechaDB(this.fechaultimo)
    this.xAPI.parametros = fini + ',' + this.estatus
    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {
        this.lstMovimientos = data.Cuerpo

        const filtered = [];
        for (const e of this.lstMovimientos) {
          const planId = e.id_plan || e.plan;
          if (!planId || !(await this.planGuard.planBloqueado(planId))) {
            filtered.push(e);
          }
        }
        this.lstMovimientos = filtered;

        this.lstMovimientos.map(e => {
          this.total_debe += parseFloat(e.debe) || 0
          this.total_haber += parseFloat(e.haber) || 0
        })
        this.blista = true

        await this.ngxService.stopLoader('load-cont')
      },
      (error) => {
        console.error(error)
        this.ngxService.stopLoader('load-cont')
      }
    )
  }

  /**
 * Inserta el precierre
  */
  GenerarPrecierre() {

    if (this.fechai == undefined || this.fechaf == undefined) {
      this._snackBar.open('Recuerde seleccionar un rango de fechas', 'OK')
      return
    }
    let fini = this.util.ConvertirFechaDB(this.fechai)

    this.ngxService.startLoader('load-precierre')
    this.xAPI.funcion = environment.xApi.INSERTAR_MOVIMIVIENTOS_COMPROBANTES
    if(this.estatus == "S") fini = this.util.ConvertirFechaDB(this.fechaultimo)
    this.xAPI.parametros = fini + ',' + this.estatus    
    this.xAPI.valores = ''

    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {
        this.apiService.Mensaje(
          "Proceso exitoso",
          "Se ha realizado el Precierre",
          "success",
          "Cierre"
        )

        this.semestral = false;
        this.estatus = 'M';
        this.consultarUltimoCierre()
        this.cierre.actualizarCierres()
        this.ngxService.stopLoader('load-precierre')
        this.lstMovimientos = []
        this.blista = false
      },

      (error) => {
        console.error(error);
        this.ngxService.stopLoader('load-precierre');
        this._snackBar.open('Error al generar el precierre. Intente de nuevo.', 'Ok');
      }
    )
  }

  getMoneda(monto: number): string {
    return this.util.ConvertirMoneda( monto );
  }

  //Cierre semestral multi-plan
  iniciarComprobante(fecha, planId: number) {
    this.Comprobante.descripcion = 'CIERRE SEMESTRAL ASIENTO ' + fecha
    this.Comprobante.detalle = 'CIERRE SEMESTRAL ASIENTO ' + fecha
    this.Comprobante.plan = planId
    this.Comprobante.fecha_ejercicio = this.util.FechaActual()
    this.Comprobante.fecha_operacion = fecha
    this.Comprobante.debe = 0.00
    this.Comprobante.haber = 0.00
    this.Comprobante.llave = 'S'
  }

  consultarValoresSemestrales() {
     if (this.fechai == undefined || this.fechaf == undefined) {
      this._snackBar.open('Recuerde seleccionar un rango de fechas', 'OK')
      return
    }

    this.procesando = true
    let fecha = this.util.ConvertirFechaDB(this.fechaultimo)
    
    // Consultar todos los planes activos
    this.xAPI.funcion = environment.xApi.CONSULTAR_PLANES_FIDEICOMISO
    this.xAPI.parametros = ''
    this.xAPI.valores = ''
    
    this.apiService.Ejecutar(this.xAPI).subscribe({
      next: async (data) => {
        const planes = (data.Cuerpo || []).filter((p: any) => Number(p.estatus) === 1 || Number(p.estatus) === 2)
        
        if (planes.length === 0) {
          this._snackBar.open('No hay planes activos para procesar', 'OK')
          this.procesando = false
          return
        }

        // Confirmar antes de procesar
        const result = await Swal.fire({
          title: 'Cierre Semestral',
          text: `Se procesará el cierre semestral para ${planes.length} plan(es) activo(s). ¿Continuar?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Si, procesar',
          cancelButtonText: 'Cancelar'
        })

        if (!result.isConfirmed) {
          this.procesando = false
          return
        }

        // Eliminar comprobantes semestrales existentes para esta fecha
        this.xAPI.funcion = environment.xApi.CONSULTAR_COMPROBANTES
        this.xAPI.parametros = ''
        this.xAPI.valores = ''
        
        this.apiService.Ejecutar(this.xAPI).subscribe({
          next: async (dataComp) => {
            const existentes = (dataComp.Cuerpo || []).filter((c: any) => 
              c.llave === 'S' && c.fecha_operacion === fecha
            )
            
            // Eliminar existentes uno por uno
            for (const comp of existentes) {
              await new Promise<void>((resolve) => {
                this.xAPI.funcion = environment.xApi.ELIMINAR_COMPROBANTE
                this.xAPI.parametros = comp.id
                this.xAPI.valores = ''
                this.apiService.Ejecutar(this.xAPI).subscribe({
                  next: () => resolve(),
                  error: () => resolve()
                })
              })
            }

            // Crear comprobante por cada plan activo
            for (const plan of planes) {
              await this.crearComprobanteSemestral(fecha, plan.id)
            }
            
            this.procesando = false
            this._snackBar.open(`Cierre semestral procesado para ${planes.length} plan(es)`, 'OK')
          },
          error: () => {
            this.procesando = false
          }
        })
      },
      error: () => {
        this.procesando = false
      }
    })
  }

  crearComprobanteSemestral(fecha: string, planId: number) {
    return new Promise<void>((resolve) => {
      this.lstData = []
      this.xAPI.funcion = environment.xApi.CONSULTAR_MOVIMIENTOS_SEMESTRALES
      this.xAPI.parametros = fecha + ',' + planId
      this.xAPI.valores = ''

      this.iniciarComprobante(fecha, planId)

      this.apiService.Ejecutar(this.xAPI).subscribe(
        data => {
          if (!data.Cuerpo || data.Cuerpo.length === 0) {
            resolve()
            return
          }

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
              'fecha_operacion': fecha
            }
            this.lstData.push(dc)
          });

          let saldo = debe - haber
          if (saldo > 0) {
            // Utilidad → HABER 734 (aumenta patrimonio)
            let dcx = {
              'comprobante': 0,
              'cuenta': '40',
              'debe': 0,
              'haber': saldo,
              'fecha_ejercicio': fecha,
              'fecha_operacion': fecha
            }
            this.lstData.push(dcx)
          } else if (saldo < 0) {
            // Pérdida → DEBE 734 (disminuye patrimonio)
            let dcx = {
              'comprobante': 0,
              'cuenta': '40',
              'debe': Math.abs(saldo),
              'haber': 0,
              'fecha_ejercicio': fecha,
              'fecha_operacion': fecha
            }
            this.lstData.push(dcx)
          }
          // Si saldo == 0 → no se agrega línea 734
          this.Comprobante.debe = debe
          this.Comprobante.haber = debe

          // Insertar directamente sin confirmación (ya se confirmó en el flujo principal)
          this.Acepar().then(() => {
            resolve();
          })
        },
        error => {
          resolve()
        }
      )
    })
  }

  Acepar(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.ngxService.startLoader("load-cont");
      this.xAPI.funcion = environment.xApi.INSERTAR_COMPROBANTE
      this.xAPI.parametros = "";
      this.Comprobante.codigo = this.util.GenerarUnicId()
          
      this.xAPI.valores = JSON.stringify(this.Comprobante);
      this.apiService.Ejecutar(this.xAPI).subscribe(
        async (data) => {
          try {
            await this.GuardarDetalle(data.msj);
            this.ngxService.stopLoader("load-cont");
            this.lstData = [];
            resolve();
          } catch (error) {
            // Rollback: eliminar comprobante si falló el detalle
            console.error('Error al guardar detalle, eliminando comprobante:', error)
            this.xAPI.funcion = environment.xApi.ELIMINAR_COMPROBANTE
            this.xAPI.parametros = data.msj
            this.xAPI.valores = ''
            this.apiService.Ejecutar(this.xAPI).subscribe({
              next: () => {
                this.ngxService.stopLoader("load-cont");
                this.lstData = [];
                resolve();
              },
              error: () => {
                this.ngxService.stopLoader("load-cont");
                this.lstData = [];
                resolve();
              }
            })
          }
        },
        (err) => {
          console.error('Error al insertar comprobante:', err)
          this.ngxService.stopLoader("load-cont");
          resolve();
        }
      );
    })
  }

  async GuardarDetalle(comprobante: number) {
    this.IDComprobante.id_comprobante = comprobante;
    for (const e of this.lstData) {
      this.IDComprobante.debe = e.debe
      this.IDComprobante.haber = e.haber
      this.IDComprobante.fecha_ejercicio = e.fecha_ejercicio
      this.IDComprobante.fecha_operacion = e.fecha_operacion
      this.IDComprobante.cuenta = e.cuenta
      this.IDComprobante.plan = this.Comprobante.plan

      this.xAPI.funcion = environment.xApi.INSERTAR_DETALLE_COMPROBANTE
      this.xAPI.parametros = "";
      this.xAPI.valores = JSON.stringify(this.IDComprobante);

      await firstValueFrom(this.apiService.Ejecutar(this.xAPI));
    }
    this.ConsultarComprobante()
  }

  /**
   * Consultar la fecha del ultimo precierre realizado
   */
  ValidarPreCierre( ) {
    this.xAPI.funcion = environment.xApi.CONSULTAR_ULTIMO_PRECIERRE
    this.xAPI.parametros = ''
    this.xAPI.valores = ''
    this.ngxService.startLoader('load-precierre')

    this.apiService.Ejecutar(this.xAPI).subscribe(
      data => {
        if (data.Cuerpo != undefined ){
          let ultimoPrecierre = data.Cuerpo[0].fecha_cierre;

          let d1: number, m1: number, y1: number;
          if (ultimoPrecierre.includes('/')) {
            // Formato DD/MM/YYYY
            [d1, m1, y1] = ultimoPrecierre.split('/').map(Number);
          } else if (ultimoPrecierre.includes('-')) {
            // Formato YYYY-MM-DD
            [y1, m1, d1] = ultimoPrecierre.split('-').map(Number);
          } else {
            throw new Error('Formato de fecha no soportado: ' + ultimoPrecierre);
          }
          let ultimoPrecierreDate = new Date(Date.UTC(y1, m1 - 1, d1)).toISOString();

          let fechaAPrecerrar = this.util.ConvertirFechaDB(this.fechai);

          let d2: number, m2: number, y2: number;
          if (fechaAPrecerrar.includes('/')) {
            [d2, m2, y2] = fechaAPrecerrar.split('/').map(Number);
          } else if (fechaAPrecerrar.includes('-')) {
            [y2, m2, d2] = fechaAPrecerrar.split('-').map(Number);
          } else {
            throw new Error('Formato de fecha no soportado: ' + fechaAPrecerrar);
          }
          let fechaAPrecerrarDate = new Date(Date.UTC(y2, m2 - 1, d2)).toISOString();

          const [d3, m3, y3] = this.fechaultimo.split('/').map(Number);
          const fechaUltimoAux = new Date(Date.UTC(y3, m3 - 1, d3));
          fechaUltimoAux.setUTCDate(fechaUltimoAux.getUTCDate() + 2);
          const fechaUltimoUTCAux = fechaUltimoAux.toISOString();

          if (this.cierre.getSemestral(this.util.ConvertirFechaHumana(fechaAPrecerrar)) && this.estatus == 'S') {            
              this.ValidarPreCierreSemestral()
              return;
          }

          //Validar si el dia ya fue precerrado
          if (fechaAPrecerrarDate < ultimoPrecierreDate) {
            this.apiService.Mensaje(
              "Pendiente",
              "Ya fue procesado el Precierre: " + this.util.ConvertirFechaHumana(this.fechai),
              "error",
              "Cierre"
            )
            this.consultarUltimoCierre()
            this.ngxService.stopLoader('load-precierre')
          }else if(fechaAPrecerrarDate >= fechaUltimoUTCAux){
          
            this.apiService.Mensaje(
              "Pendiente",
              "Tiene pendiente el cierre del anterior",
              "error",
              "Cierre"
            )
            this.consultarUltimoCierre()
            this.ngxService.stopLoader('load-precierre')
          } else if (fechaAPrecerrarDate == ultimoPrecierreDate) {
            Swal.fire({
              title: "Pendiente",
              text:  "Ya fue procesado el Precierre del día: " + this.util.ConvertirFechaHumana(this.fechai) + " Desea recalcular?",                  
              icon: 'info',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Recalcular',
              cancelButtonText: 'Cancelar',
              allowEscapeKey: true,
            }).then((result) => {
              if (result.isConfirmed) {
                this.eliminarPrecierre(fechaAPrecerrarDate)
              }
            })
          } else {
            if (this.cierre.getSemestral(this.util.ConvertirFechaHumana(fechaAPrecerrar))) {            
              this.ValidarPreCierreSemestral()
            } else {
              this.GenerarPrecierre()
            }
          }      
        }
      },
      err => {
        console.error(err)
        this.ngxService.stopLoader('load-precierre')
      }
    )
  }

  eliminarPrecierre(fechaAPrecerrar: any): void{

    const fecha = new Date(fechaAPrecerrar);
    const año = fecha.getUTCFullYear();
    const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0'); // Meses empiezan en 0
    const dia = String(fecha.getUTCDate()).padStart(2, '0');
    const fechaTransformada = `${año}-${mes}-${dia}`;
    
    let xApi: IAPICore = {
      funcion: 'FID_DPreCierre',
      parametros: fechaTransformada
    }

    this.apiService.Ejecutar(xApi).subscribe(
      data => {
        this.bauxiliar = false
        this.blista = false
        this.GenerarPrecierre()
      },
      err => {
        console.error(err)
      }
    )
    
  }

  ValidarPreCierreSemestral() {
    this.xAPI.funcion = environment.xApi.CONSULTAR_ULTIMO_CIERRE_SEMESTRAL
    this.xAPI.parametros = ''
    this.xAPI.valores = ''
    this.ngxService.startLoader('load-precierre')
    this.apiService.Ejecutar(this.xAPI).subscribe(
      data => {
        const fecha = data?.Cuerpo?.[0]?.fecha;
        if (fecha) {
          let fentrada = fecha.substring(0, 10);
          let finicio = this.util.ConvertirFechaDB(this.fechai);          
          
          if (fentrada == finicio){            
            this.apiService.Mensaje(
              "Pendiente",
              "Ya fue procesado el Precierre Semestral: " + this.util.ConvertirFechaHumana(this.fechai),
              "error",
              "Cierre"
            )
            this.ngxService.stopLoader('load-precierre')
          }else{
            this.GenerarPrecierre()
          }
        } else {
          // No hay precierre semestral previo → proceder
          this.GenerarPrecierre()
        }
      },
      err => {
        console.error(err)
        this.ngxService.stopLoader('load-precierre')
      }
    )    
  }
}
