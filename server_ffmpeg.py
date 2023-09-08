import asyncio
import websockets
import subprocess

def get_upper_path(target_path):
    divided_upper_path = target_path.split("\\")[:-1]
    upper_path = "\\".join(divided_upper_path)
    return upper_path

def concat_movie(target_path):
    # target_path = "C:\\Users\\exm_c\\Videos\\Overwolf\\Valorant Record at death\\VALORANT\\VALORANT_09-06-2023_23-26-10-790"
    cmd = "(for %i in (\"{}\\*.mp4\") do @echo file \'%i\') > \"{}\\list.txt\"".format(target_path, target_path)
    subprocess.run(cmd, shell=True)
    cmd = "ffmpeg -f concat -safe 0 -i \"{}\\list.txt\" -c copy \"{}\\{}.mp4\"".format(target_path, get_upper_path(target_path), target_path.split("\\")[-1])
    subprocess.run(cmd, shell=True)
    cmd = "rmdir /s /q \"{}\"".format(target_path)
    subprocess.run(cmd, shell=True)
    print("concat is finished!")
    cmd = "python upload_youtube.py --file=\"{}\\{}.mp4\" --title=\"{}\", --description=\"hogehoge\" --category=\"22\" --privacyStatus=\"unlisted\"".format(get_upper_path(target_path), target_path.split("\\")[-1], target_path.split("\\")[-1])
    subprocess.run(cmd, shell=True)
    print("upload is finished!")

async def handler(websocket):
    async for target_path in websocket:
        print("match end!")
        print(target_path)
        concat_movie(target_path)

async def main():
    async with websockets.serve(handler, "localhost", 8010):
        await asyncio.Future()  # run forever

asyncio.run(main())