const char* deviceId = "esp134kjhr44h2j";
const char* passwd = "kenaje4k3j";
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

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  
}

void loop() {
  // put your main code here, to run repeatedly:
  async()
  Serial.println("Normal flow of program");
  delay(2000);
}
