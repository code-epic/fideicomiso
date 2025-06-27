import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.css']
})
export class FileComponent implements OnInit {

  @ViewChild('fileInput') fileInput: ElementRef;

  fileAttr = 'Seleccionar archivos';
 
  //Define el metodo de accion sobre la carga de archivos
  @Input () ACCION: any 

  public accion : string = ""
  public tipo : any = {
    nombre : 'MAESTRO',
    delimitador : '-',
    formato : '-',
    columnas: 'codigo,nombre,descripcion',
    accion: 'db',
    datos: '0'
  }

  
  constructor() { }

  uploadFileEvt(imgFile: any) {
    if (imgFile.target.files && imgFile.target.files[0]) {
      this.fileAttr = '';
      Array.from(imgFile.target.files).forEach((file: any) => {
        this.fileAttr += file.name + ' ';
      });
      // HTML5 FileReader API
      let reader = new FileReader();
      reader.onload = (e: any) => {
        let image = new Image();
        image.src = e.target.result;
        image.onload = (rs) => {
          let imgBase64Path = e.target.result;
        };
      };
      reader.readAsDataURL(imgFile.target.files[0]);
      // Reset if duplicate image uploaded again
      this.fileInput.nativeElement.value = '';
    } else {
      this.fileAttr = 'Choose File';
    }
  }

  ngOnInit(): void {
  }


  async ngOnChanges(){ }


}
