FROM python:3.11-slim

WORKDIR /backend-fiatmanagement

COPY requirements.txt /backend-fiatmanagement/
RUN pip3 install -r /backend-fiatmanagement/requirements.txt

COPY . .


CMD ["python", "manage.py", "runserver", "0.0.0.0:8001"]
