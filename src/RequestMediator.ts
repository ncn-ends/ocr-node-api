import * as url from 'url';
import { ServerResponse, IncomingMessage, STATUS_CODES } from 'http';
import Parser from './Parser';
import * as fs from 'fs';
import IPController from './controllers/IPController';
import APIKeyController from "./controllers/APIKeyController";
import { OkResBody, ReqResParam } from './types/responses.types'
import { RoutesFieldItemType } from './Server';

// this is the parameter for each route handler to avoid importing other files
export type RoutesFileParam = {
    req: IncomingMessage;
    isMethod: isMethodUtilFn;
    hasParam: hasParamUtilFn;
    checkHeader: checkHeaderUtilFn;
    responses: {
        reject: ErrResponseUtilFn;
        sendJSON: JSONResponseUtilFn;
        sendStatic: StaticResponseUtilFn;
    };
    Parser: typeof Parser;
    checkQueryParam: checkQueryParamUtilFn
};

// these are the util functions that the route handlers can use
export type StaticResponseUtilFn = ( FileToServe: string ) => void;
export type ErrResponseUtilFn = ( ErrStatus: number, details: string ) => void;
export type JSONResponseUtilFn = ( param: OkResBody ) => void;
type isMethodUtilFn = ( method: string ) => boolean;
type checkHeaderUtilFn = ( headerKeyValuePair: {
    header: string;
    value?: string;
} ) => boolean | void;
type hasParamUtilFn = ( queryParameter: string ) => boolean;
type checkQueryParamUtilFn = ( name: string, validator: Function ) => boolean;

// route handlers may return an object for ease of use
// the object will be processed by other util fn's depending on what data is returned inside the object
export type RouteFileReturnType = {
    status: number;
    headers?: { [key: string]: string };
    body: object | 'Endpoint valid but invalid method.'; // TODO: need to make the object property type here more specific
};


const parseURL = ( reqURL: string ): url.URL | null => {
    // const base =
    //     process.env.NODE_ENV === 'DEV'
    //         ? 'http://localhost:8080'
    //         : process.env.PROD_URL_BASE;
    const base = 'http://localhost:3000';

    if ( !base ) return null;
    return new url.URL( reqURL, base );
};

export default class RequestMediator {
    static serveRoutes( { req, res, routes }: ReqResParam & { routes: RoutesFieldItemType[] } ): void {
        // send/reject utils
        const reject: ErrResponseUtilFn = ( status, details ) =>
            this._genericRejection( { res, status, details } );

        const sendJSON: JSONResponseUtilFn = ( body ) =>
            this._okResponse( { res, body } );

        const sendStatic: StaticResponseUtilFn = ( fileName ) =>
            this._okResponse( {
                res,
                body: fs.readFileSync( __dirname + '/static/' + fileName ),
            } );

        // url validation and parsing
        const url = parseURL( req.url! );

        if ( url === null ) return reject( 404, `Couldn't parse URL: ${ req.url }` );

        const urlPath: string = url.pathname === '/' ? '/index' : url.pathname;

        const endpoint: RoutesFieldItemType = routes.find(
            ( ep ) => ep.endpoint === urlPath
        )!;

        if ( !endpoint ) return reject( 404, url.pathname );


        // more utils
        const isMethod: isMethodUtilFn = ( method ) =>
            req.method!.includes( method.toUpperCase() );


        // TODO: get rid of this and add the functionality to checkQueryParam
        const hasParam: hasParamUtilFn = ( queryParameter ) =>
            !!url.searchParams.get( queryParameter );

        const checkHeader: checkHeaderUtilFn = ( { header, value } ) => {
            const headerField = req.headers[header.toLowerCase()];
            const firstHeaderValue =
                headerField &&
                typeof headerField === 'string' &&
                headerField.split( ';' )[0].trim();
            return value === firstHeaderValue;
        };

        const checkQueryParam: checkQueryParamUtilFn = ( name, validator ) => {
            let valid = false;
            url.searchParams.forEach( ( value, name ) => {
                if ( name === name ) {
                    valid = validator.call( APIKeyController, value );
                }
            } );

            return valid;
        };

        // encapsulate responses in an object for easier transport
        const responses = {
            reject,
            sendJSON,
            sendStatic,
        };

        const { pass, message } = IPController.logIPAndVerify( { req } );

        if ( !pass ) return reject( 429, message! );

        // each endpoint has its own file that determines what to do with the response
        // some endpoints may not return anything from the function directly
        const resBody: RouteFileReturnType | undefined =
            endpoint.executeFileExport( {
                isMethod,
                hasParam,
                responses,
                checkHeader,
                req,
                Parser,
                checkQueryParam
            } );

        if ( !resBody ) {
            return;
        }
    }

    // generic status code 400 response on any type of error
    // the correct error message will be logged to console
    // this is set up for security reasons to limit discrepancy factor
    // testing only: correct http status code and error messages are contained in the response
    private static _genericRejection( { res, status = 400, details }: {
        res: ServerResponse;
        status: number;
        details: string;
    } ) {

        const statusOutput = process.env.NODE_ENV === 'TEST' ? status : 400;
        const statusMessage = STATUS_CODES[statusOutput];

        if ( process.env.NODE_ENV !== 'TEST' ) {
            console.trace( new Date().toISOString(), statusOutput, statusMessage, details );
        }

        res.writeHead( statusOutput );
        res.end(
            JSON.stringify( {
                error: true,
                statusOutput,
                statusMessage
            } )
        );
    }

    // status code 200 response with a body of a static file buffer or JSON
    private static _okResponse( { res, body }: {
        res: ServerResponse;
        body?: OkResBody;
    } ): void {
        if (!Buffer.isBuffer) res.setHeader("Content-Type", "application/json");
        
        res.writeHead( 200 );

        if ( Buffer.isBuffer( body ) ) return res.end( body );

        res.end( JSON.stringify( body ) );
    }
};
