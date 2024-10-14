// Base URL for the API
const BASE_URL = "https://call-api.lanzzstore.com";
let products = [];

(async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/products/`, {
      method: "GET",
      headers: {
        Authorization: "Bearer FadhlanGanteng"
      }
    });

    const { data } = await response.json();

    // Remove _id property and use product_id
    products = data.map(({ _id, ...rest }) => rest);
    document.getElementById('totalProduct').textContent = products.length;
  } catch (e) {
    products = [
      {
        product_id: 1,
        product_name: "Laptop XYZss",
        product_category: "Electronics",
        product_quantity: 333,
        product_price: 12000003330,
        product_exp: "2025-12-31T00:00:00.000Z"
      }
      // ... (other dummy products)
    ];
    console.error(e);
  }

  // Display products after data is fetched or fallback to dummy data
  populateCategoryFilter();
  applyFiltersAndSort();
})();

// Format date to DD/MM/YYYY
function formatDate(dateString) {
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;
}

// Display products in the table
function displayProducts(productsToDisplay) {
  const tableBody = document.getElementById("productTableBody");
  tableBody.innerHTML = "";
  productsToDisplay.forEach((product) => {
    const row = `
            <tr data-id="${product.product_id}">
                <td>${product.product_id}</td>
                <td>${product.product_name}</td>
                <td>${product.product_category}</td>
                <td>${product.product_quantity}</td>
                <td>${new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(product.product_price)}</td>
                <td>${formatDate(product.product_exp)}</td>
                <td>
                    <button class="btn btn-sm btn-warning mb-2" onclick="editProduct(${
                      product.product_id
                    })">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger mb-2" onclick="deleteProduct(${
                      product.product_id
                    })">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    tableBody.innerHTML += row;
  });
}

// Search products by name or category
function searchProducts() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const filteredProducts = products.filter(
    (product) =>
      product.product_name.toLowerCase().includes(searchTerm) ||
      product.product_category.toLowerCase().includes(searchTerm)
  );
  applyFiltersAndSort(filteredProducts);
}

// Sort products
function sortProducts(productsToSort) {
  const sortBy = document.getElementById("sortSelect").value;
  switch (sortBy) {
    case "quantity_asc":
      return productsToSort.sort(
        (a, b) => a.product_quantity - b.product_quantity
      );
    case "quantity_desc":
      return productsToSort.sort(
        (a, b) => b.product_quantity - a.product_quantity
      );
    case "price_asc":
      return productsToSort.sort((a, b) => a.product_price - b.product_price);
    case "price_desc":
      return productsToSort.sort((a, b) => b.product_price - a.product_price);
    default:
      return productsToSort;
  }
}

// Filter products by category
function filterByCategory(productsToFilter) {
  const category = document.getElementById("categoryFilter").value;
  if (category) {
    return productsToFilter.filter(
      (product) => product.product_category === category
    );
  }
  return productsToFilter;
}

// Apply filters and sort to products
function applyFiltersAndSort(productsToProcess = products) {
  let filteredAndSortedProducts = filterByCategory(productsToProcess);
  filteredAndSortedProducts = sortProducts(filteredAndSortedProducts);
  displayProducts(filteredAndSortedProducts);
}

// Populate category filter
function populateCategoryFilter() {
  const categoryFilter = document.getElementById("categoryFilter");

  const categories = [
    ...new Set(products.map((product) => product.product_category)),
  ];

  // Jika Anda ingin juga menambahkan kategori ke categoryFilter, buat elemen option baru
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category; // Nilai yang akan dikirim saat filter diubah
    option.textContent = category; // Teks yang akan ditampilkan di filter
    categoryFilter.appendChild(option); // Tambahkan ke elemen filter
  });
}

