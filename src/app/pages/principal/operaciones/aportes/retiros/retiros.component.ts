import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import {  LIncremento } from 'src/app/services/banfanb/contabilidad.service';
import { UtilService } from 'src/app/services/util/util.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-retiros',
  templateUrl: './retiros.component.html',
  styleUrls: ['./retiros.component.scss']
})
export class RetirosComponent implements OnInit {
  public Incremento : any
  public blprocesar: boolean = false
  public fechai: any
  public idplan : number = 0
  public fideicomiso : string = ''
  public plan = ''
  public rif = ''

  public monto = ''

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

  public fechaultimo = ''

  public max : number = 0


  constructor(private apiService: ApiService,
    private _snackBar: MatSnackBar,
    private ngxService: NgxUiLoaderService,
    private util: UtilService,
    public formatter: NgbDateParserFormatter,) { }




  ngOnInit(): void {
    let d = new Date().toISOString().substring(0, 10).split('-')
    this.fechaultimo = d[2] + '/' + d[1] + '/' + d[0]
  }


  Seleccionar(){}

  ConsultarContrato() {
    this.ngxService.startLoader('load-cont')
    this.plan = this.util.zfill(this.plan, 4)

    this.xAPI.funcion = environment.xApi.CONSULTAR_CONTRATO
    this.xAPI.parametros = this.plan
    this.xAPI.valores = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null) {
         let Contrato = data[0]
          this.rif = Contrato.rif + '-' + Contrato.razonsocial   
          this.fideicomiso = Contrato.plan
          this.idplan = parseInt(this.plan)
              
        }
        this.ngxService.stopLoader('load-cont')
      },
      (error) => {
        this.ngxService.stopLoader('load-cont')
        console.error(error)
      }
    )
  }

  Add(){

    if ( this.plan == '') {
      return
    }
    this.ELEMENT_DATA.push({
      id: this.idplan,
      codigo: this.plan,
      tipo: this.fideicomiso.toUpperCase(),
      plan: this.rif.toUpperCase(),
      monto: this.monto,
      fecha: this.util.ConvertirFechaDB(this.fechai)
    })

    this.dataSource = new MatTableDataSource<LIncremento>(this.ELEMENT_DATA)
    this.dataSource.paginator = this.paginator;

    this.monto = ''
    this.fechai = ''
    this.rif = ''
    this.plan = ''
    this.blprocesar = true
  }


  Procesar(){
    this.max = this.ELEMENT_DATA.length
    this.insertData(0)
  }

  close(){
    this.ngxService.stopLoader('load-cont')
      this.ELEMENT_DATA = []
      this.dataSource = new MatTableDataSource<LIncremento>(
        this.ELEMENT_DATA
      );
      this.dataSource.paginator = this.paginator;
      this.blprocesar = false
      this.apiService.Mensaje('Proceso exitoso', 'Se han creado los comprobantes', 'info', 'comprobante')
  }

  insertData(cant : number) {
    
    if (cant == this.max) {
      this.close()
      return
    }
    let monto = parseFloat(this.ELEMENT_DATA[cant].monto)
    let idplan = this.ELEMENT_DATA[cant].id
    let fecha = this.ELEMENT_DATA[cant].fecha
    let Comprobante = {
      plan: idplan,
      codigo: this.ELEMENT_DATA[cant].codigo,
      descripcion: "INCREMENTO DE CAPITAL",
      detalle: `${this.ELEMENT_DATA[cant].plan}`,
      fecha_operacion: fecha,
      fecha_ejercicio: fecha,
      debe: monto,
      haber: monto,
    }

    this.xAPI.funcion = environment.xApi.INSERTAR_COMPROBANTE
    this.xAPI.parametros = ''
    this.xAPI.valores = JSON.stringify(Comprobante)
    cant++

    this.apiService.Ejecutar(this.xAPI).subscribe(
      data => {

        this.xAPI.funcion = environment.xApi.INSERTAR_RETIROS
        this.xAPI.parametros = `${data.msj},${monto},${fecha},${idplan}`, 
        this.xAPI.valores = ''
        this.apiService.Ejecutar(this.xAPI).subscribe(
          data => {
            this.insertData(cant)
          },
          (error) => {
            console.error(error)
            this.ngxService.stopLoader('load-cont')
          }
        )
        // this.InsertData(cant)
      },
      (error) => {
        console.error(error)
        this.ngxService.stopLoader('load-cont')
      }
    )


  }



  getMoneda(e) : string {
    let data = this.util.ConvertirMoneda(e)
    return data
  }

  Cancel(){

  }


}
