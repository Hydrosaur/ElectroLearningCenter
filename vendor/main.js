var courses;
var effects = [
  "bounce",
  "flash",
  "pulse",
  "rubberBand",
  "shake",
  "swing",
  "tada",
  "wobble",
  "flip"
];

if(localStorage.getItem('courses') === null){
  localStorage.setItem('courses', '[]');
}
courses = JSON.parse(localStorage.getItem('courses'));

updateCourseIndex();

$("#learnButton").on("click", function(e){
  if($("#codeInput").val() !== ""){
    $("#learnButton").attr("disabled", "");
    loadCourses($("#codeInput").val());
    $("#codeInput").val("");
  }
});

function loadCourses(code) {
  $.ajax({
    url: codeToLink(code),
    data: {},
    success: function(res){
      var xmlConvert = new X2JS();
      var xml = new XMLSerializer().serializeToString(res);
      var course = xmlConvert.xml_str2json(xml).rss.channel;
      var courseName = course.title.replace("Treehouse - ", "");
      course.code = code;
      var saveableCourse = {
        code: course.code,
        title: courseName,
        videos: videosToProgress(course.item)
      };
      var wasCodeUsed = courses.some((item) => {return item.code === code;});
      if(!wasCodeUsed){
        console.log("wasCodeUsed?", wasCodeUsed);
        courses.push(saveableCourse);
        localStorage.setItem('courses', JSON.stringify(courses));
        $("#courseModal .modal-body img").attr("class", "center-block");
        setTimeout(function(){
          $("#courseModal .modal-body img").addClass("animated flip");
        }, 1000);
        $("#courseModalName").text(`Congrats! You got the ${courseName} course!`);
        $("#courseModal").modal('show');
        updateCourseIndex();
      }
      var courseIndex = courses.findIndex((item) => {return item.code === code;});
      $("#courseName").text(courseName);
      $("#videos").empty();
      course.item.forEach(function(item, idx){
        $("#videos").append(`
          <div class="col-lg-3 col-md-4 col-sm-6 portfolio-item">
            <div class="card h-100">
              <a href="${item.enclosure._url}" target="_blank"><img class="card-img-top" src="https://placehold.it/700x400" alt=""></a>
              <div class="card-body">
                <h4 class="card-title">
                  <a href="${item.enclosure._url}" target="_blank">${idx+1}. ${item.title}</a>
                </h4>
                <p class="card-text">${item.description}</p>
                <label>Done? <label><input type="checkbox" class="doneBox" ${courses[courseIndex].videos[idx].done ? "checked=''" : ""} data-id="${idx}">
              </div>
            </div>
          </div>
        `);
      });
      createDoneBoxHandlers(code);
      $("#learnButton").removeAttr("disabled");
    },
    error: function(){
      $("#learnButton").removeAttr("disabled");
    }
  });
}

function codeToLink(string){
  var code = atob(string.replace(/#/g, "="));
  var stringCode = code.split("").reverse().join("");
  return ("https://teamtreehouse.com/library/" + stringCode + "&hd=yes");
}

function encodeLearn(string){
  return btoa(string.replace("https://teamtreehouse.com/library/", "").split("").map((item, idx, a) => {return a[(a.length-idx)-1]}).join("")).replace(/=/g, "#");
}

function videosToProgress(videos){
  return videos.map((a,b) => ({index: b, done: false}));
}

function calculateProgress(videos){
  var reducer = videos.reduce((acc, val) => {
    return (val.done ? 1:0) + acc;
  }, 0);
  return ((reducer / videos.length) * 100).toFixed(0) + "%";
}

function createDoneBoxHandlers(code){
  $(".doneBox").change(function(e){
    var index = Number($(this).data("id"));
    var courseIndex = courses.findIndex((item) => {return item.code === code;});
    if($(this)[0].checked) {
      courses[courseIndex].videos[index].done = true;
      updateCourseIndex();
    } else {
      courses[courseIndex].videos[index].done = false;
      updateCourseIndex();
    }
    localStorage.setItem('courses', JSON.stringify(courses));
  });
}

function createCourseIndexHandlers(){
  $("#courseIndex tbody tr").click(function(e){
    $("#codeInput").val($(this).find("td").eq(2).text());
  });
}

function updateCourseIndex(){
  $("#courseIndex tbody").empty();
  courses.forEach(function(item, idx){
    $("#courseIndex tbody").append(`
      <tr>
        <td>${item.title}</td>
        <td>${calculateProgress(item.videos)}</td>
        <td>${item.code}</td>
      </tr>
    `);
  });
  createCourseIndexHandlers();
}
