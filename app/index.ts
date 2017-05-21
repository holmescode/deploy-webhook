import * as Hapi from 'hapi';
import * as Joi from 'joi';
import * as Boom from 'boom';
import * as Amqp from 'amqp-ts';

const amqpUrl = process.env.AMQP_URL || 'amqp://localhost';
const connection = new Amqp.Connection(amqpUrl);
const exchange = connection.declareExchange('holmescode.deployments', 'topic', {
    durable: true,
    autoDelete: false
});

const server = new Hapi.Server();
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
        const message = new Amqp.Message(JSON.stringify(request.payload));
        exchange.send(message);
        reply(true);
    }
});

connection.completeConfiguration()
    .then(() => server.start())
    .then(() => console.info('Server ready'))
    .catch(err => console.error(`Error connecting to exchange: ${err}`));
