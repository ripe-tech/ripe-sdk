FROM hivesolutions/python:latest

LABEL version="1.0"
LABEL maintainer="Platforme <development@platforme.com>"

EXPOSE 8080

ENV LEVEL INFO
ENV SERVER netius
ENV SERVER_ENCODING gzip
ENV HOST 0.0.0.0
ENV PORT 8080

ADD package.json /
ADD gulpfile.js /
ADD requirements.txt /
ADD extra.txt /
ADD src /src

RUN apk update && apk add nodejs npm
RUN pip3 install -r /requirements.txt && pip3 install -r /extra.txt && pip3 install --upgrade netius
RUN npm install
RUN npm run build

CMD ["/usr/bin/python3", "/src/python/ripe_demo/main.py"]
