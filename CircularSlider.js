var KNOB_SIZE = 30;

var isMobile = mobileAndTabletCheck();

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

  //Setting the height of container to the biggest slider
  container = document.querySelector(container);
  if (container.getBoundingClientRect().height < radius) {
    container.style.height = radius;
  }

  //Create label container if not exists
  let labelContainer = container.querySelector(".label_container");
  if (!labelContainer) {
    labelContainer = document.createElement("div");
    container.appendChild(labelContainer);
  }

  //Create container for sliders
  let slidersContainer = container.querySelector(".sliders_container");
  if (!slidersContainer) {
    slidersContainer = document.createElement("div");
    slidersContainer.classList.add("sliders_container");
    container.appendChild(slidersContainer);
  }

  labelContainer.classList.add("label_container");
  labelContainer.appendChild(createLabel(color, label, max, min, step));

  //Creating a slider element
  let slider = document.createElement("div");
  slider.classList.add("circular_slider");
  slider.style.width = radius;
  slider.style.height = radius;
  slider.style.setProperty("--overlay-color", color);
  if (isMobile) {
    slider.ontouchstart = onSliderClick;
  } else {
    slider.onmousedown = onSliderClick;
  }
  slidersContainer.appendChild(slider);

  //Creating knob element that is used to drag along the slider
  let knob = document.createElement("div");
  knob.classList.add("knob");
  knob.dataset.label = transformForDataset(label);
  if (isMobile) {
    knob.ontouchstart = onKnobDrag;
  } else {
    knob.onmousedown = onKnobDrag;
  }
  slider.appendChild(knob);

  slidersContainer.appendChild(slider);

  //Correct position of sliders after all of them are added
  let sliders = slidersContainer.children;
  console.log(container.getBoundingClientRect());
  for (let i = 0; i < sliders.length; i++) {
    sliders[i].style.left = Math.abs(sliders[i].getBoundingClientRect().height - slidersContainer.getBoundingClientRect().height) / 2;
    sliders[i].style.top = Math.abs(sliders[i].getBoundingClientRect().height - slidersContainer.getBoundingClientRect().height) / 2;
  }

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
  labelValue.innerHTML = "$" + min;
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

  let clientX = event.clientX;
  let clientY = event.clientY;
  if (isMobile) {
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  }

  //Get relative click location inside slider div
  let relativeClickLocationX = clientX - containerBoundingBox.left;
  let relativeClickLocationY = clientY - containerBoundingBox.top;

  //Check if click was on the slider border
  if (
    //Checks max circle
    Math.pow(relativeClickLocationX - containerRadius, 2) + Math.pow(relativeClickLocationY - containerRadius, 2) < Math.pow(containerRadius, 2) &&
    //Checks min circle
    Math.pow(relativeClickLocationX - containerRadius, 2) + Math.pow(relativeClickLocationY - containerRadius, 2) > Math.pow(containerRadius - KNOB_SIZE, 2)
  ) {
    let sliderKnob = this.querySelector(".knob");
    onKnobDrag.bind(sliderKnob, event)();
  }
}

function onKnobDrag(event) {
  event.preventDefault();

  let dragFunction = knobDragging.bind(this);
  this.classList.add("dragging");
  if (isMobile) {
    addEventListener("touchmove", dragFunction);
    addEventListener("touchend", () => {
      removeEventListener("touchmove", dragFunction);
      this.classList.remove("dragging");
      document.body.classList.remove("dragging");
    }, {once: true});

  } else {
    addEventListener("mousemove", dragFunction);
    addEventListener("mouseup", () => {
      removeEventListener("mousemove", dragFunction);
      this.classList.remove("dragging");
      document.body.classList.remove("dragging");
    }, {once: true});
  }
  document.body.classList.add("dragging");
}

function knobDragging(event) {
  let container = this.parentNode;
  let label = this.parentNode.parentNode.parentNode.querySelector(".label_container #" + this.dataset.label);
  let labelValue = label.querySelector(".label_value");
  let min = parseInt(label.dataset.min);
  let max = parseInt(label.dataset.max);
  let step = parseInt(label.dataset.step);

  //Mouse coordinates
  let mouseX = event.pageX;
  let mouseY = event.pageY;
  if (isMobile) {
    mouseX = event.touches[0].pageX;
    mouseY = event.touches[0].pageY;
  }

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

  //Set knob position
  this.style.left = radius + knobPositionX + knobOffset;
  this.style.top = radius - knobPositionY + knobOffset;

  //Overlays
  let circular_slider = this.parentNode;
  circular_slider.style.setProperty("--progress", ((100 * rotation) / 360) + "%");

}

//HELPERS
function transformForDataset(text) {
  return text.toLowerCase().replace(" ", "_");
}

function mobileAndTabletCheck() {
  let check = false;
  (function (a) {if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;})(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};
