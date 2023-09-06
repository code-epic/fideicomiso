import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { elementAt } from 'rxjs';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { UtilService } from 'src/app/services/util/util.service';

@Component({
  selector: 'app-listados',
  templateUrl: './listados.component.html',
  styleUrls: ['./listados.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ListadosComponent implements OnInit {


  public codigo = ''
  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
  }
  public lstTotales = []
  public lstDetalles = []
  public lstComprobacion = []
  public acumuladord = 0
  public acumuladorh = 0
  public acum_saldo_inicial = 0
  public acum_saldo_actual = 0

  public posicion = 0
  public cambio = false
  public HTMLComprobacion = ''

  public lstIndex = [
    {id: '71', total: 0, nombre: 'TOTAL DE ACTIVOS', debe: 0, haber: 0, acc : 0},
    {id: '72', total: 0, nombre: 'TOTAL DE PASIVOS', debe: 0, haber: 0, acc : 0},
    {id: '73', total: 0, nombre: 'TOTAL DE PATRIMONIO', debe: 0, haber: 0, acc : 0},
    {id: '74', total: 0, nombre: 'TOTAL DE GASTOS', debe: 0, haber: 0, acc : 1},
    {id: '75', total: 0, nombre: 'TOTAL DE INGRESOS', debe: 0, haber: 0, acc : 1}]; //Cuentas totalizadores de Fideicomiso


  constructor(private apiService: ApiService,
    private _snackBar: MatSnackBar,
    private ngxService: NgxUiLoaderService,
    private util: UtilService,
    public formatter: NgbDateParserFormatter,) { 

    
  }

  ngOnInit(): void {
    this.consultarTotales()
    this.generarBalanceComprobacion()

  }

  consultarTotales(){
    // this.ngxService.stopLoader('load-precierre')
    this.xAPI.funcion = "FID_CTotalesMovimiento"
    this.xAPI.parametros = '2023-07-01,2023-07-30'
    this.xAPI.valores = ''

    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {
          this.lstTotales = data.Cuerpo.map(e => {
            e.debe = e.debe == null?0: parseFloat(e.debe)
            e.haber = e.haber == null?0: parseFloat(e.haber)
            e.total = e.aumenta == 'DEBE'? e.debe - e.haber: e.haber - e.debe
            return e
          })
          
          for (let i = 0; i < this.lstIndex.length; i++) {
           
            this.lstIndex[i].total = this.lstTotales.filter(e =>{
              return e.codigo.substring(0,2)==this.lstIndex[i].id}
            ).reduce((acumulador, e) => acumulador + e.total, 0);

            
          }
          // console.log(this.lstIndex)
          // console.log(this.lstTotales)
          let i = 0
          // this.lstTotales.map(e => {
          //   if(e.totalizadora == '1'){
          //     // console.log(e.codigo, '/// ', i, '  ', this.lstIndex[i].id, '  ', this.lstIndex[i].total)
          //     e.total = e.codigo.substring(0,2)==this.lstIndex[i].id ? this.lstIndex[i].total: 0
          //     i++
          //   }
            
          // })
          
          // this.ngxService.stopLoader('load-precierre')
        
      },
      (error) => {
        console.log(error)
      }
    )
  }


  generarBalanceComprobacion(){
    // this.ngxService.stopLoader('load-precierre')
    this.xAPI.funcion = "FID_CBalanceComprobacion"
    this.xAPI.parametros = '2023-07-01,2023-07-31,2023-06-30'
    // this.xAPI.parametros = '2023-06-01,2023-06-30,2023-05-31'
    this.xAPI.valores = ''

    this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {
          this.lstComprobacion = data.Cuerpo
          this.HTMLComprobacion = `
          <table class="asientos" >
                          
          <thead background-color: #e1e1d154; height: 35px;>
            <tr style="border: 0px; border-bottom: 1px solid #ccc; background-color: #e1e1d154; height: 35px;">
              <th style="text-align: left; " >DESCRIPCION DE LA CUENTA</th>
              <th style="text-align: center;">SALDO INICIAL</th>
              <th style="text-align: center;">MONTO DEBE</th>
              <th style="text-align: center;">MONTO HABER</th>
              <th style="text-align: center;">SALDO ACTUAL</th>
            </tr>
          </thead>
          <tbody>
          `
          // console.log(this.lstComprobacion)
          this.lstComprobacion.forEach(e => {
            this.getPaso(e)
          }); 

          this.lstIndex[ this.posicion ].debe = this.acumuladord;
          this.lstIndex[ this.posicion ].haber = this.acumuladorh;  
          console.log(this.lstIndex)
          let result = this.lstIndex[4].haber - this.lstIndex[3].debe

          this.HTMLComprobacion += `
            <tr style="border: 0px; border-bottom: 1px solid #ccc; background-color: #e1e1d154; height: 35px;">  
              <th >${this.lstIndex[ this.posicion ].nombre } </th>
              <th class="text-right">${this.getMoneda( this.acum_saldo_inicial )=="0"?"-": this.getMoneda(this.acum_saldo_inicial)  }</th>
              <th class="text-right">${this.getMoneda( this.acumuladord )=="0"?"-": this.getMoneda(this.acumuladord)  }</th>
              <th class="text-right">${this.getMoneda( this.acumuladorh )=="0"?"-": this.getMoneda(this.acumuladorh) }</th>
              <th class="text-right">${this.getMoneda( this.acum_saldo_actual )=="0"?"-": this.getMoneda(this.acum_saldo_actual)  }</th>
            </tr>
            <tr style="border: 0px; border-bottom: 1px solid #ccc; background-color: #f3f3ea54; height: 35px;">  
              <td colspan="5"> &nbsp; </td>
            </tr>
            <tr style="border: 0px; border-bottom: 1px solid #ccc; background-color: #f3f3ea54; height: 35px;">  
              <th colspan=5 class="text-center total" > RESULTADO NETO </th>
            </tr>
            <tr style="border: 0px; border-bottom: 1px solid #ccc; background-color: #f3f3ea54; height: 35px;">  
              <th colspan=5 class="text-center total"> 
                Bs. ${this.getMoneda( result) }
              </th>
            </tr>
          </tbody>
        </table>
          `
          // this.ngxService.stopLoader('load-precierre')
        
      },
      (error) => {
        console.log(error)
      }
    )
  }

  getTitulosACuentas(e): string{
    let debe = e.debe==null?0:e.debe
    let haber = e.haber==null?0:e.haber
    let saldo_inicial = e.saldo_inicial==null?0:e.saldo_inicial
    let saldo_actual = e.saldo_actual==null?0:e.saldo_actual
    let titulo = ''
    if (e.totalizadora == "0"){
      let txt = '&nbsp;&nbsp;&nbsp;' + e.codigo_padre + '.' + e.parte + '.' + e.moneda + '.' + e.nivel_1 + '.' + e.nivel_2
      titulo = `
      <tr>  
          <td>${txt + '. ' + e.descripcion.toUpperCase()}</td>
          <td class="text-right">${ this.getMoneda(saldo_inicial)=="0"?"-": this.getMoneda(saldo_inicial) }</td>
          <td class="text-right">${ this.getMoneda(debe)=="0"?"-": this.getMoneda(debe) }</td>
          <td class="text-right">${ this.getMoneda(haber)=="0"?"-": this.getMoneda(haber) }</td>
          <td class="text-right">${ this.getMoneda(saldo_actual)=="0"?"-": this.getMoneda(saldo_actual) }</td>
        </tr>`
    }else{
      titulo = `
      <tr>  
        <td colspan="5" style="background-color: #eeeee4;">${e.codigo_padre + '. ' + e.descripcion.toUpperCase() }</td>
      </tr>`
    }
    return titulo 
  }

  getPaso(e) {
    let debe = e.debe==null?0:e.debe
    let haber = e.haber==null?0:e.haber
    let saldo_inicial = e.saldo_inicial==null?0:e.saldo_inicial
    let saldo_actual = e.saldo_actual==null?0:e.saldo_actual

    if ( e.codigo_padre.substring(0,2) == this.lstIndex[ this.posicion ].id ) {
      this.acumuladord += parseFloat(debe) 
      this.acumuladorh += parseFloat(haber)
      this.acum_saldo_inicial += parseFloat(saldo_inicial) 
      this.acum_saldo_actual += parseFloat(saldo_actual)

      this.HTMLComprobacion += this.getTitulosACuentas(e)

    }else{
      
      this.lstIndex[ this.posicion ].debe = this.acumuladord;
      this.lstIndex[ this.posicion ].haber = this.acumuladorh;

      this.HTMLComprobacion += `
        <tr style="border: 0px; border-bottom: 1px solid #ccc; background-color: #e1e1d154; height: 35px;">  
          <th >${this.lstIndex[ this.posicion ].nombre } </th>
          <th class="text-right">${this.getMoneda( this.acum_saldo_inicial )=="0"?"-": this.getMoneda(this.acum_saldo_inicial)  }</th>
          <th class="text-right">${this.getMoneda( this.acumuladord )=="0"?"-": this.getMoneda(this.acumuladord)  }</th>
          <th class="text-right">${this.getMoneda( this.acumuladorh )=="0"?"-": this.getMoneda(this.acumuladorh) }</th>
          <th class="text-right">${this.getMoneda( this.acum_saldo_actual )=="0"?"-": this.getMoneda(this.acum_saldo_actual)  }</th>
        </tr>
        <tr>  
          <td  colspan="5">${this.getTitulosACuentas(e)} </td>
        </tr>
        
      `
      
      this.cambio = true
      this.acumuladord = parseFloat(debe) 
      this.acumuladorh = parseFloat(haber)
      this.acum_saldo_inicial = parseFloat(saldo_inicial) 
      this.acum_saldo_actual = parseFloat(saldo_actual)
      this.posicion++
    }
   
  }

  getMoneda(numero : number) : string {
    return this.util.ConvertirMoneda(numero);
  }
  
}
