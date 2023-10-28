template<typename T>
class Queue
{
private:
    int front = 0;
    int back = 0;
    int size = 10;
    T array[10] ={};
    bool hasEle = false; 
public:
    void push(T a){
        if(!isFull()){
            array[back] = a;
            back = (back+1)%size;
            hasEle = true;
        }
    }
    T pop(){
        if(!isEmpty()){
            int last = front;
            front = (front+1)%size;
            hasEle = !(front == back);
            return array[last];
        }
    }
    bool isFull(){
        return front == back && hasEle;
    }
    bool isEmpty(){
        return hasEle;
    }
};
