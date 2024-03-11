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

  let dragFunction = knobDragging.bind(this);

  this.classList.add("dragging");
  addEventListener("mousemove", dragFunction);
  document.body.classList.add("dragging");

  addEventListener("mouseup", () => {
    removeEventListener("mousemove", dragFunction);
    this.classList.remove("dragging");
    document.body.classList.remove("dragging");
  }, {once: true});
}

function knobDragging(event) {
  //Mouse coordinates
  let mouseX = event.pageX;
  let mouseY = event.pageY;

  //Container center coordinates
  let containerBoundingRect = this.parentNode.getBoundingClientRect();
  let containerX = (containerBoundingRect.width / 2) + containerBoundingRect.x;
  let containerY = (containerBoundingRect.height / 2) + containerBoundingRect.y;

  //Calculation to get angle of the mouse position relative to the containers center.
  let relativeX = mouseX - containerX;
  let relativeY = mouseY - containerY;
  let theta = Math.atan2(relativeY, relativeX);


  //First quadrant
  if (relativeX >= 0 && relativeY <= 0) {
    theta += Math.PI / 2;
    //Second quadrant
  } else if (relativeX >= 0 && relativeY >= 0) {
    theta += Math.PI / 2;
    //Third quadrant
  } else if (relativeX <= 0 && relativeY >= 0) {
    theta += Math.PI / 2;
    //Fourth quadrant
  } else if (relativeX <= 0 && relativeY <= 0) {
    theta += 2 * Math.PI + (Math.PI / 2);
  }

  theta = (theta * 180) / Math.PI;

  console.log(theta);
}
