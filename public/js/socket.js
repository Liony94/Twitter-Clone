const socket = io();

// Écouter l'événement newTweet
socket.on("newTweet", (tweet) => {
  // Créer le HTML pour le nouveau tweet
  const tweetHTML = `
    <div class="card tweet-card mb-3">
      <div class="card-body">
        <div class="d-flex">
          <img class="rounded-circle me-2" src="https://via.placeholder.com/48" alt="Photo de profil">
          <div class="tweet-content w-100">
            <div class="d-flex justify-content-between">
              <div class="tweet-header">
                <strong class="me-2">${tweet.author.username}</strong>
                <span class="text-muted">· ${new Date(
                  tweet.createdAt
                ).toLocaleDateString()}</span>
              </div>
              ${
                tweet.canDelete
                  ? `
                <button class="btn btn-sm text-danger tweet-delete-btn" data-tweet-id="${tweet._id}" title="Supprimer">
                  <i class="fas fa-trash"></i>
                </button>
              `
                  : ""
              }
            </div>
            <p class="card-text mt-2">${tweet.content}</p>
            <div class="tweet-actions mt-2">
              <button class="btn btn-sm me-3" title="Répondre">
                <i class="far fa-comment"></i>
              </button>
              <button class="btn btn-sm me-3" title="J'aime">
                <i class="far fa-heart"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Ajouter le tweet au début du conteneur
  const tweetsContainer = document.querySelector(".tweets-container");
  tweetsContainer.insertAdjacentHTML("afterbegin", tweetHTML);

  // Réinitialiser le formulaire s'il existe
  const tweetForm = document.querySelector(".tweet-form");
  if (tweetForm) {
    tweetForm.reset();
  }
});

// Rendre le socket disponible globalement
window.socket = socket;
