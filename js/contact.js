(function () {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const statusEl = document.getElementById("contact-status");
  const submitBtn = form.querySelector(".contact-form__submit");
  const defaultSubmitLabel = submitBtn ? submitBtn.innerHTML : "Send Message";

  function setStatus(message, type) {
    if (!statusEl) return;
    statusEl.textContent = message || "";
    statusEl.className = "contact-status";
    if (type) statusEl.classList.add(`contact-status--${type}`);
  }

  function setSubmitting(isSending) {
    if (!submitBtn) return;
    submitBtn.disabled = isSending;
    submitBtn.setAttribute("aria-busy", isSending ? "true" : "false");
    submitBtn.innerHTML = isSending
      ? "Sending..."
      : defaultSubmitLabel;
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    setStatus("", null);

    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      subject: String(formData.get("subject") || "").trim(),
      message: String(formData.get("message") || "").trim(),
    };

    if (!payload.name || !payload.email || !payload.subject || !payload.message) {
      setStatus("Please fill in all fields.", "error");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setStatus("Message sent — thank you! I'll get back to you soon.", "success");
        form.reset();
        return;
      }

      const fallback =
        data.error ||
        "Unable to send your message. Please try email instead.";
      setStatus(fallback, "error");
    } catch (error) {
      console.error("Contact form error:", error);
      setStatus(
        "Network error — please check your connection or email me directly.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  });
})();
