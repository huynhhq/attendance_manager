
var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://192.168.71.8:1883')





client.on('connect', function () {
  client.subscribe('abba')
  client.publish('presence', 'Hello mqtt')
  setInterval(intervalFunc, 1500);
})


client.on('message', function (topic, message) {
  // message is Buffer
  console.log(topic.toString())
  console.log(message.toString())
  client.end()
})

function intervalFunc() {
  console.log('Publish topic presence !');
  client.publish('presence', 'how are you?')
}



