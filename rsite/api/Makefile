CC=g++ -g -Wall -Werror -std=c++17
SOURCES=tag_server.cpp classify_tag.cpp

tag_server: ${SOURCES}
	${CC} -o $@ $^ -pthread -ldl

clean:
	rm -rf tag_server