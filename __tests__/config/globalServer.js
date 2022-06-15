import 'regenerator-runtime/runtime'

const {setup: setupDevServer, teardown: teardownDevServer} = require('jest-dev-server')

export async function globalSetup() {
    await setupDevServer({
        command: `yarn test:server`,
        launchTimeout: 50000,
        port: 3000,
    });
};

export async function globalTeardown() {
    await teardownDevServer()
}