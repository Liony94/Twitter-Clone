window.addEventListener("DOMContentLoaded", () => {
  const deleteBtns = document.querySelectorAll(".tweet-delete-btn");

  deleteBtns.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const tweetId = btn.getAttribute("data-tweet-id");

      if (confirm("Voulez-vous vraiment supprimer ce tweet ?")) {
        try {
          const response = await fetch(`/api/tweet/${tweetId}`, {
            method: "DELETE",
          });

          if (response.ok) {
            const tweetCard = btn.closest(".tweet-card");
            tweetCard.remove();
          } else {
            const data = await response.json();
            alert(data.message || "Vous n'êtes pas autorisé à supprimer ce tweet");
          }
        } catch (error) {
          console.error("Erreur lors de la suppression:", error);
          alert("Une erreur est survenue lors de la suppression du tweet");
        }
      }
    });
  });
});
