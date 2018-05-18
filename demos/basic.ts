import * as amqplib from 'amqplib'
import {PubSub} from "../src";

let pubSub = new PubSub(amqplib)

pubSub.createRabbitMQConnection({
    host: 'localhost'
})


setTimeout(() => {

    // Subscribe/Consume an Event
    pubSub.observable('user-joined-project')
        .subscribe( msg => {
            console.log('data received!', msg.data)
            msg.ack()
        })




    // Publish an Event
    setTimeout(() => {
        pubSub.publish({
            exchange: 'user-joined-project',
            payload: {
                username: 'chrisrocco',
                projectID: 1234
            }
        })
    }, 100)

}, 1000)
