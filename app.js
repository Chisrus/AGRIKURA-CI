// app.js - Application Agrikura avec base de données Lovable Cloud
import { chargerProjets, chargerConditions, enregistrerInvestissement } from './db.js';

// ==== DONNÉES EN MÉMOIRE ====
let projetsAgricoles = [];
let conditionsIdeales = {};

// ==== FONCTION D'ANALYSE DE RISQUE ====
function analyserRisque(projet) {
    const ideales = conditionsIdeales[projet.culture];
    if (!ideales) return { niveau: "Inconnu", couleur: "#8b949e", icone: "--", details: "Données insuffisantes", score: 0 };

    let score = 100;
    let problemes = [];

    if (projet.humidite < ideales.humiditeMin) {
        score -= (ideales.humiditeMin - projet.humidite) * 2;
        problemes.push(`Humidité trop basse (${projet.humidite}% vs min ${ideales.humiditeMin}%)`);
    } else if (projet.humidite > ideales.humiditeMax) {
        score -= (projet.humidite - ideales.humiditeMax) * 2;
        problemes.push(`Humidité trop haute (${projet.humidite}% vs max ${ideales.humiditeMax}%)`);
    }

    if (projet.temperature < ideales.tempMin) {
        score -= (ideales.tempMin - projet.temperature) * 3;
        problemes.push(`Température trop basse (${projet.temperature}°C vs min ${ideales.tempMin}°C)`);
    } else if (projet.temperature > ideales.tempMax) {
        score -= (projet.temperature - ideales.tempMax) * 3;
        problemes.push(`Température trop haute (${projet.temperature}°C vs max ${ideales.tempMax}°C)`);
    }

    if (score >= 80) {
        return { niveau: "Favorable", couleur: "#2ea043", icone: "✅", details: "Conditions optimales pour cette culture.", score };
    } else if (score >= 50) {
        return { niveau: "Modéré", couleur: "#d29922", icone: "⚠️", details: problemes.join(' | '), score };
    } else {
        return { niveau: "Risqué", couleur: "#f85149", icone: "🔴", details: problemes.join(' | '), score };
    }
}

// ==== LOGIQUE DE L'APPLICATION ====
const projectsGrid = document.querySelector('.projects-grid');

function creerCarteProjet(projet) {
    const risque = analyserRisque(projet);
    const pourcentFinance = projet.montant_besoin > 0 
        ? Math.round((projet.financement_actuel / projet.montant_besoin) * 100) 
        : 0;

    return `
        <div class="project-card" data-aos="fade-up">
            <div class="card-image" style="background-image: url('${projet.image_url || ''}'); background-size: cover; background-position: center;">
                <div class="card-badge" style="background-color: ${projet.couleur_tag};">${projet.culture}</div>
            </div>
            <div class="card-content">
                <h3>${projet.titre}</h3>
                <p class="location">📍 ${projet.localisation}</p>
                
                <div class="sensor-data">
                    <div class="sensor"><span class="sensor-icon">💧</span> ${projet.humidite}% Humidité</div>
                    <div class="sensor"><span class="sensor-icon">🌡️</span> ${projet.temperature}°C</div>
                </div>

                <button class="btn-risk-toggle" data-risk-id="${projet.id}" style="border-color: ${risque.couleur}; color: ${risque.couleur};">
                    ${risque.icone} Risque : ${risque.niveau} (${risque.score}/100) ▼
                </button>
                <div class="risk-details" id="risk-details-${projet.id}" style="display: none; border-left-color: ${risque.couleur}; background: ${risque.couleur}15;">
                    <p class="risk-score" style="color: ${risque.couleur};">Score : ${risque.score}/100</p>
                    <p><b>Culture :</b> ${projet.culture}</p>
                    <p><b>Humidité :</b> ${projet.humidite}% (idéal : ${conditionsIdeales[projet.culture]?.humiditeMin || '?'}-${conditionsIdeales[projet.culture]?.humiditeMax || '?'}%)</p>
                    <p><b>Température :</b> ${projet.temperature}°C (idéal : ${conditionsIdeales[projet.culture]?.tempMin || '?'}-${conditionsIdeales[projet.culture]?.tempMax || '?'}°C)</p>
                    <p class="risk-diagnostic"><b>Diagnostic :</b> ${risque.details}</p>
                </div>

                <div class="investment-info">
                    <div>
                        <span class="label">Besoin</span>
                        <span class="value">${projet.montant_besoin.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div>
                        <span class="label">Rendement</span>
                        <span class="value highlight">${projet.rendement_estime}%</span>
                    </div>
                </div>

                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${pourcentFinance}%;"></div>
                    <span class="progress-text">${pourcentFinance}% financé — ${projet.financement_actuel.toLocaleString('fr-FR')} FCFA</span>
                </div>

                <button class="btn-invest" data-id="${projet.id}">Investir Maintenant</button>
            </div>
        </div>
    `;
}

// Afficher le loader puis les projets
async function afficherProjets() {
    projectsGrid.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Chargement des projets...</p></div>';

    // Charger depuis la base de données
    const [projets, conditions] = await Promise.all([
        chargerProjets(),
        chargerConditions()
    ]);

    projetsAgricoles = projets;
    conditionsIdeales = conditions;

    if (projetsAgricoles.length === 0) {
        projectsGrid.innerHTML = '<p class="no-projects">Aucun projet disponible pour le moment.</p>';
        return;
    }

    projectsGrid.innerHTML = '';
    projetsAgricoles.forEach((projet, index) => {
        const carte = creerCarteProjet(projet);
        projectsGrid.innerHTML += carte;
    });

    ajouterEvenementsBoutons();
}

