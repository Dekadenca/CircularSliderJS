function circularSlider({
  container,
  color = "red",
  max = 1000,
  min = 0,
  step = 50,
  radius = 250,
}) {

  let mainContainer = document.createElement("div");
  mainContainer.style.position = "absolute";

  let slider = document.createElement("div");
  slider.classList.add("circularSlider");
  slider.style.width = radius;
  slider.style.height = radius;
  mainContainer.appendChild(slider);

  let knob = document.createElement("div");
  knob.classList.add("knob");
  knob.onmousedown = onKnobDrag;
  mainContainer.appendChild(knob);



  document.querySelector(container).appendChild(mainContainer);

  return;
}

function onKnobDrag(event) {
  event.preventDefault();

  this.classList.add("dragging");
  addEventListener("mousemove", knobDragging);
  document.body.classList.add("dragging");

  addEventListener("mouseup", () => {
    removeEventListener("mousemove", knobDragging);
    this.classList.remove("dragging");
    document.body.classList.remove("dragging");
  }, {once: true});
}

function knobDragging(event) {
  console.log(event.pageX, event.pageY);
}
