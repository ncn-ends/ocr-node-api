import * as fs from 'fs';
import * as path from 'path';
import { Responses } from './../types/responses.types';
import Tesseract from '../Tesseract';
import { FormBodyFile } from "./../Parser";

export default class FileController {
    static write( { files, responses }: {
        files: FormBodyFile[];
        responses: Responses;
    } ) {
        const outputDir = path.join( __dirname, '../../out/imgPreScan/' );
        if ( files ) {
            for ( let file of files ) {
                const stream = fs.createWriteStream( outputDir + file.filename );
                stream.write( file.picture, 'binary' );
                stream.close();
                file.picture = 'bin';

                Tesseract.process( { responses, filename: file.filename } );
            }
        }
    }

    static cleanUpFiles( { textFileName, imgFileName }: {
        textFileName: string;
        imgFileName: string;
    } ): void {
        const pathToScannedText = path.join( __dirname, '../../out/scannedText/' );
        const pathToDownloadedImg = path.join( __dirname, '../../out/imgPreScan/' );
        fs.unlinkSync( pathToScannedText + textFileName );
        fs.unlinkSync( pathToDownloadedImg + imgFileName );
    }
}
