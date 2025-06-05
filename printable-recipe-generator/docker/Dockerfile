FROM --platform=linux/amd64 node:22-slim

RUN adduser pdfrender
RUN mkdir -p /tmp && chmod 777 /tmp
VOLUME /tmp
VOLUME /home/pdfrender
RUN apt-get update && apt-get -y install wget gnupg awscli && apt-get clean && rm -rf /var/lib/apt/lists/*
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb https://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get update && apt-get -y install fontconfig libfreetype6 libfontconfig1 fonts-dejavu fonts-noto --no-install-recommends && apt-get clean && rm -rf /var/lib/apt/lists/*
RUN apt-get update && apt-get -y install google-chrome-stable && apt-get clean && rm -rf /var/lib/apt/lists/*
RUN google-chrome-stable --version

ADD printable-recipe-generator.tar.gz /printable-recipe-generator
COPY docker-entrypoint.sh /docker-entrypoint.sh
ENTRYPOINT [ "bash", "/docker-entrypoint.sh" ]
USER pdfrender
