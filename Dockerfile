FROM ubuntu:14.04
MAINTAINER yasadi <yassine.aouadi90@gmail.com>

RUN apt-get update -y
RUN apt-get install curl -y
RUN apt-get install npm -y
RUN curl -sL https://deb.nodesource.com/setup_4.x |sh
RUN apt-get install -y nodejs
RUN apt-get install -y build-essential


WORKDIR  /root/elfuche/craft-commerce
COPY . /root/elfuche/craft-commerce
COPY package.json /root/elfuche/craft-commerce/
RUN npm install



RUN mkdir -p /opt/confd/bin /etc/confd/templates  /etc/confd/conf.d && \
  curl -sLk https://github.com/kelseyhightower/confd/releases/download/v0.9.0/confd-0.9.0-linux-amd64 > /opt/confd/bin/confd && \
  ln -s /opt/confd/bin/confd /bin/confd && \
chmod +x /opt/confd/bin/confd


RUN echo   "[template] \n src  =\"myconfig.sh.tmpl\" \n dest = \"/tmp/myconfig.sh\" \n keys = [ \n \"/portsadok\" \n ]" > /etc/confd/conf.d/myconfig.toml
RUN echo  "#!/bin/bash  \n port={{getv \"/portsadok\"}} \n sed  \"s/^\s*var\s*port\s*=\s*normalize.*$/var port = normalizePort(process.env.PORT || '\$port');/g\"  /root/elfuche/craft-commerce/bin/www > server1.js \n cp  server1.js   /root/elfuche/craft-commerce/bin/www \n rm server1.js \n  nodejs   /root/elfuche/craft-commerce/bin/www " > /etc/confd/templates/myconfig.sh.tmpl


COPY myStartupScript.sh /usr/local/myscripts/myStartupScript.sh
EXPOSE 3002
CMD ["/bin/bash", "/usr/local/myscripts/myStartupScript.sh"]