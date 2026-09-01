import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { LIncremento } from 'src/app/services/banfanb/contabilidad.service';
import { UtilService } from 'src/app/services/util/util.service';
import { environment } from 'src/environments/environment';
import { PlanGuardService } from 'src/app/services/banfanb/plan-guard.service';

@Component({
  selector: 'app-retiros',
  templateUrl: './retiros.component.html',
  styleUrls: ['./retiros.component.scss']
})
export class RetirosComponent implements OnInit {
  public blprocesar: boolean = false
  public fechai: any
  public idplan: number = 0
  public fideicomiso: string = ''
  public plan = ''
  public rif = ''
  public observacion = ''
  public monto = ''
  public fechaultimo = ''
  public max: number = 0

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

  constructor(
    private apiService: ApiService,
    private ngxService: NgxUiLoaderService,
    private toastr: ToastrService,
    private util: UtilService,
    private planGuard: PlanGuardService,
  ) { }

  ngOnInit(): void {
    this.UltimoCierre()
  }

  UltimoCierre() {
    this.xAPI.funcion = environment.xApi.CONSULTAR_ULTIMO_CIERRE
    this.xAPI.parametros = ''
    this.xAPI.valores = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null && data.Cuerpo && data.Cuerpo.length > 0) {
          let fecha = data.Cuerpo[0].fecha_cierre
          let d = fecha.split('-')
          this.fechaultimo = d[2] + '/' + d[1] + '/' + d[0]

          // Fecha valor = siguiente día al último cierre
          let fechaCierre = new Date(parseInt(d[0]), parseInt(d[1]) - 1, parseInt(d[2]))
          fechaCierre.setDate(fechaCierre.getDate() + 1)
          this.fechai = fechaCierre
        }
      },
      (error) => {
        console.error(error)
      }
    )
  }

  ConsultarContrato() {
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
          this.verificarEstatusPlan(this.idplan)
        } else {
          this.toastr.warning('Plan no encontrado', 'Retiros')
        }
        this.ngxService.stopLoader('load-cont')
      },
      (error) => {
        this.ngxService.stopLoader('load-cont')
        this.toastr.error('Error al consultar el plan', 'Retiros')
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
              this.toastr.error(`Este plan está ${nombre}. No se permiten retiros.`, 'Plan bloqueado')
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

  limpiarFormulario() {
    this.plan = ''
    this.rif = ''
    this.fideicomiso = ''
    this.idplan = 0
    this.observacion = ''
    this.monto = ''
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
    if (!this.plan) {
      this.toastr.warning('Debe ingresar un plan', 'Retiros')
      return
    }
    if (!this.monto || parseFloat(this.monto) <= 0) {
      this.toastr.warning('Debe ingresar un monto válido', 'Retiros')
      return
    }
    if (!this.fechai) {
      this.toastr.warning('Debe seleccionar una fecha', 'Retiros')
      return
    }

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
      this.toastr.error('Este plan está finiquitado o cerrado. No se permiten retiros.', 'Plan bloqueado')
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
    this.fechai = ''
    this.rif = ''
    this.observacion = ''
    this.fideicomiso = ''
    this.plan = ''
    this.idplan = 0
    this.blprocesar = true
  }

  Cancel() {
    this.ELEMENT_DATA = []
    this.dataSource = new MatTableDataSource<LIncremento>(this.ELEMENT_DATA)
    this.blprocesar = false
    this.monto = ''
    this.fechai = ''
    this.rif = ''
    this.observacion = ''
    this.fideicomiso = ''
    this.plan = ''
    this.idplan = 0
  }

  Procesar() {
    if (this.ELEMENT_DATA.length === 0) {
      this.toastr.warning('No hay retiros para procesar', 'Retiros')
      return
    }
    this.ngxService.startLoader('load-cont')
    this.max = this.ELEMENT_DATA.length
    this.insertData(0)
  }

  close() {
    this.ngxService.stopLoader('load-cont')
    this.ELEMENT_DATA = []
    this.dataSource = new MatTableDataSource<LIncremento>(this.ELEMENT_DATA)
    this.dataSource.paginator = this.paginator
    this.blprocesar = false
    this.toastr.success('Retiros procesados exitosamente', 'Retiros')
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
      descripcion: "RETIRO DE CAPITAL",
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
        this.xAPI.funcion = environment.xApi.INSERTAR_RETIROS
        this.xAPI.parametros = `${data.msj},${monto},${fecha},${idplan}`
        this.xAPI.valores = ''
        this.apiService.Ejecutar(this.xAPI).subscribe(
          data => {
            this.insertData(cant)
          },
          (error) => {
            console.error(error)
            this.ngxService.stopLoader('load-cont')
            this.toastr.error('Error al registrar el retiro', 'Retiros')
          }
        )
      },
      (error) => {
        console.error(error)
        this.ngxService.stopLoader('load-cont')
        this.toastr.error('Error al crear el comprobante', 'Retiros')
      }
    )
  }

  getMoneda(e): string {
    return this.util.ConvertirMoneda(e)
  }
}
