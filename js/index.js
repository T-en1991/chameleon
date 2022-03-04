var chamecolor = "";
var degToRads = Math.PI / 180;
var valueArr = [100, 500, 100];
var mouse_changed = false;
var minTongueRadius = 405,
  maxTongueRadius = 415;
var angle = 0,
  distanceToMouse = 0,
  isActive = false;
var camouflage_timeout = null;
var colorSelector = document.querySelector(":root");
var mouse_container = document.getElementById("mouse-container");
var animationContainer = document.getElementById("lottie");
var isMacLike = navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i)?true:false;

animationContainer.setAttribute('class',isMacLike ? 'default_hidden' : 'mac_hidden')
var animData = {
  container: animationContainer,
  renderer: "svg",
  loop: true,
  autoplay: true,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid meet"
  },
  path: "https://labs.nearpod.com/bodymovin/demo/chameleon/chameleon2.json"
};
anim = lottie.loadAnimation(animData);
var animationAPI;

var leftEyeCircles = [
  {
    name: "Group 12",
    radius: 27,
    divisor: 20
  },
  {
    name: "Group 13",
    radius: 27,
    divisor: 20
  },
  {
    name: "Group 14",
    radius: 27,
    divisor: 20
  },
  {
    name: "Group 15",
    radius: 23,
    divisor: 20
  },
  {
    name: "Group 16",
    radius: 21,
    divisor: 35
  },
  {
    name: "Group 17",
    radius: 19,
    divisor: 50
  },
  {
    name: "Group 18",
    radius: 17,
    divisor: 65
  },
  {
    name: "Group 19",
    radius: 15,
    divisor: 80
  },
  {
    name: "Group 20",
    radius: 13,
    divisor: 95
  },
  {
    name: "Group 21",
    radius: 5,
    divisor: 75
  }
];
var rightEyeCircles = [
  {
    name: "Group 1",
    radius: 27,
    divisor: 20
  },
  {
    name: "Group 2",
    radius: 27,
    divisor: 20
  },
  {
    name: "Group 3",
    radius: 27,
    divisor: 20
  },
  {
    name: "Group 4",
    radius: 23,
    divisor: 20
  },
  {
    name: "Group 5",
    radius: 21,
    divisor: 35
  },
  {
    name: "Group 6",
    radius: 19,
    divisor: 50
  },
  {
    name: "Group 7",
    radius: 17,
    divisor: 65
  },
  {
    name: "Group 8",
    radius: 15,
    divisor: 80
  },
  {
    name: "Group 9",
    radius: 13,
    divisor: 95
  },
  {
    name: "Group 10",
    radius: 5,
    divisor: 75
  }
];

var leaves = ["leaf_1", "leaf_2", "leaf_3", "leaf_4"];

anim.addEventListener("DOMLoaded", function() {
  //anim.setSubframe(false);
  camouflage_timeout = setTimeout(function() {
            colorSelector.style.setProperty('--chame-color', 'rgba(240,237,231,1)');
            colorSelector.style.setProperty('--chame-color-eyes', 'rgba(228,225,218,1)');
            camouflage_timeout = null;
        }, 1000);

  animationAPI = lottie_api.createAnimationApi(anim);

  window.addEventListener("mousemove", updateValue);
  window.addEventListener("touchmove", updateValue);
  window.addEventListener("resize", onWindowResized);

  addMouthProperties();
  addTongueProperties();
  addArrowProperties();
  addEyeCircles();
  addLeavesListeners();
});

