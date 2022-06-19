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
        let pictureExists = false;
        if ( files ) {
            for ( let file of files ) {
                if (!file.picture) continue;
                pictureExists = true;
                const stream = fs.createWriteStream( outputDir + file.filename );
                stream.write( file.picture, 'binary' );
                stream.close();
                file.picture = 'bin';

                Tesseract.process( { responses, filename: file.filename } );
            }
        }
        // TODO: properly handle this
        if (!pictureExists) throw new Error("Expected 'picture' in form body but didn't appear.");
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
