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
import Swal from "sweetalert2";
import { environment } from "src/environments/environment";

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
    "disparador"
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
    console.log(e)
  }

  Consultar() {
    this.getSegmento();
    this.xAPI.funcion = environment.xApi.CONSULTAR_CUENTA;
    this.xAPI.parametros =
      this.Cuenta.codigo +
      "," +
      this.Cuenta.parte +
      "," +
      this.Cuenta.moneda +
      "," +
      this.Cuenta.nivel_1 +
      "," +
      this.Cuenta.nivel_2 +
      "," +
      this.Cuenta.nivel_3 +
      "," +
      this.Cuenta.nivel_4 +
      "," +
      this.Cuenta.nivel_5;

    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        console.log(data);
        if (data.Cuerpo != undefined) {
          if ( data.Cuerpo.length > 0) {
            this.Cuenta =  data.Cuerpo[0] ;
            this.Cuenta.moneda = this.Cuenta.moneda=='0'?'1':this.Cuenta.moneda
          }else{
            let aux = this.Cuenta.codigo;
            this.Limpiar();
            this.Cuenta.codigo = aux
            this.Cuenta.aumenta = this.naturaleza(this.Cuenta.codigo)
            this.Cuenta.disminuye = this.Cuenta.aumenta=='DEBE'?'HABER':'DEBE'
            this.getSegmento();
            
          }
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
      disminuye: '',
      aumenta: '',
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

    
    this.Cuenta.totalizadora = parseInt(this.cmbTotalizadora);

    if (this.Cuenta.codigo == "") {
      this._snackBar.open("Debe verificar todos los campos...", "Ok");
      return;
    }
    this.ngxService.startLoader("load-inver");
    this.xAPI.funcion = environment.xApi.INSERTAR_CUENTA
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
        this.txtCuenta = "";
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getTotalizadora(codigo: number): string {
    return codigo == 1 ? "SI" : "NO";
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
      this.txtCuenta = ''
    } else {
      this.active = !this.active;
    }
  }

  cargarContenido(): any {
    this.ELEMENT_DATA = [];
    this.xAPI.funcion = environment.xApi.CONSULTAR_CUENTAS
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
              disparador: ''
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

  naturaleza(cuenta: string): string {
    let nat = "DEBE";

    switch (cuenta.substring(0, 2)) {
      case "71":
        //ACTIVOS
        nat = "DEBE";
        break;
      case "72":
        //ACTIVOS
        nat = "HABER";
        break;
      case "73":
        //ACTIVOS
        nat = "HABER";
        break;
      case "74":
        //ACTIVOS
        nat = "DEBE";
        break;
      case "75":
        //ACTIVOS
        nat = "HABER";
        break;
    }
    return nat;
  }
  eliminar(e){
    console.log(e)
    
    Swal.fire({
      title: `Va a eliminar`,
      text: e.descripcion.toUpperCase(),
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'No',
      allowEscapeKey: true,
    }).then((result) => {
      
      if ( result.isConfirmed )  {
        this.ngxService.startLoader('loader-document')
        this.xAPI.funcion = environment.xApi.BORRAR_CUENTA
        this.xAPI.parametros = e.codigo
        this.apiService.Ejecutar(this.xAPI).subscribe(
          async data => {
            await this.cargarContenido() 
            
            this.ngxService.stopLoader('loader-document')
          },
          err => {
            this.ngxService.stopLoader('loader-document')
            console.error(err)
          }
        )
      
      }else {
        console.log("NO")
      }
    })
  }
}
