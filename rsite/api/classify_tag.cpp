#include "tag_server.h"
#include <sstream>
#include <string>
#include <vector>
#include <cstring>
#include <algorithm>

bool Tags::is_in(std::string word, std::string category)
{
    for (size_t i = 0; i < tag_words[category].size(); i++)
    {
        std::string keyword = tag_words[category][i];
        if (word == keyword)
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
    std::stringstream ss;
    for (size_t i = 0; i < strlen(msg_str); i++)
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
}

void Tags::assign_tags()
{
    // current method: boolean extraction from static lists
    for (size_t i = 0; i < TAG_LISTS.size(); i++)
    {
        std::string cat = TAG_LISTS[i];
        for (size_t j = 0; j < tag_words[cat].size(); j++)
        {
            std::string w = tag_words[cat][j];
            if (is_in(w, cat))
            {
                tags[w] = 1.0;
            }
        }
    }
}

std::vector<std::string> Tags::get_tags() {
    // return a vector of the best tags
    // atm: just return boolean "exists in file" with no probability
    std::vector<std::string> vec;
    for (auto it = tags.begin(); it != tags.end(); it++)
    {
        vec.push_back(it->first);
    }
    return vec;
}