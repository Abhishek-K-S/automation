#include<WiFi.h>
#include <PubSubClient.h>
#include "secret.h";

unsigned int previous = 0;
unsigned int interval = 2000;

char baseString[50];
int len = 0;

char eventUpdateStatus[40];
char eventErrAction[40];

//mqtt subscribe actions
char eventGetDeviceStat[40];
char eventStartImmediate[40];
char eventStopImmediate[40]; 
char eventRegisterConfirm[40];
char eventReconnect[40];

bool runningState = false;
bool lastState = false;
unsigned int lastUpdate = 0;

unsigned int phase=0;
int voltage[3] = {0, 0, 0};
bool manual = false;

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);

void sendError(char* request, char* reason, char* _id){
  char custom[400]= "{\"request\": \"";

  strcat(custom, request);

  strcat(custom, "\", \"reason\": \"");

  strcat(custom, reason);

  if(strlen(_id)>0){
    strcat(custom, "\", \"_id\": \"");
    strcat(custom, _id);
  }

  strcat(custom, "\"}");

  mqttClient.publish(eventErrAction, custom);
}

void sendDeviceStat(char* _id){
  char stat[500] = "{\"runningState\":";

  if(runningState){
    strcat(stat, "true");
  }else{
    strcat(stat, "false");
  }

  strcat(stat, ",\"phase\":");
  strcat(stat, String(phase).c_str());

  strcat(stat, ",\"voltage\":[");
  strcat(stat, String(voltage[0]).c_str());
  strcat(stat, ",");
  strcat(stat, String(voltage[1]).c_str());
  strcat(stat, ",");
  strcat(stat, String(voltage[2]).c_str());
  strcat(stat, "]");

  strcat(stat, ",\"manual\":");
  if(manual){
    strcat(stat, "true");
  }
  else{
    strcat(stat, "false");
  }

  int len = strlen(_id);

  Serial.print("id len = ");
  Serial.println(len);
  Serial.print("object till now ");
  Serial.print(stat);
  if(len>0 && len < 50){
    strcat(stat, ",\"_id\":\"");
    strcat(stat, _id);
    strcat(stat, "\"");
  }

  strcat(stat, "}");

  Serial.print("stat is ");
  Serial.println(stat);
  
  //take all measures for every 3 seconds, and store them on a variable;
  mqttClient.publish(eventUpdateStatus, stat);
}



////actions
void startPump3phase(){
  manual = false;
  runningState = true;
  lastUpdate = millis();
}

void stopPump3Phase(){
  manual = false;
  runningState = false;
  lastUpdate = millis();
}

void getReadings(bool immediate){
  unsigned int now = millis();

  if(immediate || (now-previous)>interval){
    previous = now;

//    runningState = false;
    //check if pump is actually running
//    get all voltage readings

    voltage[0] = 200;
    voltage[1] = 201;
    voltage[2] = 210;
    
    int p = 0;
    for(int i = 0; i<3; i++)
      if(voltage[i] >110)
        p++;

    phase = p;

//    check if in running condition
//    runnigState = that funciton()

    if(lastState != runningState){
      unsigned int now = millis();

      if((now - lastUpdate) >= (interval*2)){
        Serial.println("\n");
        Serial.println("greater than interaval 1.5");
        manual = true;
      }
    }

    lastState = runningState;
  }
}

