import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import RNG from './cryptography/RNG';
import FileController from './controllers/FileController';
import { OkResBody } from "./types/responses.types";
import { Responses } from './types/responses.types';

export default class Tesseract {
    static process( { responses, filename }: {
        responses: Responses;
        filename: string;
    } ) {
        const uuid = RNG.generate( 16 );
        const command = `tesseract out/imgPreScan/${ filename } out/scannedText/${ uuid }`;

        child_process.exec( command, ( error, stdout, stderr ) => {
            if ( error ) {
                console.error( `exec error: ${ error }` );
                console.log( filename );
            }

            let resBody: OkResBody = {} as OkResBody;

            // tesseract will always give a warning
            // this is for actual errors
            if ( stderr && !stderr.includes( 'Warning' ) && !stderr.includes( 'Estimating resolution' )) {
                resBody = { uuid, error: stderr };
                console.log( stderr );
            } else {
                const pathToScannedText = path.join(
                    __dirname,
                    '../out/scannedText/'
                );
                const text = fs.readFileSync(
                    pathToScannedText + uuid + '.txt',
                    'utf8'
                );
                resBody = { stdout, uuid, text };
            }

            FileController.cleanUpFiles( {
                textFileName: uuid + '.txt',
                imgFileName: filename,
            } );
            // @ts-ignore
            // TODO: fix this problem
            return responses.sendJSON( resBody );
        } );
    }
};
