document.addEventListener('DOMContentLoaded', () => {
  console.log('searchbar.js cargado');

  // Seleccionar elementos del DOM
  const searchInput = document.getElementById('searchInput');
  const mobileSearchInput = document.getElementById('mobileSearchInput');
  const clearSearch = document.getElementById('clearSearch');
  const mobileClearSearch = document.querySelector('.mobile-clear-search');
  const productsContainer = document.getElementById('productsContainer');

  // Verificar que los elementos existen
  console.log('searchInput:', searchInput);
  console.log('mobileSearchInput:', mobileSearchInput);
  console.log('clearSearch:', clearSearch);
  console.log('mobileClearSearch:', mobileClearSearch);
  console.log('productsContainer:', productsContainer);

  if (!searchInput || !mobileSearchInput || !clearSearch || !mobileClearSearch || !productsContainer) {
    console.error('Uno o más elementos del DOM no se encontraron');
    return;
  }

  // Función para filtrar productos y labels de categorías
  function filterProducts(searchTerm) {
    console.log('Buscando:', searchTerm);
    const lowerSearch = searchTerm.toLowerCase().trim();
    const productCards = productsContainer.querySelectorAll('.product-card');
    const categoryLabels = productsContainer.querySelectorAll('.category-label-row');
    const noResultsMessage = productsContainer.querySelector('.no-results');

    let visibleCategories = new Set();
    let visibleProducts = 0;

    // Eliminar mensaje de "no resultados" si existe
    if (noResultsMessage) {
      noResultsMessage.remove();
      console.log('Mensaje "No se encontraron productos" eliminado');
    }

    // Restaurar labels al estado original
    categoryLabels.forEach(label => {
      label.classList.remove('search-label-fix');
      label.style.removeProperty('width');
    });

    // Filtrar tarjetas de producto y recolectar categorías visibles
    productCards.forEach(card => {
      const name = card.querySelector('.product-name-card')?.textContent.toLowerCase() || '';
      const manufacturer = card.querySelector('.product-manufacturer')?.textContent.toLowerCase() || '';
      const brief = card.querySelector('.product-brief')?.textContent.toLowerCase() || '';

      const matches = !lowerSearch || name.includes(lowerSearch) || manufacturer.includes(lowerSearch) || brief.includes(lowerSearch);
      card.style.display = matches ? 'block' : 'none';
      if (matches) {
        visibleProducts++;
        // Obtener la categoría del producto desde el label anterior
        let prev = card.previousElementSibling;
        while (prev && !prev.classList.contains('category-label-row')) {
          prev = prev.previousElementSibling;
        }
        if (prev) {
          const category = prev.querySelector('.category-label')?.textContent;
          if (category) visibleCategories.add(category);
        }
      }
    });

    // Mostrar/ocultar labels de categorías
    categoryLabels.forEach(label => {
      const category = label.querySelector('.category-label')?.textContent;
      if (visibleCategories.has(category) && lowerSearch) {
        label.style.display = 'block';
        // Forzar el tamaño del label para evitar que se agrande
        label.classList.add('search-label-fix');
        label.style.width = '100%'; // Mantener el ancho original
      } else {
        label.style.display = lowerSearch ? 'none' : 'block';
      }
    });

    // Mostrar mensaje si no hay resultados y hay texto de búsqueda
    if (visibleProducts === 0 && lowerSearch) {
      const noResults = document.createElement('p');
      noResults.className = 'no-results';
      noResults.textContent = 'No se encontraron productos.';
      productsContainer.appendChild(noResults);
      console.log('Mostrando mensaje "No se encontraron productos"');
    }

    console.log('Productos visibles:', visibleProducts, 'Categorías visibles:', [...visibleCategories]);
  }

  // Función para manejar la búsqueda y sincronizar inputs
  function handleSearch(input, otherInput, clearIcon) {
    const searchTerm = input.value;
    clearIcon.style.display = searchTerm ? 'inline-block' : 'none';
    otherInput.value = searchTerm; // Sincronizar inputs
    filterProducts(searchTerm);
  }

  // Event listeners para los inputs
  searchInput.addEventListener('input', () => {
    console.log('Evento input en searchInput');
    handleSearch(searchInput, mobileSearchInput, clearSearch);
  });

  mobileSearchInput.addEventListener('input', () => {
    console.log('Evento input en mobileSearchInput');
    handleSearch(mobileSearchInput, searchInput, mobileClearSearch);
  });

  // Event listeners para los íconos de limpiar
  clearSearch.addEventListener('click', () => {
    console.log('Clic en clearSearch');
    searchInput.value = '';
    mobileSearchInput.value = '';
    clearSearch.style.display = 'none';
    mobileClearSearch.style.display = 'none';
    filterProducts('');
  });

  mobileClearSearch.addEventListener('click', () => {
    console.log('Clic en mobileClearSearch');
    searchInput.value = '';
    mobileSearchInput.value = '';
    clearSearch.style.display = 'none';
    mobileClearSearch.style.display = 'none';
    filterProducts('');
  });
});