/*///////////////////////////////////////////////////////////////////////
                     LES VARIABLES DU QUIZ
///////////////////////////////////////////////////////////////////////*/

// Extraits audio à utiliser dans l'interface du quiz
let audio = {
    succes: new Audio("Sons/bien.mp3"),
    echec: new Audio("Sons/mal.mp3"),
};

// Numéro de la question courante
let noQuestion = 0;

// Nombre de réponses justes
let nombreReponsesJustes = 0;

// Barre d'avancement du quiz
let barreAvancement = document.querySelector(".barre-avancement");
// Largeur de la barre à tout moment (initialement 0)
let largeurBarre = 0;
// Cible de largeur pour chaque étape d'avancement du quiz (calculée selon
// la progression dans les questions et le nombre total de questions)
let largeurCibleBarre = 0;

// Zone d'affichage du quiz
let zoneQuiz = document.querySelector(".quiz");

// Section contenant une question du quiz et sa position sur l'axe des X
let sectionQuestion = document.querySelector("section");
let scale = 100;

// Conteneurs des titres des questions et des choix de réponse
let titreQuestion = document.querySelector(".titre-question");
let lesChoixDeReponses = document.querySelector(".les-choix-de-reponse");

// Titre animé du quiz
let titreIntro = document.querySelector(".anim-titre-intro");

// Zone de fin du quiz
let zoneFin = document.querySelector(".fin");

// Bouton servant à recommencer le quiz
let btnRecommencer = document.querySelector("main.fin .btn-recommencer");

let videoFond = document.querySelector("video");

let body = document.querySelector("body");

let meilleurScore = localStorage.getItem("meilleurScore") || 0;

/*///////////////////////////////////////////////////////////////////////
                            ÉVÉNEMENTS
///////////////////////////////////////////////////////////////////////*/
// Gérer la fin de l'animation d'intro
titreIntro.addEventListener("animationend", afficherConsignePourDebuterLeJeu);

setTimeout(pause, 2505);

// Gestion du bouton de redémarrage du quiz (à la fin du quiz)
btnRecommencer.addEventListener("click", recommencer);

/*///////////////////////////////////////////////////////////////////////
                            LES FONCTIONS
///////////////////////////////////////////////////////////////////////*/

/**
 * Afficher les consignes pour débuter le jeu
 *
 * @param {Event} event : objet AnimationEvent de l'événement distribué
 */
function afficherConsignePourDebuterLeJeu(event) {
    //On affiche la consigne si c'est la fin de la deuxième animation: etirer-mot
    if (event.animationName == "monter-mot") {
        //On affiche un message dans le pied de page
        let piedDePage = document.querySelector("footer");
        piedDePage.innerHTML = "<h1>Cliquer dans l'écran pour commencer le quiz</h1>";

        //On met un écouteur sur la fenêtre pour enlever l'intro et commencer le quiz
        window.addEventListener("click", commencerLeQuiz);
    }
}

/**
 * Enlever les éléments de l'intro et commencer le quiz
 *
 */
function commencerLeQuiz() {
    //On enlève le conteneur de l'intro
    document.querySelector("main.intro").remove();

    //On enlève l'écouteur qui gère le début du quiz
    window.removeEventListener("click", commencerLeQuiz);

    //On met le conteneur du quiz visible
    zoneQuiz.style.display = "flex";

    //videoFond.style.filter = "blur(20px)";

    //On affiche la première question
    afficherQuestion();
}

/**
 * Afficher la question courante
 *
 */
function afficherQuestion() {
    // Récupérer l'objet de la question en cours dans le tableau des questions
    body.style.pointerEvents = "none";
    videoFond.play();

    let objetQuestion = lesQuestions[noQuestion];

    // Affecter le texte dans le titre de la question
    titreQuestion.innerText = objetQuestion.titre;

    // Créer et afficher les balises des choix de réponse :
    // On commence par vider le conteneur des choix de réponses.
    lesChoixDeReponses.innerHTML = "";

    // Puis on le remplit de nouveau avec les choix de réponses de la question
    let unChoix;
    for (let i = 0; i < objetQuestion.choix.length; i++) {
        //On crée la balise et on y affecte une classe CSS
        unChoix = document.createElement("div");
        unChoix.classList.add("choix");
        //On intègre la valeur du choix de réponse
        unChoix.innerText = objetQuestion.choix[i];

        //On affecte dynamiquement l'index de chaque choix
        unChoix.indexChoix = i;

        //On met un écouteur pour vérifier la réponse choisie
        unChoix.addEventListener("mouseover", flou);
        unChoix.addEventListener("mousedown", verifierReponse);
        unChoix.addEventListener("mouseout", plusFlou);

        //Enfin on affiche ce choix
        lesChoixDeReponses.append(unChoix);

        //pauser la video
        setTimeout(pause, 2505);
    }

    // Modifier la valeur de la position de la section sur l'axe des X
    // pour son animation
    scale = 0;
    blur = 50;

    //Partir la première requête pour l'animation de la section
    requestAnimationFrame(animerSection);

    // Fixer la largeur cible de la barre d'avancement (en proportion du nombre
    // de questions disponibles, et du numéro de la question à venir)
    largeurCibleBarre = ((noQuestion + 1) / lesQuestions.length) * 100;

    requestAnimationFrame(animerBarreAvancement);
}

