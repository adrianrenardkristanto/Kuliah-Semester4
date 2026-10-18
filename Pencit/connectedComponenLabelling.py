import numpy as np

binary_matrix = np.array([
    [1, 1, 0, 0, 0],
    [1, 0, 0, 1, 1],
    [0, 0, 1, 1, 0],
    [0, 1, 0, 0, 0]
])

rows, cols = binary_matrix.shape
labels = np.zeros_like(binary_matrix, dtype=int) # Diisi value 0 semua row, semua col

label = 1
equivalences = {} # Berguna ketika second pass sebagai penunjuk bahwa label yang satu sebenarnya satu objek

# binary_image =
# 1 1 0 0 0
# 1 0 0 1 1
# 0 0 1 1 0
# 0 1 0 0 0

# ---------- FIRST PASS ----------
for i in range(rows):
    for j in range(cols):
        if binary_matrix[i, j] == 1:
            neighbors = []

            # Cek tetangga atas
            if i > 0 and labels[i-1, j] > 0:
                neighbors.append(int(labels[i-1, j])) # kalau ada, catat ketetanggaannya

            # Cek tetangga kiri
            if j > 0 and labels[i, j-1] > 0:
                neighbors.append(int(labels[i, j-1])) # kalau ada, catat ketetanggaannya

            if not neighbors: # Pengecekan apa udah ada tetangga yang dilabelin
                labels[i, j] = label # kalau belum ada, dikasih label
                equivalences[label] = {label} 
                label += 1
            else:
                min_label = min(neighbors)
                labels[i, j] = min_label
                for l in neighbors:
                    equivalences[min_label].add(l)
                    equivalences[l] = equivalences[min_label]
# =======================================================================
# TRACE:
# (i=0,j=0) => labels[0,0] = 1, equivalences = { 1:{1} }, label = 2
# (i=0,j=1) => neighbors = [1], min_label = 1, labels[0,1] = 1, equivalences = { 1:{1} }
# (i=0,j=2-4) => skip karna nilainya = 0

# (i=1,j=0) => neighbors = [1], min_label = 1, labels[1,0] = 1, equivalences = { 1:{1} }
# (i=1,j=1-2) => skip karna nilainya = 0
# (i=1,j=3) => labels[1,3] = 2, equivalences = {1:{1}, 2:{2}}, label = 3
# (i=1,j=4) => neighbors = [2], labels[1,4] = 2, equivalences masih sama

# (i=2,j=0-1, 4) => skip karna nilainya = 0
# (i=2,j=2) => labels[2,2] = 3, equivalences = {1:{1}, 2:{2}, 3:{3}}, label = 4
# (i=2,j=3) => neighbors = [2, 3], min(neighbors) = 2, equivalences[2] = {2,3} equivalences[3] = {2,3}

# (i=3, j=0, 2-4) => skip karna nilainya = 0
# (i=3, j=1) => labels[3,1] = 4, equivalences = {1:{1}, 2:{2}, 3:{3}, 4:{4}}, label = 5

# HASIL:
# labels =
# 1 1 0 0 0
# 1 0 0 2 2
# 0 0 3 2 0
# 0 4 0 0 0

# equivalences =
# 1 => {1}
# 2 => {2,3}
# 3 => {2,3}
# 4 => {4}
# =======================================================================

# ---------- SECOND PASS ----------
for i in range(rows):
    for j in range(cols):
        if labels[i, j] > 0:
            labels[i, j] = min(equivalences[labels[i, j]])
            
# =======================================================================
# TRACE:
# i=0 => aman, tidak ada label yang berubah
# i=1 => aman, tidak ada label yang berubah
# i=2 => labels[2,3] berubah jadi min({2,3}) = 2
# i=3 => aman, tidak ada label yang berubah

# HASIL:
# labels =
# 1 1 0 0 0
# 1 0 0 2 2
# 0 0 2 2 0
# 0 4 0 0 0
# =======================================================================

print("Input:")
print(binary_matrix)
print("\nHasil Connected Component Labeling:")
print(labels)
print("\nEquivalences:")
for k in sorted(equivalences.keys()):
    print(f"Label {k} -> {equivalences[k]}")
