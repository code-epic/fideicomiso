import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { FID_IComprobante } from 'src/app/services/banfanb/comprobante.service';
import { LAporteInicial } from 'src/app/services/banfanb/contabilidad.service';
import { UtilService } from 'src/app/services/util/util.service';
import { environment } from 'src/environments/environment';
import { CierreService } from 'src/app/services/banfanb/cierre.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-aporteinicial',
  templateUrl: './aporteinicial.component.html',
  styleUrls: ['./aporteinicial.component.scss']
})
export class AporteinicialComponent implements OnInit {

  public lstAsientos = []
  public fechaultimo = ''
  public fechai: any
  public bcuentat: boolean = false
  public blprocesar: boolean = false
  public ELEMENT_DATA: LAporteInicial[] = [];
  displayedColumns: string[] = [
    "codigo",
    "plan",
    "monto",
    "estado",
  ];
  dataSource: any;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  public acum_debe = 0
  public acum_haber = 0
  public max = 0

  public planVerificado: Map<number, boolean> = new Map();

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


  constructor(private apiService: ApiService,
    private _snackBar: MatSnackBar,
    private ngxService: NgxUiLoaderService,
    private util: UtilService,
    private cierre: CierreService,
    public formatter: NgbDateParserFormatter,) { }

  ngOnInit(): void {
    this.cierre.getUltimoCierre().then(fecha => {
      this.fechaultimo = fecha
      this.fechai = this.cierre.getSiguienteDia(fecha)
    })
  }

  Listar() { }

  Calcular() {
    if (this.fechai == undefined) {
      this._snackBar.open('Recuerde seleccionar una fecha', 'OK')
      return
    }

    const fechaCierreDB = this.util.ConvertirFechaDB(this.fechaultimo)
    const fechaOperacion = this.util.ConvertirFechaDB(this.fechai)
    if (fechaCierreDB && fechaOperacion && fechaOperacion <= fechaCierreDB) {
      this._snackBar.open(
        `La fecha ${fechaOperacion} no puede ser anterior o igual al último cierre (${fechaCierreDB})`,
        'Ok'
      );
      return;
    }

    let fini = this.util.ConvertirFechaDB(this.fechai)
    this.ngxService.startLoader('load-cont')

    const xAPIConsulta: IAPICore = {
      funcion: environment.xApi.CONSULTAR_APORTE_INICIAL,
      parametros: fini,
      valores: ''
    }

    this.apiService.Ejecutar(xAPIConsulta).subscribe(
      data => {
        const planes = (data.Cuerpo || []).filter(
          (e: any) => parseInt(e.estatus) === 1 && e.monto_apertura && parseFloat(e.monto_apertura) > 0
        )

        if (planes.length === 0) {
          this.ELEMENT_DATA = []
          this.dataSource = new MatTableDataSource<LAporteInicial>([])
          this.blprocesar = true
          this.ngxService.stopLoader('load-cont')
          return
        }

        this.verificarComprobantes(planes)
      },
      (error) => {
        console.error(error)
        this.ngxService.stopLoader('load-cont')
      }
    )
  }

  verificarComprobantes(planes: any[]) {
    let verificados = 0
    this.ELEMENT_DATA = []
    this.planVerificado.clear()

    planes.forEach(plan => {
      const xAPIVerificar: IAPICore = {
        funcion: environment.xApi.CONSULTAR_COMPROBANTE_APORTE_INICIAL,
        parametros: plan.id.toString(),
        valores: ''
      }

      this.apiService.Ejecutar(xAPIVerificar).subscribe(
        data => {
          const total = data?.Cuerpo?.[0]?.total || 0
          this.planVerificado.set(plan.id, total > 0)

          this.ELEMENT_DATA.push({
            id: plan.id,
            codigo: plan.fideicomiso.toUpperCase(),
            plan: plan.observacion,
            monto: plan.monto_apertura
          })

          verificados++
          if (verificados === planes.length) {
            this.dataSource = new MatTableDataSource<LAporteInicial>(this.ELEMENT_DATA)
            this.dataSource.paginator = this.paginator
            this.blprocesar = true
            this.ngxService.stopLoader('load-cont')
          }
        },
        () => {
          this.planVerificado.set(plan.id, false)

          this.ELEMENT_DATA.push({
            id: plan.id,
            codigo: plan.fideicomiso.toUpperCase(),
            plan: plan.observacion,
            monto: plan.monto_apertura
          })

          verificados++
          if (verificados === planes.length) {
            this.dataSource = new MatTableDataSource<LAporteInicial>(this.ELEMENT_DATA)
            this.dataSource.paginator = this.paginator
            this.blprocesar = true
            this.ngxService.stopLoader('load-cont')
          }
        }
      )
    })
  }

  tieneComprobante(idPlan: number): boolean {
    return this.planVerificado.get(idPlan) || false
  }

  Procesar() {
    const fechaCierreDB = this.util.ConvertirFechaDB(this.fechaultimo)
    const fechaOperacion = this.util.ConvertirFechaDB(this.fechai)
    if (fechaCierreDB && fechaOperacion && fechaOperacion <= fechaCierreDB) {
      this._snackBar.open(
        `La fecha ${fechaOperacion} no puede ser anterior o igual al último cierre (${fechaCierreDB})`,
        'Ok'
      );
      return;
    }

    const planesPendientes = this.ELEMENT_DATA.filter(
      e => !this.tieneComprobante(e.id)
    )

    if (planesPendientes.length === 0) {
      this._snackBar.open('Todos los planes ya tienen comprobante APORTE INICIAL', 'Ok')
      return
    }

    Swal.fire({
      title: '¿Procesar aportes iniciales?',
      text: `Se crearán comprobantes para ${planesPendientes.length} plan(es)`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Procesar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.max = planesPendientes.length;
        this.InsertData(0, planesPendientes)
      }
    })
  }

  InsertData(cant: number, planes: LAporteInicial[]) {
    if (cant == planes.length) {
      this.ngxService.stopLoader('load-cont')
      this.ELEMENT_DATA = []
      this.dataSource = new MatTableDataSource<LAporteInicial>([])
      this.dataSource.paginator = this.paginator;
      this.blprocesar = false
      this.apiService.Mensaje('Proceso exitoso', 'Se han creado los comprobantes de aporte inicial', 'success', 'comprobante')
      return
    }
    let monto = planes[cant].monto
    let idplan = planes[cant].id.toString()

    this.Comprobante = {
      plan: planes[cant].id,
      codigo: "",
      descripcion: "APORTE INICIAL",
      detalle: planes[cant].plan,
      fecha_operacion: this.util.ConvertirFechaDB(this.fechai),
      fecha_ejercicio: this.util.ConvertirFechaDB(this.fechai),
      debe: monto,
      haber: monto,
      llave: 'M'
    }

    const xAPIComprobante: IAPICore = {
      funcion: environment.xApi.INSERTAR_COMPROBANTE,
      parametros: '',
      valores: JSON.stringify(this.Comprobante)
    }
    cant++

    this.apiService.Ejecutar(xAPIComprobante).subscribe(
      data => {
        const xAPIAporte: IAPICore = {
          funcion: environment.xApi.INSERTAR_APORTE_INICIAL,
          parametros: data.msj + ',' + idplan,
          valores: ''
        }
        this.apiService.Ejecutar(xAPIAporte).subscribe(
          data => {
            this.InsertData(cant, planes)
          },
          (error) => {
            console.error(error)
            this.ngxService.stopLoader('load-cont')
          }
        )
      },
      (error) => {
        console.error(error)
        this.ngxService.stopLoader('load-cont')
      }
    )
  }
}
