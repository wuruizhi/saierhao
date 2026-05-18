import sys
from rembg import remove, new_session

path = sys.argv[1]
try:
    session = new_session("isnet-general-use")
    with open(path, "rb") as i_f:
        input_data = i_f.read()
    output_data = remove(input_data, session=session)
    with open(path, "wb") as o_f:
        o_f.write(output_data)
    print(f"Done: {path}")
except Exception as e:
    print(f"Error on {path}: {e}")
