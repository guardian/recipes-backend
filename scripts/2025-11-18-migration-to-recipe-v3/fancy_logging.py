import logging
from rich.logging import RichHandler
from rich.console import Console

# Shared console instance for both logging and progress
_console = None

def get_console():
  """Get or create the shared console instance"""
  global _console
  if _console is None:
    _console = Console(stderr=True)
  return _console

class ColoredFormatter(logging.Formatter):
  # ANSI color codes
  COLORS = {
    'DEBUG': '\033[90m',     # Grey
    'INFO': '\033[97m',      # White
    'WARNING': '\033[93m',   # Yellow
    'ERROR': '\033[91m',     # Red
    'CRITICAL': '\033[91m',  # Red
  }
  RESET = '\033[0m'

  def format(self, record):
    log_color = self.COLORS.get(record.levelname, self.RESET)
    record.levelname = f"{log_color}{record.levelname}{self.RESET}"
    record.msg = f"{log_color}{record.msg}{self.RESET}"
    return super().format(record)

def init_logger(level=logging.INFO):
    handler = RichHandler(
      console=get_console(),
      show_time=True,
      show_path=False,
      rich_tracebacks=True,
      tracebacks_show_locals=True
    )
    logging.basicConfig(
      level=level,
      handlers=[handler],
      format="%(message)s",
      datefmt="[%Y-%m-%d %H:%M:%S]"
    )
