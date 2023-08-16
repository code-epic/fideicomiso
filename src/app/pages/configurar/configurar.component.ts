import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { MensajeService } from 'src/app/services/util/mensaje.service';

@Component({
  selector: 'app-configurar',
  templateUrl: './configurar.component.html',
  styleUrls: ['./configurar.component.scss']
})
export class ConfigurarComponent implements OnInit {

  public producto : string = "0"

  public xAPI : IAPICore = {
    funcion : '',
    parametros : ''
  }

  @ViewChild('hechicero', { static: true }) hechicero: TemplateRef<any>;

  @ViewChild('filex', { static: true }) filex: TemplateRef<any>;

  public lstMaestro : any
  constructor(
    public dialog: MatDialog, 
    private apiService : ApiService,
    private msj: MensajeService  
  ) { }

  ngOnInit(): void {
    this.xAPI.funcion = "SEC_CMaster"
    this.xAPI.parametros = "%"
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        console.log(data)
        this.lstMaestro = data.Cuerpo
      },
      (err) => {
        console.error(err)
      }
    )

  }

  SeleccionarCambio(e){
    console.log('testing', e, this.producto)
    //this.msj.contenido$.emit(this.producto)
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(this.filex, {
      width: '850px',
      data: {},
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      // this.animal = result;
    });
  }

  seleccionNavegacion(e){
    
  }
}
