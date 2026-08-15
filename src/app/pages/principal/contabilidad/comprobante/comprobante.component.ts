import { Component, OnInit, ViewChild } from "@angular/core";
import { Semillero } from "src/app/services/banfanb/semillero";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { ApiService, IAPICore } from "src/app/services/apicore/api.service";
import { UtilService } from "src/app/services/util/util.service";
import {
  FID_IDetalleComprobante,
  FID_IComprobante,
  IComprobante,
} from "src/app/services/banfanb/comprobante.service";
import { Contrato } from "src/app/services/banfanb/contrato.service";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { ToastrService } from "ngx-toastr";
import { ComprobanteDialogComponent } from "./comprobante-dialog/comprobante-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { environment } from "src/environments/environment";
import { CierreService } from "src/app/services/banfanb/cierre.service";

@Component({
  selector: "app-comprobante",
  templateUrl: "./comprobante.component.html",
  styleUrls: ["./comprobante.component.scss"],
})
export class ComprobanteComponent implements OnInit {
  @ViewChild(MatPaginator) paginatorLista: MatPaginator;
  public dataSourceLista = new MatTableDataSource<any>();
  public pageSize = 10;
  public pageIndex = 0;
  public fechaUltimo: string = ''

  public ELEMENT_DATA: IComprobante[] = [];
  displayedColumns: string[] = [
    "cuenta",
    "fecha",
    "descripcion",
    "debe",
    "haber",
    "accion",
  ];
  dataSource: any;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  formComprobante: FormGroup;

  public Contrato: Contrato = {
    numero: "",
    rif: "",
    razonsocial: "",
    plan: "",
    estatus: "2",
    tipo: "",
    empresa: "",
    fideicomiso: "",
    reporte: "",
    codigo: "",
    plananterior: "",
    grupoanterior: "",
    segmento: "",
    subsegmento: "",
    oficinatutora: "",
    fecha: new Date(),
    clasificacion: "1",
    Direccion: undefined,
    Ejecutivo: undefined,
    Politicas: undefined,
    Saldos: undefined,
  };
  public lstTipoFideicomiso = [
    {
      key: "ADMINISTRACION",
      val: [
        { key: "0", val: "OBRAS" },
        { key: "1", val: "PRESTACIONES SOCIALES" },
        { key: "2", val: "FONDO DE AHORRO" },
        { key: "3", val: "OTROS" },
      ],
    },
    {
      key: "INVERSION",
      val: [
        { key: "0", val: "PERSONAL" },
        { key: "1", val: "JURIDICO" },
        { key: "2", val: "GUBERNAMENTAL" },
      ],
    },
    { key: "MIXTO", val: [{ key: "0", val: "JURIDICO" }] },
  ];

