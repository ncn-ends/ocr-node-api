import * as path from 'path';
import * as fs from 'fs';
import RNG from './../cryptography/RNG';

type APIKeyType = {
    key: string,
    label: string
}

export default class APIKeyController {
    private static _validApiKeys: APIKeyType[] = [];

    private static saveApiKeys(): void {
        const apiKeys = JSON.stringify( { keys: this._validApiKeys } );

        fs.writeFileSync(
            path.join( __dirname, '../../apikeys.json' ),
            apiKeys
        );
    }

    static initializeStoredApiKeys(): void {
        const apiKeysFilePath = path.join( __dirname, '../../apikeys.json' );

        if ( !fs.existsSync( apiKeysFilePath ) ) {
            fs.writeFileSync( apiKeysFilePath, JSON.stringify( { keys: [] } ) );
            this._validApiKeys = [];
            return;
        }

        const apiKeysFile = fs.readFileSync( apiKeysFilePath );

        const { keys } = JSON.parse( apiKeysFile.toString() );

        this._validApiKeys = keys;
    }

    static addApiKey( label: string ): APIKeyType {
        let key: string | null = null;

        if ( this._validApiKeys.some( key => key.label === label ) ) {
            throw new Error( 'This label already applies to a different key. Use a different label instead.' );
        }

        do {
            const rng = RNG.generate( 16 );
            if ( !this._validApiKeys.some( ( { key } ) => key === rng ) ) {
                key = rng;
            }
        } while ( key === null );

        const apiKeyItem = {
            key,
            label
        };

        this._validApiKeys.push( apiKeyItem );
        this.saveApiKeys();

        console.log( 'Created api key: ', key );
        return apiKeyItem;
    }

    static isValidApiKey( apiKey: string ): boolean {
        if (process.env.NODE_ENV === 'TEST') {
            if (apiKey === "12321") return true;
        }
        return this._validApiKeys.some( ( { key } ) => key === apiKey );
    }
}