function addEyeCircleProperty(circleData, eye, cachedMouseEyeData) {
  //
  var eyeContainer = animationAPI.getKeyPath(
    eye + ",Contents," + circleData.name + ",Transform,Position"
  );
  var lastValue = null,
    eye_angle;
  animationAPI.addValueCallback(eyeContainer, function(currentValue) {
    if (!lastValue) {
      lastValue = [currentValue[0], currentValue[1]];
    }
    if (!isActive) {
      var trasformedPoint = animationAPI.toContainerPoint(valueArr);
      trasformedPoint = animationAPI.toKeypathLayerPoint(
        eyeContainer,
        trasformedPoint
      );
      cachedMouseEyeData.distance = Math.sqrt(
        Math.pow(trasformedPoint[0], 2) + Math.pow(trasformedPoint[1], 2)
      );
      cachedMouseEyeData.eye_angle =
        Math.atan2(0 - trasformedPoint[1], 0 - trasformedPoint[0]) / degToRads +
        179;
      cachedMouseEyeData.current[0] = valueArr[0];
      cachedMouseEyeData.current[1] = valueArr[1];
    }
    eye_angle = cachedMouseEyeData.eye_angle;
    var distance = cachedMouseEyeData.distance;
    distance = distance > circleData.radius ? circleData.radius : distance;
    var newValueX =
      currentValue[0] + distance * Math.cos(eye_angle * degToRads);
    var newValueY =
      currentValue[1] + distance * Math.sin(eye_angle * degToRads);
    lastValue[0] =
      lastValue[0] + (newValueX - lastValue[0]) / circleData.divisor * 3;
    lastValue[1] =
      lastValue[1] + (newValueY - lastValue[1]) / circleData.divisor * 3;
    //return currentValue;
    return lastValue;
  });
}

function addEyeCircles() {
  var i,
    len = leftEyeCircles.length;
  // len = 1;
  var cachedMouseEyeData = {
    current: [-1, -1],
    distance: 0,
    eye_angle: 0
  };
  for (i = 0; i < len; i += 1) {
    addEyeCircleProperty(
      leftEyeCircles[i],
      "Loop,left_eye",
      cachedMouseEyeData
    );
  }
  len = rightEyeCircles.length;
  cachedMouseEyeData = {
    current: [-1, -1],
    distance: 0,
    eye_angle: 0
  };
  // len = 1;
  for (i = 0; i < len; i += 1) {
    addEyeCircleProperty(
      rightEyeCircles[i],
      "Loop,right_eye",
      cachedMouseEyeData
    );
  }
}

function changeColor(leave_name) {
  var leafColorKey = animationAPI.getKeyPath(
    "#" + leave_name + ",Contents,color_group,fill_prop,Color"
  );
  var colorValue = leafColorKey.getPropertyAtIndex(0).getValue();
  var colorString = "rgba(";
  colorString += Math.round(colorValue[0]);
  colorString += ",";
  colorString += Math.round(colorValue[1]);
  colorString += ",";
  colorString += Math.round(colorValue[2]);
  colorString += ",1)";
  colorSelector.style.setProperty("--chame-color", colorString);
  colorSelector.style.setProperty("--chame-color-eyes", colorString);
  if (camouflage_timeout) {
    clearTimeout(camouflage_timeout);
  }
  camouflage_timeout = setTimeout(function() {
    colorSelector.style.setProperty("--chame-color", "rgba(240,237,231,1)");
    colorSelector.style.setProperty("--chame-color-eyes", "rgba(228,225,218,1)");
    camouflage_timeout = null;
  }, 15000);
}

function addLeaveListener(leave_name) {
  var leaveElement = document.getElementById(leave_name);
  leaveElement.addEventListener("mouseover", function() {
    changeColor(leave_name);
  });
  leaveElement.addEventListener("touchmove", function() {
    changeColor(leave_name);
  });
}

function addLeavesListeners() {
  var i,
    len = leaves.length;
  for (i = 0; i < len; i += 1) {
    addLeaveListener(leaves[i]);
  }
}

function addMouthProperties() {
  var keyPathMouthInner = animationAPI.getKeyPath("Mouth,ReferencePoint");
  var keyPathMouthContainerTimeRemap = animationAPI.getKeyPath(
    "Mouth,Time Remap"
  );
  var perc = 0;
  animationAPI.addValueCallback(keyPathMouthContainerTimeRemap, function(
    currentValue
  ) {
    if (!isActive && mouse_changed) {
      var point2 = animationAPI.toContainerPoint(valueArr);
      point2 = animationAPI.toKeypathLayerPoint(keyPathMouthInner, point2);
      angle = Math.atan2(0 - point2[1], 0 - point2[0]) / degToRads + 170;
      distanceToMouse = Math.sqrt(
        Math.pow(0 - point2[0], 2) + Math.pow(0 - point2[1], 2)
      );
      mouse_changed = false;
    }

    if (distanceToMouse < minTongueRadius) {
      perc = distanceToMouse / minTongueRadius;
      return perc * 9 / 30;
    } else if (distanceToMouse > maxTongueRadius) {
      perc =
        1 -
        Math.min(
          1,
          (distanceToMouse - maxTongueRadius) / (maxTongueRadius + 100)
        );
      return perc * (9 / 30);
    } else if (distanceToMouse >= minTongueRadius) {
      return 9 / 30;
    }
    return 0;
  });
}

