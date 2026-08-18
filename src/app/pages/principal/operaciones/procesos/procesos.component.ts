import { Component, OnInit } from "@angular/core";
import { MatDatepickerInputEvent } from "@angular/material/datepicker";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NgbDateParserFormatter } from "@ng-bootstrap/ng-bootstrap";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { firstValueFrom } from "rxjs";
import { ApiService, IAPICore } from "src/app/services/apicore/api.service";
import { CierreService } from "src/app/services/banfanb/cierre.service";
import { FID_IComprobante } from "src/app/services/banfanb/comprobante.service";
import { UtilService } from "src/app/services/util/util.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";

@Component({
  selector: "app-procesos",
  templateUrl: "./procesos.component.html",
  styleUrls: ["./procesos.component.scss"],
})
export class ProcesosComponent implements OnInit {
  fechau: any;
  fechaultimo: string = "";
  fechai: any;
  fechaf: any;
  fecha_al: string = "";

  lstAsientos: any[] = [];
  lstVencimiento: any[] = [];
  lstCompra = [];
  dias: number = 1;

  // devengo
  acum_debe: number = 0;
  acum_haber: number = 0;

  // Compra
  acum_debec: number = 0;

  // Vencimiento
  acum_debev: number = 0;

  existenMovimientos: boolean;
  mostrarVencimientos: boolean = false;
  mostrarCompras: boolean = false;

  xAPI: IAPICore = {
    funcion: '',
    parametros: '',
    valores: ''
  };

  public Comprobante: FID_IComprobante = {
    plan: 0,
    codigo: "",
    descripcion: "",
    detalle: "",
    fecha_operacion: "",
    fecha_ejercicio: "",
    debe: 0,
    haber: 0,
    llave: "",
  };

  mostrarGenerarComprobante: boolean = false;
  mostrarComprobantes: boolean = false;
  generandoComprobante: boolean = false;
  esConsulta: boolean = false;

  constructor(
    private apiService: ApiService,
    private _snackBar: MatSnackBar,
    private ngxService: NgxUiLoaderService,
    private util: UtilService,
    public formatter: NgbDateParserFormatter,
    private cierre: CierreService
  ) { }

  ngOnInit(): void {
    this.consultarUltimoCierre();
  }

  async consultarUltimoCierre() {
    this.ngxService.startLoader("load-precierre");
    this.fechaultimo = await this.cierre.getUltimoCierre();
    this.fechai = this.cierre.getSiguienteDia(this.fechaultimo);
    this.fechaf = this.fechai;
    this.consultarUltimoCalculo(this.fechai);
    this.ngxService.stopLoader("load-precierre");
  }

