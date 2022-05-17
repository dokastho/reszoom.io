#include "tag_server.h"
#include "string.h"
#include "unistd.h"
#include <thread>
#include <sys/types.h>
#include <netinet/in.h>
#include <memory>
#include <iostream>
#include <sstream>

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
        //exit(1);
        return -1;
    }
    // Use ntohs to convert from network byte order to host byte order.
    return ntohs(addr.sin_port);
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
    // (2) Print out the message
    std::stringstream out;
    out << "Client " << connectionfd << " says " << msg_cstr;
    lock_print(out.str().c_str());

    // (3) Send reply
    out.str(""); 
    out << "Sent " << msg_cstr << " to " << msg_cstr;
    lock_print(out.str().c_str());
    
    send_bytes(connectionfd, msg_cstr, MAX_MESSAGE_SIZE);

    // (4) Close connection
    close(connectionfd);

    return 0;
}

int main(int argc, char* argv[])
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
        //exit(1);
        return -1;
    }

    // (2) Set the "reuse port" socket option
    int yesval = 1;
    if (setsockopt(sock, SOL_SOCKET, SO_REUSEADDR, &yesval, sizeof(yesval)) == -1)
    {
        perror("Error setting socket options");
        //exit(1);
        return -1;
    }
    // (3) Bind to the port.
    if (bind(sock, (sockaddr *)&addr, sizeof(addr)) == -1)
    {
        perror("Error binding stream socket");
        //exit(1);
        return -1;
    }

    // (3b) Detect which port was chosen.
    if (argc == 1 || port == 0)
    {
        port = get_port_number(sock);
    }
    else if (port < 0 || port > 0xFFFF)
    {
        //exit(1);
        return -1;
    }

    listen(sock, 30);

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
