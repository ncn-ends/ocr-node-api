import * as fs from 'fs';

import config from './config';
import RequestMediator from './RequestMediator';
import * as path from 'path';
import * as http from 'http';
import APIKeyController from './controllers/APIKeyController';
import { RoutesFileParam, RouteFileReturnType } from './RequestMediator';

export type RoutesFieldItemType = {
    endpoint: string;
    executeFileExport: ( param: RoutesFileParam ) => RouteFileReturnType;
};

export default class Server {
    private static _routes: RoutesFieldItemType[] = [];

    private static _establishEndpoints(): void {
        let routeDirFiles = fs.readdirSync( __dirname + '/routes' );

        const searchDirOrSetRoute = ( path = '/', subDirFiles: string[] = [] ): void => {
            // base condition requires all files in the routes directory to be searched
            if ( !routeDirFiles.length && !subDirFiles.length ) return;

            // prioritize subDirFiles over routeDirFiles
            const file = subDirFiles.pop() ?? routeDirFiles.pop();

            // check if current file matches allowed extensions from config file
            const matchingExtensions = config.routeDirFileExtensions.filter(
                ( ext: string ) => file!.endsWith( `.${ ext }` )
            );

            // condition for regular files
            if ( matchingExtensions.length ) {
                const filePathShort: string = path + file;
                const endpoint = filePathShort.slice(
                    0,
                    0 - matchingExtensions[0].length - 1
                );
                this._routes.push( {
                    endpoint,
                    executeFileExport: require( __dirname +
                        '/routes' +
                        filePathShort ),
                } );

                // if this subdirectory has been searched, reset the path to traverse the rest of the tree
                if ( !subDirFiles.length ) path = '/';

                return searchDirOrSetRoute( path, subDirFiles );
            }

            // at this point the file must be a directory, so continue searching through the directory
            const subDir = fs.readdirSync( __dirname + '/routes' + path + file );
            searchDirOrSetRoute( path + file + '/', subDir );
        };
        searchDirOrSetRoute();
    }

    static start( port: number ): void {
        // establish endpoints and store in memory to prevent disc reads for each request
        this._establishEndpoints();
        console.log( 'Active Endpoints: \n', this._routes.map(route => route.endpoint) ); // TODO: make this simpler

        // create necessary read/write directories
        ['/../out', '/../out/imgPreScan', '/../out/scannedText'].forEach(
            ( dir ) => {
                if ( !fs.existsSync( path.join( __dirname + dir ) ) )
                    fs.mkdirSync( path.join( __dirname + dir ) );
            }
        );

        // take stored api keys and store in memory
        APIKeyController.initializeStoredApiKeys();

        // ensure that there is a NODE_ENV variable set
        if ( !process.env.NODE_ENV || !["TEST", "PROD", "DEV"].includes( process.env.NODE_ENV ) ) {
            throw new Error( 'No valid NODE_ENV var set. Must be: TEST, PROD, or DEV' )
        }
        
        http.createServer((req, res) => {
            RequestMediator.serveRoutes({req, res, routes: this._routes});
        }).listen(port);


        console.log(`Listening to requests on port ${port}...`);
    }
};
