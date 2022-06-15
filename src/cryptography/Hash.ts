import * as crypto from 'crypto';

module.exports = class Hash {
    static generate( data: string ): string {
        const hash: crypto.Hash = crypto.createHash( 'BLAKE2s256' );
        let out: string = "";

        hash.on( 'readable', () => {
            const data: Buffer | null = hash.read();

            if ( data ) {
                out = data.toString( 'hex' );
            }

        } );

        hash.write( data );
        hash.end();

        return out;
    }

    static compare( phrase: string, hashToCompare: string ): boolean {
        const hashedPhrase = this.generate( phrase );

        return hashedPhrase === hashToCompare;
    }
}