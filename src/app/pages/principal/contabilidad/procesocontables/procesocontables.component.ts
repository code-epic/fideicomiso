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
import { environment } from 'src/environments/environment';
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

  public dias: number = 0
  public acum_debe = 0
  public acum_haber = 0

  public yaProcesadoCierreSemestral = false

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

  constructor(
    private apiService: ApiService,
    private _snackBar: MatSnackBar,
    private ngxService: NgxUiLoaderService,
    private util: UtilService,
    private cierre: CierreService,
    public formatter: NgbDateParserFormatter,
  ) { }

  ngOnInit(): void {
    this.semestral = false
    this.estatus = 'M'
    this.consultarUltimoCierre()
  }

  async consultarUltimoCierre() {
    this.ngxService.startLoader('load-precierre')
    this.fechaultimo = await this.cierre.getUltimoCierre()
    this.semestral = this.cierre.getSemestral(this.fechaultimo)

    if(this.semestral){
      this.fechai = this.cierre.getSiguienteDia(this.fechaultimo, 1);
      this.ValidarPreCierreSemestral(false)
      if (this.yaProcesadoCierreSemestral) {
        this.semestral = true;
        this.estatus = 'S'
      }
    }else{
      this.semestral = false
      this.estatus = 'M'
      this.fechai = this.cierre.getSiguienteDia(this.fechaultimo)
    }
    this.fechaf = this.fechai
    this.ngxService.stopLoader('load-precierre')
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
    this.ELEMENT_DATA = []
    this.ngxService.startLoader('load-cont')
    this.xAPI.funcion = environment.xApi.CONSULTAR_MOVIMIENTOS_COMPROBANTE
    this.xAPI.valores = ''
    if(this.estatus == "S") fini = this.fechau
    this.xAPI.parametros = fini + ',' + this.estatus

    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {
        this.lstMovimientos = data.Cuerpo
        this.lstMovimientos.map(e => {
          this.total_debe += parseFloat(e.debe)
          this.total_haber += parseFloat(e.haber)
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

    this.ngxService.stopLoader('load-precierre')
    this.xAPI.funcion = environment.xApi.INSERTAR_MOVIMIVIENTOS_COMPROBANTES
    if(this.estatus == "S") fini = this.fechau
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
        console.error(error)
      }
    )
  }

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
    this.xAPI.funcion = environment.xApi.CONSULTAR_MOVIMIENTOS_SEMESTRALES
    this.xAPI.parametros = fecha
    this.xAPI.valores = ''

    this.registrarComprobante(fecha)

    this.apiService.Ejecutar(this.xAPI).subscribe(
      data => {
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
        let dcx = {
          'comprobante': 0,
          'cuenta': '40',
          'debe': 0,
          'haber': saldo,
          'fecha_ejercicio': fecha,
          'fecha_operacion': fecha
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
      error => { }
    )
  }

  Acepar() {
    this.ngxService.startLoader("load-cont");
    this.xAPI.funcion = environment.xApi.INSERTAR_COMPROBANTE
    this.xAPI.parametros = "";
    this.Comprobante.codigo = this.util.GenerarUnicId()
        
    this.xAPI.valores = JSON.stringify(this.Comprobante);
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
      this.IDComprobante.plan = 1

      this.xAPI.funcion = environment.xApi.INSERTAR_DETALLE_COMPROBANTE
      this.xAPI.parametros = "";
      this.xAPI.valores = JSON.stringify(this.IDComprobante);      

      await this.apiService.Ejecutar(this.xAPI).subscribe(
        (data) => { },
        (err) => { }
      );
    })
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
          
          let ultimoPrecierre = data.Cuerpo[0].fecha
          let fechaAPrecerrar = this.util.ConvertirFechaDB(this.fechai)

          let ultimoPrecierreDate = new Date(ultimoPrecierre).toISOString();
          let fechaAPrecerrarDate = new Date(fechaAPrecerrar).toISOString();
          
          const fechaUltimoAux = new Date(this.fechaultimo.split('/').reverse().join('-'));
          fechaUltimoAux.setDate(fechaUltimoAux.getDate() + 2); 
          const fechaUltimoUTCAux = fechaUltimoAux.toISOString(); 

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

          }else if(fechaAPrecerrarDate == ultimoPrecierreDate){
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
          }else{
            if (fechaAPrecerrar == '2024-12-31' || fechaAPrecerrar == '2024-06-30' || fechaAPrecerrar == '2025-12-31' ) {            
              this.ValidarPreCierreSemestral()
            }else{
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

  ValidarPreCierreSemestral(x: boolean = true, ultc = null) {
    this.xAPI.funcion = environment.xApi.CONSULTAR_ULTIMO_CIERRE_SEMESTRAL
    this.xAPI.parametros = ''
    this.xAPI.valores = ''
    this.ngxService.startLoader('load-precierre')

    this.apiService.Ejecutar(this.xAPI).subscribe(
      data => {
        if (data.Cuerpo != undefined ){
          let fentrada = data.Cuerpo[0].fecha;
          let finicio = this.util.ConvertirFechaDB(this.fechai);          
          
          if (fentrada == finicio){            
            if (x) {
              this.apiService.Mensaje(
                "Pendiente",
                "Ya fue procesado el Precierre Semestral: " + this.util.ConvertirFechaHumana(this.fechai),
                "error",
                "Cierre"
              )
              this.ngxService.stopLoader('load-precierre')
            }else{
              this.yaProcesadoCierreSemestral = false
              this.consultarUltimoCierre()       
            }
          }else{
            if (x) {
              this.GenerarPrecierre()
            }else{
              this.yaProcesadoCierreSemestral = true       
              this.consultarUltimoCierre()       
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
}
