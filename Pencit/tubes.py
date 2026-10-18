import os
import cv2
import numpy as np
import matplotlib.pyplot as plt
from sklearn.decomposition import PCA

import matplotlib.pyplot as plt
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.metrics import ConfusionMatrixDisplay
from skimage.feature import hog


# ================================
# LOAD DATASET
# ================================
def load_dataset(base_path):

    images = []
    labels = []

    classes = ["Damaged","Old","Ripe","Unripe"]

    for label in classes:

        folder = os.path.join(base_path,label)

        if not os.path.exists(folder):
            continue

        for file in os.listdir(folder):

            img_path = os.path.join(folder,file)

            img = cv2.imread(img_path)

            if img is None:
                continue

            img = cv2.resize(img,(100,100))

            images.append(img)
            labels.append(label)

    return images, labels


# ================================
# FEATURE EXTRACTION (HOG)
# ================================
def extract_features(images):

    features = []

    for img in images:

        gray = cv2.cvtColor(img,cv2.COLOR_BGR2GRAY)

        hog_feature = hog(
            gray,
            orientations=9,
            pixels_per_cell=(8,8),
            cells_per_block=(2,2),
            block_norm='L2-Hys'
        )

        # ===== RGB FEATURE
        mean_color = np.mean(img, axis=(0,1))
        std_color  = np.std(img, axis=(0,1))

        color_feat = np.concatenate([mean_color, std_color])
        final_feat = np.concatenate([hog_feature, color_feat])
        features.append(final_feat)

    return np.array(features)

# ================================
# SCALING
# ================================
def standardize(X):
    mean = np.mean(X, axis=0)
    std  = np.std(X, axis=0) + 1e-8
    return (X - mean) / std, mean, std

def standardize_val(X, mean, std):
    return (X - mean) / std


# ================================
# TRAIN MODEL
# ================================
def train_svm_linear(X_train,y_train):

    model = SVC(kernel='linear', class_weight='balanced')

    model.fit(X_train,y_train)

    return model


def train_svm_rbf(X_train,y_train):

    model = SVC(kernel='rbf', class_weight='balanced')

    model.fit(X_train,y_train)

    return model


# ================================
# EVALUATE MODEL
# ================================
def evaluate_model(model, X_test, y_test, model_name):

    predictions = model.predict(X_test)

    acc = accuracy_score(y_test, predictions)

    print("Accuracy :", acc)
    print()

    print("Classification Report")
    print(classification_report(y_test, predictions))

    cm = confusion_matrix(y_test, predictions)

    # membuat visualisasi confusion matrix
    disp = ConfusionMatrixDisplay(confusion_matrix=cm)

    disp.plot(cmap='Blues')
    plt.title("Confusion Matrix - " + model_name)

    # simpan sebagai gambar
    filename = "confusion_matrix_" + model_name + ".png"
    plt.savefig(filename)

    print("Confusion matrix saved as:", filename)

    plt.show()


# ================================
# MAIN PROGRAM
# ================================
def main():

    train_path = "Dataset/train"
    val_path = "Dataset/val"

    print("Loading training data...")
    train_images, train_labels = load_dataset(train_path)

    print("Loading validation data...")
    val_images, val_labels = load_dataset(val_path)

    print("Train images :",len(train_images))
    print("Validation images :",len(val_images))


    print("\nExtracting features...")

    X_train = extract_features(train_images)
    X_val = extract_features(val_images)

    y_train = train_labels
    y_val = val_labels
    
    print("\nStandardizing...")
    X_train, mean, std = standardize(X_train)
    X_val = standardize_val(X_val, mean, std)


    print("\nTraining Linear SVM...")
    linear_model = train_svm_linear(X_train,y_train)

    print("Training RBF SVM...")
    rbf_model = train_svm_rbf(X_train,y_train)


    print("\n===== Linear SVM Result =====")
    evaluate_model(linear_model, X_val, y_val, "Linear")

    print("\n===== RBF SVM Result =====")
    evaluate_model(rbf_model, X_val, y_val, "RBF")


if __name__ == "__main__":
    main()