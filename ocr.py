# extract text from image 
# from PIL import Image
# import pytesseract
# import numpy as np

# filename = 'image.webp'
# img1 = np.array(Image.open(filename))
# text = pytesseract.image_to_string(img1)

# print(text)

# =========================================================================================================

# extracat text with coordinates

# import pytesseract
# from PIL import Image

# def extract_text_from_image(image_path, coordinates):
#     # Open the image
#     img = Image.open(image_path)
    
#     # Crop the image based on coordinates
#     left, top, right, bottom = coordinates
#     cropped_img = img.crop((left, top, right, bottom))
    
#     # Perform OCR on the cropped image
#     extracted_text = pytesseract.image_to_string(cropped_img)
    
#     return extracted_text


# # Example coordinates (left, top, right, bottom)
# coordinates = (113,591,255,610)

# # Path to the image
# image_path = 'QualityHosting_page-0001.jpg'

# # Extract text using OCR
# extracted_text = extract_text_from_image(image_path, coordinates)

# # Print the extracted text
# print("Extracted text:\n", extracted_text)


# ===================================================
import fitz
import cv2
import matplotlib.pyplot as plt
from matplotlib.widgets import Cursor


# Initialize variables to store coordinates
coordinates = []

# Mouse event handler
def on_mouse(event):
    if event.button == 1:
        x, y = int(event.xdata), int(event.ydata)
        coordinates.append((x, y))
        print(f"Coordinates added: ({x}, {y})")

# Load the image
image_path = 'QualityHosting_page-0001.jpg'
doc = fitz.open(image_path)
page = doc.load_page(0)
image = page.get_pixmap()

# Display the image
fig, ax = plt.subplots()
ax.imshow(image)


# Display the image and set the mouse event handler
cv2.imshow('Image', image)
cv2.setMouseCallback('Image', on_mouse)

print("Click on the image to select coordinates. Press 'q' when done.")
cv2.waitKey(0)

# Close the image window
cv2.destroyAllWindows()

# Print the final coordinates
print("Final Coordinates:", coordinates)
