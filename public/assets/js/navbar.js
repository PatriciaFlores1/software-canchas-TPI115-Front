// navbar.js
(function () {
  const path = window.location.pathname;
  const loginBtn = document.getElementById("btn-login");
  const registroBtn = document.getElementById("btn-registro");

  if (path.includes("/login")) {
    loginBtn.style.display = "none";
  }

  if (path.includes("/registro")) {
    registroBtn.style.display = "none";
  }
})();
