// app.js

// ==== DONNÉES FACTICES (Notre fausse base de données) ====
// Dans une vraie application, ces données viendraient d'un serveur (Backend) ou de la blockchain.
const projetsAgricoles = [
    {
        id: 1,
        titre: "Champ de Cacao",
        culture: "Cacao",
        localisation: "Soubré, Côte d'Ivoire", // J'ai mis Soubré, grande zone de cacao
        humidite: 65,
        temperature: 28,
        rendementEstime: 12.5,
        montantDuBesoin: 5000000, // 5 millions FCFA
        financementActuel: 3000000,
        couleurTag: "#8b5a2b", // Marron Cacao
        image: "https://www.terre-de-culture.com/storage/2021/05/culture-du-cacao.jpg"
    },
    {
        id: 2,
        titre: "Culture d'Igname",
        culture: "Igname",
        localisation: "Bouaké, Côte d'Ivoire",
        humidite: 50,
        temperature: 30,
        rendementEstime: 15.0,
        montantDuBesoin: 2500000,
        financementActuel: 1500000,
        couleurTag: "#d2b48c", // Beige/Marron clair
        image: "https://tse3.mm.bing.net/th/id/OIP.gAxwvHfjb4E7YNfu6-lCXAHaEH?rs=1&pid=ImgDetMain&o=7&rm=3"
    },
    {
        id: 3,
        titre: "Plantation de Tomate",
        culture: "Tomate",
        localisation: "Sikensi, Côte d'Ivoire",
        humidite: 70,
        temperature: 25,
        rendementEstime: 18.2,
        montantDuBesoin: 1200000,
        financementActuel: 400000,
        couleurTag: "#ff0000", // Rouge Tomate
        image: "https://www.agri-mag.com/wp-content/uploads/2022/02/DSC_0203-scaled.jpg"
    },
    {
        id: 4,
        titre: "Champ de Piment",
        culture: "Piment",
        localisation: "Korhogo, Côte d'Ivoire",
        humidite: 45,
        temperature: 35,
        rendementEstime: 22.0,
        montantDuBesoin: 800000,
        financementActuel: 150000,
        couleurTag: "#cc0000", // Rouge foncé
        image: "https://tse4.mm.bing.net/th/id/OIP._1Pv_sJZFsVCD21hU9aLpQHaHa?w=1200&h=1200&rs=1&pid=ImgDetMain&o=7&rm=3"
    }
];

// ==== CONDITIONS IDEALES PAR CULTURE ====
// Ces données représentent les plages optimales d'humidité et de température pour chaque type de culture.
const conditionsIdeales = {
    "Cacao": { humiditeMin: 60, humiditeMax: 80, tempMin: 24, tempMax: 30 },
    "Igname": { humiditeMin: 40, humiditeMax: 60, tempMin: 25, tempMax: 35 },
    "Tomate": { humiditeMin: 60, humiditeMax: 80, tempMin: 20, tempMax: 28 },
    "Piment": { humiditeMin: 40, humiditeMax: 70, tempMin: 25, tempMax: 35 }
};

