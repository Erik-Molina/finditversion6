import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBJi-ve8Z1v6IGaa-4F0135AIAabdISPx8",
    authDomain: "sajsajndhbshaihbaksjsdnsjahius.firebaseapp.com",
    databaseURL: "https://sajsajndhbshaihbaksjsdnsjahius-default-rtdb.firebaseio.com",
    projectId: "sajsajndhbshaihbaksjsdnsjahius",
    storageBucket: "sajsajndhbshaihbaksjsdnsjahius.firebasestorage.app",
    messagingSenderId: "923009709693",
    appId: "1:923009709693:web:abde872e5878909b556314",
    measurementId: "G-NG78JB2DLE"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const offersRef = ref(db, 'offers');

// Elementos del DOM
const modalBody = document.querySelector('.modal-body-ofe');
const filterButtons = {
    all: document.createElement('button'),
    hardware: document.createElement('button'),
    fashion: document.createElement('button'),
    tech: document.createElement('button')
};

// Crear filtros
function createFilters() {
    const filtersContainer = document.createElement('div');
    filtersContainer.className = 'offer-filters';
    
    // Configurar botones de filtro
    Object.keys(filterButtons).forEach(category => {
        const btn = filterButtons[category];
        btn.className = 'offer-filter-btn';
        btn.dataset.category = category;
        
        switch(category) {
            case 'all':
                btn.textContent = '#Todas';
                btn.style.backgroundColor = '#444';
                break;
            case 'hardware':
                btn.textContent = '#Ferretería';
                btn.style.backgroundColor = '#ff7e5f';
                break;
            case 'fashion':
                btn.textContent = '#Moda';
                btn.style.backgroundColor = '#feb47b';
                break;
            case 'tech':
                btn.textContent = '#Tecnología';
                btn.style.backgroundColor = '#6a11cb';
                break;
        }
        
        btn.addEventListener('click', () => filterOffers(category));
        filtersContainer.appendChild(btn);
    });
    
    modalBody.appendChild(filtersContainer);
    console.log('Filtros creados:', Object.keys(filterButtons));
}

