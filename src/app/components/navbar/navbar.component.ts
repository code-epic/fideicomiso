import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ROUTES } from '../sidebar/sidebar.component';
import { Location} from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
@Output() onChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  public listTitles: any[];
  public location: Location;
  booleanIsSidenav: boolean = false;

  constructor(location: Location) {
    this.location = location;
  }

  ngOnInit() {
    this.listTitles = ROUTES.filter(listTitle => listTitle);
  }

  getTitle(){
    var titlee = this.location.prepareExternalUrl(this.location.path());
    if(titlee.charAt(0) === '#'){
        titlee = titlee.slice( 1 );
    }

    for(var item = 0; item < this.listTitles.length; item++){
        if(this.listTitles[item].path === titlee){
            return this.listTitles[item].title;
        }
    }
    return 'Principal';
  }

  onChangeSidenav() {
    this.booleanIsSidenav = !this.booleanIsSidenav;
    this.onChange.emit(true);
  }

  cerrar(){
    Swal.fire({
      title: '¿Desea salir del sistema?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        sessionStorage.clear()
        window.location.href = './';
      }
    })    
  }

}
