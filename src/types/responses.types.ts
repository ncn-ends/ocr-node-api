// formerly known as "OkResBody"
import * as http from "http";
import { ErrResponseUtilFn, JSONResponseUtilFn, StaticResponseUtilFn } from "../RequestMediator";

export type OkResBody =
    | Buffer
    | {
    uuid?: string;
    error?: string;
    stdout?: string;
    text?: string;
};


export type ReqResParam = {
    req: http.IncomingMessage;
    res: http.ServerResponse;
};

export type Responses = {
    reject: ErrResponseUtilFn;
    sendJSON: JSONResponseUtilFn;
    sendStatic: StaticResponseUtilFn;
};
