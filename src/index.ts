import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";

export interface PubSubEvent {
    exchange: string
    payload: object
}

export interface PubSubMessage {
    data: object
    ack: Function
}

export class PubSub {

    private connection
    private channel
    private amqp

    constructor(amqplib: any) {
        this.amqp = amqplib
    }

    async createRabbitMQConnection({host, user = '', pass = '', port = 5672}) {
        let uri = PubSub.buildConnectionURI({host, user, pass, port})
        let connection$, channel$

        connection$ = this.amqp.connect(uri).then( conn => {
            channel$ = conn.createChannel().then( ch => {
                this.connection = conn
                this.channel = ch
            })
        })

        let connection = await connection$
        let channel = await channel$
        return ({ connection, channel })
    }

    publish({exchange, payload}: PubSubEvent) {
        this.channel.assertExchange(exchange, 'fanout', {durable: false})
        this.channel.publish(exchange, '', new Buffer(JSON.stringify(payload)))
    }

    observable(exchange: string): Observable<PubSubMessage> {
        let subject = new Subject<PubSubMessage>()

        this.channel.assertExchange(exchange, 'fanout', {durable: false})
        this.channel.assertQueue('', {exclusive: true}).then(q => {
            let handler = msg => {
                let decodedPayload = JSON.parse(msg.content.toString())
                let acknowledgeFunc = () => this.channel.ack(msg)
                subject.next({ data: decodedPayload, ack: acknowledgeFunc })
            }

            this.channel.bindQueue(q.queue, exchange, '')
            this.channel.consume(q.queue, handler, {noAck: false})
        }).catch( err => console.error(err) )

        return subject.asObservable()
    }

    static buildConnectionURI({host, user = '', pass = '', port = 5672}) {
        let auth = ''
        if (user !== '') auth = user + ':' + pass + '@'
        let _port = ''
        if (port !== null) _port = ':' + port

        return `amqp://${auth}${host}${_port}`
    }

}