import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { UtilService } from 'src/app/services/util/util.service';
import { ImprimirService } from 'src/app/services/util/imprimir.service';
import { environment } from 'src/environments/environment';
import * as XLSX from 'xlsx';

interface CuentaItem {
  id: number;
  codigo: string;
  descripcion: string;
  aumenta: string;
}

interface FilaAuxiliar {
  tipo: 'SALDO_ANTERIOR' | 'MOVIMIENTO' | 'TOTAL_AUXILIAR' | 'TOTAL_BALANCE' | 'DIFERENCIA' | 'RESUMEN_MES';
  fecha: string;
  descripcion: string;
  debe?: number;
  haber?: number;
  saldoAuxiliar: number;
  planNombre?: string;
  esNegrita?: boolean;
}

interface ResultadoAuxiliar {
  encabezado: {
    id: number;
    codigo: string;
    nombre: string;
    aumenta: string;
  };
  saldoAnterior: {
    fecha: string;
    monto: number;
  };
  movimientos: any[];
  totalBalance: {
    fecha: string;
    monto: number;
  };
}

@Component({
  selector: 'app-auxiliar',
  templateUrl: './auxiliar.component.html',
  styleUrls: ['./auxiliar.component.css']
})
export class AuxiliarComponent implements OnInit {

  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
  };

  public fechaInicio: any;
  public fechaFin: any;
  public cuentaControl = new FormControl();
  public cuentaSeleccionada: CuentaItem | null = null;
  public modoReporte: 'abierto' | 'resumido' = 'abierto';
  public plan: string = '%';

  public lstCuentas: CuentaItem[] = [];
  public lstPlanesFideicomiso: any[] = [];
  public filteredCuentas: Observable<CuentaItem[]>;

  public mostrarResultados = false;
  public cargando = false;

  public filas: FilaAuxiliar[] = [];
  public totalAuxiliar = 0;
  public totalBalance = 0;
  public diferencia = 0;

  constructor(
    private apiService: ApiService,
    private ngxService: NgxUiLoaderService,
    private toastrService: ToastrService,
    private util: UtilService,
    private _imprimir: ImprimirService
  ) { }

  ngOnInit(): void {
    this.inicializarFechas();
    this.cargarCuentas();
    this.cargarPlanes();

    this.filteredCuentas = this.cuentaControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        if (!value || value === '') {
          this.cuentaSeleccionada = null;
        }
        return this._filterCuentas(value);
      })
    );
  }

  inicializarFechas() {
    const hoy = new Date();
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    this.fechaInicio = inicio;
    this.fechaFin = fin;
  }

  cargarCuentas() {
    this.xAPI.funcion = environment.xApi.CONSULTAR_CUENTAS;
    this.xAPI.parametros = '';
    this.xAPI.valores = '';
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data: any) => {
        if (data.Cuerpo) {
          this.lstCuentas = data.Cuerpo
            .filter((c: any) => parseInt(c.totalizadora) === 0)
            .map((c: any) => ({
              id: c.id,
              codigo: `${c.codigo_padre}.${c.parte}.${c.moneda}.${c.nivel_1}.${c.nivel_2}.${c.nivel_3}.${c.nivel_4}.${c.nivel_5}`,
              descripcion: c.descripcion,
              aumenta: c.aumenta
            }));
        }
      },
      (error) => console.error('Error cargando cuentas', error)
    );
  }

  cargarPlanes() {
    const xAPI: IAPICore = {
      funcion: 'FID_CPlanesFideicomiso',
      parametros: '',
      valores: ''
    };
    this.apiService.Ejecutar(xAPI).subscribe({
      next: (data: any) => {
        this.lstPlanesFideicomiso = data.Cuerpo || [];
      },
      error: (err) => console.error('Error cargando planes', err)
    });
  }

  private _filterCuentas(value: string): CuentaItem[] {
    if (!value) return this.lstCuentas.slice(0, 50);
    const filterValue = value.toLowerCase();
    return this.lstCuentas.filter(c =>
      c.codigo.toLowerCase().includes(filterValue) ||
      c.descripcion.toLowerCase().includes(filterValue)
    ).slice(0, 50);
  }

  onCuentaSelected(event: any) {
    const selected = this.lstCuentas.find(c => c.codigo === event.option.value);
    this.cuentaSeleccionada = selected || null;
  }

  displayCuenta(valor: string): string {
    if (!valor) return '';
    const codigo = valor.includes(' - ') ? valor.split(' - ')[0] : valor;
    const c = this.lstCuentas.find(x => x.codigo === codigo);
    return c ? `${c.codigo} - ${c.descripcion}` : valor;
  }

  private formatearFechaDB(fecha: any): string {
    if (!fecha) return '';
    if (typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) return fecha;
    const d = new Date(fecha);
    const anio = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  private ultimoDiaMes(anio: number | string, mes: number | string): string {
    const d = new Date(Number(anio), Number(mes) + 1, 0);
    return this.formatearFechaDB(d);
  }

  Consultar() {
    if (!this.cuentaSeleccionada) {
      this.toastrService.warning('Debe seleccionar una cuenta contable', 'Auxiliar Contable');
      return;
    }
    if (!this.fechaInicio || !this.fechaFin) {
      this.toastrService.warning('Debe seleccionar fecha de inicio y fin', 'Auxiliar Contable');
      return;
    }

    const fInicio = this.formatearFechaDB(this.fechaInicio);
    const fFin = this.formatearFechaDB(this.fechaFin);

    if (fInicio > fFin) {
      this.toastrService.warning('La fecha de inicio no puede ser mayor a la fecha fin', 'Auxiliar Contable');
      return;
    }

    this.ngxService.startLoader('load-cont');
    this.cargando = true;

    this.xAPI.funcion = environment.xApi.CONSULTAR_AUXILIAR_CONTABLE;
    this.xAPI.parametros = `${fInicio},${fFin},${this.cuentaSeleccionada.id},${this.plan || '%'}`;
    this.xAPI.valores = '';

    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data: any) => {
        this.ngxService.stopLoader('load-cont');
        this.cargando = false;

        if (!data.Cuerpo || data.Cuerpo.length === 0) {
          this.toastrService.warning('No se encontraron datos para los parámetros seleccionados', 'Auxiliar Contable');
          this.mostrarResultados = false;
          return;
        }

        this.procesarDatos(data.Cuerpo);
        this.mostrarResultados = true;
      },
      (error) => {
        this.ngxService.stopLoader('load-cont');
        this.cargando = false;
        console.error('Error consultando auxiliar contable', error);
        this.toastrService.error('Error al consultar el auxiliar contable', 'Auxiliar Contable');
      }
    );
  }

  procesarDatos(datos: any[]) {
    const encabezado = datos.find(r => r.tipo === 'ENCABEZADO');
    const saldoAnteriorRow = datos.find(r => r.tipo === 'SALDO_ANTERIOR');
    const totalBalanceRow = datos.find(r => r.tipo === 'TOTAL_BALANCE');
    const movimientosRaw = datos.filter(r => r.tipo === 'MOVIMIENTO');

    const cuentaInfo = {
      id: encabezado?.id_cuenta || 0,
      codigo: encabezado?.codigo_cuenta || '',
      nombre: encabezado?.nombre_cuenta || '',
      aumenta: encabezado?.aumenta || 'DEBE'
    };

    const aumentaDebe = (cuentaInfo.aumenta || 'DEBE').toUpperCase() === 'DEBE';

    const saldoAnteriorBD = {
      fecha: saldoAnteriorRow?.fecha_operacion || '',
      monto: this.round2(parseFloat(saldoAnteriorRow?.saldo) || 0)
    };

    // La fecha mostrada del SALDO ANTERIOR es el día inmediatamente anterior a fecha_inicio
    const fInicioStr = this.formatearFechaDB(this.fechaInicio);
    const saldoAnterior = {
      fecha: this.util.SumarDias(fInicioStr, -1),
      monto: saldoAnteriorBD.monto
    };

    const totalBalance = {
      fecha: totalBalanceRow?.fecha_operacion || '',
      monto: this.round2(parseFloat(totalBalanceRow?.saldo) || 0)
    };

    this.filas = [];

    // Fila SALDO ANTERIOR
    if (saldoAnterior.fecha) {
      this.filas.push({
        tipo: 'SALDO_ANTERIOR',
        fecha: saldoAnterior.fecha,
        descripcion: 'SALDO ANTERIOR',
        saldoAuxiliar: saldoAnterior.monto
      });
    }

    // Procesar movimientos
    const movimientos = movimientosRaw.map(m => {
      const debe = this.round2(parseFloat(m.debe) || 0);
      const haber = this.round2(parseFloat(m.haber) || 0);
      const signed = this.round2(aumentaDebe ? (debe - haber) : (haber - debe));
      return {
        fecha: m.fecha_operacion,
        descripcion: m.descripcion || '',
        debe,
        haber,
        signed,
        planNombre: m.plan_nombre || ''
      };
    });

    if (this.modoReporte === 'abierto') {
      movimientos.forEach(m => {
        this.filas.push({
          tipo: 'MOVIMIENTO',
          fecha: m.fecha,
          descripcion: m.descripcion,
          debe: m.debe,
          haber: m.haber,
          saldoAuxiliar: m.signed,
          planNombre: m.planNombre
        });
      });
    } else {
      // Modo resumido: agrupar por mes
      const grupos = new Map<string, { fecha: string; descripcion: string; total: number }>();
      movimientos.forEach(m => {
        const d = new Date(m.fecha);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!grupos.has(key)) {
          const [anio, mes] = key.split('-').map(Number);
          const ultimoDia = this.ultimoDiaMes(anio, mes - 1);
          const nombreMes = new Date(anio, mes - 1, 1).toLocaleDateString('es-VE', { month: 'long', year: 'numeric' }).toUpperCase();
          grupos.set(key, { fecha: ultimoDia, descripcion: `MOVIMIENTOS ${nombreMes}`, total: 0 });
        }
        grupos.get(key).total = this.round2(grupos.get(key).total + m.signed);
      });

      Array.from(grupos.values())
        .sort((a, b) => a.fecha.localeCompare(b.fecha))
        .forEach(g => {
          this.filas.push({
            tipo: 'RESUMEN_MES',
            fecha: g.fecha,
            descripcion: g.descripcion,
            saldoAuxiliar: g.total
          });
        });
    }

    // Calcular totales
    this.totalAuxiliar = this.round2(this.filas.reduce((sum, f) => sum + (f.saldoAuxiliar || 0), 0));
    this.totalBalance = totalBalance.monto;
    this.diferencia = this.round2(this.totalAuxiliar - this.totalBalance);

    // Filas de totales
    this.filas.push({
      tipo: 'TOTAL_AUXILIAR',
      fecha: '',
      descripcion: 'TOTAL AUXILIAR',
      saldoAuxiliar: this.totalAuxiliar,
      esNegrita: true
    });

    this.filas.push({
      tipo: 'TOTAL_BALANCE',
      fecha: totalBalance.fecha,
      descripcion: 'TOTAL BALANCE',
      saldoAuxiliar: this.totalBalance,
      esNegrita: true
    });

    this.filas.push({
      tipo: 'DIFERENCIA',
      fecha: '',
      descripcion: 'DIFERENCIA',
      saldoAuxiliar: this.diferencia,
      esNegrita: true
    });
  }

  round2(valor: number): number {
    return Math.round((valor + Number.EPSILON) * 100) / 100;
  }

  getMoneda(numero: number): string {
    return this.util.ConvertirMoneda(numero);
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '';
    return this.util.ConvertirFechaHumana(fecha);
  }

  getNombreCuenta(): string {
    return this.cuentaSeleccionada ? this.cuentaSeleccionada.descripcion : '';
  }

  getCodigoCuenta(): string {
    return this.cuentaSeleccionada ? this.cuentaSeleccionada.codigo : '';
  }

  getFechaCorte(): string {
    return this.formatFecha(this.formatearFechaDB(this.fechaFin));
  }

  mostrarColumnaPlan(): boolean {
    return this.plan === '%';
  }

  getNombrePlan(): string {
    if (this.plan === '%') return 'TODOS LOS PLANES';
    const p = this.lstPlanesFideicomiso.find(x => x.id == this.plan);
    return p ? p.observacion : '';
  }

  // ==================== IMPRESIÓN ====================

  imprimir() {
    const cuentaNombre = this.getNombreCuenta();
    const cuentaCodigo = this.getCodigoCuenta();
    const fechaCorte = this.getFechaCorte();
    const conPlan = this.mostrarColumnaPlan();

    const filasHTML = this.filas.map(f => {
      const esTotal = f.tipo === 'TOTAL_AUXILIAR' || f.tipo === 'TOTAL_BALANCE' || f.tipo === 'DIFERENCIA';
      const estiloFila = esTotal
        ? 'background: #F1F5F9; font-weight: 700; border-top: 2px solid #1E293B;'
        : 'border-bottom: 1px solid #E4E5E7;';
      const celdaPlan = conPlan
        ? `<td style="padding: 8px 12px; font-size: 11px; text-align: left;">${f.planNombre || ''}</td>`
        : '';
      return `
        <tr style="${estiloFila}">
          <td style="padding: 8px 12px; font-size: 11px; text-align: center;">${f.fecha ? this.formatFecha(f.fecha) : ''}</td>
          <td style="padding: 8px 12px; font-size: 11px; text-align: left;">${f.descripcion}</td>
          ${celdaPlan}
          <td style="padding: 8px 12px; font-size: 11px; text-align: right; ${f.saldoAuxiliar < 0 ? 'color: #dc2626;' : ''}">${this.getMoneda(f.saldoAuxiliar)}</td>
        </tr>
      `;
    }).join('');

    const anchoFecha = conPlan ? '14%' : '18%';
    const anchoDesc = conPlan ? '47%' : '57%';
    const anchoPlan = conPlan ? '18%' : '';

    const contenido = `
      <div style="font-family: 'IBM Plex Sans', sans-serif; color: #0F172A; padding: 20px 24px;">

        <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 14px; border-bottom: 3px solid #1E293B; margin-bottom: 18px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <img src="./assets/img/brand/logo.png" alt="Logo" style="height: 48px;">
            <div>
              <p style="margin: 0; font-size: 13px; font-weight: 700; color: #1E293B; letter-spacing: 0.3px;">BANCO DE LA FUERZA ARMADA NACIONAL BOLIVARIANA</p>
              <p style="margin: 2px 0 0 0; font-size: 10px; color: #64748B; letter-spacing: 1px; text-transform: uppercase;">Dirección de Fideicomiso</p>
            </div>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 9px; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.5px;">Fecha de impresión</p>
            <p style="margin: 2px 0 0 0; font-size: 11px; font-weight: 600; color: #334155;">${this.formatFecha(new Date().toISOString())}</p>
          </div>
        </div>

        <div style="text-align: center; margin-bottom: 18px;">
          <p style="margin: 0; font-size: 16px; font-weight: 700; color: #1E293B;">AUXILIAR CONTABLE</p>
          <p style="margin: 6px 0 0 0; font-size: 14px; font-weight: 600; color: #1E293B;">${cuentaNombre}</p>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748B;">${cuentaCodigo}</p>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748B;">${this.getNombrePlan()} - AL ${fechaCorte}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; border: 1px solid #E4E5E7; margin-bottom: 20px;">
          <thead>
            <tr style="background: #1E293B; color: #fff;">
              <th style="padding: 10px 12px; font-size: 11px; text-align: center; width: ${anchoFecha};">Fecha Registro</th>
              <th style="padding: 10px 12px; font-size: 11px; text-align: left; width: ${anchoDesc};">Descripción</th>
              ${conPlan ? `<th style="padding: 10px 12px; font-size: 11px; text-align: left; width: ${anchoPlan};">Plan</th>` : ''}
              <th style="padding: 10px 12px; font-size: 11px; text-align: right; width: 25%;">Saldo Auxiliar</th>
            </tr>
          </thead>
          <tbody>
            ${filasHTML}
          </tbody>
        </table>

        <div style="margin-top: 24px; font-size: 9px; color: #64748B;">
          <p style="margin: 0;">Código: VPCO-FO-001-0/09-14</p>
        </div>

      </div>
    `;

    this._imprimir.createHtmlSectionForPrint(contenido, 0);
  }

  // ==================== EXCEL ====================

  exportarExcel() {
    const cuentaNombre = this.getNombreCuenta();
    const cuentaCodigo = this.getCodigoCuenta();
    const fechaCorte = this.getFechaCorte();
    const conPlan = this.mostrarColumnaPlan();

    const wb = XLSX.utils.book_new();
    const wsData: any[][] = [];

    // Título e información de cabecera
    wsData.push(['', '', '', '', '', '', '', '', '', '', '', '']);
    wsData.push(['', '', '', '', 'AUXILIAR CONTABLE', '', '', '', '', '', '', '']);
    wsData.push(['', '', '', '', '', '', '', '', '', '', '', '']);
    wsData.push(['', 'Dirección de', '', 'FIDEICOMISO', '', '', '', '', '', '', '', '']);
    wsData.push(['', '', '', '', '', '', '', '', '', '', '', '']);
    wsData.push(['', '', '', '', cuentaNombre.toUpperCase(), '', '', '', '', '', '', '']);
    wsData.push(['', '', '', '', cuentaCodigo, '', '', '', '', '', '', '']);
    wsData.push(['', '', '', '', '', this.getNombrePlan() + ' - AL ' + fechaCorte, '', '', '', '', '', '']);
    wsData.push(['', '', '', '', '', '', '', '', '', '', '', '']);

    // Cabecera de tabla
    if (conPlan) {
      wsData.push(['', 'Fecha Registro', '', 'Descripción', '', '', '', 'Plan', '', 'Saldo Auxiliar', '', '']);
    } else {
      wsData.push(['', 'Fecha Registro', '', 'Descripción', '', '', '', '', '', 'Saldo Auxiliar', '', '']);
    }

    // Filas
    this.filas.forEach(f => {
      const celdaPlan = conPlan ? (f.planNombre || '') : '';
      wsData.push([
        '',
        f.fecha ? this.formatFecha(f.fecha) : '',
        '',
        f.descripcion,
        '', '', '',
        celdaPlan, '',
        f.saldoAuxiliar,
        '', ''
      ]);
    });

    // Código de formulario
    wsData.push(['', '', '', '', '', '', '', '', '', '', '', '']);
    wsData.push(['', 'Código: VPCO-FO-001-0/09-14', '', '', '', '', '', '', '', '', '', '']);

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Anchos de columna
    ws['!cols'] = [
      { wch: 2 },   // A
      { wch: 16 },  // B Fecha Registro
      { wch: 2 },   // C
      { wch: 45 },  // D Descripción
      { wch: 2 },   // E
      { wch: 2 },   // F
      { wch: 2 },   // G
      { wch: 25 },  // H Plan
      { wch: 2 },   // I
      { wch: 18 },  // J Saldo Auxiliar
      { wch: 2 },   // K
      { wch: 2 }    // L
    ];

    // Fusiones
    ws['!merges'] = [
      { s: { r: 1, c: 4 }, e: { r: 1, c: 7 } },       // AUXILIAR CONTABLE
      { s: { r: 3, c: 3 }, e: { r: 3, c: 5 } },       // FIDEICOMISO
      { s: { r: 5, c: 4 }, e: { r: 5, c: 7 } },       // Nombre cuenta
      { s: { r: 6, c: 4 }, e: { r: 6, c: 7 } },       // Código cuenta
      { s: { r: 7, c: 5 }, e: { r: 7, c: 9 } },       // Plan/fecha corte
      { s: { r: 9, c: 1 }, e: { r: 9, c: 2 } },       // Fecha Registro header
      { s: { r: 9, c: 3 }, e: { r: 9, c: 6 } },       // Descripción header
    ];
    if (conPlan) {
      ws['!merges'].push({ s: { r: 9, c: 7 }, e: { r: 9, c: 8 } }); // Plan header
    }
    ws['!merges'].push({ s: { r: 9, c: 9 }, e: { r: 9, c: 11 } }); // Saldo Auxiliar header

    // Aplicar estilos básicos
    const headerStyle = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '1E293B' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    };
    const titleStyle = { font: { bold: true, sz: 16 }, alignment: { horizontal: 'center' } };
    const boldStyle = { font: { bold: true } };
    const rightStyle = { alignment: { horizontal: 'right' } };
    const numberStyle = { numFmt: '#,##0.00', alignment: { horizontal: 'right' } };

    // Título
    ws['E2'].s = titleStyle;
    ws['D4'].s = { font: { bold: true }, alignment: { horizontal: 'left' } };
    ws['E6'].s = { font: { bold: true, sz: 12 }, alignment: { horizontal: 'center' } };
    ws['E7'].s = { alignment: { horizontal: 'center' } };
    ws['F8'].s = { alignment: { horizontal: 'center' } };

    // Cabecera tabla
    ws['B10'].s = headerStyle;
    ws['D10'].s = headerStyle;
    if (conPlan) {
      ws['H10'].s = headerStyle;
    }
    ws['J10'].s = headerStyle;

    // Filas de datos
    const filaInicio = 10;
    this.filas.forEach((f, idx) => {
      const r = filaInicio + 1 + idx;
      const esTotal = f.tipo === 'TOTAL_AUXILIAR' || f.tipo === 'TOTAL_BALANCE' || f.tipo === 'DIFERENCIA';
      ws[`D${r + 1}`].s = esTotal ? boldStyle : {};
      ws[`J${r + 1}`].s = numberStyle;
      if (esTotal) {
        ws[`B${r + 1}`].s = boldStyle;
      }
    });

    XLSX.utils.book_append_sheet(wb, ws, 'Auxiliar Contable');

    const nombreArchivo = `auxiliar_contable_${cuentaCodigo.replace(/\./g, '_')}_${this.formatearFechaDB(this.fechaInicio)}_${this.formatearFechaDB(this.fechaFin)}.xlsx`;
    XLSX.writeFile(wb, nombreArchivo);
  }
}
