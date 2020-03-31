
var mqtt = require('mqtt');

class MqttHandler {

  constructor() {
    this.mqttClient = null;
    this.host = 'mqtt://192.168.71.8:1883';
  }

  connect() {
    this.mqttClient  = mqtt.connect( this.host );
    
    // Mqtt error calback
    this.mqttClient.on('error', (err) => {
      console.log(err);
      this.mqttClient.end();
    });

    // Connection callback
    this.mqttClient.on('connect', () => {
      console.log(`mqtt client connected`);
    });

    // mqtt subscriptions
    this.mqttClient.subscribe('mytopic', {qos: 0});

    // When a message arrives, console.log it
    this.mqttClient.on('message', function (topic, message) {
      console.log(message.toString());
    });

    this.mqttClient.on('close', () => {
      console.log(`mqtt client disconnected`);
    });  
  }

  sendMessage( topic, message ) {
    console.log('My TOPIC: ' + topic);
    this.mqttClient.publish( topic, message);
  }  
}

class Singleton {

  constructor() {
    if (!Singleton.instance) {
        Singleton.instance = new MqttHandler();
    }
  }

  getInstance() {
    return Singleton.instance;
  }
}

module.exports = Singleton;



// client.on('connect', function () {
//   client.subscribe('abba');
//   client.publish('presence', 'Hello mqtt');  
// })

// client.on('message', function (topic, message) {  
//   console.log(topic.toString());
//   console.log(message.toString());
//   client.end()
// })

// function intervalFunc() {
//   console.log('Publish topic presence !');
//   client.publish('presence', 'how are you?');
// }