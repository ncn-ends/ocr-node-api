import APIKeyController from "../../controllers/APIKeyController";

const ocrApiEndpoint = ( { isMethod, hasParam, responses, req, Parser, checkHeader, checkQueryParam } ) => {
    if ( !isMethod( 'GET' ) )
        return responses.reject(405);

    return responses.sendJSON({
        "msg": "pong"
    });
};

module.exports = ocrApiEndpoint;
