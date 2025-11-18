"""TUI Logger using Rich library for progress tracking and log display"""
from threading import Lock
from typing import Optional
from rich.console import Console
from rich.live import Live
from rich.layout import Layout
from rich.panel import Panel
from rich.progress import Progress, TextColumn, BarColumn, TaskProgressColumn, TimeRemainingColumn, MofNCompleteColumn
from rich.text import Text
from rich.table import Table


class TUI:
    """Thread-safe TUI logger with progress bar and log display"""

    def __init__(self, max_log_lines: int = 40):
        self.console = Console()
        self.max_log_lines = max_log_lines
        self.log_lines: list[tuple[str, str]] = []  # (style, message)
        self.lock = Lock()
        self.live: Optional[Live] = None
        self.progress: Optional[Progress] = None
        self.task_id = None
        self.layout: Optional[Layout] = None
        self.total_cost: float = 0.0

    def start(self, total: int):
        """Start the TUI with a progress bar"""
        # Create progress bar
        self.progress = Progress(
            TextColumn("[bold blue]{task.description}"),
            BarColumn(complete_style="green", finished_style="bold green"),
            MofNCompleteColumn(),
            TextColumn("•"),
            TaskProgressColumn(),
            TextColumn("•"),
            TimeRemainingColumn(),
        )
        self.task_id = self.progress.add_task("[cyan]Processing recipes...", total=total)

        # Create layout
        self.layout = Layout()
        self.layout.split_column(
            Layout(name="logs", size=self.max_log_lines + 2),
            Layout(name="progress", size=4),
        )

        # Start live display
        self.live = Live(self.layout, console=self.console, refresh_per_second=4, transient=False)
        self.live.start()
        self._update_display()

    def _update_display(self):
        """Update the display with current logs and progress"""
        if self.layout is None or not isinstance(self.layout, Layout):
            return

        # Update logs panel
        log_table = Table.grid(padding=(0, 1))
        log_table.add_column(justify="left", overflow="fold")

        with self.lock:
            # Show most recent logs (up to max_log_lines)
            display_logs = self.log_lines[-self.max_log_lines:]
            for style, message in display_logs:
                log_table.add_row(Text(message, style=style))

        self.layout["logs"].update(Panel(log_table, title="[bold]Logs", border_style="blue"))

        # Update progress bar with cost
        if self.progress:
            # Create a table for progress and cost
            progress_table = Table.grid(padding=(0, 0))
            progress_table.add_column()
            progress_table.add_row(self.progress)
            with self.lock:
                cost_text = Text(f"Total Cost: ${self.total_cost:.4f}", style="bold yellow")
            progress_table.add_row(cost_text)
            self.layout["progress"].update(Panel(progress_table, border_style="green"))

    def log(self, message: str, style: str = ""):
        """Add a log message"""
        with self.lock:
            self.log_lines.append((style, message))
        if self.live:
            self._update_display()

    def info(self, message: str):
        """Log an info message"""
        self.log(message, "cyan")

    def success(self, message: str):
        """Log a success message"""
        self.log(message, "green")

    def warning(self, message: str):
        """Log a warning message"""
        self.log(message, "yellow")

    def error(self, message: str):
        """Log an error message"""
        self.log(message, "red bold")

    def update_progress(self, completed: int = 0):
        """Advance the progress bar"""
        if self.progress and self.task_id is not None:
            self.progress.update(self.task_id, completed=completed)
            if self.live:
                self._update_display()

    def add_cost(self, cost: float):
        """Add to the total cost"""
        with self.lock:
            self.total_cost += cost
        if self.live:
            self._update_display()

    def stop(self):
        """Stop the live display"""
        if self.live:
            self.live.stop()
            self.live = None


# Global singleton instance
_logger_instance: Optional[TUI] = None


def get_tui() -> TUI:
    """Get the global TUI logger instance"""
    global _logger_instance
    if _logger_instance is None:
        _logger_instance = TUI()
    return _logger_instance