function ajouterEvenementsBoutons() {
    document.querySelectorAll('.btn-invest').forEach(bouton => {
        bouton.addEventListener('click', function (event) {
            const projetId = event.target.getAttribute('data-id');
            const projet = projetsAgricoles.find(p => p.id === projetId);
            if (projet) ouvrirModaleInvestissement(projet);
        });
    });

    document.querySelectorAll('.btn-risk-toggle').forEach(btn => {
        btn.addEventListener('click', function () {
            const riskId = this.getAttribute('data-risk-id');
            const panel = document.getElementById('risk-details-' + riskId);
            if (panel.style.display === 'none') {
                panel.style.display = 'block';
                this.textContent = this.textContent.replace('▼', '▲');
            } else {
                panel.style.display = 'none';
                this.textContent = this.textContent.replace('▲', '▼');
            }
        });
    });
}

// ==== GESTION DE LA MODALE ====
const modal = document.getElementById('invest-modal');
const modalTitle = document.getElementById('modal-project-title');
const btnCloseModal = document.querySelector('.close-modal');
const btnConfirmInvest = document.getElementById('btn-confirm-invest');
const amountInput = document.getElementById('amount');

let projetActuelSelectionne = null;

function ouvrirModaleInvestissement(projet) {
    projetActuelSelectionne = projet;
    modalTitle.innerHTML = `Investir dans : <br> ${projet.titre}`;
    amountInput.value = '';
    modal.classList.add('active');
}

function fermerModale() {
    modal.classList.remove('active');
    projetActuelSelectionne = null;
}

btnCloseModal.addEventListener('click', fermerModale);

modal.addEventListener('click', function (e) {
    if (e.target === modal) fermerModale();
});

btnConfirmInvest.addEventListener('click', async function () {
    const montantSaisi = parseInt(amountInput.value);
    const mobileMoneyChoisi = document.querySelector('input[name="payment"]:checked')?.value;

    if (!mobileMoneyChoisi) {
        montrerNotification("⚠️ <b>Erreur</b><br>Veuillez choisir un mode de paiement.", "info");
        return;
    }

    if (!montantSaisi || montantSaisi < 5000) {
        montrerNotification("⚠️ <b>Erreur</b><br>Veuillez saisir un montant d'au moins 5 000 FCFA.", "info");
        return;
    }

    const nomReseau = mobileMoneyChoisi.charAt(0).toUpperCase() + mobileMoneyChoisi.slice(1);

    // Désactiver le bouton pendant le traitement
    btnConfirmInvest.disabled = true;
    btnConfirmInvest.textContent = 'Traitement...';

    // Enregistrer dans la base de données
    const resultat = await enregistrerInvestissement(
        projetActuelSelectionne.id,
        montantSaisi,
        mobileMoneyChoisi
    );

    btnConfirmInvest.disabled = false;
    btnConfirmInvest.textContent = 'Confirmer le Paiement';

    fermerModale();

    if (resultat) {
        montrerNotification(`✅ <b>Paiement Initié</b><br>Demande de ${montantSaisi.toLocaleString('fr-FR')} FCFA via <b>${nomReseau}</b> envoyée. Investissement enregistré !`, "info");
        // Recharger les projets pour voir le financement mis à jour
        afficherProjets();
    } else {
        montrerNotification(`✅ <b>Paiement Initié</b><br>Demande de ${montantSaisi.toLocaleString('fr-FR')} FCFA via <b>${nomReseau}</b> envoyée sur votre téléphone.`, "info");
    }
});

// Bouton Espace Investisseur
const btnConnect = document.querySelector('.btn-connect');
btnConnect.addEventListener('click', function (e) {
    e.preventDefault();
    montrerNotification("🔐 <b>Espace Sécurisé</b><br>Connexion à votre espace investisseur en cours...", "info");
});

// ==== COMPTEURS ANIMÉS ====
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const speed = 200;
    counters.forEach(counter => {
        const animate = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText.replace(/[^0-9.]/g, '');
            const increment = target / speed;
            if (count < target) {
                counter.innerText = Math.ceil(count + increment);
                setTimeout(animate, 1);
            } else {
                if (target >= 1000000) counter.innerText = (target / 1000000).toFixed(1) + 'M';
                else if (target >= 1000) counter.innerText = (target / 1000).toFixed(0) + 'K';
                else if (target % 1 !== 0) counter.innerText = target.toFixed(1);
                else counter.innerText = target;
            }
        };
        animate();
    });
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const statsSection = document.getElementById('statistics');
if (statsSection) observer.observe(statsSection);

// ==== FAQ ====
document.addEventListener('DOMContentLoaded', function() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const isActive = faqItem.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(item => item.classList.remove('active'));
            if (!isActive) faqItem.classList.add('active');
        });
    });

    // ==== MENU MOBILE ====
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        // Fermer le menu au clic sur un lien
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }
});

// ==== NOTIFICATIONS ====
function montrerNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.innerHTML = message;
    container.appendChild(notif);
    setTimeout(() => notif.classList.add('show'), 10);
    setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 300);
    }, 4000);
}

// ==== DÉMARRAGE ====
document.addEventListener('DOMContentLoaded', afficherProjets);
