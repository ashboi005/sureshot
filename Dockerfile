FROM public.ecr.aws/lambda/python:3.11

# Install system dependencies for building Python packages
RUN yum update -y && \
    yum install -y gcc gcc-c++ postgresql-devel && \
    yum clean all

# Upgrade pip to latest version
RUN pip install --upgrade pip

# Copy requirements and install dependencies
COPY requirements.txt ${LAMBDA_TASK_ROOT}

# Install dependencies with specific flags to prefer binary packages
RUN pip install --no-cache-dir --prefer-binary -r requirements.txt

# Copy application code
COPY . ${LAMBDA_TASK_ROOT}

# Set the CMD to your handler
CMD ["lambda_function.lambda_handler"]