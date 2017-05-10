import * as Hapi from 'hapi';
import * as Joi from 'joi';
import * as Boom from 'boom';

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
            }
        }
    },
    handler: (request, reply) => {
        // var entry = new Entry(request.payload);
        // entry.save()
        //     .then(e => reply(e))
        //     .catch(err => reply(Boom.badImplementation(err)));
        console.info(JSON.stringify(request.payload));
        reply(null);
    }
});

server.start()
    .then(() => console.info('Server started'))
    .catch(err => console.error(`Error starting server: ${err}`));
