FROM hivesolutions/python:latest
MAINTAINER Platforme

EXPOSE 8080

VOLUME /data

ENV LEVEL INFO
ENV ENCODING gzip
ENV HOST 0.0.0.0
ENV PORT 8080
ENV CACHE 86400
ENV CORS 1
ENV BASE_PATH /libs

ADD src /src

RUN pip3 install --upgrade netius

CMD ["/usr/bin/python3", "-m", "netius.extra.filea"]
