CC=g++ -g -Wall -Werror -std=c++17
ROUTE=rsite/api/
SOURCES=${ROUTE}tag_server.cpp

tag_server: ${SOURCES}
	${CC} -o $@ $^ -pthread

clean:
	rm -rf tag_server