import * as fs from 'fs';
import { IncomingMessage } from 'http';
import * as util from 'util';
import FileController from './controllers/FileController';
import { Responses } from './types/responses.types';

export type FormBodyFile = {
    picture: string;
    filename: string;
    'Content-Type': string;
    [key: string]: string;
};

interface FilesParam {
    [key: string]: string | FormBodyFile[];
}

export default class Parser {
    private static _getBoundary( contentTypeArray: string[] ) {
        const boundaryPrefix = 'boundary=';
        let boundary = contentTypeArray.find( ( item ) =>
            item.startsWith( boundaryPrefix )
        );
        if ( !boundary ) return null;
        boundary = boundary.slice( boundaryPrefix.length );
        if ( boundary ) boundary = boundary.trim();
        return boundary;
    }

    private static _getMatching( string: string, regex: RegExp ): string | null {
        // Helper function when using non-matching groups
        const matches = string.match( regex );
        if ( !matches || matches.length < 2 ) {
            return null;
        }
        return matches[1].trim();
    }

    static formBody( { req, responses }: {
        req: IncomingMessage;
        responses: Responses;
    } ) {
        const maxLength = 1e8; // 100mb limit
        const contentLength = parseInt( req.headers['content-length']! );

        // content-length validation
        if ( isNaN( contentLength ) || contentLength > maxLength ) {
            return responses.reject(411, 'Request body too large or non-existent.' );
        }

        const contentTypeArray = req.headers['content-type']!.split( ';' ).map(
            ( x: string ) => x.trim()
        );

        // begin parsing and storing to memory
        req.setEncoding( 'latin1' );

        let rawData = '';

        req.on( 'data', ( chunk: Buffer ) => {
            rawData += chunk;
        } );

        req.on( 'end', () => {
            const boundary = this._getBoundary( contentTypeArray );

            if ( !boundary ) return responses.reject( 400, 'Boundary missing.' );

            const rawDataArray = rawData.split( boundary );
            let result: FilesParam = {} as FilesParam;

            for ( const field of rawDataArray ) {
                let name = this._getMatching( field, /(?:name=")(.+?)(?:")/ );

                if ( !name ) continue;
                let value = this._getMatching(
                    field,
                    /(?:\r\n\r\n)([\S\s]*)(?:\r\n--$)/
                );

                if ( !value ) continue;
                let filename = this._getMatching(
                    field,
                    /(?:filename=")(.*?)(?:")/
                );

                if ( !filename ) {
                    result[name] = value;
                } else {
                    let file: FormBodyFile = {} as FormBodyFile;

                    file[name] = value;
                    file.filename = filename;
                    file['Content-Type'] = this._getMatching(
                        field,
                        /(?:Content-Type:)(.*?)(?:\r\n)/
                    )!;

                    if ( !Array.isArray( result.files ) ) {
                        result.files = [];
                    }
                    result.files.push( file );
                }
            }
            // @ts-ignore
            FileController.write( { files: result.files, responses } );
        } );
    }
};
