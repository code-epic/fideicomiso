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
  public fechau: any;
  public fechaultimo = "";
  public fechai: any;
  public fechaf: any;
  public fecha_al: string = "";

  public lstAsientos = [];
  public lstVencimiento = [];
  public lstCompra = [];
  public bcuentat = false;
  public dias: number = 0;
  public acum_debe = 0;
  public acum_haber = 0;
  public acum_debev = 0;
  public acum_debec = 0;
  public acum_haberv = 0;
  public blComprobante = false;
  public blProcesar = false;

  public xAPI: IAPICore = {
    funcion: "",
    parametros: "",
  };

  events: string[] = [];

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

  visible: boolean = false;
  recalcular: boolean = false

  // public lstData = []

  constructor(
    private apiService: ApiService,
    private _snackBar: MatSnackBar,
    private ngxService: NgxUiLoaderService,
    private util: UtilService,
    public formatter: NgbDateParserFormatter,
    private cierre: CierreService
  ) { }

  ngOnInit(): void {
    this.lstVencimiento = [];
    this.lstCompra = [];
    this.consultarUltimoCierre();
  }

  async consultarUltimoCierre() {
    this.ngxService.stopLoader("load-precierre");
    this.fechaultimo = await this.cierre.getUltimoCierre()
    this.fechai = this.cierre.getSiguienteDia(this.fechaultimo);
    this.ngxService.stopLoader("load-precierre");
  }

  CalcularDias(type: string, event: MatDatepickerInputEvent<Date>) {
    this.dias =
      this.util.CalcuarDiasTranscurridos(this.fechai, this.fechaf) + 1;
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

    if (true) {
      this.ngxService.startLoader("load-cont");
      this.xAPI.funcion = environment.xApi.INSERTAR_MOVIMIENTOS_LOTE
      this.xAPI.parametros = fini + ",I," + usuario + "," + llave;

      this.xAPI.valores = "";

      this.apiService.Ejecutar(this.xAPI).subscribe(
        async (data) => {
          this.recalcular = true
          this.blProcesar = false
          this.ListarInversiones();
        },
        (error) => {
          console.error(error);
          this.ngxService.stopLoader("load-cont");
        }
      );
    } 
    else {
      Swal.fire({
        title: "Informacion",
        text: 'Ya ha insertado los movimientos',
        icon: 'info',
        showCancelButton: false,
        confirmButtonColor: '#3085d6',
        // cancelButtonColor: '#d33',
        confirmButtonText: 'Salir',
        allowEscapeKey: true,
      }).then((result) => {
        // const respuesta = result.isConfirmed
        // if (respuesta) {
        //   this.ngxService.startLoader("load-cont");
        //   this.xAPI.funcion = environment.xApi.BORRAR_MOVIMIENTOS_LOTE
        //   this.xAPI.parametros = fini;
        //   this.xAPI.valores = "";
        //   this.apiService.Ejecutar(this.xAPI).subscribe(
        //     (data) => {
        //       this.recalcular = false
        //       this.CalculoPosicion();
        //     },
        //     (error) => {
        //       console.error(error);
        //       this.ngxService.stopLoader("load-cont");
        //     }
        //   );
        // }
      })
      this.ngxService.stopLoader("load-cont");
    }
  }

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
        this.visible = false;
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
    this.visible = false;
    this.apiService.Ejecutar(this.xAPI).subscribe(
      async (data) => {
        this.lstAsientos = data.Cuerpo;
        if (this.lstAsientos.length > 0) {
          data.Cuerpo.forEach((e) => {
            this.acum_debe += parseFloat(e.interes_acumulado);
            this.acum_haber += parseFloat(e.interes_acumulado);
          });

          this.visible = true;

          let factual = new Date(this.fechau + " 00:00:00");
          let fcalculo = new Date(this.fechai);

          const partes = this.fechaultimo.split('/'); // Divide la fecha en [día, mes, año]
          const dia = parseInt(partes[0], 10); // Día
          const mes = parseInt(partes[1], 10) - 1; // Mes (resta 1 porque los meses en Date comienzan en 0)
          const anio = parseInt(partes[2], 10); // Año

          const fechaConvertida = new Date(anio, mes, dia); // Crea un objeto Date


          if (factual.getTime() > fcalculo.getTime() && fechaConvertida.getTime() < fcalculo.getTime()) {
            this.blProcesar = true;
            this.blComprobante = true;
          }

          this.recalcular = false
          this.consultarUltimoComprobante();
          this.ListarVencimiento();
          this.Listarcompra();
          this.blProcesar = false
        } else {
          this.recalcular = true
          this.blComprobante = true;
          this.ngxService.stopLoader("load-cont");
          this.blProcesar = true
        }
      },
      (error) => {
        console.error(error);
        this.ngxService.stopLoader("load-cont");
      }
    );
  }

  consultarUltimoComprobante() {
    let xApiAux: IAPICore = {
      funcion: "FID_CUltimoComprobante",
      parametros: "",
      valores: "",
    };
    let fechaiAux = ''

    if (this.fechai) {
      const fecha = new Date(this.fechai);
      fecha.setDate(fecha.getDate() - 1);
      const anio = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      const dia = String(fecha.getDate()).padStart(2, '0');
      fechaiAux = `${anio}-${mes}-${dia}`;
    }

    this.apiService.Ejecutar(xApiAux).subscribe(
      (data) => {
        let ultc = data.Cuerpo[0].ultimaFechaComprobante;
        if (ultc == fechaiAux) {
          this.blComprobante = true
        }
      },
      (error) => {
        console.error(error);
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
      async (data) => {
        this.lstVencimiento = data.Cuerpo;

        this.lstVencimiento.map((e) => {
          this.acum_debev += this.RendicionCupon(e);
          this.acum_debev += parseFloat(e.valor_nominal)
        });

        await this.ngxService.stopLoader("load-cont");
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
      async (data) => {
        this.lstCompra = data.Cuerpo;

        if (this.lstCompra.length > 0) {
          this.visible = true;
        }

        this.lstCompra.map(e => {
          this.acum_debec += e.valor_nominal * 1;
        });

        await this.ngxService.stopLoader("load-cont");
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
    this.xAPI.parametros =
      dt.msj + "," + this.util.ConvertirFechaDB(this.fechai);
    this.xAPI.valores = "";

    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {


        if (this.lstVencimiento.length > 0) {
          this.GenerarComprobanteVencimiento()
        } else {
          if (this.lstCompra.length > 0) {
            this.GenerarComprobanteCompra()
          } else {
            this.ngxService.stopLoader("load-cont")
            this.visible = false;
            this.blProcesar = false;
            this.blComprobante = false;
          }

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
    console.log('vencimiento', vencimiento);
    this.xAPI.funcion = environment.xApi.INSERTAR_VENCIMIENTO_INVERSIONES
    this.xAPI.parametros = dt.msj + "," + this.util.ConvertirFechaDB(this.fechai) + "," + vencimiento.codigo;
    this.xAPI.valores = "";
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstVencimiento = [];
        this.ngxService.stopLoader("load-cont");
        this.visible = false;

        if (this.lstCompra.length > 0) this.GenerarComprobanteCompra();
        this.visible = false;
        this.blProcesar = false;
        this.blComprobante = false;
      },
      (error) => {
        console.error(error);
        this.ngxService.stopLoader("load-cont");
      }
    );
  }

  GenerarComprobanteCompra() {
    let fecha = this.util.ConvertirFechaDB(this.fechai);

    this.lstCompra.map(e => {
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
        this.visible = false;
        this.blProcesar = false;
        this.blComprobante = false;
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
