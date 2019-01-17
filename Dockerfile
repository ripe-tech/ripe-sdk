FROM hivesolutions/python:latest

LABEL version="1.0"
LABEL maintainer="Platforme <development@platforme.com>"

EXPOSE 8080

ENV LEVEL INFO
ENV ENCODING gzip
ENV HOST 0.0.0.0
ENV PORT 8080
ENV CACHE 86400
ENV CORS 1
ENV BASE_PATH /dist

ADD package.json /
ADD gulpfile.js /
ADD src /src

RUN apk update && apk add nodejs npm
RUN pip3 install --upgrade netius
RUN npm install
RUN npm run build
RUN ln -s . dist/js && ln -s . dist/css

CMD ["/usr/bin/python3", "-m", "netius.extra.filea"]
