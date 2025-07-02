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

document.addEventListener('DOMContentLoaded', () => {
    console.log('cantidades.js cargado a las', new Date().toLocaleString('es-ES', { timeZone: 'America/Chicago' }));

    // Botones de ofertas
    const offerButtons = {
        desktop: document.getElementById('openOffersModal'),
        mobile: document.getElementById('openOffersModalMobile')
    };

    // Verificar botones
    console.log('Botones de ofertas:', offerButtons);

    // Añadir contadores a los botones
    function updateOfferCount(count) {
        Object.values(offerButtons).forEach(button => {
            if (button) {
                let countElement = button.querySelector('.offer-count');
                if (!countElement) {
                    countElement = document.createElement('span');
                    countElement.className = 'offer-count';
                    button.style.position = 'relative';
                    button.appendChild(countElement);
                }
                countElement.textContent = count;
                console.log(`Contador de ofertas actualizado en ${button.id}: ${count}`);
            } else {
                console.error(`Botón ${button?.id} no encontrado`);
            }
        });
    }

    // Cargar contador de ofertas desde Firebase
    function loadOfferCount() {
        console.log('Cargando contador de ofertas desde Firebase...');
        onValue(offersRef, (snapshot) => {
            const offersData = snapshot.val();
            let activeOffers = 0;
            if (offersData) {
                Object.values(offersData).forEach(offer => {
                    if (offer.status === 'active' && new Date(offer.endDateTime) > new Date()) {
                        activeOffers++;
                    }
                });
                console.log('Ofertas activas encontradas:', activeOffers);
            } else {
                console.log('No hay datos en el nodo "offers"');
            }
            updateOfferCount(activeOffers);
        }, (error) => {
            console.error('Error al cargar contador de ofertas:', error);
            updateOfferCount(0);
        });
    }

    // Iniciar carga del contador
    loadOfferCount();
});