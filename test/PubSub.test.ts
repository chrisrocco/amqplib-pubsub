import {PubSub} from "../src";


test('builds the correct rabbit-mq connection URI', () => {
    expect(PubSub.buildConnectionURI({
        host: 'localhost'
    })).toBe('amqp://localhost:5672')

    expect(PubSub.buildConnectionURI({
        host: 'rabbitmq',
        user: 'rabbitmq',
        pass: 'rabbitmq',
        port: 1234
    })).toBe('amqp://rabbitmq:rabbitmq@rabbitmq:1234')
})