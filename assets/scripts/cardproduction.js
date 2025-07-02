import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAUzXZfOm7laa_ubkP_mYz5YMhYFfy5zOc",
  authDomain: "dataestorage.firebaseapp.com",
  databaseURL: "https://dataestorage-default-rtdb.firebaseio.com",
  projectId: "dataestorage",
  storageBucket: "dataestorage.firebasestorage.app",
  messagingSenderId: "1062428871648",
  appId: "1:1062428871648:web:338409b616e2cfba29b985",
  measurementId: "G-W47EH5YSFS"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Seleccionar elementos del DOM
const productsContainer = document.getElementById('productsContainer');
const categoriesContainer = document.getElementById('categoriesContainer');
const rubroInputs = document.querySelectorAll('input[name="rubro"]');
const cartModal = document.getElementById('cartModal');
const modalBodyCarrito = cartModal ? cartModal.querySelector('.modal-body-carrito') : null;
const closeCartModal = document.getElementById('closeCartModal');

// Variables globales
let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

// Función para sanitizar el nombre del producto para la URL
function sanitizeProductName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').trim();
}

// Función para guardar el carrito en localStorage
function saveCartToStorage() {
  localStorage.setItem('cartItems', JSON.stringify(cartItems));
}

// Función para mostrar notificación
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'cart-notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Función para agregar producto al carrito
function addToCart(productData) {
  const existingItem = cartItems.find(item => item.name === productData.name);
  
  if (existingItem) {
    const newQuantity = existingItem.quantity + productData.quantity;
    if (newQuantity <= productData.stock) {
      existingItem.quantity = newQuantity;
    } else {
      existingItem.quantity = productData.stock;
      showNotification('Cantidad limitada por stock disponible');
    }
  } else {
    cartItems.push({
      ...productData,
      id: Date.now() // ID único para cada producto
    });
  }
  
  saveCartToStorage();
  updateCartDisplay();
  showNotification('Producto añadido al carrito');
}

