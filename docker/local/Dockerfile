FROM ubuntu:22.04

ARG LOCAL_DEVELOPMENT_UID
ARG LOCAL_DEVELOPMENT_SSH_PASSWORD

ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=America/Sao_Paulo

# Configurar fuso horário
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Instalar pacotes essenciais
RUN apt-get update && apt-get install -y \
    sudo \
    curl \
    software-properties-common \
    git \
    openssh-server \
    iptables \
    unzip \
    tzdata

# Reconfigure o tzdata
RUN dpkg-reconfigure -f noninteractive tzdata
    
# Configurar Git PPA e atualizar
RUN add-apt-repository ppa:git-core/ppa && apt-get update && apt-get install -y git

# Configurar acesso SSH
RUN mkdir /var/run/sshd
RUN useradd -rm -d /home/ubuntu -s /bin/bash -g root -G sudo -u ${LOCAL_DEVELOPMENT_UID:-1000} ubuntu
RUN echo "ubuntu:${LOCAL_DEVELOPMENT_SSH_PASSWORD}" | chpasswd

# Instalar Bun
RUN curl -fsSL https://bun.sh/install | bash
RUN mv /root/.bun /usr/local/
ENV PATH="/usr/local/.bun/bin:$PATH"
RUN ln -s /usr/local/.bun/bin/bun /usr/local/bin/bun

# Limpar cache do apt
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Inicia o servidor SSH:
# -D: Executa o sshd em primeiro plano (não como daemon)
# -e: Envia a saída de log para stderr em vez de syslog
# Isso é útil para contêineres Docker, pois permite visualizar logs diretamente
# e mantém o processo SSH como processo principal, evitando que o contêiner se encerre
CMD ["/usr/sbin/sshd", "-D", "-e"]