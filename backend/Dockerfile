# fastapi
FROM python:3.8.5-alpine
ENV TZ=Asia/Bangkok
WORKDIR /code
COPY ./requirements.txt /code/requirements.txt
RUN apk add curl
RUN apk update && apk add gcc g++ unixodbc unixodbc-dev musl-dev jpeg-dev zlib-dev libffi-dev cairo-dev pango-dev gdk-pixbuf-dev build-base postgresql-libs postgresql-dev
# RUN apt-get update && apt-get install -y msodbcsql17 mssql-tools
RUN curl -O https://download.microsoft.com/download/e/4/e/e4e67866-dffd-428c-aac7-8d28ddafb39b/msodbcsql17_17.10.2.1-1_amd64.apk
RUN curl -O https://download.microsoft.com/download/e/4/e/e4e67866-dffd-428c-aac7-8d28ddafb39b/mssql-tools_17.10.1.1-1_amd64.apk

#(Optional) Verify signature, if 'gpg' is missing install it using 'apk add gnupg':
# RUN curl -O https://download.microsoft.com/download/e/4/e/e4e67866-dffd-428c-aac7-8d28ddafb39b/msodbcsql17_17.10.2.1-1_amd64.sig
# RUN curl -O https://download.microsoft.com/download/e/4/e/e4e67866-dffd-428c-aac7-8d28ddafb39b/mssql-tools_17.10.1.1-1_amd64.sig

# RUN curl https://packages.microsoft.com/keys/microsoft.asc  | gpg --import -
# RUN gpg --verify msodbcsql17_17.10.1.1-1_amd64.sig msodbcsql17_17.10.2.1-1_amd64.apk
# RUN gpg --verify mssql-tools_17.10.1.1-1_amd64.sig mssql-tools_17.10.1.1-1_amd64.apk

#Install the package(s)
RUN apk add --allow-untrusted msodbcsql17_17.10.2.1-1_amd64.apk
RUN apk add --allow-untrusted mssql-tools_17.10.1.1-1_amd64.apk

RUN pip install --no-cache-dir -r /code/requirements.txt
COPY . /code
CMD [py manage.py runserver 0.0.0.0:8000]