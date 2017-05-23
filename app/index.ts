import * as Hapi from 'hapi';
import * as Joi from 'joi';
import * as Boom from 'boom';
import * as Amqp from 'amqp-ts';
import * as bunyan from 'bunyan';

const log = bunyan.createLogger({
    name: 'deploy-webhook'
});

const amqpUrl = process.env.AMQP_URL || 'amqp://localhost';
const connection = new Amqp.Connection(amqpUrl);
const exchange = connection.declareExchange('holmescode.deployments', 'topic', {
    durable: true,
    autoDelete: false
});

const server = new Hapi.Server({
    debug: {
        request: [ 'error' ]
    }
});

server.connection({
    host: '0.0.0.0',
    port: process.env.PORT || 5000
});

server.route({
    method: 'GET',
    path: '/health',
    handler: (request, reply) => {
        reply(null);
    }
});

server.route({
    method: 'POST',
    path: '/',
    config: {
        validate: {
            payload: {
                callback_url: Joi.string(),
                push_data: {
                    tag: Joi.string(),
                },
                repository: {
                    repo_name: Joi.string()
                }
            },
            options: {
                allowUnknown: true
            },
        },
    },
    handler: (request, reply) => {
        const json = JSON.stringify(request.payload);
        log.info({ request: json }, 'Received image push notification');
        exchange.send(new Amqp.Message(json));
        reply(true);
    }
});

connection.completeConfiguration()
    .then(() => server.register({
        register: require('hapi-bunyan'),
        options: {
            logger: log
        }
    }))
    .then(() => server.start())
    .then(() => log.info('Server ready'))
    .catch(err => log.error({ exchange }, 'Error connecting to exchange'));
