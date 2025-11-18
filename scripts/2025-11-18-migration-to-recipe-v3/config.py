from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Config:
  capi_key: str
  templatiser_url: str
  templatiser_token: str


def load_config() -> Config:
  filepath = Path.home() / '.gu' / 'feast-migration-v2-config.json'
  with open(filepath, 'r') as f:
    import json
    data = json.load(f)
    return Config(
      capi_key=data['capi_key'],
      templatiser_url=data['templatiser_url'],
      templatiser_token=data['templatiser_token']
    )
