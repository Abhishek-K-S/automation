#include<cstring>
char* stringJoin(const char* a, char* b){
    int size = 0;
    size = strlen(a);
    size += strlen(b);
    char newString[size];
    strcat(newString, a);
    strcat(newString, b);
    return newString;
}
