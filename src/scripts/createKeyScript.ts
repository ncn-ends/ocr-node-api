import * as process from 'process';
import APIKeyController from "@/controllers/APIKeyController";

// get label argument from cl
const args = process.argv;
const labelTagPos = args.findIndex( arg => arg === "-l" );

// throw an error if there's no label tag or if there's no arg after it
if ( labelTagPos === -1 || labelTagPos + 1 >= args.length ) {
    throw new Error( "No label argument found. " +
        "Use the command in the following format:\n" +
        "    yarn createApiKey -l \"someLabel\"" +
        "\n\n\n" )
}

const label = args[labelTagPos + 1];

APIKeyController.initializeStoredApiKeys();
APIKeyController.addApiKey( label );