/**
 * Animer la barre d'avancement
 */
function animerBarreAvancement() {
    largeurBarre += 1;
    barreAvancement.style.width = largeurBarre + "vw";

    if (largeurBarre < largeurCibleBarre) {
        requestAnimationFrame(animerBarreAvancement);
    }
}

/**
 * Animer l'arrivée de la section contenant la question
 */
function animerSection() {
    //On décrémente la position de 2 (vw)
    scale += 1;
    blur -= 1;
    sectionQuestion.style.transform = `scale(${scale}%)`;
    sectionQuestion.style.filter = `blur(${blur}px)`;

    //On part une autre requête  d'animation si la position n'est pas atteinte
    if (scale < 100) {
        requestAnimationFrame(animerSection);
    }
}

/*
 * Vérifier la réponse cliquée et gerer le passage à la prochaine question.
 *
 * @param {object} event Informations sur l'événement MouseEvent distribué
 */
function verifierReponse(event) {
    // Ne pas modifier cette ligne de code
    lesChoixDeReponses.classList.toggle("desactiver");

    // Capturer et valider la réponse.
    // Associer les effets de l'interface (animation, transition, sons)
    // Incrémenter le nombre de réponses justes au besoin (variable définie en haut du fichier)

    if (event.target.indexChoix == lesQuestions[noQuestion].bonneReponse) {
        event.target.classList.add("reponse-succes");
        audio.succes.play();
        nombreReponsesJustes++;
    } else {
        event.target.classList.add("reponse-echec");
        audio.echec.play();
    }

    event.target.addEventListener("animationend", gererProchaineQuestion);
}

/**
 * Fonction permettant de gérer l'affichage de la prochaine question
 *
 */
function gererProchaineQuestion(event) {
    // On réactive les clics sur les choix de réponse
    lesChoixDeReponses.classList.toggle("desactiver");

    // On incrémente noQuestion pour la  prochaine question à afficher
    noQuestion++;

    //S'il reste une question on l'affiche, sinon c'est la fin du quiz...
    if (noQuestion < lesQuestions.length) {
        afficherQuestion();
    } else {
        afficherFinQuiz();
    }
}

/*
 * Afficher l'interface de la fin du quiz
 *
 */
function afficherFinQuiz() {
    // Retirer la zone du quiz de l'affichage
    meilleurScore = Math.max(meilleurScore, nombreReponsesJustes);
    localStorage.setItem("meilleurScore", meilleurScore);
    zoneQuiz.style.display = "none";

    //flouter le fond
    videoFond.style.filter = "blur(30px)";

    // Créer dynamiquement la section qui contiendra le score (résultat)
    let sectionResultat = document.createElement("section");

    sectionResultat.innerText =
        "score:" +
        nombreReponsesJustes +
        "/" +
        lesQuestions.length +
        "\n \n meilleur Score:" +
        meilleurScore +
        "/" +
        lesQuestions.length;
    sectionResultat.classList.add("resultat");
    zoneFin.prepend(sectionResultat);

    // Remettre dans l'affichage la zone de "fin du quiz"
    zoneFin.style.display = "flex";

    // Le bouton "recommencer" est affiché à la fin de l'animation du résultat du quiz
    sectionResultat.addEventListener("animationend", afficherBtnRecommencer);
}

/**
 * Modifier l'opacité du bouton 'recommencer' pour le rendre visible
 */
function afficherBtnRecommencer() {
    btnRecommencer.style.opacity = "1";
}

/**
 * Redémarrer le quiz (sans l'animation de début) en réinitialisant l'état de
 * l'application.
 */
function recommencer() {
    // Remettre les variables numériques du quiz à leurs valeurs initiales (à vous
    // de voir lesquelles vous devez réinitialiser)
    videoFond.style.filter = "blur(0)";
    noQuestion = 0;
    largeurBarre = 0;
    nombreReponsesJustes = 0;
    // Retirer du DOM la section contenant le résultat (l'élément ayant la classe 'resultat')
    document.querySelector(".resultat").remove();
    // Remettre l'opacité du bouton "recommencer" à 0
    btnRecommencer.style.opacity = "0";
    // On réaffiche le conteneur de la zone du quiz (son affichage initial était "flex")
    zoneQuiz.style.display = "flex";
    // Et on retire la zone de "fin du quiz" de l'affichage
    zoneFin.style.display = "none";
    // Finalement, on peut afficher la première question...
    afficherQuestion();
}

function flou() {
    videoFond.style.filter = "blur(10px)";
}

function plusFlou() {
    videoFond.style.filter = "blur(0px)";
}

function pause() {
    videoFond.pause();
    body.style.pointerEvents = "auto";
}
