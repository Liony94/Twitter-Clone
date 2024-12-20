const messageForm = document.getElementById("messageForm");
const messagesContainer = document.querySelector(".messages-container");

if (messageForm) {
  messageForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const recipientId = messageForm.querySelector("[name=recipientId]").value;
    const content = messageForm.querySelector("[name=content]").value;

    console.log("Envoi du message:", { recipientId, content });

    try {
      const response = await fetch("/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipientId, content }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Message envoyé avec succès:", data);
        appendMessage(data);
        messageForm.reset();
      } else {
        console.error("Erreur serveur:", data.message);
        alert(data.message || "Erreur lors de l'envoi du message");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      alert("Erreur lors de l'envoi du message");
    }
  });
}

function appendMessage(message) {
  console.log("Ajout du message à l'interface:", message);
  const messageHTML = `
    <div class="message mb-3 ${
      message.sender._id === currentUserId ? "text-end" : ""
    }">
      <div class="message-bubble d-inline-block p-2 rounded ${
        message.sender._id === currentUserId
          ? "bg-primary text-white"
          : "bg-light"
      }">
        <p class="mb-1">${message.content}</p>
        <small class="text-muted">${new Date(
          message.createdAt
        ).toLocaleTimeString()}</small>
      </div>
    </div>
  `;
  messagesContainer.insertAdjacentHTML("beforeend", messageHTML);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

window.socket.on("newMessage", (message) => {
  console.log("Nouveau message reçu via socket:", message);
  if (messagesContainer) {
    appendMessage(message);
  }

  const unreadBadge = document.querySelector(".unread-messages-count");
  if (unreadBadge) {
    const currentCount = parseInt(unreadBadge.textContent) || 0;
    unreadBadge.textContent = currentCount + 1;
  }
});

// Faire défiler jusqu'au dernier message au chargement
if (messagesContainer) {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
