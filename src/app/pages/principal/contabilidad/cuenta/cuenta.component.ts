import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { ApiService, IAPICore } from "src/app/services/apicore/api.service";
import {
  ICuenta,
  LCuenta,
} from "src/app/services/banfanb/contabilidad.service";

@Component({
  selector: "app-cuenta",
  templateUrl: "./cuenta.component.html",
  styleUrls: ["./cuenta.component.scss"],
})
export class CuentaComponent implements OnInit {
  public ELEMENT_DATA: LCuenta[] = [];
  displayedColumns: string[] = [
    "cuenta",
    "descripcion",
    "codigo_asignacion",
    "accion",
  ];
  dataSource: any;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  public Cuenta: ICuenta = {
    moneda: "",
    totalizadora: 0,
    parte: "",
    disminuye: "",
    aumenta: "",
    descripcion: "",
    codigo: "",
    nivel_1: "",
    nivel_2: "",
    nivel_3: "",
    nivel_4: "",
    nivel_5: "",
    usuario: "",
  };

  public txtCuenta: string;
  public cmbTotalizadora: string;

  public lstCuenta = [];
  public xAPI: IAPICore = {
    funcion: "",
    parametros: "",
  };

  public focus: boolean = false;
  public active: boolean = false;

  public porta_insert: string = "";
  public porta_search: string = "none";
  public selectedIndex = 0;
  public buscar = "";

  constructor(
    private apiService: ApiService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private ngxService: NgxUiLoaderService
  ) {}

  ngOnInit(): void {
    // this.Listar()
    this.cargarContenido();
  }

  atras() {
    this.porta_insert = "";
    this.porta_search = "none";
  }

  editar(e) {
    this.Cuenta = e;
    this.porta_insert = "";
    this.porta_search = "none";
  }

  // Listar() {
  //   this.xAPI.funcion = "FID_CCuentas"
  //   this.xAPI.parametros = ''
  //   this.apiService.Ejecutar(this.xAPI).subscribe(
  //     (data) => {
  //       if (data != null && data.msj == undefined) this.lstCuenta = data
  //     },
  //     (error) => {
  //       console.log(error)
  //       this.Limpiar()
  //     }
  //   )
  // }

  Consultar() {
    this.xAPI.funcion = "FID_CCuenta";
    this.xAPI.parametros = this.Cuenta.codigo;

    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        console.log(data)
        if (data.Cuerpo != undefined) {
          this.Cuenta = data.Cuerpo.length > 0? data.Cuerpo[0]: {};
        } else {
          let aux = this.Cuenta.codigo;
          this.Limpiar();
          this.Cuenta.codigo = aux;
        }
      },
      (error) => {
        console.log(error);
        this.Limpiar();
      }
    );
  }

  Seleccionar() {
    // this.Listar()
    this.porta_insert = "none";
    this.porta_search = "";
  }

  Limpiar() {
    this.Cuenta = {
      moneda: "",
      totalizadora: 0,
      parte: "",
      disminuye: "",
      aumenta: "",
      descripcion: "",
      codigo: "",
      nivel_1: "",
      nivel_2: "",
      nivel_3: "",
      nivel_4: "",
      nivel_5: "",
      usuario: "",
    };
  }

  setSegmento() {
    let cta = this.txtCuenta.split(".");
    switch (cta.length) {
      case 1:
        this.txtCuenta += ".00.0.00.00.00.00.00";
        break;
      case 2:
        this.txtCuenta += ".1.00.00.00.00.00";
        break;
      case 3:
        this.txtCuenta += ".00.00.00.00.00";
        break;
      case 4:
        this.txtCuenta += ".00.00.00.00";
        break;
      case 5:
        this.txtCuenta += ".00.00.00";
        break;
      case 6:
        this.txtCuenta += ".00.00";
        break;
      case 7:
        this.txtCuenta += ".00";
        break;
      default:
        break;
    }
  }

  getSegmento() {
    let cta = this.txtCuenta.split(".");
    this.Cuenta.codigo = cta[0];
    this.Cuenta.parte = cta[1];
    this.Cuenta.moneda = cta[2];

    if (cta.length > 3) {
      this.Cuenta.nivel_1 = cta[3];
      this.Cuenta.nivel_2 = cta[4];
      this.Cuenta.nivel_3 = cta[5];
      this.Cuenta.nivel_4 = cta[6];
      this.Cuenta.nivel_5 = cta[7];
    }

  }

  Guardar() {
    this.txtCuenta.length;

    this.getSegmento();
    this.Cuenta.totalizadora = parseInt(this.cmbTotalizadora);

    if (this.Cuenta.codigo == "") {
      this._snackBar.open("Debe verificar todos los campos...", "Ok");
      return;
    }
    this.ngxService.startLoader('load-inver')
    this.xAPI.funcion = "FID_ICuenta";
    this.xAPI.parametros = "";
    this.xAPI.valores = JSON.stringify(this.Cuenta);

    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        console.log(data);
        this.apiService.Mensaje(
          "Proceso exitoso",
          "Felicitaciones",
          "success",
          "inversion"
        );
        this.ngxService.stopLoader("load-inver");
        this.Limpiar();
        this.txtCuenta = ''

      },
      (error) => {
        console.log(error);
      }
    );
  }

  getTotalizadora(codigo : number) : string {
    return codigo==1?'SI':'NO'
  }

  getDebe(tipo: string): string {
    if (tipo == "DEBE") {
      return "H/D";
    }
    return "D/H";
  }

  Buscar(e) {}

  tabActive(event) {
    this.selectedIndex = event.index;
    if (!this.active) {
      this.Limpiar();
      //this.contrato_search = 'none'
      //this.GenerarSemillero()
      // this.Listar()
    } else {
      this.active = !this.active;
    }
  }

  cargarContenido(): any {
    this.ELEMENT_DATA = [];
    this.xAPI.funcion = "FID_CCuentas";
    this.xAPI.parametros = "";
    this.xAPI.valores = "";
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data.Cuerpo != undefined) {
          data.Cuerpo.forEach((e) => {
            let cta =
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
              e.nivel_5;
            this.ELEMENT_DATA.push({
              codigo: e.id,
              descripcion: e.descripcion,
              aumenta_por: e.aumenta,
              disminuye_por: e.disminuye,
              codigo_asignacion: e.totalizadora,
              cuenta: cta,
              accion: e.aumenta == "DEBE" ? "D/H" : "H/D",
            });
          });
          this.dataSource = new MatTableDataSource<LCuenta>(this.ELEMENT_DATA);
          this.dataSource.paginator = this.paginator;
        }
      },
      (err) => {
        console.error(err);
      }
    );
  }
}
