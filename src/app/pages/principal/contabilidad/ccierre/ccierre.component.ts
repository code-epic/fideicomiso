import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { CierreService } from 'src/app/services/banfanb/cierre.service';
import { FID_IComprobante, FID_IDetalleComprobante } from 'src/app/services/banfanb/comprobante.service';
import { LPosicionInversiones } from 'src/app/services/banfanb/contabilidad.service';
import { UtilService } from 'src/app/services/util/util.service';
import { environment } from 'src/environments/environment';

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
  blista: boolean = false
  bauxiliar: boolean = false
  constructor(
    private apiService: ApiService,
    private ngxService: NgxUiLoaderService,
    private util: UtilService,
    public formatter: NgbDateParserFormatter,
    private cierre: CierreService
  ) { }

  ngOnInit(): void {
    this.consultarUltimoCierre()
  }


  async consultarUltimoCierre() {
    this.fechaultimo = await this.cierre.getUltimoCierre()
    this.fechai = this.cierre.getSiguienteDia(this.fechaultimo);
    this.fechaf = this.fechai
    this.semestral = this.cierre.getSemestral(this.fechaultimo)
    this.dias = 1
  }

  CalcularDias(type: string, event: MatDatepickerInputEvent<Date>) {
    this.dias = this.util.CalcuarDiasTranscurridos(this.fechai, this.fechaf) + 1
  }


  async ValidarPreCierre() {
    this.ngxService.startLoader('load-precierre')
    let fentrada = await this.cierre.getUltimoPrecierre()
    let finicio = this.util.ConvertirFechaDB(this.fechai)

    fentrada = this.util.ConvertirFechaDB(fentrada)

    let fentradaDate = new Date(fentrada).toISOString(); // Convertir fentrada a formato UTC
    let finicioDate = new Date(finicio).toISOString();   // Convertir finicio a formato UTC

    if (fentradaDate >= finicioDate) {
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
    } else {
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

  CrearSaldos(llave = 'M') {
    let d = this.fechaultimo.split('/')
    let fultimo = d[2] + '-' + d[1] + '-' + d[0];
    let dt = new Date(this.fechai).toISOString()

    d = dt.split('T')
    let fopera = d[0]
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
    this.xAPI.funcion = environment.xApi.INSERTAR_SALDOS_CIERRE
    this.xAPI.parametros = `${fopera},${usuario},${llave},${plan},${fultimo}`
    this.xAPI.valores = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {
        this.apiService.Mensaje(
          "Proceso exitoso",
          "Se ha realizado el cierre para el dia: " + this.util.ConvertirFechaHumana(this.fechai),
          "success",
          "Cierres"
        )
        this.consultarUltimoCierre()
        this.cierre.actualizarCierres()
        this.ngxService.stopLoader('load-precierre')

      },
      (error) => {
        console.error(error)
      }
    )
  }


  CrearSemestral(llave) {
    this.ngxService.startLoader('load-precierre')
    let d = this.fechaultimo.split('/')
    let fultimo = d[2] + '-' + d[1] + '-' + d[0]
    this.xAPI.funcion = environment.xApi.BORRAR_CIERRE_SEMESTRAL
    this.xAPI.parametros = fultimo
    this.xAPI.valores = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {
        this.CrearSaldos(llave)
        this.ngxService.stopLoader('load-precierre')
      },
      (error) => {
        console.error(error)
      }
    )
  }


}
