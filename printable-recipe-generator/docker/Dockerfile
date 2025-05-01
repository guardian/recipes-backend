FROM --platform=linux/amd64 node:22-slim

RUN adduser pdfrender
RUN mkdir -p /tmp && chmod 777 /tmp
RUN ln -s /tmp /home/pdfrender/.local && ln -s /tmp /home/pdfrender/.config
VOLUME /tmp
RUN apt-get update && apt-get -y install wget gnupg awscli
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb https://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get update && apt-get -y install google-chrome-stable
RUN google-chrome-stable --version

ADD printable-recipe-generator.tar.gz /printable-recipe-generator
COPY docker-entrypoint.sh /docker-entrypoint.sh
ENTRYPOINT [ "bash", "/docker-entrypoint.sh" ]
USER pdfrender