// Filtrar ofertas por categoría
function filterOffers(category) {
    console.log(`Filtrando ofertas por: ${category}`);
    // Resetear estilos de botones
    Object.values(filterButtons).forEach(btn => {
        btn.style.opacity = '0.7';
        btn.style.transform = 'scale(0.95)';
    });
    
    // Resaltar botón activo
    filterButtons[category].style.opacity = '1';
    filterButtons[category].style.transform = 'scale(1.05)';
    
    // Mostrar solo ofertas de la categoría seleccionada
    const offerItems = document.querySelectorAll('.offer-item');
    offerItems.forEach(item => {
        if (item.dataset.category === category || category === 'all') {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Crear elemento de oferta
function createOfferElement(offer) {
    const now = new Date();
    const endDate = new Date(offer.endDateTime);
    const timeLeft = endDate - now;
    
    if (timeLeft <= 0 || offer.status !== 'active') return null;
    
    const offerItem = document.createElement('div');
    offerItem.className = 'offer-item';
    offerItem.dataset.category = offer.category;
    
    // Calcular tiempo restante
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    // Imágenes (usamos ambas si están disponibles)
    const imageUrl = offer.imageUrl1 || offer.imageUrl2 || 'https://via.placeholder.com/150';
    const imagesList = [offer.imageUrl1, offer.imageUrl2].filter(img => img).join(',');
    
    offerItem.innerHTML = `
        <div class="offer-image-container">
            <img src="${imageUrl}" alt="${offer.productName}" class="offer-image" data-images="${imagesList}">
        </div>
        <div class="offer-details">
            <h3 class="offer-title">${offer.productName || 'Producto sin nombre'}</h3>
            <div class="offer-prices">
                <span class="original-price">L ${offer.currentPrice ? offer.currentPrice.toFixed(2) : 'N/A'}</span>
                <span class="discount-price">L ${offer.offerPrice ? offer.offerPrice.toFixed(2) : 'N/A'}</span>
                <span class="discount-percent">-${offer.discount || 0}%</span>
            </div>
            <div class="offer-timer">
                <span class="material-icons">access_time</span>
                <span class="time-left">${hoursLeft}h ${minutesLeft}m</span>
            </div>
        </div>
        <div class="offer-actions">
            <button class="buy-now-btn">Comprar Online</button>
            <button class="contact-now-btn">Contactar para comprar ahora</button>
        </div>
    `;
    
    return offerItem;
}

// Cargar ofertas desde Firebase
function loadOffers() {
    console.log('Cargando ofertas desde Firebase...');
    onValue(offersRef, (snapshot) => {
        const offersData = snapshot.val();
        modalBody.innerHTML = '';
        createFilters();
        
        if (!offersData) {
            modalBody.innerHTML = '<p class="no-offers">No hay ofertas disponibles en este momento</p>';
            console.log('No hay datos en el nodo "offers"');
            return;
        }
        
        const offersContainer = document.createElement('div');
        offersContainer.className = 'offers-container';
        
        Object.keys(offersData).forEach(key => {
            const offer = offersData[key];
            const offerElement = createOfferElement(offer);
            if (offerElement) {
                offersContainer.appendChild(offerElement);
            }
        });
        
        modalBody.appendChild(offersContainer);
        console.log('Ofertas renderizadas en .modal-body-ofe');
        
        // Mostrar todas las ofertas inicialmente
        filterOffers('all');
        
        // Configurar visor de imágenes
        setupImageViewers();
    }, (error) => {
        console.error('Error al cargar ofertas:', error);
        modalBody.innerHTML = `<p class="no-offers">Error al cargar las ofertas: ${error.message}</p>`;
    });
}

// Configurar visor de imágenes
function setupImageViewers() {
    const images = document.querySelectorAll('.offer-image');
    console.log('Imágenes encontradas para visor:', images.length);
    images.forEach(image => {
        image.addEventListener('click', () => {
            console.log('Abriendo visor para:', image.src);
            const imagesList = image.dataset.images.split(',').filter(img => img);
            if (imagesList.length === 0) {
                console.log('No hay imágenes válidas para el visor');
                return;
            }
            let currentIndex = 0;
            
            const viewer = document.createElement('div');
            viewer.className = 'image-viewer';
            viewer.innerHTML = `
                <div class="image-viewer-content">
                    <img src="${imagesList[currentIndex]}" alt="Producto">
                    <button class="close-image"><span class="material-icons">close</span></button>
                    ${imagesList.length > 1 ? `
                        <button class="prev-image"><span class="material-icons">chevron_left</span></button>
                        <button class="next-image"><span class="material-icons">chevron_right</span></button>
                    ` : ''}
                </div>
            `;
            document.body.appendChild(viewer);
            
            setTimeout(() => viewer.classList.add('open'), 10);
            
            viewer.querySelector('.close-image').addEventListener('click', () => {
                console.log('Cerrando visor de imagen');
                viewer.classList.remove('open');
                setTimeout(() => viewer.remove(), 400);
            });
            
            if (imagesList.length > 1) {
                viewer.querySelector('.prev-image').addEventListener('click', () => {
                    currentIndex = (currentIndex - 1 + imagesList.length) % imagesList.length;
                    viewer.querySelector('img').src = imagesList[currentIndex];
                    console.log('Imagen anterior:', imagesList[currentIndex]);
                });
                
                viewer.querySelector('.next-image').addEventListener('click', () => {
                    currentIndex = (currentIndex + 1) % imagesList.length;
                    viewer.querySelector('img').src = imagesList[currentIndex];
                    console.log('Imagen siguiente:', imagesList[currentIndex]);
                });
            }
        });
    });
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    console.log('offers.js cargado a las', new Date().toLocaleString('es-ES', { timeZone: 'America/Chicago' }));
    loadOffers();
});