// Add new product
async function addProduct(product) {
  product.product_id = products.length + 1; // Assign new product_id
  await fetch(`${BASE_URL}/api/products/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer FadhlanGanteng"
    },
    body: JSON.stringify(product)
  })
    .then((res) => alert(`Sukses menambahkan data!`))
    .catch((e) => alert(`Gagal menambahkan data!`));
  products.push(product);
  applyFiltersAndSort();
  document.getElementById("productForm").reset();
  populateCategoryFilter();
}

// Edit product
function editProduct(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  const product = products.find((p) => p.product_id === id);

  row.classList.add("edit-mode");
  row.innerHTML = `
        <td>${product.product_id}</td>
        <td><input type="text" value="${
          product.product_name
        }" name="product_name"></td>
        <td><input type="text" value="${
          product.product_category
        }" name="product_category"></td>
        <td><input type="number" value="${
          product.product_quantity
        }" name="product_quantity"></td>
        <td><input type="number" value="${
          product.product_price
        }" name="product_price"></td>
        <td><input type="date" value="${
          product.product_exp.split("T")[0]
        }" name="product_exp"></td>
        <td>
            <button class="btn btn-sm btn-success mb-2" onclick="saveProduct(${id})">
                <i class="fas fa-save"></i>
            </button>
            <button class="btn btn-sm btn-secondary mb-2" onclick="cancelEdit(${id})">
                <i class="fas fa-times"></i>
            </button>
        </td>
    `;
}

// Save edited product
async function saveProduct(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  const updatedProduct = {
    product_id: id,
    product_name: row.querySelector('input[name="product_name"]').value,
    product_category: row.querySelector('input[name="product_category"]').value,
    product_quantity: parseInt(
      row.querySelector('input[name="product_quantity"]').value
    ),
    product_price: parseFloat(
      row.querySelector('input[name="product_price"]').value
    ),
    product_exp: row.querySelector('input[name="product_exp"]').value
  };
  fetch(`${BASE_URL}/api/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer FadhlanGanteng"
    },
    body: JSON.stringify(updatedProduct)
  })
    .then((res) => alert(`Sukses mengedit data!`))
    .catch((e) => alert(`Gagal mengedit data`));
  const index = products.findIndex((p) => p.product_id === id);
  products[index] = updatedProduct;
  row.classList.remove("edit-mode");
  applyFiltersAndSort();
}

// Cancel edit
function cancelEdit(id) {
  applyFiltersAndSort();
}

// Delete product
async function deleteProduct(id) {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!"
  }).then(async (result) => {
    if (result.isConfirmed) {
      products = products.filter((product) => product.product_id !== id);
      fetch(`${BASE_URL}/api/products/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer FadhlanGanteng"
        }
      });
      applyFiltersAndSort();
      Swal.fire("Deleted!", "Your product has been deleted.", "success");
    }
  });
}

// Event listener for product form
document
  .getElementById("productForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const product = {
      product_name: document.getElementById("productName").value,
      product_category: document.getElementById("productCategory").value,
      product_quantity: parseInt(
        document.getElementById("productQuantity").value
      ),
      product_price: parseFloat(document.getElementById("productPrice").value),
      product_exp: document.getElementById("productExp").value
    };
    await addProduct(product);
  });

// Event listeners for search, sort, and filter
document
  .getElementById("searchInput")
  .addEventListener("input", searchProducts);
document
  .getElementById("sortSelect")
  .addEventListener("change", () => applyFiltersAndSort());
document
  .getElementById("categoryFilter")
  .addEventListener("change", () => applyFiltersAndSort());

  document.getElementById('btnAddProduct').addEventListener('click', () => {
    document.getElementById('contentContainer').style.display = 'none';
    document.getElementById('formContainer').classList.remove("d-none");
    document.getElementById('btnAddProduct').style.display = 'none'
  })
  
  document.getElementById('btnCancelAddForm').addEventListener('click', () => {
    document.getElementById('contentContainer').style.display = 'block';
    document.getElementById('formContainer').classList.add("d-none");
    document.getElementById('btnAddProduct').style.display = 'block';
  })



// Initialize product display
populateCategoryFilter();
applyFiltersAndSort();