void getId(byte* payload, unsigned int length, char* _sid){
  char cred[length+1];
  memcpy(cred, payload, length);
  cred[length] = '\0';
  Serial.println(cred);
  String credStr = String(cred);
  int i = credStr.indexOf("__id__");
  Serial.print("id found ");
  Serial.print(strlen(cred));
  Serial.print(" ");
  Serial.print(length-i-6);
  Serial.print(" ");
  Serial.println(i);
  if(i > -1 && (i+6) < length){
    char* _id = (char*)(credStr.substring(i+6, length).c_str());
    Serial.println(_id);
    if(strlen(_id) < 100)
      strcat(_sid, _id);
  }
  Serial.println("[Exiting] ");
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i=0;i<length;i++) {
    Serial.print((char)payload[i]);
  }

  Serial.println();

  if(strcmp(topic, reconnect) == 0){
    //device needs to reconnect to the server
    mqttClient.publish(registerDevice, String(String(deviceId)+",PUMP").c_str());
  }
  else if( strlen(topic)>len ){
    if(strcmp(topic, eventRegisterConfirm) == 0){
      mqttClient.subscribe(eventGetDeviceStat);
      mqttClient.subscribe(eventStartImmediate);
      mqttClient.subscribe(eventStopImmediate);
    }
    else if(strcmp(topic, eventGetDeviceStat)==0){
//      create a json adn send back
      Serial.println("event get stats");
      sendDeviceStat("");
    }
    else {
      unsigned int now = millis();
      char _id[100]="";
      getId(payload, length, _id);
      
      if((now-lastUpdate) < (2 *interval)){
        sendError("Immediate action", "Immediate action not accepted.", _id);
        return;
      }
      
      if(strcmp(topic, eventStartImmediate) == 0){
        
        if(runningState){
          //already running, so no cation,instaead throw an error
          sendError("PUMP_START", "Pump already running", _id);
          
        }
        else{
          startPump3phase();
    
          Serial.print("Id is ");
          Serial.println(strlen(_id));
        }
  
        delay(800);
        getReadings(true);
  
        sendDeviceStat(_id);
        
        Serial.println("event start immediate");
      }
      else if(strcmp(topic, eventStopImmediate) == 0){
        if(!runningState){
          sendError("PUMP_STOP", "Pump already not running", _id);
        }
        else{
          stopPump3Phase();
        }
        
        delay(800);
        getReadings(true);
        
        sendDeviceStat(_id);
        Serial.println("event stop immediate");
      }
    }
  }
  
  Serial.println();
}

void connectToWifi(){
  WiFi.begin(wifiSsid, wifiPasswd);
  while (true) {
  if(WiFi.status() == WL_CONNECTED){
      Serial.println("[WiFi] WiFi is connected!");
      Serial.print("[WiFi] IP address: ");
      Serial.println(WiFi.localIP());
break;
  }
  else{
      Serial.print("[WiFi] WiFi Status: ");
      Serial.println(WiFi.status());
  }
  delay(500);
}
}

void createKeys(){
  strcpy(baseString, String(String("dev/")+String(deviceId)+String("/")).c_str());
  len = strlen(baseString);

  strncpy(eventUpdateStatus, baseString, len);
  strcat(eventUpdateStatus, updateStatus);

  strncpy(eventErrAction, baseString, len);
  strcat(eventErrAction, errAction);

  strncpy(eventGetDeviceStat, baseString, len);
  strcat(eventGetDeviceStat, getDeviceStat);

  strncpy(eventStartImmediate, baseString, len);
  strcat(eventStartImmediate, startImmediate);

  strncpy(eventStopImmediate, baseString, len);
  strcat(eventStopImmediate, stopImmediate);
  
  strncpy(eventRegisterConfirm, baseString, len);
  strcat(eventRegisterConfirm, registerConfirm);

  Serial.println("deivce will topic");
  Serial.println();
}

void mqttSubscribe(){
  mqttClient.subscribe(eventRegisterConfirm);
  mqttClient.subscribe(reconnect);
  mqttClient.publish(registerDevice, String(String(deviceId)+",PUMP").c_str());
}

void connectToMqtt(){
  while(true){
    mqttClient.setServer(mqttServer, mqttPort);
    mqttClient.setCallback(callback);
    mqttClient.setKeepAlive(6);
  
    // Connect to MQTT broker
    if (mqttClient.connect(deviceId, offline, 0, false, String(String(deviceId)+",auth").c_str())) {
      Serial.println("Connected to MQTT broker");
      
      mqttSubscribe();
      
      break;
    } else {
      Serial.println("Failed to connect to MQTT broker");
    }
    delay(1000);
  }
}

void setup() {
  Serial.begin(9600);
  connectToWifi();

  createKeys();
  Serial.println(String(len)+String(" base string is")+String(baseString));

  connectToMqtt();
}

void loop() {
  if(WiFi.status() != WL_CONNECTED){
          connectToWifi();
      }
  if (!mqttClient.connected()) {
    connectToMqtt();
  }

  getReadings(true);
  
  mqttClient.loop();  

  delay(1000);
}
