import { Inject, Injectable } from '@angular/core';


@Injectable({
    providedIn: 'root'
})
export class ImprimirService {

    createHtmlSectionForPrint(printContents: any, i: number = 0, xsize : string = '') {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        let headContent = '';
        if (i === 0) {
            headContent = ` 
            <base href="${window.location.origin}/">
            <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style type="text/css">
            @page { 
                size: letter portrait;
                margin: 10mm 12mm;
            }
            @media print {
                body { padding: 0 !important; margin: 0 !important; }
                div, table, thead, tbody, tfoot, tr, th, td, p { font-family: 'IBM Plex Sans', sans-serif; }
                table { width: 100%; border-collapse: collapse; page-break-inside: auto; }
                tr { page-break-inside: auto; }
                th, td { padding: 10px 16px; }
            }

            body { 
                font-family: 'IBM Plex Sans', sans-serif;
                font-size: 13px;
                line-height: 1.5;
                color: #0F172A;
                margin: 0;
                padding: 0;
            }

            table { 
                width: 100%; 
                border-collapse: collapse;
            }

            th, td { 
                padding: 10px 16px; 
            }
            </style>`;
        } else {
            headContent = ` 
            <base href="${window.location.origin}/">
            <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
            <style type="text/css">
                @media print {
                    @page { 
                        size: landscape; 
                    }
                    table {
                        border-collapse: collapse;
                        font-size: 10.5px;
                        width: 100%;
                    }
                    div, table, thead, tbody, tfoot, tr, th, td, p { font-family: "Roboto"; font-size: x-small; }
                    .titulo th { border: 1px solid black; }
                    .cabecera th { border: 1px solid black; text-align: center; background-color: rgb(182, 167, 167); }
                    tr td { border: 1px solid black; text-align: center; }
                    td, th { padding: 0.5rem; }
                    .right { text-align: right; }
                    .bgblue { background-color: rgb(182, 167, 167); color: white; }
                    .none { border: none; }
                    .linea { background-color: rgb(255, 255, 255); }
                    .yellow { background-color: rgb(97, 97, 75); }
                }

                table {
                    border-collapse: collapse;
                    font-size: 10.5px;
                    width: 100%;
                }
                div, table, thead, tbody, tfoot, tr, th, td, p { font-family: "Roboto"; font-size: x-small; }
                .titulo th { border: 1px solid black; }
                .cabecera th { border: 1px solid black; text-align: center; background-color: rgb(182, 167, 167); }
                tr td { border: 1px solid black; text-align: center; }
                td, th { padding: 0.5rem; }
                .right { text-align: right; }
                .bgblue { background-color: rgb(182, 167, 167); color: white; }
                .none { border: none; }
                .linea { background-color: rgb(255, 255, 255); }
                .yellow { background-color: rgb(97, 97, 75); }
            </style>`;
        }

        printWindow.document.write(`
            <html>
            <head>
                ${headContent}
            </head>
            <body>${printContents}</body>
            </html>
        `);

        const triggerPrint = () => {
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };

        const images = printWindow.document.querySelectorAll('img');
        if (images.length > 0) {
            let loadedCount = 0;
            const onImageLoaded = () => {
                loadedCount++;
                if (loadedCount === images.length) {
                    setTimeout(triggerPrint, 300);
                }
            };
            images.forEach((img: any) => {
                if (img.complete) {
                    onImageLoaded();
                } else {
                    img.onload = onImageLoaded;
                    img.onerror = onImageLoaded;
                }
            });
            setTimeout(triggerPrint, 2500); // Fallback timeout
        } else {
            setTimeout(triggerPrint, 500);
        }
    }
}
