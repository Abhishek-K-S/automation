#include<WiFi.h>
#include<ESP32MQTTClient.h>
//#include "Queue.h";
//#include "secret.h"

ESP32MQTTClient mqttClient;
//Queue<char*> messageQueue;

unsigned long previous = 0;

const int interval = 5000;


void async(){
  unsigned long now = millis();
  if(now - previous >= interval){
    previous = now;
    // Put code here to run nonblockingly for every 5 seconds
    Serial.println("Async code running");
    
  }
}

void connectToWifi(){
//  WiFi.begin(wifiSsid, wifiPasswd);
  WiFi.begin("Kenaje_2.4G", "kenaje@1819");
  int tryDelay = 500;

  // Wait for the WiFi event
  while (true) { 
    if(WiFi.status() == WL_CONNECTED){
        Serial.println("[WiFi] WiFi is connected!");
        Serial.print("[WiFi] IP address: ");
        Serial.println(WiFi.localIP());
        mqttClient.enableDebuggingMessages();

//        mqttClient.setURI(mqttServer);
        mqttClient.setURI("mqtt://192.168.101.8:1883");
        //mqttClient.enableLastWillMessage("leaving", deviceId);
        mqttClient.setKeepAlive(30);
        mqttClient.loopStart();
        break;
    }
    else{
        Serial.print("[WiFi] WiFi Status: ");
        Serial.println(WiFi.status());
    }
    delay(tryDelay);
  }
}

void setup() {
  Serial.begin(9600);
//  Serial.println("value of ssid is "+String(wifiSsid));
  connectToWifi();
}

void loop() {
  if(WiFi.status() != WL_CONNECTED){
    connectToWifi();
  }
  async();
//  mqttClient.publish("registerDevice", "deviceId", 0, false);
//  bool value = messageQueue.isEmpty();
//  Serial.println("is queue empty"+String(value));
  delay(2000);
}

void onConnectionEstablishedCallback(esp_mqtt_client_handle_t client){
  if(mqttClient.isMyTurn(client)){
//    mqttClient.subscribe(registerConfirm, [](const String &payload){
//      mqttClient.subscribe( getDeviceStat, [](const String &payload){messageQueue.push(payload);});
//      mqttClient.subscribe( startImmediate, [](const String &payload){messageQueue.push(payload);});
//      mqttClient.subscribe( stopImmediate, [](const String &payload){messageQueue.push(payload);});
//      mqttClient.subscribe( ping, [](const String &payload){messageQueue.push(payload);});
//    });
    Serial.println("Its my turn ");
//    mqttClient.publish("registerDevice", "deviceId", 0, false);
  }
}

esp_err_t handleMQTT(esp_mqtt_event_handle_t event){
  mqttClient.onEventCallback(event);
  return ESP_OK;
}
