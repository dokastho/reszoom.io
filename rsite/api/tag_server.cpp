#include "tag_server.h"
#include "string.h"
#include "unistd.h"
#include <thread>
#include <sys/types.h>
#include <netinet/in.h>
#include <memory>
#include <iostream>
#include <sstream>
#include <fstream>
#include <vector>

std::mutex rcv_msg_lock, cout_lock;

const unsigned int MAX_MESSAGE_SIZE = 256;

// copy of keywords in memory
std::map<std::string, std::vector<std::string>> tag_words;

const std::vector<std::string> TAG_LISTS = {
    "backend",
    "db",
    "frontend",
    "lang",
    "web"};

// print with the cout_lock
void lock_print(const char *str)
{
    cout_lock.lock();
    std::cout << str << "\n";
    cout_lock.unlock();
}

// send len bytes from buf over sock
void send_bytes(int sock, const char *buf, int len)
{
    int sent = 0;
    int n = 0;
    do
    {
        n = send(sock, buf + sent, len - sent, MSG_NOSIGNAL);
        sent += n;
    } while (sent < len);
}

int get_port_number(int sockfd)
{
    struct sockaddr_in addr;
    socklen_t length = sizeof(addr);
    if (getsockname(sockfd, (sockaddr *)&addr, &length) == -1)
    {
        perror("Error getting port of socket");
        // exit(1);
        return -1;
    }
    // Use ntohs to convert from network byte order to host byte order.
    return ntohs(addr.sin_port);
}

// read the contents of each tag keyword file into memory
int init()
{
    for (size_t i = 0; i < TAG_LISTS.size(); i++)
    {
        // read files
        std::string tagFile = TAG_LISTS[i];
        std::fstream fp;
        fp.open("files/" + tagFile + ".tags");

        if (!fp.is_open())
        {
            return 1;
        }

        // store the keywords for each tag in memory
        std::string line;
        while (getline(fp, line))
        {
            tag_words[tagFile].push_back(line);
        }
    }
    return 0;
}

int handle_connection(int connectionfd)
{
    // (1) Receive message from client.

    char msg_cstr[MAX_MESSAGE_SIZE + 1];
    memset(msg_cstr, 0, sizeof(msg_cstr));

    // Call recv() enough times to consume all the data the client sends.
    size_t recvd = 0;
    ssize_t rval;
    rcv_msg_lock.lock();
    do
    {
        // Receive as many additional bytes as we can in one call to recv()
        // (while not exceeding MAX_MESSAGE_SIZE bytes in total).
        rval = recv(connectionfd, msg_cstr + recvd, MAX_MESSAGE_SIZE - recvd, 0);
        if (rval == -1)
        {
            perror("Error reading stream message");
            // exit(1);
            return -1;
        }
        recvd += rval;
    } while (msg_cstr[strlen(msg_cstr)] != '\0'); // old: recv() returns 0 when client closes
    rcv_msg_lock.unlock();
    close(connectionfd);
    // (2) Print out the message
    std::stringstream out;
    out << "Client " << connectionfd << " says " << msg_cstr;
    lock_print(out.str().c_str());

    // (3) Compute tags
    Tags t(msg_cstr);
    t.assign_tags();

    int send_sock = t.get_dest_sock();

    std::vector<std::string> tags = t.get_tags();

    // construct space-separated reply
    std::stringstream ss;
    for (size_t i = 0; i < tags.size(); i++)
    {
        ss << tags[i] << " ";
    }

    std::string response = ss.str();

    char reply[MAX_MESSAGE_SIZE] = {'\0'};
    for (size_t i = 0; i < strlen(response.c_str()); i++)
    {
        reply[i] = response.c_str()[i];
    }

    // (4) Send reply
    out.str("");
    out << "Sent " << reply << " to " << send_sock;
    lock_print(out.str().c_str());

    send_bytes(send_sock, reply, MAX_MESSAGE_SIZE);

    // (5) Close connection
    close(send_sock);

    return 0;
}

int main(int argc, char *argv[])
{
    int port = argc == 1 ? 0 : atoi(argv[1]);

    sockaddr_in addr;

    memset(&addr, 0, sizeof(addr));
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = htonl(INADDR_ANY);
    addr.sin_port = htons(port);

    // (1) Create socket
    int sock = socket(AF_INET, SOCK_STREAM, 0);
    if (sock == -1)
    {
        perror("Error opening stream socket");
        // exit(1);
        return -1;
    }

    // (2) Set the "reuse port" socket option
    int yesval = 1;
    if (setsockopt(sock, SOL_SOCKET, SO_REUSEADDR, &yesval, sizeof(yesval)) == -1)
    {
        perror("Error setting socket options");
        // exit(1);
        return -1;
    }
    // (3) Bind to the port.
    if (bind(sock, (sockaddr *)&addr, sizeof(addr)) == -1)
    {
        perror("Error binding stream socket");
        // exit(1);
        return -1;
    }

    // (3b) Detect which port was chosen.
    if (argc == 1 || port == 0)
    {
        port = get_port_number(sock);
    }
    else if (port < 0 || port > 0xFFFF)
    {
        // exit(1);
        return -1;
    }

    listen(sock, 30);

    // initialize tag keywords
    if (init())
    {
        // file could not be opened
        return -1;
    }

    std::cout << "\n@@@ port " << port << std::endl;
    while (true)
    {
        int clientsocket = accept(sock, 0, 0);
        if (clientsocket == -1)
        {
            perror("Error accepting connection");
            // exit(1);
            return -1;
        }
        std::thread s(handle_connection, clientsocket);
        s.detach();
    }
}
