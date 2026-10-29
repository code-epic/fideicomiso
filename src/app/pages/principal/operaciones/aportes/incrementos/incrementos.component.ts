import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { LIncremento } from 'src/app/services/banfanb/contabilidad.service';
import { UtilService } from 'src/app/services/util/util.service';
import { environment } from 'src/environments/environment';
import { CierreService } from 'src/app/services/banfanb/cierre.service';
import { PlanGuardService } from 'src/app/services/banfanb/plan-guard.service';

@Component({
  selector: 'app-incrementos',
  templateUrl: './incrementos.component.html',
  styleUrls: ['./incrementos.component.scss']
})
export class IncrementosComponent implements OnInit {

  public Incremento: any
  public blprocesar: boolean = false
  public fechai: any
  public idplan: number = 0
  public fideicomiso: string = ''
  public plan = ''
  public rif = ''

  public observacion = ''

  public monto = ''

  public ELEMENT_DATA: LIncremento[] = [];
  displayedColumns: string[] = [
    "codigo",
    "plan",
    "tipo",
    "monto",
  ];

  dataSource: any;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  public xAPI: IAPICore = {
    funcion: '',
    parametros: ''
  }

  public fechaultimo = ''

  public max: number = 0

  minDate: Date;
  maxDate: Date;

  constructor(private apiService: ApiService,
    private ngxService: NgxUiLoaderService,
    private toastr: ToastrService,
    private util: UtilService,
    private cierre: CierreService,
    private planGuard: PlanGuardService,
    public formatter: NgbDateParserFormatter,) { }

  // Establecer el rango de fechas
  setDateRange(startDate: Date, endDate: Date) {
    this.minDate = startDate;
    this.maxDate = endDate;
  }

  // Manejar el evento de entrada de fecha
  onDateInput(event: MatDatepickerInputEvent<Date>) {
    const selectedDate = event.value;
    if (selectedDate < this.minDate || selectedDate > this.maxDate) {
      // Limpiar la selección si está fuera del rango
      // Puedes mostrar un mensaje o tomar otra acción aquí
    }
  }


  ngOnInit(): void {
    // let d = new Date().toISOString().substring(0, 10).split('-')
    // this.fechaultimo = d[2] + '/' + d[1] + '/' + d[0]
    this.UltimoCierre()
  }

