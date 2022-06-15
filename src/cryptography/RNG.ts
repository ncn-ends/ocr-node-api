const { randomBytes } = require( 'crypto' );

export default class RNG {
    static generate( size: number ): string {
        const buf: Buffer = randomBytes( size );
        return buf.toString( 'hex' );
    }
};