const form = document.getElementById("shorten-form");
const originalUrlInput = document.getElementById("original-url");
const resultDiv = document.getElementById("result");
const shortUrlAnchor = document.getElementById("short-url");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const originalUrl = originalUrlInput.value;
  if (!originalUrl) return alert("Please enter a valid URL");

  try {
    // Отправка POST-запроса на API
    const response = await fetch("/shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ originalUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to shorten the URL");
    }

    const data = await response.json();

    // Отображение результата
    shortUrlAnchor.href = `/${data.shortUrl}`;
    shortUrlAnchor.textContent = `${window.location.origin}/${data.shortUrl}`;
    resultDiv.classList.remove("hidden");
  } catch (error) {
    alert(error.message);
  }
});
