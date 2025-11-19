from argparse import ArgumentParser

from csv_state import load_csv_state


def main(state_folder: str):
  reports = load_csv_state(state_folder)



if __name__ == "__main__":
  arg_parser = ArgumentParser(description='Stage 2 of the migration to recipe v3')
  arg_parser.add_argument('-s', '--state-folder', type=str, required=True, help='Path to the state folder')

  args = arg_parser.parse_args()
  main(state_folder=args.state_folder)
