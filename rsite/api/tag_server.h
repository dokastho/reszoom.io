#ifndef TAG_SERVER
#define TAG_SERVER

#include <mutex>
#include <map>
#include <vector>
#include <queue>
#include <string>

extern std::mutex rcv_msg_lock, cout_lock;

extern const unsigned int MAX_MESSAGE_SIZE;

extern const std::vector<std::string> TAG_LISTS;

extern std::map<std::string, std::vector<std::string>> tag_words;

enum class VALID : bool {
    GOOD,
    BAD,
};

// tag engine class

class Tags {
    private:

    VALID v;

    int dest_port;
    int dest;

    // words map: {word, freq}
    std::map<std::string, int> words;

    // tags map: {word, prob}
    std::map<std::string, float> tags;

    // search for a word from a keyword vector
    bool is_in(std::string, std::string);
 
    public:
    // default constructor. behavior undefined atm
    Tags();

    // overloaded constructor, takes message as argument and will split it
    Tags(char*);

    // use any given method to assign tags to a message
    void assign_tags();

    // return the tags vector
    std::vector<std::string> get_tags();
    
    // connect to the dest socket
    int connect_dest();

    // return dest socket
    int get_dest_sock();


    bool is_valid();
};

#endif