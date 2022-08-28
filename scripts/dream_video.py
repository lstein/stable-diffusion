import argparse
import string
import os
from ldm.simplet2i import T2I
from random import choice
import PIL
from PIL.Image import Resampling

_t2i = T2I()

def get_vid_path():
    return os.path.join(".", "outputs", "vid-samples")

def prompt2vid(prompt, n_frames, initial_image = None, **config):
    vid_path = get_vid_path()
    os.makedirs(vid_path, exist_ok=True)
    
    next_frame = PIL.Image.open(initial_image)
    next_frame_filename = os.path.join(vid_path, "0.png")
    next_frame.save(next_frame_filename)
    for i in range(n_frames):
        images = _t2i.prompt2image(prompt, init_img=next_frame_filename, strength=0.2, **config)
        
        next_frame, _seed = choice(images)
        w, h = next_frame.size
        crop_box = (int(w * 0.01), int(h * 0.01), int(w * 0.99), int(h * 0.99))
        next_frame = next_frame.crop(crop_box).resize((w, h), resample=Resampling.BICUBIC)
        
        next_frame_filename = os.path.join(vid_path, f"{i}.png")
        next_frame.save(next_frame_filename)

def create_parser():
    parser = argparse.ArgumentParser(description="Parse Arguments for dream_video")
    parser.add_argument("prompt")
    parser.add_argument(
        "-F",
        "--n_frames",
        type=int,
        help="Number of Video Frames to Generate"
    )
    parser.add_argument(
        "-I",
        "--init_img",
        type=str
    )
    return parser

if __name__ == "__main__":
    parser = create_parser()
    opt = parser.parse_args()

    print("Initializing Model, please wait...")
    _t2i.load_model()

    print(opt)
    prompt2vid(opt.prompt, opt.n_frames, opt.init_img)