// ==== FONCTION D'ANALYSE DE RISQUE ====
// Compare les valeurs des capteurs aux conditions idéales de la culture
function analyserRisque(projet) {
    const ideales = conditionsIdeales[projet.culture];
    if (!ideales) return { niveau: "Inconnu", couleur: "#8b949e", icone: "--", details: "Données insuffisantes" };

    let score = 100; // On part de 100 (parfait) et on enlève des points
    let problemes = [];

    // Vérification de l'humidité
    if (projet.humidite < ideales.humiditeMin) {
        const ecart = ideales.humiditeMin - projet.humidite;
        score -= ecart * 2;
        problemes.push(`Humidité trop basse (${projet.humidite}% vs min ${ideales.humiditeMin}%)`);
    } else if (projet.humidite > ideales.humiditeMax) {
        const ecart = projet.humidite - ideales.humiditeMax;
        score -= ecart * 2;
        problemes.push(`Humidité trop haute (${projet.humidite}% vs max ${ideales.humiditeMax}%)`);
    }

    // Vérification de la température
    if (projet.temperature < ideales.tempMin) {
        const ecart = ideales.tempMin - projet.temperature;
        score -= ecart * 3;
        problemes.push(`Température trop basse (${projet.temperature}°C vs min ${ideales.tempMin}°C)`);
    } else if (projet.temperature > ideales.tempMax) {
        const ecart = projet.temperature - ideales.tempMax;
        score -= ecart * 3;
        problemes.push(`Température trop haute (${projet.temperature}°C vs max ${ideales.tempMax}°C)`);
    }

    // Classer le risque selon le score
    if (score >= 80) {
        return { niveau: "Favorable", couleur: "#2ea043", icone: "", details: "Conditions optimales pour cette culture.", score };
    } else if (score >= 50) {
        return { niveau: "Modéré", couleur: "#d29922", icone: "", details: problemes.join(' | '), score };
    } else {
        return { niveau: "Risqué", couleur: "#f85149", icone: "", details: problemes.join(' | '), score };
    }
}

// ==== LOGIQUE DE L'APPLICATION ====

// Trouver l'endroit où on veut insérer nos cartes dans le HTML
const projectsGrid = document.querySelector('.projects-grid');

// Fonction pour générer une carte HTML à partir des données
function creerCarteProjet(projet) {
    // On crée une grande chaîne de caractères qui contient le code HTML de la carte
    // Les backticks (``) permettent d'insérer des variables avec ${variable}
    const html = `
        <div class="project-card">
            <!-- On affiche l'image fournie avec un centrage automatique -->
            <div class="card-image" style="background-image: url('${projet.image}'); background-size: cover; background-position: center;"></div>
            <div class="card-content">
                <span class="tag" style="color: #ffffff; background-color: ${projet.couleurTag}; padding: 0.4rem 0.8rem; border-radius: 20px;">${projet.culture}</span>
                <h3>${projet.titre}</h3>
                <p class="location">${projet.localisation}</p>
                
                <div class="sensor-data">
                    <div class="sensor">Humidité : ${projet.humidite}%</div>
                    <div class="sensor">Temp. : ${projet.temperature}°C</div>
                </div>

                <div class="risk-analysis" style="border-left: 3px solid ${analyserRisque(projet).couleur}; padding: 0.6rem 0.8rem; margin-bottom: 1rem; background: ${analyserRisque(projet).couleur}15; border-radius: 0 6px 6px 0;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
                        <span style="font-weight: 700; color: ${analyserRisque(projet).couleur};">Analyse Risque : ${analyserRisque(projet).niveau}</span>
                        <span style="font-size: 0.8rem; color: ${analyserRisque(projet).couleur};">${analyserRisque(projet).score}/100</span>
                    </div>
                    <small style="color: #b3bac2; font-size: 0.78rem;">${analyserRisque(projet).details}</small>
                </div>

                <div class="investment-info">
                    <div>
                        <span class="label">Montant du Besoin</span>
                        <span class="value">${projet.montantDuBesoin.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                </div>

                <div class="investment-info">
                    <div>
                        <span class="label">Rendement Est.</span>
                        <span class="value highlight">${projet.rendementEstime}%</span>
                    </div>
                    <div>
                        <span class="label">Déjà Financé</span>
                        <span class="value" style="color: var(--primary-color);">${projet.financementActuel.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                </div>

                <!-- Focus sur ce projet via le data-id -->
                <button class="btn-invest" data-id="${projet.id}">Investir Maintenant</button>
            </div>
        </div>
    `;
    return html;
}

