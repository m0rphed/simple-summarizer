import os


def get_sample(filename: str, data_subdir=".tmp") -> str:
    file_path = os.path.join(data_subdir, filename)
    with open(file_path, 'r') as file:
        content = file.read()
        return content