function addArrowProperties() {
  var scalePath = "Mouth,Tongue_Comp,arrow,Contents,Shape 1,Transform,Scale";
  var rotationPath = "Mouth,Tongue_Comp,arrow,Contents,Shape 1,Transform,Rotation";
  var scaleKeyPath, rotationKeyPath;
  if(isMacLike) {
    scaleKeyPath = "Mouth,Tongue_Comp,.mac_arrow,Contents,Shape 1,Transform,Scale";
    rotationKeyPath = "Mouth,Tongue_Comp,.mac_arrow,Contents,Shape 1,Transform,Rotation";
  } else {
    scaleKeyPath = "Mouth,Tongue_Comp,.default_arrow,Contents,Shape 1,Transform,Scale";
    rotationKeyPath = "Mouth,Tongue_Comp,.default_arrow,Contents,Shape 1,Transform,Rotation";
  }
  var keyPathArrowScale = animationAPI.getKeyPath(
    scaleKeyPath
  );
  var currentScale = -1;
  var currentScaleValue = [-1, -1];
  animationAPI.addValueCallback(keyPathArrowScale, function(currentValue) {
    var scale = animationAPI.getScaleData().scale;
    if (currentScale !== scale) {
      currentScaleValue[0] = currentValue[0] / scale;
      currentScaleValue[1] = currentValue[1] / scale;
      currentScale = scale;
    }
    return currentScaleValue;
  });

  var keyPathArrowRotation = animationAPI.getKeyPath(
    rotationKeyPath
  );
  animationAPI.addValueCallback(keyPathArrowRotation, function(currentValue) {
    return -angle;
  });
}

function addTongueProperties() {
  var tongueInitialAnimationTime = 0;
  var tongueCurrentTime = 0;

  function animateTongue() {
    tongueInitialAnimationTime = Date.now() - 1500 / 30;
    isActive = true;
    mouse_container.setAttribute("class", "active");
  }

  function resetTongue() {
    isActive = false;
    mouse_container.setAttribute("class", "");
  }
  var keyPathTongueContainerTimeRemap = animationAPI.getKeyPath(
    "Mouth,Tongue_Comp,Time Remap"
  );
  animationAPI.addValueCallback(keyPathTongueContainerTimeRemap, function(
    currentValue
  ) {
    if (
      distanceToMouse > minTongueRadius &&
      distanceToMouse < maxTongueRadius &&
      !isActive
    ) {
      animateTongue();
    }
    if (isActive) {
      tongueCurrentTime = 2 * (Date.now() - tongueInitialAnimationTime) / 1000;
    }
    if (tongueCurrentTime > 2) {
      tongueCurrentTime = 0;
      resetTongue();
    }
    return tongueCurrentTime;
  });

  var keyPathTongueContainer = animationAPI.getKeyPath(
    "Mouth,Tongue_Comp,Transform,Rotation"
  );
  animationAPI.addValueCallback(keyPathTongueContainer, function(currentValue) {
    return angle;
  });
}

function updateValue(ev) {
  mouse_changed = true;
  var mouseX, mouseY;
  if (ev.touches && ev.touches.length) {
    var mouseX = ev.touches[0].pageX;
    var mouseY = ev.touches[0].pageY;
  } else if (ev.pageX !== undefined) {
    mouseX = ev.pageX;
    mouseY = ev.pageY;
  }
  valueArr[0] = mouseX;
  valueArr[1] = mouseY;
}

function onWindowResized() {
  if (animationAPI) {
    anim.resize();
    animationAPI.recalculateSize();
  }
}