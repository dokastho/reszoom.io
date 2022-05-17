#ifndef TAG_SERVER
#define TAG_SERVER

#include <mutex>

std::mutex rcv_msg_lock, cout_lock;

const unsigned int MAX_MESSAGE_SIZE = 256;

#endif