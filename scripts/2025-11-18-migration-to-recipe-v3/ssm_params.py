import logging
import boto3
from botocore.exceptions import BotoCoreError, ClientError

logger = logging.getLogger(__name__)


def fetch_ssm_param(param_name: str) -> str | None:
  session = boto3.session.Session(profile_name='feast')
  ssm_client = session.client('ssm')

  try:
    response = ssm_client.get_parameter(
      Name=param_name,
      WithDecryption=True
    )
    return response['Parameter']['Value']
  except (BotoCoreError, ClientError) as e:
    logger.error(f"Error fetching SSM parameter {param_name}: {e}")
    return None
