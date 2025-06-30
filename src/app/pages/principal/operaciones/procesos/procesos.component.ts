import { Component, OnInit } from "@angular/core";
import { MatDatepickerInputEvent } from "@angular/material/datepicker";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NgbDateParserFormatter } from "@ng-bootstrap/ng-bootstrap";
import { NgxUiLoaderService } from "ngx-ui-loader";
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

  existenMovimientos: boolean

  xAPI: IAPICore = {
    funcion: '',
    parametros: '',
    valores: ''
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
    llave: "",
  };

  mostrarGenerarComprobante: boolean = false;
  mostrarComprobantes: boolean = false

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
    this.fechaultimo = await this.cierre.getUltimoCierre()
    this.fechai = this.cierre.getSiguienteDia(this.fechaultimo);
    this.fechaf = this.fechai
    this.consultarUltimoCalculo(this.fechai)
    this.ngxService.stopLoader("load-precierre");
  }

  consultarUltimoCalculo(f: any){
    const fecha = this.util.ConvertirFechaDB(f)
    const xApi: IAPICore = {
      funcion: environment.xApi.ULTIMO_COMPROBANTE,
      parametros: fecha,
      valores: "",
    }

    this.apiService.Ejecutar(xApi).subscribe({
      next: (data) => {
        this.existenMovimientos = data.Cuerpo.length > 0
      },
      error: (error) => {
        console.error(error)
      }
    })
  }

  CalcularDias(type: string, event: MatDatepickerInputEvent<Date>) {
    this.dias = this.util.CalcuarDiasTranscurridos(this.fechai, this.fechaf) + 1;
  }

  CalcularDiasInterese(fechai, fechaf): number {
    const calculo = this.util.CalcuarDiasTranscurridos(fechai, fechaf) + 1;
    return calculo;
  }

  CalculoPosicion() {
    if (this.fechai == undefined || this.fechaf == undefined) {
      this._snackBar.open("Recuerde seleccionar un rango de fechas", "OK");
      return;
    }
    const fini = this.util.ConvertirFechaDB(this.fechai);
    const usuario = "";
    const llave = "";

    if (!this.existenMovimientos) {
      this.existenMovimientos = true
      this.insertarMovimientos(fini, usuario, llave)
    } 
    else {
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
          this.eliminarMovimientos(fini)
        }
      })
      this.ngxService.stopLoader("load-cont");
    }
  }

  private insertarMovimientos(fini: string, usuario: string, llave: string){
    this.ngxService.startLoader("load-cont");
    this.xAPI.funcion = environment.xApi.INSERTAR_MOVIMIENTOS_LOTE
    this.xAPI.parametros = fini + ",I," + usuario + "," + llave;

    this.xAPI.valores = "";

    this.apiService.Ejecutar(this.xAPI).subscribe(
      async (data) => {
        this.mostrarGenerarComprobante = true
        this.ListarInversiones();
      },
      (error) => {
        console.error(error);
        this.ngxService.stopLoader("load-cont");
      }
    );
  }

  private eliminarMovimientos(fecha: string){
    this.ngxService.startLoader("load-cont");
    this.xAPI.funcion = environment.xApi.BORRAR_MOVIMIENTOS_LOTE
    this.xAPI.parametros = fecha;
    this.xAPI.valores = "";
    this.apiService.Ejecutar(this.xAPI).subscribe({
      next: (data) => {
        this.eliminarComprobantes(fecha)
      },
      error: (error) => {
        console.error(error);
        this.ngxService.stopLoader("load-cont");
      }
    });
  }

  private eliminarComprobantes(fecha: string){
    this.xAPI.funcion = environment.xApi.ELIMINAR_COMPROBANTES_INVERSIONES
    this.xAPI.parametros = fecha;
    this.xAPI.valores = "";
    this.apiService.Ejecutar(this.xAPI).subscribe({
      next: (data) => {
        this.existenMovimientos = false
        this.CalculoPosicion()
        this.ngxService.stopLoader("load-cont");
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
    this.xAPI.funcion = environment.xApi.DISTRIBUIR_INTERESES
    this.xAPI.parametros =
      fope + "," + fini + "," + ffin + "," + usuario + "," + llave;
    this.xAPI.valores = "";
    this.apiService.Ejecutar(this.xAPI).subscribe(
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
    this.xAPI.funcion = environment.xApi.CONSULTAR_POSICIONES_INVERSIONES
    this.xAPI.parametros = fini + "," + ffin;
    this.xAPI.valores = "";
    this.lstAsientos = [];
    this.acum_debe = 0;
    this.acum_haber = 0;
    this.apiService.Ejecutar(this.xAPI).subscribe(
      async (data) => {
        this.lstAsientos = data.Cuerpo;

        if (this.lstAsientos.length > 0) {
          this.mostrarComprobantes = true
          data.Cuerpo.forEach((e) => {
            this.acum_debe += parseFloat(e.interes_acumulado);
            this.acum_haber += parseFloat(e.interes_acumulado);
          });

          this.ListarVencimiento();
          this.Listarcompra();
        }else{
          this.mostrarComprobantes = false
          this.CalculoPosicion()
          this.ngxService.stopLoader("load-cont");
        }
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
    this.xAPI.funcion = environment.xApi.CONSULTAR_VENCIMIENTO_INVERSIONES
    this.xAPI.parametros = fini + "," + ffin;
    this.xAPI.valores = "";
    this.acum_debev = 0;
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstVencimiento = data.Cuerpo;

        this.lstVencimiento.map((e) => {
          this.acum_debev += this.RendicionCupon(e);
          this.acum_debev += parseFloat(e.valor_nominal)
        });

        this.ngxService.stopLoader("load-cont");
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
    this.xAPI.funcion = environment.xApi.CONSULTAR_COMPRA_INVERSIONES
    this.xAPI.parametros = fini + "," + ffin;
    this.xAPI.valores = "";
    this.acum_debev = 0;
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstCompra = data.Cuerpo;

        this.lstCompra.map(e => {
          this.acum_debec += e.valor_nominal * 1;
        });

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
    let fecha = this.util.ConvertirFechaDB(this.fechai);

    this.Comprobante = {
      plan: 1,
      codigo: this.util.GenerarUnicId(),
      descripcion: `DEVENGO DE INVERSIONES ${this.util.ConvertirFechaHumana(
        fecha
      )}`,
      detalle: `DEVENGO DE INVERSIONES ${this.util.ConvertirFechaHumana(
        fecha
      )}`,
      fecha_operacion: this.util.ConvertirFechaDB(this.fechai),
      fecha_ejercicio: this.util.ConvertirFechaDB(this.fechai),
      debe: this.acum_debe,
      haber: this.acum_haber,
      llave: "M",
    };

    this.xAPI.funcion = environment.xApi.INSERTAR_COMPROBANTE
    this.xAPI.parametros = "";
    this.xAPI.valores = JSON.stringify(this.Comprobante);
    this.ngxService.startLoader("load-cont");

    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.InsertData(data, this.lstAsientos.length);
        this.mostrarComprobantes = false
        this.mostrarGenerarComprobante = false
        this.existenMovimientos = true
        Swal.fire({
          title: "Comprobantes generados correctamente",
          confirmButtonColor: '#3085d6',
          icon: 'success'
        })
      },
      (error) => {
        console.error(error);
        this.ngxService.stopLoader("load-cont");
      }
    );
  }

  InsertData(dt, cant: number) {
    cant++;
    this.xAPI.funcion = environment.xApi.INSERTAR_DEVENGO_INVERIONES
    this.xAPI.parametros = dt.msj + "," + this.util.ConvertirFechaDB(this.fechai);
    this.xAPI.valores = "";

    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (this.lstVencimiento.length > 0) {
          this.GenerarComprobanteVencimiento()
        }
        if (this.lstCompra.length > 0) {
          this.GenerarComprobanteCompra()
        } else {
          this.ngxService.stopLoader("load-cont")
        }

      },
      (error) => {
        console.error(error);
        this.ngxService.stopLoader("load-cont");
      }
    );
  }

  GenerarComprobanteVencimiento() {
    let fecha = this.util.ConvertirFechaDB(this.fechai);
    this.lstVencimiento.forEach(e => {
      let vencimiento = {
        plan: 1,
        codigo: this.util.GenerarUnicId(),
        descripcion: `VENCIMIENTO DE INVERSIONES ${this.util.ConvertirFechaHumana(
          fecha
        )}`,

        detalle: `VENCIMIENTO DE INVERSIONES ${this.util.ConvertirFechaHumana(
          fecha
        )}`,
        
        fecha_operacion: this.util.ConvertirFechaDB(this.fechai),
        fecha_ejercicio: this.util.ConvertirFechaDB(this.fechai),
        debe: parseFloat(e.valor_nominal) + this.RendicionCupon(e),
        haber: parseFloat(e.valor_nominal) + this.RendicionCupon(e),
        llave: "M",
      };

      this.xAPI.funcion = environment.xApi.INSERTAR_COMPROBANTE
      this.xAPI.parametros = "";
      this.xAPI.valores = JSON.stringify(vencimiento);

      this.apiService.Ejecutar(this.xAPI).subscribe(
        (data) => {
          this.InsertDataVencimiento(data, e);
        },
        (error) => {
          console.error(error);
          this.ngxService.stopLoader("load-cont");
        }
      );
    })
  }

  InsertDataVencimiento(dt: any, vencimiento: any) {
    this.xAPI.funcion = environment.xApi.INSERTAR_VENCIMIENTO_INVERSIONES
    this.xAPI.parametros = dt.msj + "," + this.util.ConvertirFechaDB(this.fechai) + "," + vencimiento.codigo;
    this.xAPI.valores = "";
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstVencimiento = [];
        this.ngxService.stopLoader("load-cont");
      },
      (error) => {
        console.error(error);
        this.ngxService.stopLoader("load-cont");
      }
    );
  }

  GenerarComprobanteCompra() {
    let fecha = this.util.ConvertirFechaDB(this.fechai);

    this.lstCompra.map((e, i) => {
      let compra = {
        plan: 1,
        codigo: this.util.GenerarUnicId(),
        descripcion: `COMPRA DE INVERSIONES ${this.util.ConvertirFechaHumana(
          fecha
        )}`,
        detalle: `COMPRA DE INVERSIONES ${this.util.ConvertirFechaHumana(fecha)}`,
        fecha_operacion: this.util.ConvertirFechaDB(this.fechai),
        fecha_ejercicio: this.util.ConvertirFechaDB(this.fechai),
        debe: e.valor_nominal,
        haber: e.valor_nominal,
        llave: "M",
      };

      this.xAPI.funcion = environment.xApi.INSERTAR_COMPROBANTE
      this.xAPI.parametros = "";
      this.xAPI.valores = JSON.stringify(compra);

      this.apiService.Ejecutar(this.xAPI).subscribe(
        (xd) => {
          this.InsertDataCompra(xd, e.codigo)
        },
        (error) => {
          console.error(error);
          this.ngxService.stopLoader("load-cont");
        }
      );
    });
  }

  InsertDataCompra(dt: any, codigo: any) {
    this.xAPI.funcion = environment.xApi.INSERTAR_COMPRA_INVERSIONES
    this.xAPI.parametros = dt.msj + "," + this.util.ConvertirFechaDB(this.fechai) + "," + codigo;
    this.xAPI.valores = "";

    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstCompra = [];
        this.ngxService.stopLoader("load-cont");
      },
      (error) => {
        console.error(error);
        this.ngxService.stopLoader("load-cont");
      }
    );
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