// Fonction pour afficher toutes les cartes sur la page
function afficherProjets() {
    // On vide la grille (qui contient actuellement les cartes HTML statiques)
    projectsGrid.innerHTML = '';

    // On parcourt notre fausse base de données
    projetsAgricoles.forEach(projet => {
        // On crée le HTML pour chaque projet
        const carteHTML = creerCarteProjet(projet);
        // On l'ajoute à la grille
        projectsGrid.innerHTML += carteHTML;
    });

    // Une fois les boutons créés, on leur ajoute la capacité de réagir au clic
    ajouterEvenementsBoutons();
}

// Fonction pour gérer les clics sur les boutons "Investir"
function ajouterEvenementsBoutons() {
    const boutons = document.querySelectorAll('.btn-invest');

    boutons.forEach(bouton => {
        bouton.addEventListener('click', function (event) {
            // event.target est le bouton cliqué. getAttribute permet de lire notre 'data-id'
            const projetId = event.target.getAttribute('data-id');
            const projet = projetsAgricoles.find(p => p.id == projetId);

            // Ouvrir la modale au lieu d'afficher une notification
            ouvrirModaleInvestissement(projet);
        });
    });
}

// ==== GESTION DE LA MODALE ====
const modal = document.getElementById('invest-modal');
const modalTitle = document.getElementById('modal-project-title');
const btnCloseModal = document.querySelector('.close-modal');
const btnConfirmInvest = document.getElementById('btn-confirm-invest');
const amountInput = document.getElementById('amount');

// Pour garder en mémoire le projet en cours d'investissement
let projetActuelSelectionne = null;

function ouvrirModaleInvestissement(projet) {
    projetActuelSelectionne = projet;
    modalTitle.innerHTML = `Investir dans : <br> ${projet.titre}`;
    amountInput.value = ''; // Réinitialiser le champ
    modal.classList.add('active');
}

function fermerModale() {
    modal.classList.remove('active');
    projetActuelSelectionne = null;
}

// Fermer via le bouton X
btnCloseModal.addEventListener('click', fermerModale);

// Fermer en cliquant à l'extérieur de la Pop-up
modal.addEventListener('click', function (e) {
    if (e.target === modal) {
        fermerModale();
    }
});

// Gérer le clic sur "Confirmer le Paiement"
btnConfirmInvest.addEventListener('click', function () {
    const montantSaisi = parseInt(amountInput.value);

    // Vérifier quel réseau Mobile Money a été choisi
    const mobileMoneyChoisi = document.querySelector('input[name="payment"]:checked').value;
    const nomReseau = mobileMoneyChoisi.charAt(0).toUpperCase() + mobileMoneyChoisi.slice(1); // Mettre la Majuscule

    if (!montantSaisi || montantSaisi < 5000) {
        montrerNotification("⚠️ <b>Erreur</b><br>Veuillez saisir un montant validé d'au moins 5 000 FCFA.", "info");
        return;
    }

    // Si tout va bien, on ferme la modale et on simule un succès !
    fermerModale();
    montrerNotification(`✅ <b>Paiement Initié</b><br>Demande d'autorisation de ${montantSaisi.toLocaleString('fr-FR')} FCFA via <b>${nomReseau}</b> envoyée sur votre téléphone.`, "info");
});

// Fonction pour le bouton "Connecter Wallet" dans la barre de navigation
const btnConnect = document.querySelector('.btn-connect');
btnConnect.addEventListener('click', function (e) {
    e.preventDefault(); // Empêche le lien de nous ramener en haut de la page
    montrerNotification("🦊 <b>Action Simulée</b><br>Connexion au Wallet (ex: MetaMask) en cours...", "info");
});

// ==== SYSTÈME DE NOTIFICATION ====
function montrerNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.innerHTML = message;

    container.appendChild(notif);

    // Afficher avec une petite animation
    setTimeout(() => {
        notif.classList.add('show');
    }, 10);

    // Disparaître après 4 secondes
    setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 300); // Attendre la fin de l'animation CSS
    }, 4000);
}

// ==== DEMARRAGE ====
// Quand le navigateur a fini de lire tout le HTML, on lance notre fonction d'affichage
document.addEventListener('DOMContentLoaded', afficherProjets);
