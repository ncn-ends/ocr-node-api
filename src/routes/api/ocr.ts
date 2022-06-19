import APIKeyController from "../../controllers/APIKeyController";

const ocrApiEndpoint = ( { isMethod, hasParam, responses, req, res, Parser, checkHeader, checkQueryParam } ) => {
    if ( !isMethod( 'POST' ) )
        return responses.reject(405);

    if ( !hasParam( 'api_key' ) || !checkQueryParam( "api_key", APIKeyController.isValidApiKey ) ) {
        return responses.reject(401,  'Invalid or missing API Key' );
    }

    if (
        !checkHeader( {
            header: 'content-type',
            value: 'multipart/form-data',
        } )
    )
        return responses.reject(415, 
            "Content Type Header missing. Should be 'multipart/form-data'"
        );

    const err = Parser.formBody( { req, responses } );
    if (err) {
        console.log("entered err");
        responses.reject(res, 500, err);
    }
};

module.exports = ocrApiEndpoint;
