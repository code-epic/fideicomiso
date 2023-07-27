import { Component, OnInit, ViewChild } from '@angular/core';
import { Semillero } from 'src/app/services/banfanb/semillero';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { UtilService } from 'src/app/services/util/util.service';
import { Comprobante, IComprobante } from 'src/app/services/banfanb/comprobante.service';
import { Contrato } from 'src/app/services/banfanb/contrato.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-comprobante',
  templateUrl: './comprobante.component.html',
  styleUrls: ['./comprobante.component.scss']
})
export class ComprobanteComponent implements OnInit {

  public ELEMENT_DATA: IComprobante [] = [];
  displayedColumns: string[] = ['cuenta', 'fecha', 'descripcion', 'debe', 'haber'];
  dataSource : any

  @ViewChild(MatPaginator) paginator: MatPaginator;

  public Contrato: Contrato = {
    numero: '',
    rif: '',
    razonsocial: '',
    plan: '',
    estatus: '2',
    tipo: '',
    empresa: '',
    fideicomiso: '',
    reporte: '',
    codigo: '',
    plananterior: '',
    grupoanterior: '',
    segmento: '',
    subsegmento: '',
    oficinatutora: '',
    fecha: new Date(),
    clasificacion: '1',
    Direccion: undefined,
    Ejecutivo: undefined,
    Politicas: undefined,
    Saldos: undefined
  }
  public lstTipoFideicomiso = [
    { "key": "ADMINISTRACION", "val" : [
      {"key": "0", "val":"OBRAS"}, 
      {"key": "1", "val":"PRESTACIONES SOCIALES"}, 
      {"key": "2", "val": "FONDO DE AHORRO"},
      {"key": "3", "val": "OTROS"}
    ] 
    
  },
    { "key": "INVERSION", "val"  : [{"key": "0", "val":"PERSONAL"}, {"key": "1", "val":"JURIDICO"}, {"key": "2", "val":"GUBERNAMENTAL"}] ,},
    { "key": "MIXTO" , "val" : [{"key": "0", "val":"JURIDICO"}] ,}
  ]

  public lstTipoFid = []

  public lstContratos = []
  public semillero : Semillero = {
    codigo: 0,
    plan: '',
    descripcion: '',
    fecha: new Date(),
    autor: ''
  }

  public IComprobante : IComprobante = {
    cuenta: '',
    fecha: '',
    debe: 0,
    haber: 0,
    referencia: '',
    descripcion: '',
    auxiliar: '',
    cc: '',
    tipo: '',
    estatus: false
  }




  public Comprobante: Comprobante = {
    codigo: '',
    plan: '',
    fecha: '',
    monto_total: 0,
    detalle: '',
    tipo: '',
    estatus: false,
    items: [],
    numero: '',
    saldo_debe: 0,
    saldo_haber: 0
  }

  public xAPI: IAPICore = {
    funcion: '',
    parametros: ''
  }

  public fechacreacion = new FormControl(new Date());
  public fechaejercicio = new FormControl(new Date());

  public lstComprobante = [];

  public lst = []


  public porta_search = false
  public porta_insert = true
  public focus : boolean = false
  public active: boolean = false
  public buscar = ''
  public selectedIndex = 0;
  public debe: number = 0.00
  public haber: number = 0.00
  public saldo_debe: string = '0.00'
  public saldo_haber: string = '0.00'

  public cuenta : string = ''
  myCuentas = new FormControl('');
  Cuentas: string[] = [];
  filteredCuentas: Observable<string[]>;

  constructor(
    private apiService: ApiService,
    private _snackBar: MatSnackBar,
    private ngxService: NgxUiLoaderService,
    private util: UtilService
  ) { }

  ngOnInit(): void {
    //this.fechacreacion.setValue(this.Contrato.Saldos.fechacreacion)
    this.cargarContenido()
    this.GenerarSemillero()
  }

  ConsultarComprobante(){}

