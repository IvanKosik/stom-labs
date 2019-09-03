from pathlib import Path
from skimage.io import imread, imsave
import skimage.transform
import numpy as np


def add_paddings(img):
    """Add zero-padding to make square image (original image will be in the center of paddings)"""
    shape_dif = img.shape[1] - img.shape[0]
    pad_axis0 = shape_dif / 2
    if pad_axis0 < 0:
        pad_axis0_before = pad_axis0_after = 0
    else:
        pad_axis0_before = round(pad_axis0)
        pad_axis0_after = shape_dif - pad_axis0_before
    shape_dif = img.shape[0] - img.shape[1]
    pad_axis1 = shape_dif / 2
    if pad_axis1 < 0:
        pad_axis1_before = pad_axis1_after = 0
    else:
        pad_axis1_before = round(pad_axis1)
        pad_axis1_after = shape_dif - pad_axis1_before
    img = np.pad(img, ((pad_axis0_before, pad_axis0_after), (pad_axis1_before, pad_axis1_after), (0, 0)), mode='constant', constant_values=255)
    return img


def resize_images(images_path: Path):
    for image_path in images_path.iterdir():
        if not image_path.is_file():
            continue

        print(image_path)

        img = imread(str(image_path))

        if img.shape[2] == 3:
            # Add alpha channel
            img = np.dstack((img, np.full(img.shape[:-1], fill_value=255)))

        print(img.shape)

        # VARIANT 1
        # Add paddings to width, to get about 500 (then css will not upscale image more, maybe)
        NEW_WIDTH = 500
        width = img.shape[1]
        width_pad = (NEW_WIDTH - width) // 2
        if width_pad > 0:
            img = np.pad(img, ((0, 0), (width_pad, width_pad), (0, 0)), mode='constant', constant_values=255)

            # Do pads transparent: from [255, 255, 255, 255] to [255, 255, 255, 0]
            img[:, :width_pad, :] = [255, 255, 255, 0]
            img[:, -width_pad:, :] = [255, 255, 255, 0]

        img = img.astype(np.uint8)
        print(img.shape, img.min(), img.max(), img.dtype)



        # VARIANT 2
        '''
        max_current_size = max(img.shape[0], img.shape[1])
        MAX_SIZE = 400
        scale_factor = MAX_SIZE / max_current_size
        # Only downscale images (do not upscale)
        if scale_factor < 1:
            img = skimage.transform.rescale(img, scale_factor, order=3, multichannel=True, anti_aliasing=True)
        '''

        # VARIANT 3
        '''
        img = add_paddings(img)
        print(img.shape)
        img = skimage.transform.resize(img, (300, 300), anti_aliasing=True)#, preserve_range=True)
        '''

        imsave(str(Path('../New_temp_images/resized') / (image_path.stem + '.png')), img)

        # break


def main():
    print("Begin")

    resize_images(Path('../New_temp_images'))


if __name__ == '__main__':
    main()