FROM debian:latest

WORKDIR /src

RUN apt update -y && apt upgrade -y
RUN apt install -y python3 python3-pip python3.11-venv 

COPY ./api/requirements.txt /src/requirements.txt

RUN python3 -m venv /opt/venv
RUN /opt/venv/bin/pip install -r /src/requirements.txt

CMD [ "/opt/venv/bin/python", "main.py" ]
