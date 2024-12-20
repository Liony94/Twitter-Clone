document.addEventListener("DOMContentLoaded", () => {
  const userSearch = document.getElementById("userSearch");
  const usersList = document.getElementById("usersList");
  const modal = document.getElementById("newConversationModal");

  let searchTimeout;

  if (userSearch) {
    userSearch.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      const searchTerm = e.target.value.trim();

      searchTimeout = setTimeout(async () => {
        if (searchTerm.length > 0) {
          try {
            const response = await fetch(
              `/messages/users/search?q=${searchTerm}`
            );
            const users = await response.json();

            usersList.innerHTML = users
              .map(
                (user) => `
                <a href="/messages/${user._id}" 
                   class="list-group-item list-group-item-action d-flex align-items-center">
                  <img src="https://via.placeholder.com/32" 
                       class="rounded-circle me-3" 
                       alt="${user.username}">
                  <span>${user.username}</span>
                </a>
              `
              )
              .join("");
          } catch (error) {
            console.error("Erreur lors de la recherche:", error);
          }
        } else {
          usersList.innerHTML = "";
        }
      }, 300);
    });
  }

  // Nettoyer la recherche quand le modal est fermé
  if (modal) {
    modal.addEventListener("hidden.bs.modal", () => {
      if (userSearch) {
        userSearch.value = "";
        usersList.innerHTML = "";
      }
    });
  }
});
