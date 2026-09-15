import { Component, OnInit } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { CierreService } from 'src/app/services/banfanb/cierre.service';
import { UtilService } from 'src/app/services/util/util.service';
import {
  InteresesService,
  DiagnosticoPagoIntereses,
  ComprobantePagoIntereses,
  LineaDetalle
} from 'src/app/services/banfanb/intereses.service';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { environment } from 'src/environments/environment';
import { lastValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pagointereses',
  templateUrl: './pagointereses.component.html',
  styleUrls: ['./pagointereses.component.scss']
})
export class PagointeresesComponent implements OnInit {

  public xAPI: IAPICore = { funcion: '', parametros: '', valores: '' };

  // Datos del plan
  public lstPlanes: any[] = [];
  public planSeleccionado: any = null;
  public fechaultimo: string = '';
  public fechaCorte: string = '';

  // Diagnóstico
  public diagnostico: DiagnosticoPagoIntereses | null = null;
  public montoSolicitado: number = 0;

  // Comprobante preparado
  public comprobante: ComprobantePagoIntereses | null = null;

  // Estados
  public procesando: boolean = false;
  public mostrarPreview: boolean = false;

  constructor(
    private apiService: ApiService,
    private ngxService: NgxUiLoaderService,
    private toastr: ToastrService,
    private util: UtilService,
    private cierre: CierreService,
    private interesesService: InteresesService
  ) { }

  async ngOnInit(): Promise<void> {
    try {
      this.fechaultimo = await this.cierre.getUltimoCierre();
      console.log('[PagoIntereses] fechaultimo:', this.fechaultimo);
      await this.listarPlanesActivos();
      console.log('[PagoIntereses] lstPlanes:', this.lstPlanes);
    } catch (e) {
      console.error('[PagoIntereses] Error en ngOnInit:', e);
    }
  }

  async listarPlanesActivos(): Promise<void> {
    this.ngxService.startLoader('load-pagointereses');
    this.xAPI.funcion = environment.xApi.CONSULTAR_PLANES_FIDEICOMISO;
    this.xAPI.parametros = '';
    this.xAPI.valores = '';
    try {
      const data: any = await lastValueFrom(this.apiService.Ejecutar(this.xAPI));
      console.log('[PagoIntereses] API response:', data);
      this.lstPlanes = (data?.Cuerpo || [])
        .filter((p: any) => p.estatus === '1' || p.estatus === '2')
        .map((p: any) => ({
          id: p.id,
          fideicomiso: p.fideicomiso,
          tipo_fideicomiso: p.tipo_fideicomiso,
          observacion: p.observacion
        }));
    } catch (error) {
      console.error('[PagoIntereses] Error al cargar planes:', error);
      this.toastr.error('Error al cargar los planes', 'Pago Intereses');
    } finally {
      this.ngxService.stopLoader('load-pagointereses');
    }
  }

  async seleccionarPlan(plan: any): Promise<void> {
    this.planSeleccionado = plan;
    this.diagnostico = null;
    this.comprobante = null;
    this.montoSolicitado = 0;
    this.mostrarPreview = false;

    if (!plan) return;

    this.ngxService.startLoader('load-pagointereses');
    try {
      this.fechaCorte = this.util.ConvertirFechaDB(new Date());
      this.diagnostico = await this.interesesService.consultarDiagnosticoPagoIntereses(
        plan.id,
        this.util.ConvertirFechaDB(this.fechaultimo),
        this.fechaCorte
      );
    } catch (error) {
      this.toastr.error('Error al consultar diagnóstico', 'Pago Intereses');
    } finally {
      this.ngxService.stopLoader('load-pagointereses');
    }
  }

  prepararComprobante(): void {
    if (!this.diagnostico) {
      this.toastr.warning('Primero consulte el diagnóstico', 'Pago Intereses');
      return;
    }

    if (this.montoSolicitado <= 0) {
      this.toastr.warning('Ingrese un monto mayor a 0', 'Pago Intereses');
      return;
    }

    this.comprobante = this.interesesService.prepararComprobante(
      this.diagnostico,
      this.montoSolicitado
    );

    this.mostrarPreview = true;

    if (!this.comprobante.esValido) {
      this.comprobante.errores.forEach(e => this.toastr.error(e, 'Validación'));
    }
  }

  async confirmarPago(): Promise<void> {
    if (!this.comprobante || !this.comprobante.esValido || !this.planSeleccionado) return;

    const result = await Swal.fire({
      title: 'Confirmar Pago de Rendimientos',
      html: `
        <div style="text-align: left; font-size: 13px;">
          <p><strong>Plan:</strong> ${this.planSeleccionado.observacion}</p>
          <p><strong>Fecha Cierre:</strong> ${this.fechaCorte} → <strong>Aplicación:</strong> ${this.fechaAplicacion}</p>
          <p><strong>Monto:</strong> ${this.util.ConvertirMoneda(this.comprobante.montoSolicitado)}</p>
          <table style="width: 100%; margin-top: 8px;">
            <tr><td>DEBE 734 (Rendimientos Acumulados)</td><td style="text-align: right;">${this.util.ConvertirMoneda(this.comprobante.debe_734)}</td></tr>
            ${this.comprobante.debe_744 > 0 ? `<tr><td>DEBE 744 (Gasto por Pago Intereses)</td><td style="text-align: right;">${this.util.ConvertirMoneda(this.comprobante.debe_744)}</td></tr>` : ''}
            <tr><td>HABER 711 (Disponibilidad)</td><td style="text-align: right;">${this.util.ConvertirMoneda(this.comprobante.haber_711)}</td></tr>
          </table>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, registrar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    this.procesando = true;
    this.ngxService.startLoader('load-pagointereses');

    try {
      const fecha = this.util.ConvertirFechaDB(new Date());
      const descripcion = `PAGO RENDIMIENTOS - ${this.planSeleccionado.observacion} - ${fecha}`;
      const detalle = `Pago de rendimientos plan ${this.planSeleccionado.id}`;

      const idComprobante = await this.interesesService.registrarPagoIntereses(
        this.planSeleccionado.id,
        this.fechaAplicacion,
        this.comprobante.montoSolicitado,
        this.comprobante.lineas,
        descripcion,
        detalle
      );

      this.toastr.success(`Comprobante #${idComprobante} registrado exitosamente`, 'Pago Intereses');
      this.limpiar();
      await this.seleccionarPlan(this.planSeleccionado);
    } catch (error) {
      console.error('Error al registrar pago:', error);
      this.toastr.error('Error al registrar el pago de rendimientos', 'Pago Intereses');
    } finally {
      this.procesando = false;
      this.ngxService.stopLoader('load-pagointereses');
    }
  }

  limpiar(): void {
    this.comprobante = null;
    this.mostrarPreview = false;
    this.montoSolicitado = 0;
  }

  formatearMonto(monto: number): string {
    return this.util.ConvertirMoneda(monto);
  }

  getTotalDebe(): number {
    return this.comprobante?.lineas.reduce((sum, l) => sum + l.debe, 0) || 0;
  }

  getTotalHaber(): number {
    return this.comprobante?.lineas.reduce((sum, l) => sum + l.haber, 0) || 0;
  }

  // Fecha de aplicación contable (cierre + 1 día)
  get fechaAplicacion(): string {
    if (!this.fechaultimo) return '';
    const fechaCierreDB = this.util.ConvertirFechaDB(this.fechaultimo);
    return this.util.SumarDias(fechaCierreDB, 1);
  }

  limpiarNombrePlan(observacion: string): string {
    if (!observacion) return '';
    return observacion.split('|')[0].trim();
  }
}
