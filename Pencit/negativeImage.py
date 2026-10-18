# from PIL import Image
# import cv2
# import sys
# import numpy as np
# from matplotlib import pyplot as plt

# S = 255
# if (sys.argv[2] == 'rgb'):
#     img = cv2.imread(sys.argv[1], cv2.IMREAD_COLOR)
#     B, G, R = cv2.split(img)
#     B[:] = [S - x for x in B]
#     G[:] = [S - x for x in G]
#     R[:] = [S - x for x in R]
    
#     transfomred_img = cv2.merge(B, G, R)
#     cv2.imwrite(sys.argv[1] + '_inverted.png', transfomred_img)
# else:
#     img = cv2.imread(sys.argv[1], cv2.IMREAD_GRAYSCALE)
#     inverted_img = np.array([S - x for x in img])
#     cv2.imwrite(sys.argv[1] + '_inverted.png', inverted_img)
    
# plt.subplot(211)
# plt.axis('off')
# plt.title('origin')
# plt.imshow(cv2.imread(sys.argv[1]))

# plt.su bplot(212)
# plt.axis('off')
# plt.title('transformed')
# plt.imshow(cv2.imread(sys.argv[1]+'_inverted.png'))

# gambar = PhotoImage(file="images.jpeg")

# teks = Label(fg="#cd5c5c", relief=RIDGE, bd=0, image=gambar, combound="bottom")

import numpy as np
import cv2

img1 = cv2.imread(r"C:\Users\Asus\OneDrive\Documents\ADRIAN\Kuliah\SEMESTER 4\Pencit\images.jpeg")
width = int(img1.shape[0] * 10 / 100)
height = int(img1.shape[0] * 10 / 100)
dim = (width, height)
img = cv2.resize(img1, dim, interpolation = cv2.INTER_AREA)

imgfin = 255 - img
cv2.imshow('image', imgfin)
cv2.waitKey(0)



    