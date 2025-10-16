import json

import boto3
from botocore.client import BaseClient
from botocore.exceptions import ClientError


class LLMClient:
  _brt: BaseClient
  _model_name: str

  def __init__(self, region: str = "eu-west-1",
               model_name="arn:aws:bedrock:eu-west-1:156041417282:inference-profile/eu.anthropic.claude-sonnet-4-5-20250929-v1:0"):
    session = boto3.Session(region_name=region, profile_name="feast")
    self._brt = session.client("bedrock-runtime")
    self._model_name = model_name

  def call_llm(self, prompt: str, tool: dict, temperature: float = 0) -> dict:
    native_request = {
      "anthropic_version": "bedrock-2023-05-31",
      "max_tokens": 64000,
      "temperature": temperature,
      "messages": [
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": prompt
            }
          ]
        }
      ],
      "tools": [tool]
    }

    # Convert the native request to JSON.
    request = json.dumps(native_request)

    try:
      # Invoke the model with the request.
      response = self._brt.invoke_model(modelId=self._model_name, body=request)

    except (ClientError, Exception) as e:
      print(f"ERROR: Can't invoke '{self._model_name}'. Reason: {e}")
      exit(1)

    # Decode the response body.
    model_response = json.loads(response["body"].read())
    obj_response = None
    for content in model_response["content"]:
      if content["type"] == "tool_use":
        obj_response = content["input"]
      elif content["type"] == "text":
        print(f"LLM TEXT: {content['text']}")

    if obj_response is None:
      raise ValueError("No tool_use response from LLM")

    return obj_response
