from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Config:
  capi_key: str
  capi_url: str
  index_url: str
  templatiser_url: str
  templatiser_token: str
  integration_read_url: str
  integration_write_url: str
  ca_bundle_path: str | None


def load_config() -> Config:
  filepath = Path.home() / '.gu' / 'feast-migration-v2-config.json'
  with open(filepath, 'r') as f:
    import json
    data = json.load(f)
    return Config(
      capi_key=data['capi_key'],
      capi_url=data['capi_url'],
      index_url=data['index_url'],
      templatiser_url=data['templatiser_url'],
      templatiser_token=data['templatiser_token'],
      integration_read_url=data['integration_read_url'],
      integration_write_url=data['integration_write_url'],
      ca_bundle_path=data.get('ca_bundle_path'),
    )