  public lstMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ].map((nombre, index) => ({
    nombre: nombre,
    valor: index + 1
  }));

  public anios: number[] = [
    2024,
    2025,
    2026,
  ]

  

  public lstTipoFid: any[] = [];

  public lstContratos: any[] = [];
  public razonsocial = "";
  public semillero: Semillero = {
    codigo: 0,
    plan: "",
    descripcion: "",
    fecha: new Date(),
    autor: "",
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
    llave: "M",
  };

  private auxComprobante: string;

  public IDComprobante: FID_IDetalleComprobante = {
    comprobante: 0,
    cuenta: 0,
    debe: 0,
    haber: 0,
    fecha_operacion: "",
    fecha_ejercicio: "",
    plan: 1,
  };

  public xAPI: IAPICore = {
    funcion: "",
    parametros: "",
  };

  public fechaejercicio = new FormControl(new Date());

  public lstComprobante: any[] = [];

  public lst: any[] = [];

  public porta_search = false;
  public porta_insert = true;
  public focus: boolean = false;
  public active: boolean = false;
  public buscar = "";
  public selectedIndex = 0;
  public debe: number = 0.0;
  public haber: number = 0.0;
  public saldo_debe: string = "0.00";
  public saldo_haber: string = "0.00";
  public lstCuenta: any[] = [];
  public mostrarImprimir = false;

  public mes: number = null
  public anio: number = null

  public total: number = null

  public cuenta: string = "";
  myCuentas = new FormControl("");
  Cuentas: string[] = [];
  filteredCuentas: Observable<string[]>;

  public lstOriginal: any[] = []; // Lista original sin filtrar

  constructor(
    private apiService: ApiService,
    private _snackBar: MatSnackBar,
    private ngxService: NgxUiLoaderService,
    private toastrService: ToastrService,
    private util: UtilService,
    private dialog: MatDialog,
    private _fb: FormBuilder,
    private _cierre: CierreService
  ) {}

  async ngOnInit() {
    this.mes = this.getMes()
    this.anio = this.getAnio()

    //this.fechacreacion.setValue(this.Contrato.Saldos.fechacreacion)
    this.CargarFormulario();
    this.cargarContenido();
    this.GenerarSemillero();
    this.cargarComprobantes()
    this.fechaUltimo = await this._cierre.getUltimoCierre()
  }

  cargarComprobantes(){
    let xAPI = {
      funcion: environment.xApi.CONTAR_COMPROBANTES,
      parametros: `${this.mes}, ${this.anio}`
    }

     this.apiService.Ejecutar(xAPI).subscribe(
      (data) => {
        this.total = parseInt(data.Cuerpo[0].total)
        this.ListarComprobantes();
      },
      (err) => {
        console.error(err)
      }
    );
  }

  private getMes(): number{
    return new Date().getMonth() + 1;
  }

  private getAnio(): number{
     return new Date().getFullYear();
  }

  parseFecha(f: any): Date {
    if (!f) return new Date();
    if (f instanceof Date) return f;
    if (typeof f === "string") {
      const parts = f.split(" ")[0].split("-");
      if (parts.length === 3) {
        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      }
    }
    return new Date(f);
  }

  CargarFormulario() {
    this.formComprobante = this._fb.group({
      plan: [this.Comprobante.plan, Validators.required],
      codigo: [this.Comprobante.codigo, Validators.required],
      descripcion: [this.Comprobante.descripcion, Validators.required],
      fechaEjercicio: [
        this.parseFecha(this.Comprobante.fecha_operacion || this.fechaejercicio.value),
        Validators.required,
      ],
      totalDebe: [this.Comprobante.debe, Validators.required],
      totalHaber: [this.Comprobante.haber, Validators.required],
    });

    this.actualizarPlanConCeros();
    this.ConsultarContrato();

    // Suscribirse a los cambios de plan
    this.formComprobante.get("plan").valueChanges.subscribe((val) => {
      if (val && Number(val) > 0 && val.toString().length < 4) {
        this.actualizarPlanConCeros();
      }
    });
  }

  private actualizarPlanConCeros() {
    let plan = this.formComprobante.get("plan").value;
    if (plan && Number(plan) > 0) {
      const planConCeros = this.CompletarCeros(plan.toString());
      this.formComprobante
        .get("plan")
        .setValue(planConCeros, { emitEvent: false });
    }
  }

  CompletarCeros(e: string): string {
    return this.util.zfill(e, 4);
  }

  ListarComprobantes() {
    this.lst = [];
    this.xAPI.funcion = environment.xApi.PAGINAR_COMPROBANTES;
    this.xAPI.parametros = `${this.mes}, ${this.anio}, ${this.pageIndex * 10}, ${this.pageSize}`;
    this.xAPI.valores = "";
    this.ngxService.startLoader("load-cont");
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstOriginal = data.Cuerpo;
        this.lst = [...this.lstOriginal];
        this.ngxService.stopLoader("load-cont");
        this.filtrarLista();
      },
      (err) => {
        this.ngxService.stopLoader("load-cont");
      }
    );
  }

  filtrarLista() {
    const texto = (this.buscar || '').toLowerCase();
    if (!texto) {
      this.lst = [...this.lstOriginal];
      return;
    }
    this.lst = this.lstOriginal.filter(e =>
      (e.descripcion || '').toLowerCase().includes(texto)
    );
  }

  // Añade este método para manejar cambios de página
  cambiarPagina(event: PageEvent) {
    this.pageSize = event.pageSize;

    this.pageIndex = event.pageIndex;
    this.ListarComprobantes()
  }

  cargarDatos(datos: any[]) {
    this.dataSourceLista.data = datos;
    if (this.paginatorLista) {
      this.paginatorLista.firstPage();
    }
  }

  // Modifica tu ngAfterViewInit si existe, o créalo
  ngAfterViewInit() {
    this.dataSourceLista.paginator = this.paginatorLista;
  }

  ConsultarComprobante() {}

  ConsultarContrato() {
    this.xAPI.funcion = environment.xApi.CONSULTAR_CONTRATO;
    this.xAPI.parametros = this.formComprobante.get("plan").value.toString();
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null && data.length > 0) {
          this.Contrato = data[0];
          this.getTipoFideicomiso();
        } else {
          let aux = this.Comprobante.plan;
          this.Limpiar();
          this.Comprobante.plan = aux;
        }
      },
      (error) => {
        console.error(error);
        this.Limpiar();
      }
    );
  }

  getTipoFideicomiso() {
    let codigo = this.Contrato?.plan || "";

    this.lstTipoFid = [];
    this.lstTipoFideicomiso.forEach((e) => {
      if (e.key == codigo) {
        this.lstTipoFid = e.val;
      }
    });
  }

  Buscar(e) {}

  editar(e: any, x: boolean = true) {
    this.Comprobante = e;
    this.auxComprobante = e.id;
    this.fechaejercicio = new FormControl(this.parseFecha(e.fecha_operacion));
    this.ELEMENT_DATA = JSON.parse(e.definicion).map((ev) => {
      ev.fecha = e.fecha_operacion;
      return ev;
    });
    this.dataSource = new MatTableDataSource<IComprobante>(this.ELEMENT_DATA);
    this.dataSource.paginator = this.paginator;
    if (x) {
      this.active = true;
      this.selectedIndex = 1;
      this.CargarFormulario();
      this.mostrarImprimir = true;
    }
    this.TotalizarElement();
  }

  tabActive(event) {
    this.selectedIndex = event.index;
    if (!this.active) {
      this.Limpiar();
      this.mostrarImprimir = false;
      this.CargarFormulario();
      this.GenerarSemillero();
    } else {
      this.ListarComprobantes();
      this.active = !this.active;
    }
  }

  onSubmit() {
    if (this.formComprobante.valid) {
      this.Guardar();
    } else {
      this._snackBar.open("Por favor verifique los campos ", "ok");
    }
  }

  inicializarContrato() {
    this.Contrato = {
      numero: "",
      rif: "",
      razonsocial: "",
      plan: "",
      estatus: "2",
      tipo: "",
      empresa: "",
      fideicomiso: "",
      reporte: "",
      codigo: "",
      plananterior: "",
      grupoanterior: "",
      segmento: "",
      subsegmento: "",
      oficinatutora: "",
      fecha: new Date(),
      clasificacion: "1",
      Direccion: undefined,
      Ejecutivo: undefined,
      Politicas: undefined,
      Saldos: undefined,
    };
  }

  Limpiar() {
    this.Comprobante = {
      plan: 0,
      codigo: "",
      descripcion: "",
      detalle: "",
      fecha_operacion: "",
      fecha_ejercicio: "",
      debe: 0,
      haber: 0,
      llave: "M",
    };

    this.inicializarContrato();

    this.formComprobante.reset();
    this.dataSource = null;
    this.fechaejercicio.setValue(new Date());
    if (this.formComprobante && this.formComprobante.get("fechaEjercicio")) {
      this.formComprobante
        .get("fechaEjercicio")
        .setValue(this.fechaejercicio.value);
    }
  }

  Consultar() {}

  Seleccionar() {}

  GenerarSemillero() {
    this.xAPI.funcion = environment.xApi.CONSULTAR_SEMILLERO_CONTABLE;
    this.xAPI.parametros = "";
    this.xAPI.valores = {};
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null && data.length > 0) {
          let codigo = parseInt(data[0].codigo) + 1;
          this.Comprobante.codigo = this.util.zfill(codigo, 4);
        } else {
          this.Comprobante.codigo = "0001";
        }
      },
      (error) => {
        console.error(error);
        //this.Limpiar()
      }
    );
  }

  cargarContenido(): any {
    this.lstComprobante = [];
    this.xAPI.funcion = environment.xApi.CONSULTAR_CUENTAS;
    this.xAPI.parametros = "";
    this.xAPI.valores = "";
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstComprobante = data.Cuerpo;

        this.lstComprobante.forEach((e) => {
          if (e.totalizadora == "0") {
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
            let valor = cta + " | " + e.descripcion.toUpperCase();
            this.Cuentas.push(valor);

            this.lstCuenta.push({ id: e.id, cuenta: cta });
          }
        });

        this.filteredCuentas = this.myCuentas.valueChanges.pipe(
          startWith(""),
          map((value) => this._filterCuentas(value || ""))
        );
      },
      (err) => {
        console.error(err);
      }
    );
  }

  private _filterCuentas(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.Cuentas.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  addElement() {
    if (
      (this.debe <= 0 && this.haber <= 0) ||
      this.debe == null ||
      this.haber == null
    ) {
      this._snackBar.open("Por favor verifique los campos ", "ok");
      return;
    }

    const fechaVal = this.formComprobante.get("fechaEjercicio")?.value || this.fechaejercicio.value;
    let fecha = this.util.ConvertirFechaDB(fechaVal);

    if (!this.cuenta) {
      this._snackBar.open("Por favor seleccione una cuenta ", "ok");
      return;
    }

    let cta = this.cuenta.split("|");
    let debe = parseFloat(this.debe.toString());
    let haber = parseFloat(this.haber.toString());

    // Validar si debe y haber son números
    if (isNaN(debe) || isNaN(haber)) {
      this._snackBar.open("Por favor verifique los campos ", "ok");
      return;
    }

    let detalle = {
      cuenta: cta[0].trim(),
      descripcion: cta[1].trim(),
      detalle: cta[0].trim(),
      debe: parseFloat(debe.toFixed(2)),
      haber: parseFloat(haber.toFixed(2)),
      fecha: fecha.substr(0, 10),
      referencia: "",
      auxiliar: "",
      cc: "",
      tipo: "",
      estatus: false,
    };
    // if ( this.IComprobante.plan == '' ) {
    //   this._snackBar.open('Por favor seleccione un plan o fideicomiso','ok')
    //   return
    // }

    let sd = parseFloat(this.saldo_debe) + debe;
    let sh = parseFloat(this.saldo_haber) + haber;
    this.saldo_debe = sd.toFixed(2);
    this.saldo_haber = sh.toFixed(2);

    this.formComprobante.get("totalHaber").setValue(this.saldo_haber);
    this.formComprobante.get("totalDebe").setValue(this.saldo_debe);

    this.ELEMENT_DATA.push(detalle);

    this.dataSource = new MatTableDataSource<IComprobante>(this.ELEMENT_DATA);
    this.dataSource.paginator = this.paginator;
    this.cuenta = "";
    this.myCuentas.setValue("");
    this.debe = 0;
    this.haber = 0;
  }

  eliminar(e) {
    let pos = 0;

    for (let i = 0; i < this.ELEMENT_DATA.length; i++) {
      const ev = this.ELEMENT_DATA[i];
      if (String(e.cuenta).trim() == String(ev.cuenta).trim()) {
        pos = i;
      }
    }

    this.ELEMENT_DATA.splice(pos, 1);
    this.dataSource = new MatTableDataSource<IComprobante>(this.ELEMENT_DATA);
    this.dataSource.paginator = this.paginator;

    this.TotalizarElement();
  }

  TotalizarElement() {
    let debe = 0;
    let haber = 0;
    this.ELEMENT_DATA.map((e) => {
      debe += parseFloat(e.debe.toString());
      haber += parseFloat(e.haber.toString());
    });
    this.saldo_debe = debe.toFixed(2);
    this.saldo_haber = haber.toFixed(2);

    if (this.formComprobante) {
      this.formComprobante.get("totalDebe").setValue(this.saldo_debe);
      this.formComprobante.get("totalHaber").setValue(this.saldo_haber);
    }
  }

  getComprobante() {
    let debe = 0;
    let haber = 0;
    this.ELEMENT_DATA.map((e) => {
      debe += parseFloat(e.debe.toString());
      haber += parseFloat(e.haber.toString());
    });

    const rif = this.Contrato?.rif || "";
    const razonSocial = this.Contrato?.razonsocial?.toUpperCase() || "";
    this.Comprobante.detalle = `${rif} - ${razonSocial}`;

    this.Comprobante.debe = debe;
    this.Comprobante.haber = haber;
  }

  async Guardar() {
    this.convertirComprobante();

    if (this.saldo_debe != this.saldo_haber) {
      let saldo = parseFloat(this.saldo_debe) - parseFloat(this.saldo_haber);
      let msj = "Existe una diferencia de Bs. " + saldo * -1;
      if (parseFloat(this.saldo_debe) > parseFloat(this.saldo_haber))
        msj = "Existe una diferencia de Bs. " + saldo;
      this.apiService.Mensaje(msj, "Advertencia", "warning", "comprobante");
      return;
    }

    Swal.fire({
      title: "Esta seguro que desea realizar la operación",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si",
      cancelButtonText: "No",
      allowEscapeKey: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.Aceptar();
      }
    });
  }

  convertirComprobante() {
    this.Comprobante.plan = this.formComprobante.get("plan").value;
    this.Comprobante.codigo = this.formComprobante.get("codigo").value;
    this.Comprobante.descripcion =
      this.formComprobante.get("descripcion").value;
    this.Comprobante.fecha_operacion = this.util.ConvertirFechaDB(
      this.formComprobante.get("fechaEjercicio").value
    );
    this.Comprobante.fecha_ejercicio = this.util.ConvertirFechaDB(
      this.formComprobante.get("fechaEjercicio").value
    );
  }

  Aceptar() {
    if (this.mostrarImprimir) {
      this.deleteData(this.auxComprobante);
    }

    this.getComprobante();
    this.ngxService.startLoader("load-cont");
    this.xAPI.funcion = environment.xApi.INSERTAR_COMPROBANTE;
    this.xAPI.parametros = "";
    this.xAPI.valores = JSON.stringify(this.Comprobante);

    this.apiService.Ejecutar(this.xAPI).subscribe(
      async (data) => {
        await this.GuardarDetalle(data.msj);
        this.ngxService.stopLoader("load-cont");
        this.ELEMENT_DATA = [];
        this.dataSource = new MatTableDataSource<IComprobante>(
          this.ELEMENT_DATA
        );
        this.dataSource.paginator = this.paginator;
        this.Limpiar();
      },
      (err) => {}
    );
  }

  async GuardarDetalle(comprobante: number) {
    const plan = Number(this.formComprobante.get("plan").value);
    const promises = this.ELEMENT_DATA.map((e) => {
      const detalle: FID_IDetalleComprobante = {
        comprobante: comprobante,
        cuenta: this.getIDCuenta(e.cuenta),
        debe: e.debe,
        haber: e.haber,
        fecha_operacion: this.Comprobante.fecha_operacion,
        fecha_ejercicio: this.Comprobante.fecha_ejercicio,
        plan: plan,
      };

      this.xAPI.funcion = environment.xApi.INSERTAR_DETALLE_COMPROBANTE;
      this.xAPI.parametros = "";
      this.xAPI.valores = JSON.stringify(detalle);
      return this.apiService.Ejecutar(this.xAPI).toPromise();
    });
    await Promise.all(promises);
  }

  getIDCuenta(cuenta: any): number {
    // Si ya es un número válido, retornarlo directamente
    if (typeof cuenta === 'number' && cuenta > 0) {
      return cuenta;
    }

    // Si es un string numérico, parsearlo
    if (typeof cuenta === 'string' && !isNaN(Number(cuenta))) {
      const num = Number(cuenta);
      if (num > 0) return num;
    }

    // Buscar por código de cuenta (formato "1.01.01.01...")
    const found = this.lstCuenta.find((e) => e.cuenta == cuenta);
    return found ? found.id : 0;
  }

  getMoneda(e): string {
    return this.util.ConvertirMoneda(e.debe);
  }

  getFecha(f): string {
    return this.util.ConvertirFechaHumana(f);
  }

  esPeriodoCerrado(e: any): boolean {
    const fechaCierre = this.util.ConvertirFechaDB(this.fechaUltimo);
    return new Date(fechaCierre) >= new Date(e.fecha_operacion);
  }

  eliminarComprobante(e: any) {
    Swal.fire({
      title: `¿Estás seguro que desea eliminar este comprobante? \n\n ${e.descripcion.toUpperCase()} `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si",
      cancelButtonText: "No",
      allowEscapeKey: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteData(e.id);
      }
    });
  }

  deleteData(id) {
    this.ngxService.startLoader("load-cont");
    this.xAPI.funcion = environment.xApi.ELIMINAR_COMPROBANTE;
    this.xAPI.parametros = id;
    this.xAPI.valores = "";
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (!this.mostrarImprimir) {
          this.toastrService.success(
            "Se ha eliminado comprobante con exito",
            `Fideicomiso`
          );
            this.ListarComprobantes();
            this.ngxService.stopLoader("load-cont");
        }
      },
      (err) => {
        if (!this.mostrarImprimir) {
          this.toastrService.error(
            "No se ha logrado eliminar el comprobante",
            `Fideicomiso`
          );
        }
        this.ngxService.stopLoader("load-cont");
      }
    );
  }

  abrirDialogo(e: any = null) {
    if (e) {
      this.editar(e, false);
    }
    this.dialog.open(ComprobanteDialogComponent, {
      width: "60%",
      data: { datos: this.ELEMENT_DATA },
    });
  }
}