  ConsultarContrato() {
    this.xAPI.funcion = "FID_CContrato"
    this.xAPI.parametros = this.Comprobante.plan
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null) {
          this.Contrato = data[0]
          // this.fechacreacion.setValue(this.Contrato.Saldos.fechainicio)
          
          this.getTipoFideicomiso()
        } else {
          let aux = this.Comprobante.plan
          this.Limpiar()
          this.Comprobante.plan= aux
        }
      },
      (error) => {
        console.log(error)
        this.Limpiar()
      }
    )
  }
  getTipoFideicomiso() {
    
    let codigo = this.Contrato.plan
    // console.log(codigo)

    this.lstTipoFid = []
    this.lstTipoFideicomiso.forEach(e => {
      
      if (e.key == codigo){
        this.lstTipoFid = e.val
        
      }
    });
    
    // console.log(this.lstTipoFid)
  }

  Buscar(e){

  }

  editar(e){

  }


  tabActive(event) {
   
    this.selectedIndex = event.index
    if (!this.active) {
      this.Limpiar()
      //this.contrato_search = 'none'
      this.GenerarSemillero()
      // this.Listar()
    } else {
      this.active = !this.active
    }

  }

  
  Limpiar(){
    this.Comprobante = {
      codigo: '',
      plan: '',
      fecha: '',
      monto_total: 0,
      detalle: '',
      tipo: '',
      estatus: false,
      items: [],
      numero: '',
      saldo_debe: 0,
      saldo_haber: 0
    }
  }

  Consultar(){}

  Seleccionar(){}

  GenerarSemillero(){
    this.xAPI.funcion = "FID_CSemilleroContable"
    this.xAPI.parametros = ""
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null) {
          let codigo = parseInt(data[0].codigo) + 1
          this.Comprobante.numero = this.util.zfill(codigo, 4)
        
        } else {
          this.Comprobante.numero = "0001"
        }

      },
      (error) => {
        console.log(error)
        //this.Limpiar()
      }
    )
  }



  cargarContenido(): any {

    this.lstComprobante = []
    this.xAPI.funcion = "FID_CCuentas"
    this.xAPI.parametros = ''
    this.xAPI.valores = ""
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstComprobante = data.Cuerpo
        
        this.lstComprobante.forEach(e => {
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
          let valor = cta  + ' | ' + e.descripcion.toUpperCase() 
          this.Cuentas.push(valor)
        });

        this.filteredCuentas = this.myCuentas.valueChanges.pipe(
          startWith(''),
          map(value => this._filterCuentas(value || '')),
        );
      },
      (err) => {
        console.error(err)
      }
    )
  }



  private _filterCuentas(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.Cuentas.filter(option => option.toLowerCase().includes(filterValue));
  }


  obtenerValores(){
    let cta = this.cuenta.split('|')
    this.IComprobante.cuenta = cta[0].trim()
    this.IComprobante.descripcion = cta[1].trim()
    
    console.log(this.myCuentas)
  }
  addElement(){
    // this.saldo_debe = parseFloat(this.saldo_debe * 1
    // this.saldo_haber = this.saldo_haber * 1
    
    if ( this.debe <= 0 && this.haber <= 0 ) {
      this._snackBar.open('Por favor verifique los campos ','ok')
      return
    }
    
    let fecha = new Date(this.fechaejercicio.value).toISOString()
    let cta = this.cuenta.split('|')
    let detalle = {
      'cuenta' : cta[0].trim(),
      'descripcion' : cta[1].trim(),
      'debe' : this.debe,
      'haber': this.haber,
      'fecha': fecha.substr(0,10),
      'referencia': '',
      'auxiliar': '',
      'cc': '',
      'tipo': '',
      'estatus': false
    }
    // if ( this.IComprobante.plan == '' ) {
    //   this._snackBar.open('Por favor seleccione un plan o fideicomiso','ok')
    //   return
    // }
    console.log( parseFloat(this.saldo_debe) )
    let sd = parseFloat(this.saldo_debe) + parseFloat(this.debe.toString())
    let sh = parseFloat(this.saldo_haber) + parseFloat(this.haber.toString())

    this.saldo_debe = sd.toString()
    this.saldo_haber = sh.toString()
    
    this.ELEMENT_DATA.push(detalle)

    this.dataSource = new MatTableDataSource<IComprobante>(this.ELEMENT_DATA)
    this.dataSource.paginator = this.paginator
    this.cuenta = ''
    this.myCuentas.setValue('')
    this.debe = 0
    this.haber = 0

  }


  Guardar(){
    if (this.saldo_debe != this.saldo_haber) {
      this._snackBar.open('Por favor verifique los asientos, existe una diferencia','ok')
      return
    }
  }

}
