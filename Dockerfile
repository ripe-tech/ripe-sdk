FROM hivesolutions/python:latest
LABEL maintainer="Platforme <development@platforme.com>"

EXPOSE 8080

ENV LEVEL INFO
ENV ENCODING gzip
ENV HOST 0.0.0.0
ENV PORT 8080
ENV CACHE 86400
ENV CORS 1
ENV BASE_PATH /src

ADD src /src

RUN pip3 install --upgrade netius

CMD ["/usr/bin/python3", "-m", "netius.extra.filea"]
