export default function () {
  const formNode = document.getElementById("form");
  const searchNode = document.getElementById("search");

  formNode.onsubmit = submit;

  function submit(e) {
    e.preventDefault();
    e.stopPropagation();

    window.location = "/results?q=" + searchNode.value;

    return false;
  }
}
