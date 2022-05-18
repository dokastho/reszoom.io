#include "tag_server.h"
#include <sstream>
#include <string>
#include <vector>
#include <cstring>
#include <ctype.h>
#include <algorithm>
#include "unistd.h"
#include <sys/types.h>
#include <netinet/in.h>

bool Tags::is_in(std::string word, std::string category)
{
    for (size_t i = 0; i < tag_words[category].size(); i++)
    {
        std::string keyword = tag_words[category][i];
        if (!strcmp(word.c_str(), keyword.c_str()))
        {
            return true;
        }
    }
    return false;
}

Tags::Tags()
{
}

Tags::Tags(char *msg_str)
{
    // unpack port
    int port = 0, portlen = 5;
    for (size_t i = 0; i < 5; i++)
    {
        // base 10 ops
        port *= 10;  // move digit over
        const char c = msg_str[i];
        int digit = (int)c - 48;
        if (digit > 9)
        {
            // end of port num
            portlen = i;
            break;
        }
        port += digit;
    }
    // create a socket with the port
    sockaddr_in addr;

    memset(&addr, 0, sizeof(addr));
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = htonl(INADDR_ANY);
    addr.sin_port = htons(port);

    int sock = socket(AF_INET, SOCK_STREAM, 0);
    connect(sock, (sockaddr *)&addr, sizeof(addr));

    this->dest = sock;

    // unpack message
    std::stringstream ss;
    for (size_t i = portlen; i < strlen(msg_str); i++)
    {
        char c = msg_str[i];
        // split message by spaces
        if (c == ' ')
        {
            std::string word = ss.str();
            // verify that word is not a stopword
            words[word] = 1;

            ss.str("");
        }
        else
        {
            ss << c;
        }
    }
    std::string word = ss.str();
    // verify that word is not a stopword
    words[word] = 1;
}

void Tags::assign_tags()
{
    // current method: boolean extraction from static lists
    for (size_t i = 0; i < TAG_LISTS.size(); i++)
    {
        std::string cat = TAG_LISTS[i];
        for (auto it = words.begin(); it != words.end(); it++)
        {
            std::string word = it->first;
            if (is_in(word, cat))
            {
                tags[cat] = 1.0;
            }
        }
    }
}

std::vector<std::string> Tags::get_tags()
{
    // return a vector of the best tags
    // atm: just return boolean "exists in file" with no probability
    std::vector<std::string> vec;
    for (auto it = tags.begin(); it != tags.end(); it++)
    {
        vec.push_back(it->first);
    }
    return vec;
}

int Tags::get_dest_sock()
{
    return dest;
}