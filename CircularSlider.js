var SLIDER_BORDER_SIZE = 25;
var LABEL_CONTAINER_WIDTH = 200;

function circularSlider({
  container,
  label,
  color = "red",
  max = 1000,
  min = 0,
  step = 50,
  radius = 250,
}) {
  if (!container) {
    console.log("Missing container selector");
    return;
  }

  if (!label) {
    console.log("Missing label");
    return;
  }

  container = document.querySelector(container);
  container.style.width = 250 + (SLIDER_BORDER_SIZE * 2) + LABEL_CONTAINER_WIDTH;
  container.style.height = 250 + (SLIDER_BORDER_SIZE * 2);

  //Create label container if not exists
  let labelContainer = document.createElement("div");
  labelContainer.style.width = LABEL_CONTAINER_WIDTH;
  labelContainer.classList.add("label_container");
  labelContainer.appendChild(createLabel(color, label, max, min, step));

  let sliderContainer = document.createElement("div");
  sliderContainer.style.position = "relative";

  //Creating a slider element
  let slider = document.createElement("div");
  slider.classList.add("circular_slider");
  slider.style.width = radius;
  slider.style.height = radius;
  slider.onmousedown = onSliderClick;
  sliderContainer.appendChild(slider);

  //Creating knob element that is used to drag along the slider
  let knob = document.createElement("div");
  knob.classList.add("knob");
  knob.dataset.label = transformForDataset(label);
  knob.onmousedown = onKnobDrag;
  sliderContainer.appendChild(knob);

  //Overlay element that hides
  let overlayContainer1 = document.createElement("div");
  overlayContainer1.classList.add("overlay_container");
  let overlay1 = document.createElement("div");
  overlay1.classList.add("overlay");
  overlayContainer1.appendChild(overlay1);

  let overlayContainer2 = document.createElement("div");
  overlayContainer2.classList.add("overlay_container");
  let overlay2 = document.createElement("div");
  overlay2.classList.add("overlay", "overlay_right");
  overlayContainer2.appendChild(overlay2);

  slider.appendChild(overlayContainer1);
  slider.appendChild(overlayContainer2);

  container.appendChild(labelContainer);
  container.appendChild(sliderContainer);

  return;
}

function createLabel(color, label, max, min, step) {
  //Create new label div
  let labelDiv = document.createElement("div");
  labelDiv.id = transformForDataset(label);
  labelDiv.dataset.max = max;
  labelDiv.dataset.min = min;
  labelDiv.dataset.step = step;
  labelDiv.classList.add("label");

  //Label value that changes on drag
  let labelValue = document.createElement("div");
  labelValue.classList.add("label_value");
  labelValue.innerHTML = "$0";
  labelDiv.appendChild(labelValue);

  //Label color
  let labelColor = document.createElement("div");
  labelColor.classList.add("label_color");
  labelColor.style.backgroundColor = color;
  labelDiv.appendChild(labelColor);

  //Label text value
  let labelText = document.createElement("div");
  labelText.innerHTML = label;
  labelDiv.appendChild(labelText);

  return labelDiv;
}

function onSliderClick(event) {
  let containerBoundingBox = this.getBoundingClientRect();
  let containerRadius = containerBoundingBox.width / 2;

  //Get relative click location inside slider div
  let relativeClickLocationX = event.clientX - containerBoundingBox.left;
  let relativeClickLocationY = event.clientY - containerBoundingBox.top;

  //Check if click was on the slider border
  if (
    //Checks max circle
    Math.pow(relativeClickLocationX - containerRadius, 2) + Math.pow(relativeClickLocationY - containerRadius, 2) < Math.pow(containerRadius, 2) &&
    //Checks min circle
    Math.pow(relativeClickLocationX - containerRadius, 2) + Math.pow(relativeClickLocationY - containerRadius, 2) > Math.pow(containerRadius - SLIDER_BORDER_SIZE, 2)
  ) {
    let sliderKnob = this.parentNode.querySelector(".knob");
    onKnobDrag.bind(sliderKnob, event)();
  }
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
  let container = this.parentNode;
  let label = this.parentNode.parentNode.querySelector(".label_container #" + this.dataset.label);
  let labelValue = label.querySelector(".label_value");
  let min = parseInt(label.dataset.min);
  let max = parseInt(label.dataset.max);
  let step = parseInt(label.dataset.step);

  //Mouse coordinates
  let mouseX = event.pageX;
  let mouseY = event.pageY;

  //Container center coordinates
  let containerBoundingRect = container.getBoundingClientRect();
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
  let rotation = (theta * 180) / Math.PI;

  //Set label value according to step
  let value = Math.ceil((rotation * (max - min)) / 360);
  if (value % step > step / 2) {
    value += step - (value % step);
  } else {
    value -= value % step;
  }
  labelValue.innerHTML = "$" + (value + min);

  //Modified angle with step
  rotation = (value * 360) / (max - min);
  //Transformed to radians to be used when setting know location
  theta = (Math.PI * rotation) / 180;

  //Offsetting knob position according to its radius. We also subsctract 2 as it is its border.
  let knobOffset = (this.getBoundingClientRect().width / 2) - 2;

  //Calculating and setting the knob position
  let radius = (containerBoundingRect.height / 2) - knobOffset;
  let knobPositionY = radius * Math.cos(theta);
  let knobPositionX = radius * Math.sin(theta);


  knobPositionX = radius + knobPositionX + knobOffset;
  knobPositionY = radius - knobPositionY + knobOffset;
  //Set knob position


  this.style.left = knobPositionX;
  this.style.top = knobPositionY;

  //Overlays
  let sliderContainer = this.parentNode.querySelector(".circular_slider");
  let overLays = sliderContainer.querySelectorAll(".overlay_container");

  let overlayRotationLeft, overlayRotationRight;
  if (rotation < 180) {
    overlayRotationLeft = 0;
    overlayRotationRight = rotation;
  } else {
    overlayRotationLeft = rotation + 180;
    overlayRotationRight = 180;
  }

  overLays[0].style.transform = "rotate(" + overlayRotationLeft + "deg)";
  overLays[1].style.transform = "rotate(" + overlayRotationRight + "deg)";
}

//HELPERS

function transformForDataset(text) {
  return text.toLowerCase().replace(" ", "_");
}