  consultarUltimoCalculo(f: any) {
    const fecha = this.util.ConvertirFechaDB(f);
    const xApi: IAPICore = {
      funcion: environment.xApi.CONSULTAR_POSICIONES_INVERSIONES,
      parametros: fecha + "," + fecha,
      valores: "",
    };

    this.apiService.Ejecutar(xApi).subscribe({
      next: (data) => {
        this.existenMovimientos = data.Cuerpo && data.Cuerpo.length > 0;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  CalcularDias(type: string, event: MatDatepickerInputEvent<Date>) {
    this.dias = this.util.CalcuarDiasTranscurridos(this.fechai, this.fechaf) + 1;
  }

  CalcularDiasInterese(fechai, fechaf): number {
    const calculo = this.util.CalcuarDiasTranscurridos(fechai, fechaf) + 1;
    return calculo;
  }

  Consultar() {
    if (this.fechai == undefined || this.fechaf == undefined) {
      this._snackBar.open("Recuerde seleccionar un rango de fechas", "OK");
      return;
    }
    this.esConsulta = true;
    this.limpiarPantalla();
    this.ListarInversiones();
  }

  CalculoPosicion() {
    if (this.fechai == undefined || this.fechaf == undefined) {
      this._snackBar.open("Recuerde seleccionar un rango de fechas", "OK");
      return;
    }
    this.esConsulta = false;
    const fini = this.util.ConvertirFechaDB(this.fechai);
    const usuario = "";
    const llave = "";

    if (!this.existenMovimientos) {
      this.limpiarPantalla();
      this.insertarMovimientos(fini, usuario, llave);
    } else {
      Swal.fire({
        title: "¡Ya ha insertado los movimientos!",
        text: '¿Desea Recalcular?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si',
        cancelButtonText: 'No',
        allowEscapeKey: true,
      }).then((result) => {
        if (result.isConfirmed) {
          this.limpiarPantalla();
          this.eliminarMovimientos(fini);
        }
      });
      this.ngxService.stopLoader("load-cont");
    }
  }

  private insertarMovimientos(fini: string, usuario: string, llave: string) {
    this.ngxService.startLoader("load-cont");
    const api: IAPICore = {
      funcion: environment.xApi.INSERTAR_MOVIMIENTOS_LOTE,
      parametros: fini + ",I," + usuario + "," + llave,
      valores: ""
    };

    this.apiService.Ejecutar(api).subscribe(
      async (data) => {
        this.ListarInversiones();
      },
      (error) => {
        console.error(error);
        this.ngxService.stopLoader("load-cont");
      }
    );
  }

  private eliminarMovimientos(fecha: string) {
    this.ngxService.startLoader("load-cont");
    const api: IAPICore = {
      funcion: environment.xApi.BORRAR_MOVIMIENTOS_LOTE,
      parametros: fecha,
      valores: ""
    };
    this.apiService.Ejecutar(api).subscribe({
      next: (data) => {
        this.eliminarComprobantes(fecha);
      },
      error: (error) => {
        console.error(error);
        this.ngxService.stopLoader("load-cont");
      }
    });
  }

  private eliminarComprobantes(fecha: string) {
    const api: IAPICore = {
      funcion: environment.xApi.ELIMINAR_COMPROBANTES_INVERSIONES,
      parametros: fecha,
      valores: ""
    };
    this.apiService.Ejecutar(api).subscribe({
      next: (data) => {
        this.existenMovimientos = false;
        this.ngxService.stopLoader("load-cont");
        this._snackBar.open("Movimientos eliminados. Procesando de nuevo...", "OK");
        const usuario = "";
        const llave = "";
        this.insertarMovimientos(fecha, usuario, llave);
      },
      error: (error) => {
        console.error(error);
        this.ngxService.stopLoader("load-cont");
      }
    });
  }

  // NO se esta usando
  CalcularInversion() {
    if (this.fechai == undefined || this.fechaf == undefined) {
      this._snackBar.open("Recuerde seleccionar un rango de fechas", "OK");
      return;
    }
    let fini = this.util.ConvertirFechaDB(this.fechai);
    let ffin = this.util.ConvertirFechaDB(this.fechaf);
    let fope = new Date().toISOString().substring(0, 10);
    let usuario = "";
    let llave = "";

    this.ngxService.startLoader("load-cont");
    const api: IAPICore = {
      funcion: environment.xApi.DISTRIBUIR_INTERESES,
      parametros: fope + "," + fini + "," + ffin + "," + usuario + "," + llave,
      valores: ""
    };
    this.apiService.Ejecutar(api).subscribe(
      async (data) => {
        this.mostrarComprobantes = false;
        await this.ngxService.stopLoader("load-cont");
      },
      (error) => {
        console.error(error);
        this.ngxService.stopLoader("load-cont");
      }
    );
  }

  ListarInversiones() {
    if (this.fechai == undefined || this.fechaf == undefined) {
      this._snackBar.open("Recuerde seleccionar un rango de fechas", "OK");
      return;
    }
    let fini = this.util.ConvertirFechaDB(this.fechai);
    let ffin = this.util.ConvertirFechaDB(this.fechaf);

    this.fecha_al = fini;
    this.ngxService.startLoader("load-cont");
    const api: IAPICore = {
      funcion: environment.xApi.CONSULTAR_POSICIONES_INVERSIONES,
      parametros: fini + "," + ffin,
      valores: ""
    };
    this.lstAsientos = [];
    this.acum_debe = 0;
    this.acum_haber = 0;
    this.apiService.Ejecutar(api).subscribe(
      async (data) => {
        this.lstAsientos = data.Cuerpo || [];

        if (this.lstAsientos.length > 0) {
          this.mostrarComprobantes = true;
          this.lstAsientos.forEach((e) => {
            this.acum_debe += parseFloat(e.interes_acumulado);
            this.acum_haber += parseFloat(e.interes_acumulado);
          });
        } else {
          this.mostrarComprobantes = false;
        }
        this.ListarVencimiento();
      },
      (error) => {
        console.error(error);
        this.ngxService.stopLoader("load-cont");
      }
    );
  }

  ListarVencimiento() {
    this.lstVencimiento = [];
    let fini = this.util.ConvertirFechaDB(this.fechai);
    let ffin = this.util.ConvertirFechaDB(this.fechaf);

    this.fecha_al = fini;
    const api: IAPICore = {
      funcion: environment.xApi.CONSULTAR_VENCIMIENTO_INVERSIONES,
      parametros: fini + "," + ffin,
      valores: ""
    };
    this.acum_debev = 0;
    this.apiService.Ejecutar(api).subscribe(
      (data) => {
        this.lstVencimiento = data.Cuerpo || [];

        if (this.lstVencimiento.length > 0) {
          this.mostrarVencimientos = true;
          this.lstVencimiento.forEach((e) => {
            this.acum_debev += this.RendicionCupon(e);
            this.acum_debev += parseFloat(e.valor_nominal);
          });
        } else {
          this.mostrarVencimientos = false;
        }
        this.Listarcompra();
      },
      (error) => {
        console.error(error);
        this.ngxService.stopLoader("load-cont");
      }
    );
  }

  Listarcompra() {
    this.lstCompra = [];
    let fini = this.util.ConvertirFechaDB(this.fechai);
    let ffin = this.util.ConvertirFechaDB(this.fechaf);

    this.fecha_al = fini;
    const api: IAPICore = {
      funcion: environment.xApi.CONSULTAR_COMPRA_INVERSIONES,
      parametros: fini + "," + ffin,
      valores: ""
    };
    this.acum_debec = 0;
    this.apiService.Ejecutar(api).subscribe(
      (data) => {
        this.lstCompra = data.Cuerpo || [];

        if (this.lstCompra.length > 0) {
          this.mostrarCompras = true;
          this.lstCompra.forEach(e => {
            this.acum_debec += e.valor_nominal * 1;
          });
        } else {
          this.mostrarCompras = false;
        }

        this.existenMovimientos = (this.lstAsientos.length > 0 || this.lstVencimiento.length > 0 || this.lstCompra.length > 0);

        if (!this.mostrarComprobantes && !this.mostrarVencimientos && !this.mostrarCompras) {
          this._snackBar.open("No hay devengos, vencimientos ni compras para procesar", "OK");
        }

        if (!this.esConsulta && this.existenMovimientos) {
          this.mostrarGenerarComprobante = true;
        } else {
          this.mostrarGenerarComprobante = false;
        }

        this.ngxService.stopLoader("load-cont");
      },
      (error) => {
        console.error(error);
        this.ngxService.stopLoader("load-cont");
      }
    );
  }

  RendicionCupon(inv): number {
    let rendicion =
      (inv.valor_nominal * inv.tasa_cupon * (inv.plazo_cupon / 100)) /
      inv.base_calculo;
    return parseFloat(rendicion.toFixed(2));
  }

  getCuenta(e) {
    return (
      e.codigo_padre +
      "." +
      e.parte +
      "." +
      e.moneda +
      "." +
      e.nivel_1 +
      "." +
      e.nivel_2 +
      "." +
      e.nivel_3 +
      "." +
      e.nivel_4 +
      "." +
      e.nivel_5
    );
  }

  GenerarComprobante() {
    if (this.generandoComprobante) return;
    this.generandoComprobante = true;
    this.mostrarGenerarComprobante = false;

    let fecha = this.util.ConvertirFechaDB(this.fechai);
    this.ngxService.startLoader("load-cont");

    // Eliminar comprobantes existentes previamente para esta fecha
    const apiDel: IAPICore = {
      funcion: environment.xApi.ELIMINAR_COMPROBANTES_INVERSIONES,
      parametros: fecha,
      valores: ""
    };

    this.apiService.Ejecutar(apiDel).subscribe({
      next: (data) => {
        this.ejecutarGeneracionComprobantes(fecha);
      },
      error: (error) => {
        console.error(error);
        this.generandoComprobante = false;
        this.ngxService.stopLoader("load-cont");
        this._snackBar.open("Error al limpiar comprobantes existentes", "OK");
      }
    });
  }

  async ejecutarGeneracionComprobantes(fecha: string) {
    try {
      // 1. Comprobante Devengo
      if (this.lstAsientos.length > 0) {
        const comprobanteDevengo: FID_IComprobante = {
          plan: 1,
          codigo: this.util.GenerarUnicId(),
          descripcion: `DEVENGO DE INVERSIONES ${this.util.ConvertirFechaHumana(fecha)}`,
          detalle: `DEVENGO DE INVERSIONES ${this.util.ConvertirFechaHumana(fecha)}`,
          fecha_operacion: fecha,
          fecha_ejercicio: fecha,
          debe: this.acum_debe,
          haber: this.acum_haber,
          llave: "M",
        };

        const apiDev: IAPICore = {
          funcion: environment.xApi.INSERTAR_COMPROBANTE,
          parametros: "",
          valores: JSON.stringify(comprobanteDevengo)
        };

        const resDev = await firstValueFrom(this.apiService.Ejecutar(apiDev));
        if (resDev && resDev.msj) {
          const apiDevData: IAPICore = {
            funcion: environment.xApi.INSERTAR_DEVENGO_INVERIONES,
            parametros: resDev.msj + "," + fecha,
            valores: ""
          };
          await firstValueFrom(this.apiService.Ejecutar(apiDevData));
        }
      }

      // 2. Comprobantes Vencimiento
      if (this.lstVencimiento.length > 0) {
        for (const e of this.lstVencimiento) {
          const monto = parseFloat(e.valor_nominal) + this.RendicionCupon(e);
          const vencimiento = {
            plan: 1,
            codigo: this.util.GenerarUnicId(),
            descripcion: `VENCIMIENTO DE INVERSIONES ${this.util.ConvertirFechaHumana(fecha)}`,
            detalle: `VENCIMIENTO DE INVERSIONES ${this.util.ConvertirFechaHumana(fecha)}`,
            fecha_operacion: fecha,
            fecha_ejercicio: fecha,
            debe: monto,
            haber: monto,
            llave: "M",
          };

          const apiVenc: IAPICore = {
            funcion: environment.xApi.INSERTAR_COMPROBANTE,
            parametros: "",
            valores: JSON.stringify(vencimiento)
          };

          const resVenc = await firstValueFrom(this.apiService.Ejecutar(apiVenc));
          if (resVenc && resVenc.msj) {
            const apiVencData: IAPICore = {
              funcion: environment.xApi.INSERTAR_VENCIMIENTO_INVERSIONES,
              parametros: resVenc.msj + "," + fecha + "," + e.codigo,
              valores: ""
            };
            await firstValueFrom(this.apiService.Ejecutar(apiVencData));
          }
        }
      }

      // 3. Comprobantes Compra
      if (this.lstCompra.length > 0) {
        for (const e of this.lstCompra) {
          const compra = {
            plan: 1,
            codigo: this.util.GenerarUnicId(),
            descripcion: `COMPRA DE INVERSIONES ${this.util.ConvertirFechaHumana(fecha)}`,
            detalle: `COMPRA DE INVERSIONES ${this.util.ConvertirFechaHumana(fecha)}`,
            fecha_operacion: fecha,
            fecha_ejercicio: fecha,
            debe: e.valor_nominal,
            haber: e.valor_nominal,
            llave: "M",
          };

          const apiComp: IAPICore = {
            funcion: environment.xApi.INSERTAR_COMPROBANTE,
            parametros: "",
            valores: JSON.stringify(compra)
          };

          const resComp = await firstValueFrom(this.apiService.Ejecutar(apiComp));
          if (resComp && resComp.msj) {
            const apiCompData: IAPICore = {
              funcion: environment.xApi.INSERTAR_COMPRA_INVERSIONES,
              parametros: resComp.msj + "," + fecha + "," + e.codigo,
              valores: ""
            };
            await firstValueFrom(this.apiService.Ejecutar(apiCompData));
          }
        }
      }

      this.ngxService.stopLoader("load-cont");
      this.existenMovimientos = true;
      this.limpiarPantalla();
      this.generandoComprobante = false;

      Swal.fire({
        title: "Comprobantes generados correctamente",
        confirmButtonColor: '#3085d6',
        icon: 'success'
      });
    } catch (error) {
      console.error(error);
      this.ngxService.stopLoader("load-cont");
      this.generandoComprobante = false;
      this._snackBar.open("Error al generar comprobantes", "OK");
    }
  }

  limpiarPantalla() {
    this.mostrarComprobantes = false;
    this.mostrarVencimientos = false;
    this.mostrarCompras = false;
    this.mostrarGenerarComprobante = false;
    this.lstAsientos = [];
    this.lstVencimiento = [];
    this.lstCompra = [];
    this.acum_debe = 0;
    this.acum_haber = 0;
    this.acum_debev = 0;
    this.acum_debec = 0;
  }

  getMoneda(numero: number): string {
    let valor = this.util.ConvertirMoneda(numero);
    let result = valor.toString();
    let cant = result.split(",");

    if (cant.length == 1) result = result + ",00";

    return result;
  }

  InteresDiarioCupon(inv: any, dias: number): number {
    let rendicion =
      ((inv.valor_nominal * inv.tasa_cupon * (1 / 100)) / inv.base_calculo) *
      dias;

    return parseFloat(rendicion.toFixed(2));
  }
}
