#include "tag_server.h"
#include <sstream>
#include <string>
#include <vector>
#include <cstring>

using namespace std;

Tags::Tags() {}

Tags::Tags(char *msg_str)
{
    stringstream ss;
    for (size_t i = 0; i < strlen(msg_str); i++)
    {
        char c = msg_str[i];
        // split message by spaces
        if (c == ' ')
        {
            string word = ss.str();
            // verify that word is not a stopword
            words[word] = 1;

            ss.str("");
        }
        else
        {
            ss << c;
        }
    }
}

void Tags::assign_tags() {}

std::vector<std::string> Tags::get_tags() {}