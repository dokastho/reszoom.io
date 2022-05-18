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

std::string to_lower(std::string s)
{
    std::string l = s;
    for (size_t i = 0; i < s.size(); i++)
    {
        if (s[i] <= 90 && s[i] >= 65)
        {
            l[i] = tolower(s[i]);
        }
        else
        {
            l[i] = s[i];
        }
    }
    return l;
}

bool Tags::is_in(std::string word, std::string category)
{
    for (size_t i = 0; i < tag_words[category].size(); i++)
    {
        std::string keyword = tag_words[category][i];
        std::string lhs = to_lower(keyword), rhs = to_lower(word);
        if (!strcmp(lhs.c_str(), rhs.c_str()))
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
    // validate message
    for (size_t i = 0; i < 3; i++)
    {
        if (msg_str[i] != '@')
        {
            v = VALID::BAD;
            return;
        }
    }

    // unpack port
    int port = 0, portlen = 8;
    for (size_t i = 3; i < 8; i++)
    {
        // base 10 ops
        port *= 10; // move digit over
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

    dest_port = port;

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

int Tags::connect_dest()
{
    // create a socket with the port
    sockaddr_in addr;

    memset(&addr, 0, sizeof(addr));
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = htonl(INADDR_ANY);
    addr.sin_port = htons(dest_port);

    int sock = socket(AF_INET, SOCK_STREAM, 0);
    if (connect(sock, (sockaddr *)&addr, sizeof(addr)) == -1)
    {
        return 1;
    };

    this->dest = sock;
    return 0;
}

int Tags::get_dest_sock()
{
    return dest;
}

bool Tags::is_valid()
{
    return v == VALID::GOOD;
}