  UltimoCierre() {
    this.xAPI.funcion = environment.xApi.CONSULTAR_ULTIMO_CIERRE
    this.xAPI.parametros = ''
    this.xAPI.valores = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null) {
          let fecha = data.Cuerpo[0].fecha_cierre
          let d = fecha.split('-')
          this.fechaultimo = d[2] + '/' + d[1] + '/' + d[0]
          this.minDate = new Date(this.fechaultimo)
          this.maxDate = new Date(2024, 12, 31)

          // Fecha valor = siguiente día al último cierre
          let fechaCierre = new Date(parseInt(d[0]), parseInt(d[1]) - 1, parseInt(d[2]))
          fechaCierre.setDate(fechaCierre.getDate() + 1)
          this.fechai = fechaCierre
        }
        this.ngxService.stopLoader('load-cont')
      },
      (error) => {
        this.ngxService.stopLoader('load-cont')
        console.error(error)
      }
    )
  }

  Seleccionar() { }

  limpiarFormulario() {
    this.plan = ''
    this.rif = ''
    this.fideicomiso = ''
    this.idplan = 0
    this.observacion = ''
    this.monto = ''
  }

  async ConsultarContrato() {
    if (!this.plan) return
    this.ngxService.startLoader('load-cont')
    this.plan = this.plan.padStart(4, '0')
    this.xAPI.funcion = environment.xApi.CONSULTAR_CONTRATO
    this.xAPI.parametros = this.plan
    this.xAPI.valores = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null && data.length > 0) {
          let Contrato = data[0]
          this.rif = Contrato.rif + '-' + Contrato.razonsocial
          this.fideicomiso = Contrato.plan
          this.idplan = parseInt(this.plan)

          // Verificar estatus del plan desde MySQL
          this.verificarEstatusPlan(this.idplan)
        } else {
          this.toastr.warning('Plan no encontrado', 'Incrementos')
        }
        this.ngxService.stopLoader('load-cont')
      },
      (error) => {
        this.ngxService.stopLoader('load-cont')
        this.toastr.error('Error al consultar el plan', 'Incrementos')
        console.error(error)
      }
    )
  }

  verificarEstatusPlan(idPlan: number) {
    const xAPI: IAPICore = {
      funcion: environment.xApi.CONSULTAR_PLANES_FIDEICOMISO,
      parametros: '',
      valores: ''
    }
    this.apiService.Ejecutar(xAPI).subscribe(
      (data) => {
        if (data?.Cuerpo) {
          const plan = data.Cuerpo.find((p: any) => parseInt(p.id) === idPlan)
          if (plan) {
            const estatus = parseInt(plan.estatus) || 0
            if (estatus === 3 || estatus === 4) {
              const nombre = estatus === 3 ? 'FINIQUITADO' : 'CERRADO'
              this.toastr.error(`Este plan está ${nombre}. No se permiten incrementos.`, 'Plan bloqueado')
              this.limpiarFormulario()
            } else {
              this.ConsultarObservacion(idPlan)
            }
          }
        }
      },
      (error) => console.error(error)
    )
  }

  ConsultarObservacion(idplan: number) {
    this.xAPI.funcion = environment.xApi.CONSULTAR_PLANES_FIDEICOMISO
    this.xAPI.parametros = ''
    this.xAPI.valores = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null && data.Cuerpo && data.Cuerpo.length > 0) {
          const p = data.Cuerpo.find((x: any) => Number(x.id) === idplan)
          this.observacion = p ? p.observacion : ''
        }
      },
      (error) => console.error(error)
    )
  }

  async Add() {
    // Validar que la fecha no sea anterior o igual al último cierre
    const fechaCierreDB = this.util.ConvertirFechaDB(this.fechaultimo)
    const fechaOperacion = this.util.ConvertirFechaDB(this.fechai)
    if (fechaCierreDB && fechaOperacion && fechaOperacion <= fechaCierreDB) {
      this.toastr.error(
        `La fecha ${fechaOperacion} no puede ser anterior o igual al último cierre (${fechaCierreDB})`,
        'Error'
      );
      return;
    }

    // Verificar si el plan está bloqueado
    const bloqueado = await this.planGuard.planBloqueado(this.idplan)
    if (bloqueado) {
      this.toastr.error('Este plan está finiquitado o cerrado. No se permiten incrementos.', 'Plan bloqueado')
      this.limpiarFormulario()
      return
    }

    this.ELEMENT_DATA.push({
      id: this.idplan,
      codigo: this.plan,
      tipo: this.fideicomiso.toUpperCase(),
      plan: this.observacion || this.rif.toUpperCase(),
      monto: parseFloat(this.monto) || 0,
      fecha: this.util.ConvertirFechaDB(this.fechai)
    })

    this.dataSource = new MatTableDataSource<LIncremento>(this.ELEMENT_DATA)
    this.dataSource.paginator = this.paginator;

    this.monto = ''
    this.fechai = this.cierre.getSiguienteDia(this.fechaultimo)
    this.rif = ''
    this.observacion = ''
    this.plan = ''
    this.blprocesar = true
  }


  Procesar() {
    this.max = this.ELEMENT_DATA.length
    this.insertData(0)
  }

  close() {
    this.ngxService.stopLoader('load-cont')
    this.ELEMENT_DATA = []
    this.dataSource = new MatTableDataSource<LIncremento>(
      this.ELEMENT_DATA
    );
    this.dataSource.paginator = this.paginator;
    this.blprocesar = false
    this.apiService.Mensaje('Proceso exitoso', 'Se han creado los comprobantes', 'success', 'comprobante')
  }

  insertData(cant: number) {

    if (cant == this.max) {
      this.close()
      return
    }
    let monto = this.ELEMENT_DATA[cant].monto
    let idplan = this.ELEMENT_DATA[cant].id
    let fecha = this.ELEMENT_DATA[cant].fecha
    let Comprobante = {
      plan: idplan,
      codigo: this.ELEMENT_DATA[cant].codigo,
      descripcion: "INCREMENTO DE CAPITAL",
      detalle: `${this.ELEMENT_DATA[cant].plan}`,
      fecha_operacion: fecha,
      fecha_ejercicio: fecha,
      debe: monto,
      haber: monto,
      llave: 'M'
    }
    
    this.xAPI.funcion = environment.xApi.INSERTAR_COMPROBANTE
    this.xAPI.parametros = ''
    this.xAPI.valores = JSON.stringify(Comprobante)
    cant++

    this.apiService.Ejecutar(this.xAPI).subscribe(
      data => {

        this.xAPI.funcion = environment.xApi.INSERTAR_INCREMENTO
        this.xAPI.parametros = `${data.msj},${monto},${fecha},${idplan}`,
          this.xAPI.valores = ''
        this.apiService.Ejecutar(this.xAPI).subscribe(
          data => {
            this.insertData(cant)            
          },
          (error) => {
            console.error(error)
            this.ngxService.stopLoader('load-cont')
          }
        )
        // this.InsertData(cant)
      },
      (error) => {
        console.error(error)
        this.ngxService.stopLoader('load-cont')
      }
    )


  }



  getMoneda(e): string {
    let data = this.util.ConvertirMoneda(e)
    return data
  }

}
