(function () {
  const route = document.querySelector("#requested-route");
  if (route) {
    route.textContent = window.location.pathname || "/";
  }
})();