// Función para actualizar la visualización del carrito
function updateCartDisplay() {
  if (!modalBodyCarrito) return;
  
  modalBodyCarrito.innerHTML = '';
  
  if (cartItems.length === 0) {
    modalBodyCarrito.innerHTML = `
      <div class="empty-cart">
        <img src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png" alt="Carrito vacío" class="empty-cart-image">
        <p>Tu carrito está vacío</p>
      </div>
    `;
    return;
  }

  const total = cartItems.reduce((sum, item) => {
    const priceNum = parseFloat(item.price.replace(/[^0-9.-]+/g, '')) || 0;
    return sum + (priceNum * item.quantity);
  }, 0);

  cartItems.forEach(item => {
    const priceNum = parseFloat(item.price.replace(/[^0-9.-]+/g, '')) || 0;
    const subtotal = priceNum * item.quantity;
    
    const itemElement = document.createElement('div');
    itemElement.className = 'cart-item';
    itemElement.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item-image">
      <div class="cart-item-details">
        <h3>${item.name}</h3>
        <p>${item.details}</p>
      </div>
      <div class="cart-item-price">Precio: ${item.price}</div>
      <div class="quantity-control">
        <p style="color:black;">Cantidad</p>
        <button class="btn-decrement">-</button>
        <input type="number" class="cart-quantity" value="${item.quantity}" min="1" max="${item.stock}" data-id="${item.id}" data-stock="${item.stock}">
        <button class="btn-increment">+</button>
      </div>
      <div class="cart-item-subtotal">Subtotal: HN ${subtotal.toFixed(2)}</div>
      <button class="remove-item" data-id="${item.id}">
        <span class="material-icons">delete</span>
      </button>
    `;
    modalBodyCarrito.appendChild(itemElement);

    const quantityInput = itemElement.querySelector('.cart-quantity');
    const decrementBtn = itemElement.querySelector('.btn-decrement');
    const incrementBtn = itemElement.querySelector('.btn-increment');
    const stock = parseInt(quantityInput.dataset.stock);

    function updateQuantity(newValue) {
      let quantity = Math.max(1, Math.min(stock, parseInt(newValue) || 1));
      quantityInput.value = quantity;
      const itemToUpdate = cartItems.find(i => i.id === item.id);
      if (itemToUpdate) {
        itemToUpdate.quantity = quantity;
        saveCartToStorage();
        updateCartDisplay();
      }
    }

    quantityInput.addEventListener('change', (e) => {
      updateQuantity(e.target.value);
    });

    decrementBtn.addEventListener('click', () => {
      updateQuantity(parseInt(quantityInput.value) - 1);
    });

    incrementBtn.addEventListener('click', () => {
      updateQuantity(parseInt(quantityInput.value) + 1);
    });

    itemElement.querySelector('.remove-item').addEventListener('click', () => {
      cartItems = cartItems.filter(i => i.id !== item.id);
      saveCartToStorage();
      updateCartDisplay();
      showNotification('Producto eliminado');
    });
  });

  const footer = document.createElement('div');
  footer.className = 'cart-footer';
  footer.innerHTML = `
    <div class="cart-total">
      <span class="cart-total-label">Total:</span>
      <span class="cart-total-amount">L ${total.toFixed(2)}</span>
    </div>
    <div class="payment-methods">
      <button class="payment-btn online" id="onlinePaymentBtn">
        <span class="material-icons">credit_card</span>
        Pago Online (Transferencia)
      </button>
      <button class="payment-btn cash" id="cashPaymentBtn">
        <span class="material-icons">payments</span>
        Pago en Efectivo
      </button>
    </div>
  `;
  
  modalBodyCarrito.appendChild(footer);

  document.getElementById('onlinePaymentBtn')?.addEventListener('click', () => {
    alert('Redirigiendo a pago online...');
  });

  document.getElementById('cashPaymentBtn')?.addEventListener('click', () => {
    alert('Seleccionaste pago en efectivo');
  });
}

// Función para abrir el modal del carrito
function openCartModal() {
  if (cartModal) {
    cartModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    updateCartDisplay();
  }
}

// Función para cerrar el modal del carrito
function closeCartModalHandler() {
  if (cartModal) {
    cartModal.classList.remove('open');
    document.body.style.overflow = 'auto';
  }
}

// Función para renderizar productos con labels por categoría
function renderProducts(products) {
  console.log('Rendering products:', products.length, 'items');
  productsContainer.innerHTML = '';

  if (!products || products.length === 0) {
    productsContainer.innerHTML = '<p>No se encontraron productos.</p>';
    return;
  }

  const selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked'))
    .map(checkbox => checkbox.value);

  const groupedProducts = {};
  products.forEach(producto => {
    const category = producto.clase || 'Sin categoría';
    if (!groupedProducts[category]) {
      groupedProducts[category] = [];
    }
    groupedProducts[category].push(producto);
  });

  Object.keys(groupedProducts).forEach((category, index) => {
    if (selectedCategories.length === 0 || selectedCategories.includes(category)) {
      const label = document.createElement('div');
      label.className = 'category-label-row';
      label.innerHTML = `<span class="category-label">${category}</span>`;
      productsContainer.appendChild(label);

      groupedProducts[category].forEach(producto => {
        const card = document.createElement('div');
        card.className = 'product-card';

        const briefDetail = producto.detalles.length > 50 ? producto.detalles.substring(0, 50) + '...' : producto.detalles || 'Sin detalles';

        card.innerHTML = `
          <div class="product-badge ${producto.disponible ? 'available' : 'sold-out'}">
            ${producto.disponible ? 'Disponible' : 'Agotado'}
          </div>
          <div class="product-image-container">
            <img src="${producto.imagenes_url[0]}" alt="${producto.nombre}" class="product-img" />
            <div class="overlay"></div>
            <button class="view-button" title="Ver producto" data-images='${JSON.stringify(producto.imagenes_url)}' data-product='${JSON.stringify(producto)}'>
              <span class="material-icons">visibility</span> Ver detalles
            </button>
          </div>
          <div class="product-info">
            <h3 class="product-name-card">${producto.nombre}</h3>
            <p class="product-price-card">${producto.precio}</p>
            <p class="product-brief">${briefDetail}</p>
            <p class="product-manufacturer"><strong>Marca:</strong> ${producto.fabricante}</p>
          </div>
        `;

        productsContainer.appendChild(card);
      });
    }
  });

  setupProductEventListeners();
}

// Función para configurar los event listeners de los productos
function setupProductEventListeners() {
  document.querySelectorAll('.view-button').forEach(button => {
    button.addEventListener('click', () => {
      const images = JSON.parse(button.dataset.images);
      const product = JSON.parse(button.dataset.product);
      openProductImagesModal(images, product);
    });
  });

  document.querySelectorAll('.btn-add-cart').forEach(button => {
    button.addEventListener('click', () => {
      const productCard = button.closest('.product-card');
      const productData = {
        name: productCard.querySelector('.product-name-card').textContent,
        price: productCard.querySelector('.product-price-card').textContent,
        image: productCard.querySelector('.product-img').src,
        details: productCard.querySelector('.product-brief').textContent,
        quantity: 1,
        stock: JSON.parse(button.closest('.view-button').dataset.product).stock || 0
      };
      addToCart(productData);
    });
  });

  document.querySelectorAll('.btn-buy-now').forEach(button => {
    button.addEventListener('click', () => {
      const productCard = button.closest('.product-card');
      const productData = {
        name: productCard.querySelector('.product-name-card').textContent,
        price: productCard.querySelector('.product-price-card').textContent,
        image: productCard.querySelector('.product-img').src,
        details: productCard.querySelector('.product-brief').textContent,
        quantity: 1,
        stock: JSON.parse(button.closest('.view-button').dataset.product).stock || 0
      };
      addToCart(productData);
      openCartModal();
    });
  });
}

// Función para abrir el modal de imágenes del producto (CON FUNCIÓN DE COMPARTIR)
function openProductImagesModal(images, product) {
  let modal = document.getElementById('productImagesModal');

  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'productImagesModal';
    modal.className = 'modalproduct';
    document.body.appendChild(modal);
  }

  const stock = product.stock || 0;
  let quantity = 1;
  let currentIndex = 0;
  const displayImages = images.slice(0, 3);

  modal.innerHTML = `
    <div class="modal-content-product">
      <div class="modal-header-product">
        <h2>${product.nombre}</h2>
        <button class="close-modal" id="closeProductImagesModal">
          <span class="material-icons">close</span>
        </button>
      </div>
      <div class="modal-body-product">
        <div class="parent">
          <div class="div1">
            <div class="main-image-container">
              <img src="${displayImages[currentIndex]}" alt="${product.nombre}" class="main-product-img" />
            </div>
            <div class="thumbnail-row">
              ${displayImages.map((img, idx) => `
                <img src="${img}" alt="${product.nombre} - Thumbnail ${idx + 1}" class="thumbnail-img" data-index="${idx}" />
              `).join('')}
            </div>
          </div>
          <div class="div2">
            <h3 class="modal-product-name">${product.nombre}</h3>
            <div class="product-details">
              <p>${product.detalles}</p>
              <p><strong>ID:</strong> ${product.id}</p>
              <p><strong>Fabricante:</strong> ${product.fabricante}</p>
            </div>
            <div class="price-quantity-row">
              <p class="product-price">${product.precio}</p>
              <div class="quantity-control">
                <button class="btn-decrement">-</button>
                <input type="number" class="quantity-input" value="${quantity}" min="1" max="${stock}">
                <button class="btn-increment">+</button>
              </div>
            </div>
            <div class="product-actions">
              <button class="btn-buy-now">Comprar ahora</button>
              <button class="btn-add-cart">Añadir al carrito</button>
            </div>
            <button class="share-button" title="Compartir" data-productid="${product.id}">
              <span class="material-icons">share</span> Compartir
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Configurar eventos del modal de producto
  const mainImage = modal.querySelector('.main-product-img');
  const thumbnails = modal.querySelectorAll('.thumbnail-img');
  const quantityInput = modal.querySelector('.quantity-input');
  const decrementBtn = modal.querySelector('.btn-decrement');
  const incrementBtn = modal.querySelector('.btn-increment');
  const addToCartButton = modal.querySelector('.btn-add-cart');
  const buyNowButton = modal.querySelector('.btn-buy-now');
  const shareButton = modal.querySelector('.share-button');

  function updateMainImage(index) {
    currentIndex = index;
    mainImage.src = displayImages[currentIndex];
  }

  thumbnails.forEach(thumb => {
    thumb.addEventListener('click', () => {
      updateMainImage(parseInt(thumb.dataset.index));
    });
  });

  function updateQuantity(newValue) {
    quantity = Math.max(1, Math.min(stock, parseInt(newValue) || 1));
    quantityInput.value = quantity;
  }

  quantityInput.addEventListener('input', (e) => updateQuantity(e.target.value));
  decrementBtn.addEventListener('click', () => updateQuantity(quantity - 1));
  incrementBtn.addEventListener('click', () => updateQuantity(quantity + 1));

  if (addToCartButton) {
    addToCartButton.addEventListener('click', () => {
      const productData = {
        name: product.nombre,
        price: product.precio,
        image: displayImages[0],
        details: product.detalles,
        quantity: quantity,
        stock: stock
      };
      addToCart(productData);
    });
  }

  if (buyNowButton) {
    buyNowButton.addEventListener('click', () => {
      const productData = {
        name: product.nombre,
        price: product.precio,
        image: displayImages[0],
        details: product.detalles,
        quantity: quantity,
        stock: stock
      };
      addToCart(productData);
      closeProductImagesModal();
      openCartModal();
    });
  }

 // FUNCIÓN DE COMPARTIR PRODUCTO (ACTUALIZADA)
if (shareButton) {
    shareButton.addEventListener('click', async () => {
        try {
            // Generar URL con el formato: #product-ID#product-Nombre
            const productUrl = `${window.location.origin}${window.location.pathname}#product-${product.id}#product-${encodeURIComponent(product.nombre)}`;
            
            // Copiar al portapapeles
            await navigator.clipboard.writeText(productUrl);
            
            // Mostrar notificación
            showNotification('¡Enlace copiado! Comparte este producto');
            
            // Cambiar temporalmente el ícono para feedback visual
            const icon = shareButton.querySelector('.material-icons');
            icon.textContent = 'check';
            setTimeout(() => {
                icon.textContent = 'share';
            }, 2000);
            
        } catch (err) {
            console.error('Error al copiar:', err);
            showNotification('Error al copiar el enlace');
        }
    });
}

  function closeProductImagesModal() {
    modal.classList.remove('open');
    document.body.style.overflow = 'auto';
  }

  document.getElementById('closeProductImagesModal').addEventListener('click', closeProductImagesModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeProductImagesModal();
  });
}

// Función para obtener categorías únicas según el rubro
function getCategoriesByRubro(data, rubro) {
  const categories = new Set();
  Object.values(data).forEach(producto => {
    if (producto.rubro === rubro && producto.clase) {
      categories.add(producto.clase);
    }
  });
  return Array.from(categories).sort();
}

// Función para renderizar checkboxes de categorías
function renderCategories(categories) {
  categoriesContainer.innerHTML = '';

  if (categories.length === 0) {
    categoriesContainer.innerHTML = '<p class="no-categories">No hay categorías disponibles</p>';
    return;
  }

  categories.forEach(category => {
    const label = document.createElement('label');
    label.className = 'filter-item';
    label.innerHTML = `
      <input type="checkbox" name="category" value="${category}">
      <span>${category}</span>
    `;
    categoriesContainer.appendChild(label);
  });
}

// Función para filtrar productos según rubro y categorías seleccionadas
function filterProducts(data, rubro, selectedCategories) {
  const products = Object.values(data);
  if (!rubro) return products;
  if (selectedCategories.length === 0) return products.filter(producto => producto.rubro === rubro);
  return products.filter(producto => producto.rubro === rubro && selectedCategories.includes(producto.clase));
}

function handleProductHash() {
    const hash = window.location.hash;
    
    // Verificar si el hash sigue el formato #product-ID#product-Nombre
    const productMatch = hash.match(/#product-([^#]+)#product-(.+)/);
    
    if (productMatch) {
        const productId = productMatch[1]; // Extraer el ID del producto
        const productName = decodeURIComponent(productMatch[2]); // Extraer y decodificar el nombre
        
        // Buscar el producto en Firebase
        const productosRef = ref(db, '/');
        onValue(productosRef, (snapshot) => {
            const data = snapshot.val() || {};
            const allProducts = Object.values(data);
            const product = allProducts.find(p => p.id === productId);
            
            if (product) {
                // Verificar que el nombre coincida (sin distinguir mayúsculas/minúsculas)
                if (product.nombre.toLowerCase() === productName.toLowerCase()) {
                    // Abrir el modal del producto automáticamente
                    openProductImagesModal(product.imagenes_url, product);
                    
                    // Limpiar el hash después de abrir (opcional)
                    history.replaceState(null, null, ' ');
                } else {
                    console.warn('El nombre del producto no coincide');
                    showNotification('El producto no se encuentra disponible', 'error');
                }
            }
        }, { onlyOnce: true });
    }
}

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
  // Configurar eventos del carrito
  if (closeCartModal) {
    closeCartModal.addEventListener('click', closeCartModalHandler);
  }

  cartModal?.addEventListener('click', (e) => {
    if (e.target === cartModal) closeCartModalHandler();
  });

  // Configurar botón del carrito en el navbar
  const cartIcon = document.querySelector('.cart-icon');
  if (cartIcon) {
    cartIcon.addEventListener('click', openCartModal);
  }

  // Cargar datos de Firebase
  const productosRef = ref(db, '/');
  onValue(productosRef, (snapshot) => {
    const data = snapshot.val() || {};
    const allProducts = Object.values(data);
    renderProducts(allProducts);

    // Configurar eventos de filtrado
    rubroInputs.forEach(input => {
      input.addEventListener('change', () => {
        const currentRubro = input.value;
        const categories = getCategoriesByRubro(data, currentRubro);
        renderCategories(categories);
        const products = filterProducts(data, currentRubro, []);
        renderProducts(products);
      });
    });

    categoriesContainer.addEventListener('change', (event) => {
      if (event.target.name === 'category') {
        const currentRubro = document.querySelector('input[name="rubro"]:checked')?.value;
        if (!currentRubro) return;
        const selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(checkbox => checkbox.value);
        const filteredProducts = filterProducts(data, currentRubro, selectedCategories);
        renderProducts(filteredProducts);
      }
    });
  }, { onlyOnce: false });

  // Cargar carrito inicial
  updateCartDisplay();
  
  // Manejar URLs con hash de producto
  handleProductHash();
  
  // Escuchar cambios en el hash
  window.addEventListener('hashchange', handleProductHash);


});