import { IncomingMessage } from "http";

export default class IPController {
    private static _loggedIPs: { ip: string; accesses: string[] }[] = [];

    static logIPAndVerify = ( { req }: { req: IncomingMessage } ): { pass: boolean, message?: string } => {
        const parseIp = (req) =>
            req.headers['x-forwarded-for']?.split(',').shift()
            || req.socket?.remoteAddress;

        const ip = parseIp(req);

        if ( !ip ) return { pass: false, message: 'No IP found.' };

        if (process.env.NODE_ENV !== "TEST") {
            console.log( `IP: ${ ip } - has ushered a request.` );
        }

        const ipInLogsIndex = this._loggedIPs.findIndex(
            ( { ip: loggedIP } ) => loggedIP === ip
        );
        const ipInLogs = this._loggedIPs[ipInLogsIndex];

        let timestamp = new Date();
        timestamp.setSeconds( timestamp.getSeconds() + 5 );

        if ( !ipInLogs ) {
            this._loggedIPs.push( {
                ip,
                accesses: [timestamp.toISOString()],
            } );
            return { pass: true };
        }

        if ( ipInLogs ) {
            const nonExpiredAccesses = ipInLogs.accesses.filter( ( access ) => {
                return new Date( access ).getTime() > new Date().getTime();
            } );

            this._loggedIPs[ipInLogsIndex].accesses = nonExpiredAccesses;

            if ( nonExpiredAccesses.length >= 10 ) {
                return { pass: false, message: 'Too many requests.' };
            }

            this._loggedIPs[ipInLogsIndex].accesses.push(
                timestamp.toISOString()
            );
        }

        return { pass: true };
    };
}
