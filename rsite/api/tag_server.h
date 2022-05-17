#ifndef TAG_SERVER
#define TAG_SERVER

#include <mutex>
#include <map>
#include <vector>
#include <queue>
#include <string>

std::mutex rcv_msg_lock, cout_lock;

const unsigned int MAX_MESSAGE_SIZE = 256;

// tag engine class

class Tags {
    private:
    // words map: {word, freq}
    std::map<std::string, int> words;

    // tags map: {word, prob}
    std::map<std::string, float> tags;
 
    public:
    // default constructor. behavior undefined atm
    Tags();

    // overloaded constructor, takes message as argument and will split it
    Tags(char* msg_str);

    void assign_tags();

    // return the tags vector
    std::vector<std::string> get_tags();
};

#endif