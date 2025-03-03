# Gallery Thumbs
## Overview
It creates a gallery of the image elements placed in the specified container of the html file.
<br>The images can be written with `<picture>` or separate `<img>` tags.

<br>When you click on one of the images, a separate modal window opens with the selected image.
<br>The modal window also has an interface for navigating through the images. You can also scroll through the images 
using the keyboard keys or swipe on a mobile device.

<br>Each image for the gallery is placed in two versions:
- for the overall gallery (minimized images), must be nested in `/thumbs/` folder.
- for the separate display of the images (with high resolution), the images must be placed in the
root folder.
<br>The root folder with high-resolution images must comprise the folder `/thumbs/` with the minified images.

### Initialization

1. Scss is used and must be included in the root scss file of the project.
2. Import `{ initThumbs } from "./path/gallery-thumbs/gallery-thumbs-index.js"` in Your js file.
3. Use `initThumbs` with the css selector of the image container:`initThumbs("#gallery-work")`

### Notes
The modal window works as follows:
By clicking on the image in the galley, the full-screen modal opens with the original image of the same name, as the
image in the "thumbs" directory, which is used for the thumbs gallery.
- by clicking on the selected image in the gallery, the index of the image in the array of placed images is determined.
- if the path to the image contains `"path/tofile/thumbs"`, then a new path is modified by removing the `"/thumbs/"` 
from the path string.
  <br>Therefore, the name of the image file in the `"path/tofile/"` directory and in the `"path/tofile/thumbs"` 
directory must be the same.
  <br>If the image file is not found in the `"path/tofile/"` directory, then a minified version of the image is used 
in the modal window at the origin path: `"path/tofile/thumbs"`.

- The dimension ratio of the modal view: w/h = 1.9545; max dimensions: (1290px : 660px);
- The width of the "thumbs/" images: 480px, height: any;