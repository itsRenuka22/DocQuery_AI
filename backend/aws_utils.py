import boto3
from botocore.config import Config

def s3_client(region: str):
    return boto3.client("s3", region_name=region, config=Config(signature_version="s3v4"))

def ddb_table(region: str, table_name: str):
    return boto3.resource("dynamodb", region_name=region).Table(table_name)
