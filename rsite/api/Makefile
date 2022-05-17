CC=g++ -g -Wall -Werror -std=c++17
SOURCES=tag_server.cpp

tag_server: ${SOURCES}
	${CC} -o $@ $^ -pthread

clean:
	rm -rf tag_server